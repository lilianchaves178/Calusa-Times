"""Monthly newspaper email subscriptions."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
import uuid

from routes.auth import require_permission
from services import email_service

router = APIRouter(prefix="/api/subscribers", tags=["subscribers"])

db = None


def set_db(database):
    global db
    db = database


class Subscriber(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    email: EmailStr
    source: Optional[str] = "footer"
    unsubscribed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SubscribeRequest(BaseModel):
    email: EmailStr
    source: Optional[str] = "footer"


@router.post("", response_model=Subscriber)
async def subscribe(payload: SubscribeRequest):
    email_lc = payload.email.lower()
    existing = await db.subscribers.find_one({"email": email_lc})
    if existing:
        # Idempotent: re-subscribe silently if they had unsubscribed
        if existing.get("unsubscribed"):
            await db.subscribers.update_one(
                {"email": email_lc}, {"$set": {"unsubscribed": False}}
            )
            existing["unsubscribed"] = False
        existing.pop("_id", None)
        return Subscriber(**existing)

    obj = Subscriber(email=email_lc, source=payload.source)
    await db.subscribers.insert_one(obj.dict())

    # Fire-and-forget welcome email via the existing Resend pipeline
    email_service.fire_and_forget(_send_welcome(obj.email))
    return obj


async def _send_welcome(to_email: str) -> None:
    if not email_service.is_enabled():
        return
    subject = "You're subscribed to The Calusa Times"
    body = (
        "<p>Thanks for subscribing! We'll drop a single email in your inbox "
        "each month when the new edition of <strong>The Calusa Times</strong> is ready, "
        "with a link to download the printable PDF.</p>"
        "<p>No spam, just student stories.</p>"
    )
    html = email_service._render_template(  # type: ignore[attr-defined]
        subject, body, "Read the newspaper", "/print"
    )
    await email_service._send_to([to_email], subject, html)  # type: ignore[attr-defined]


@router.get("", response_model=List[Subscriber])
async def list_subscribers(
    active_only: bool = True,
    _=Depends(require_permission("edit")),
):
    query = {"unsubscribed": False} if active_only else {}
    items = (
        await db.subscribers.find(query, {"_id": 0})
        .sort("created_at", -1)
        .to_list(2000)
    )
    return [Subscriber(**i) for i in items]


@router.delete("/{sub_id}")
async def delete_subscriber(sub_id: str, _=Depends(require_permission("delete"))):
    res = await db.subscribers.delete_one({"id": sub_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}


@router.post("/unsubscribe")
async def unsubscribe(payload: SubscribeRequest):
    email_lc = payload.email.lower()
    await db.subscribers.update_one(
        {"email": email_lc}, {"$set": {"unsubscribed": True}}
    )
    return {"message": "Unsubscribed"}
