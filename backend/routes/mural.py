from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel, Field
from routes.auth import require_permission
from services import email_service
from datetime import datetime, timedelta
import uuid
import random

router = APIRouter(prefix="/api/mural", tags=["mural"])

db = None

def set_db(database):
    global db
    db = database

# Givebacks payment configuration
GIVEBACKS_URL = "https://www.givebacks.com/causes/calusa/shop/items/50684"
TIER_PRICES = {"plain": 3, "featured": 5}
MURAL_DISPLAY_DAYS = 30
FEATURED_SLOT_LIMIT = 2


class MuralMessage(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    message: str
    author_name: str
    color: str = "yellow"  # yellow, pink, blue, green, orange, purple
    rotation: int = 0  # -5 to 5 degrees
    position_x: int = 0
    position_y: int = 0
    tier: str = "plain"  # plain or featured
    price: float = 3.0
    paid: bool = False
    approved: bool = False
    payment_reference: Optional[str] = None  # optional parent-provided reference
    givebacks_url: str = GIVEBACKS_URL
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None


class MuralMessageCreate(BaseModel):
    message: str
    author_name: str
    color: Optional[str] = None
    tier: Optional[str] = "plain"
    payment_reference: Optional[str] = None


@router.get("", response_model=List[MuralMessage])
async def get_mural_messages(approved_only: bool = True, include_expired: bool = False):
    query = {}
    if approved_only:
        query["approved"] = True
        query["paid"] = True

    if not include_expired:
        now = datetime.utcnow()
        query["$or"] = [
            {"expires_at": None},
            {"expires_at": {"$gt": now}},
        ]

    messages = await db.mural_messages.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [MuralMessage(**m) for m in messages]


@router.get("/pending", response_model=List[MuralMessage])
async def get_pending_mural_messages(_=Depends(require_permission("edit"))):
    """Admin view: all messages waiting for payment verification/approval."""
    messages = await db.mural_messages.find({"approved": False}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [MuralMessage(**m) for m in messages]


@router.post("", response_model=MuralMessage)
async def create_mural_message(payload: MuralMessageCreate):
    colors = ["yellow", "pink", "blue", "green", "orange", "purple"]
    color = payload.color if payload.color else random.choice(colors)
    requested_tier = payload.tier if payload.tier in TIER_PRICES else "plain"

    # Enforce featured slot cap at submission time so parents can't
    # hold a Givebacks reservation for a slot that's already taken.
    if requested_tier == "featured":
        now = datetime.utcnow()
        featured_active = await db.mural_messages.count_documents({
            "tier": "featured",
            "approved": True,
            "paid": True,
            "$or": [
                {"expires_at": None},
                {"expires_at": {"$gt": now}},
            ],
        })
        if featured_active >= FEATURED_SLOT_LIMIT:
            raise HTTPException(
                status_code=409,
                detail=(
                    "Featured slots are full right now — please pick the plain tier or "
                    "try again after a featured message expires."
                ),
            )

    tier = requested_tier
    price = TIER_PRICES[tier]

    msg = MuralMessage(
        message=payload.message,
        author_name=payload.author_name,
        color=color,
        rotation=random.randint(-5, 5),
        position_x=random.randint(0, 100),
        position_y=random.randint(0, 100),
        tier=tier,
        price=price,
        paid=False,
        approved=False,
        payment_reference=payload.payment_reference,
    )

    await db.mural_messages.insert_one(msg.dict())
    email_service.fire_and_forget(email_service.notify_new_mural_message(db, msg.dict()))
    return msg


@router.put("/{message_id}/approve", response_model=MuralMessage)
async def approve_mural_message(message_id: str, _=Depends(require_permission("edit"))):
    """Admin: mark message as paid + approved so it shows on the cork board.

    Starts the 30-day display window from the moment of approval.
    """
    now = datetime.utcnow()
    expires_at = now + timedelta(days=MURAL_DISPLAY_DAYS)
    result = await db.mural_messages.update_one(
        {"id": message_id},
        {"$set": {"approved": True, "paid": True, "expires_at": expires_at}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")

    updated = await db.mural_messages.find_one({"id": message_id}, {"_id": 0})
    return MuralMessage(**updated)


@router.put("/{message_id}/extend", response_model=MuralMessage)
async def extend_mural_message(
    message_id: str,
    days: int = MURAL_DISPLAY_DAYS,
    _=Depends(require_permission("edit")),
):
    """Extend (or reset) a mural message's display window by N days from now."""
    existing = await db.mural_messages.find_one({"id": message_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Message not found")

    new_expiry = datetime.utcnow() + timedelta(days=max(1, days))
    await db.mural_messages.update_one(
        {"id": message_id},
        {"$set": {"expires_at": new_expiry}},
    )
    updated = await db.mural_messages.find_one({"id": message_id}, {"_id": 0})
    return MuralMessage(**updated)


@router.put("/{message_id}/reject")
async def reject_mural_message(message_id: str, _=Depends(require_permission("edit"))):
    result = await db.mural_messages.update_one(
        {"id": message_id},
        {"$set": {"approved": False, "paid": False}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message rejected"}


@router.delete("/{message_id}")
async def delete_mural_message(message_id: str, _=Depends(require_permission("delete"))):
    result = await db.mural_messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted"}


@router.get("/config/pricing")
async def get_mural_pricing():
    now = datetime.utcnow()
    featured_active = await db.mural_messages.count_documents({
        "tier": "featured",
        "approved": True,
        "paid": True,
        "$or": [
            {"expires_at": None},
            {"expires_at": {"$gt": now}},
        ],
    })
    return {
        "tiers": TIER_PRICES,
        "givebacks_url": GIVEBACKS_URL,
        "display_days": MURAL_DISPLAY_DAYS,
        "featured_slot_limit": FEATURED_SLOT_LIMIT,
        "featured_slots_used": featured_active,
        "featured_available": featured_active < FEATURED_SLOT_LIMIT,
    }
