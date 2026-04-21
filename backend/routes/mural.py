from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
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
async def get_mural_messages(approved_only: bool = True):
    query = {}
    if approved_only:
        query["approved"] = True
        query["paid"] = True

    now = datetime.utcnow()
    query["$or"] = [
        {"expires_at": None},
        {"expires_at": {"$gt": now}},
    ]

    messages = await db.mural_messages.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [MuralMessage(**m) for m in messages]


@router.get("/pending", response_model=List[MuralMessage])
async def get_pending_mural_messages():
    """Admin view: all messages waiting for payment verification/approval."""
    messages = await db.mural_messages.find({"approved": False}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [MuralMessage(**m) for m in messages]


@router.post("", response_model=MuralMessage)
async def create_mural_message(payload: MuralMessageCreate):
    colors = ["yellow", "pink", "blue", "green", "orange", "purple"]
    color = payload.color if payload.color else random.choice(colors)
    tier = payload.tier if payload.tier in TIER_PRICES else "plain"
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
    return msg


@router.put("/{message_id}/approve", response_model=MuralMessage)
async def approve_mural_message(message_id: str):
    """Admin: mark message as paid + approved so it shows on the cork board."""
    result = await db.mural_messages.update_one(
        {"id": message_id},
        {"$set": {"approved": True, "paid": True}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")

    updated = await db.mural_messages.find_one({"id": message_id}, {"_id": 0})
    return MuralMessage(**updated)


@router.put("/{message_id}/reject")
async def reject_mural_message(message_id: str):
    result = await db.mural_messages.update_one(
        {"id": message_id},
        {"$set": {"approved": False, "paid": False}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message rejected"}


@router.delete("/{message_id}")
async def delete_mural_message(message_id: str):
    result = await db.mural_messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted"}


@router.get("/config/pricing")
async def get_mural_pricing():
    return {
        "tiers": TIER_PRICES,
        "givebacks_url": GIVEBACKS_URL,
    }
