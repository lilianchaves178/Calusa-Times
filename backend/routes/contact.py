"""Contact Us — public submission + admin inbox."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
import uuid

from routes.auth import require_permission
from services import email_service

router = APIRouter(prefix="/api/contact", tags=["contact"])

db = None


def set_db(database):
    global db
    db = database


class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    name: str
    email: EmailStr
    subject: str
    message: str
    article_id: Optional[str] = None
    article_title: Optional[str] = None
    resolved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    article_id: Optional[str] = None


@router.post("", response_model=ContactMessage)
async def submit_contact(payload: ContactCreate):
    data = payload.dict()

    # Enrich with article title if the sender referenced one
    article_title = None
    if data.get("article_id"):
        article = await db.articles.find_one({"id": data["article_id"]}, {"_id": 0, "title": 1})
        if article:
            article_title = article["title"]

    obj = ContactMessage(**data, article_title=article_title)
    await db.contact_messages.insert_one(obj.dict())
    email_service.fire_and_forget(email_service.notify_new_contact(db, obj.dict()))
    return obj


@router.get("", response_model=List[ContactMessage])
async def list_contact_messages(
    resolved: Optional[bool] = None,
    _=Depends(require_permission("edit")),
):
    query = {}
    if resolved is not None:
        query["resolved"] = resolved
    items = (
        await db.contact_messages.find(query, {"_id": 0})
        .sort("created_at", -1)
        .to_list(500)
    )
    return [ContactMessage(**i) for i in items]


@router.put("/{msg_id}/resolve", response_model=ContactMessage)
async def toggle_resolve(
    msg_id: str,
    resolved: bool = True,
    _=Depends(require_permission("edit")),
):
    existing = await db.contact_messages.find_one({"id": msg_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Not found")
    await db.contact_messages.update_one(
        {"id": msg_id}, {"$set": {"resolved": resolved}}
    )
    updated = await db.contact_messages.find_one({"id": msg_id}, {"_id": 0})
    return ContactMessage(**updated)


@router.delete("/{msg_id}")
async def delete_contact_message(msg_id: str, _=Depends(require_permission("delete"))):
    res = await db.contact_messages.delete_one({"id": msg_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}
