"""AI summarizer — uses whichever provider key is configured (Anthropic, OpenAI, or Gemini)
via litellm. No Emergent-specific dependency required."""
from __future__ import annotations

import logging
import os
import re

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


def _pick_model() -> str | None:
    """Pick a litellm model string based on whichever provider key is configured.
    Preference order: Anthropic, OpenAI, Gemini."""
    if os.environ.get("ANTHROPIC_API_KEY"):
        return "anthropic/claude-sonnet-4-5-20250929"
    if os.environ.get("OPENAI_API_KEY"):
        return "gpt-4o-mini"
    if os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"):
        return "gemini/gemini-1.5-flash"
    return None


async def summarize_article(title: str, body: str) -> str:
    """Return a 3-4 sentence summary of the article, or '' if unavailable."""
    model = _pick_model()
    if not model:
        logger.info(
            "No AI summary key set (ANTHROPIC_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY) — skipping AI summary"
        )
        return ""

    try:
        import litellm
    except Exception as exc:
        logger.warning("litellm not importable: %s", exc)
        return ""

    # Truncate input so we don't waste tokens on huge texts
    body_trim = (body or "").strip()
    if len(body_trim) > 4000:
        body_trim = body_trim[:4000]

    try:
        response = await litellm.acompletion(
            model=model,
            messages=[
                {"role": "system", "content": _SYSTEM},
                {
                    "role": "user",
                    "content": (
                        f"Article title: {title}\n\n"
                        f"Article body:\n{body_trim}\n\n"
                        "Write the summary now."
                    ),
                },
            ],
            max_tokens=200,
        )
        reply = response.choices[0].message.content
        return _strip(reply or "")
    except Exception as exc:
        logger.warning("summarize_article failed: %s", exc)
        return ""
