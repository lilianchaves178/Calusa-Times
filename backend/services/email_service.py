"""Email notification service powered by Resend.

If RESEND_API_KEY is not set, all notifications are skipped silently so the
rest of the app continues to work.
"""
from __future__ import annotations

import asyncio
import logging
import os
from typing import Iterable, List, Optional

import resend

logger = logging.getLogger(__name__)

_API_KEY = os.environ.get("RESEND_API_KEY")
_SENDER = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
_PUBLIC_URL = os.environ.get("PUBLIC_APP_URL", "")

if _API_KEY:
    resend.api_key = _API_KEY


def is_enabled() -> bool:
    return bool(_API_KEY)


async def _admin_emails(db) -> List[str]:
    """Return every admin-role user's email."""
    cursor = db.users.find({"role": "admin", "is_active": True}, {"_id": 0, "email": 1})
    rows = await cursor.to_list(100)
    return [r["email"] for r in rows if r.get("email")]


def _render_template(title: str, body_html: str, cta_label: str, cta_path: str) -> str:
    base = _PUBLIC_URL.rstrip("/")
    cta_url = f"{base}{cta_path}" if base else cta_path
    return f"""
    <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f7fafc; padding: 24px; border-radius: 12px;">
      <div style="background: #0f1e42; color: #fff; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">The Calusa Times</h1>
        <p style="margin: 4px 0 0; font-size: 12px; opacity: .8;">Admin notification</p>
      </div>
      <div style="background: #fff; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
        <h2 style="margin: 0 0 12px; font-size: 18px; color: #0f1e42;">{title}</h2>
        <div style="font-size: 14px; color: #334155; line-height: 1.6;">
          {body_html}
        </div>
        <div style="margin-top: 24px;">
          <a href="{cta_url}" style="display: inline-block; background: #0f1e42; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">{cta_label}</a>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #64748b;">You receive this email because you're an admin of The Calusa Times.</p>
      </div>
    </div>
    """


async def _send_to(recipients: List[str], subject: str, html: str) -> None:
    if not _API_KEY:
        logger.warning("_send_to called but RESEND_API_KEY is empty — skipping (to=%s)", recipients)
        return
    if not recipients:
        logger.warning("_send_to called with no recipients — skipping (subject=%s)", subject)
        return
    logger.info("Attempting Resend send: from=%s to=%s subject=%s", _SENDER, recipients, subject)
    try:
        result = await asyncio.to_thread(
            resend.Emails.send,
            {
                "from": _SENDER,
                "to": recipients,
                "subject": subject,
                "html": html,
            },
        )
        logger.info("Resend send returned: %r", result)
    except Exception as exc:  # email must never break request flow
        logger.warning("Resend send failed: %s: %s", type(exc).__name__, exc)


def fire_and_forget(coro) -> None:
    """Schedule an async coroutine without awaiting it (background task style)."""
    try:
        asyncio.create_task(coro)
    except RuntimeError:
        # no running loop — run synchronously as a fallback
        asyncio.run(coro)


def _render_plain(title: str, body_html: str, cta_label: str, cta_url_absolute: str, footer: str) -> str:
    """Like _render_template, but takes a fully-formed CTA URL and a custom footer
    (used for user-facing emails like password reset, not admin notifications)."""
    return f"""
    <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f7fafc; padding: 24px; border-radius: 12px;">
      <div style="background: #0f1e42; color: #fff; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">The Calusa Times</h1>
      </div>
      <div style="background: #fff; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
        <h2 style="margin: 0 0 12px; font-size: 18px; color: #0f1e42;">{title}</h2>
        <div style="font-size: 14px; color: #334155; line-height: 1.6;">
          {body_html}
        </div>
        <div style="margin-top: 24px;">
          <a href="{cta_url_absolute}" style="display: inline-block; background: #0f1e42; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">{cta_label}</a>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #64748b;">{footer}</p>
      </div>
    </div>
    """


async def send_password_reset_email(to_email: str, reset_url: str) -> None:
    """Send a password reset link to a single admin/editor user."""
    if not is_enabled():
        logger.info("RESEND_API_KEY not set — skipping password reset email (link: %s)", reset_url)
        return
    subject = "Reset your Calusa Times admin password"
    body = (
        "<p>We received a request to reset the password for your Calusa Times admin account.</p>"
        "<p>Click the button below to choose a new password. This link expires in 1 hour.</p>"
    )
    footer = "If you didn't request this, you can safely ignore this email — your password won't change."
    html = _render_plain(subject, body, "Reset Password", reset_url, footer)
    await _send_to([to_email], subject, html)


async def notify_new_mural_message(db, message: dict) -> None:
    if not is_enabled():
        return
    recipients = await _admin_emails(db)
    subject = f"New Mural message pending — ${message.get('price', 0)} ({message.get('tier', 'plain')})"
    body = (
        f"<p><strong>{message.get('author_name', 'Anonymous')}</strong> submitted a new "
        f"<strong>${message.get('price', 0)} {message.get('tier', 'plain')}</strong> mural message.</p>"
        f"<blockquote style=\"border-left: 4px solid #d97706; padding: 8px 12px; color: #475569; margin: 12px 0; background: #fff7ed;\">"
        f"{message.get('message', '')}"
        f"</blockquote>"
        f"<p>Verify the parent's Givebacks donation, then approve the message in the admin dashboard.</p>"
    )
    await _send_to(recipients, subject, _render_template(subject, body, "Review Mural Queue", "/admin/mural"))


async def notify_new_article(db, article: dict) -> None:
    if not is_enabled():
        return
    recipients = await _admin_emails(db)
    subject = f"New story pending review: {article.get('title', 'Untitled')}"
    body = (
        f"<p><strong>{article.get('author', 'A student')}</strong> submitted a new story in "
        f"<em>{article.get('category', 'news')}</em>.</p>"
        f"<p><strong>Title:</strong> {article.get('title', '')}<br/>"
        f"<strong>Description:</strong> {article.get('description', '')}</p>"
    )
    await _send_to(recipients, subject, _render_template(subject, body, "Review Articles", "/admin/articles"))


async def notify_new_art(db, art: dict) -> None:
    if not is_enabled():
        return
    recipients = await _admin_emails(db)
    subject = f"New art submission: {art.get('title', 'Untitled')}"
    body = (
        f"<p><strong>{art.get('artist_name', 'A student')}</strong> submitted new artwork "
        f"titled <em>{art.get('title', '')}</em>.</p>"
    )
    await _send_to(recipients, subject, _render_template(subject, body, "Review Art", "/admin/art"))


async def notify_new_comment(db, comment: dict, article_title: Optional[str] = None) -> None:
    if not is_enabled():
        return
    recipients = await _admin_emails(db)
    subject = "New comment awaiting approval"
    body = (
        f"<p><strong>{comment.get('author_name', 'Anonymous')}</strong> left a comment"
        + (f" on <em>{article_title}</em>" if article_title else "")
        + ":</p>"
        f"<blockquote style=\"border-left: 4px solid #0f1e42; padding: 8px 12px; color: #475569; margin: 12px 0; background: #eff6ff;\">"
        f"{comment.get('content', '')}"
        f"</blockquote>"
    )
    await _send_to(recipients, subject, _render_template(subject, body, "Moderate Comments", "/admin/comments"))


async def notify_new_spotlight(db, student: dict) -> None:
    if not is_enabled():
        return
    recipients = await _admin_emails(db)
    subject = f"New Spotlight submission: {student.get('name', 'Anonymous')}"
    body = (
        f"<p><strong>{student.get('name', 'A student')}</strong>"
        + (f" ({student.get('grade')})" if student.get('grade') else '')
        + " submitted a Spotlight story:</p>"
        f"<blockquote style=\"border-left: 4px solid #f59e0b; padding: 8px 12px; color: #475569; margin: 12px 0; background: #fffbeb;\">"
        f"{student.get('quote', '')}"
        f"</blockquote>"
        f"<p>Review and approve it to feature them on the Spotlight page.</p>"
    )
    await _send_to(recipients, subject, _render_template(subject, body, "Review Spotlight", "/admin/spotlight"))


async def notify_new_contact(db, message: dict) -> None:
    if not is_enabled():
        return
    recipients = await _admin_emails(db)
    subject = f"New Contact Us message: {message.get('subject', 'No subject')}"
    article_line = ""
    if message.get("article_title"):
        article_line = f"<p><strong>Related article:</strong> {message['article_title']}</p>"
    body = (
        f"<p><strong>{message.get('name', 'Anonymous')}</strong> "
        f"&lt;{message.get('email', '')}&gt; wrote:</p>"
        f"{article_line}"
        f"<blockquote style=\"border-left: 4px solid #0f1e42; padding: 8px 12px; color: #475569; margin: 12px 0; background: #eff6ff;\">"
        f"{message.get('message', '')}"
        f"</blockquote>"
        f"<p>Reply directly to this sender at <a href=\"mailto:{message.get('email', '')}\">{message.get('email', '')}</a>, "
        f"or manage the inbox in the admin dashboard.</p>"
    )
    await _send_to(recipients, subject, _render_template(subject, body, "Open Contact Inbox", "/admin/contact"))
