"""AI summarizer powered by Emergent LLM Key (Claude Sonnet)."""
from __future__ import annotations

import logging
import os
import re
import uuid

logger = logging.getLogger(__name__)

_SYSTEM = (
    "You are an editor for 'The Calusa Times', an elementary-school student newspaper. "
    "Given a student-written article, write a short neutral summary for parents to read at a glance. "
    "Rules: 3-4 sentences max, under 60 words total, plain text (no headings or lists), "
    "keep the student's voice but fix obvious typos, do not add facts that aren't in the original. "
    "Never start with the word 'Summary'."
)

_WORD_LIMIT = 120  # hard cap when we re-trim the LLM output


def _strip(text: str) -> str:
    """Clean up common LLM preamble/wrappers."""
    if not text:
        return ""
    t = text.strip().strip('"').strip("'")
    # Remove markdown headings / bullet prefixes if the model ignored the system rule
    t = re.sub(r"^(summary[:\-]\s*)", "", t, flags=re.IGNORECASE)
    t = re.sub(r"\s+", " ", t).strip()
    words = t.split(" ")
    if len(words) > _WORD_LIMIT:
        t = " ".join(words[:_WORD_LIMIT]).rstrip(",.;:") + "…"
    return t


async def summarize_article(title: str, body: str) -> str:
    """Return a 3-4 sentence summary of the article, or '' if unavailable."""
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        logger.info("EMERGENT_LLM_KEY not set — skipping AI summary")
        return ""

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
    except Exception as exc:
        logger.warning("emergentintegrations not importable: %s", exc)
        return ""

    # Truncate input so we don't waste tokens on huge texts
    body_trim = (body or "").strip()
    if len(body_trim) > 4000:
        body_trim = body_trim[:4000]

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"summary-{uuid.uuid4().hex[:8]}",
            system_message=_SYSTEM,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")

        msg = UserMessage(
            text=(
                f"Article title: {title}\n\n"
                f"Article body:\n{body_trim}\n\n"
                "Write the summary now."
            )
        )
        reply = await chat.send_message(msg)
        return _strip(reply or "")
    except Exception as exc:
        logger.warning("summarize_article failed: %s", exc)
        return ""
