from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid
import random

router = APIRouter(prefix="/api/mural", tags=["mural"])

db = None

def set_db(database):
    global db
    db = database

class MuralMessage(BaseModel):
    id: str = uuid.uuid4().hex
    message: str
    author_name: str
    color: str = "yellow"  # yellow, pink, blue, green, orange, purple
    rotation: int = 0  # -5 to 5 degrees for randomness
    position_x: int = 0
    position_y: int = 0
    paid: bool = False
    approved: bool = False
    created_at: datetime = datetime.utcnow()
    expires_at: Optional[datetime] = None

class MuralMessageCreate(BaseModel):
    message: str
    author_name: str
    color: Optional[str] = None

@router.get("", response_model=List[MuralMessage])
async def get_mural_messages(approved_only: bool = True):
    query = {}
    if approved_only:
        query["approved"] = True
    
    now = datetime.utcnow()
    query["$or"] = [
        {"expires_at": None},
        {"expires_at": {"$gt": now}}
    ]
    
    messages = await db.mural_messages.find(query).sort("created_at", -1).to_list(100)
    return messages

@router.post("", response_model=MuralMessage)
async def create_mural_message(message: MuralMessageCreate):
    # Assign random color if not provided
    colors = ["yellow", "pink", "blue", "green", "orange", "purple"]
    color = message.color if message.color else random.choice(colors)
    
    message_dict = message.dict()
    message_dict["id"] = uuid.uuid4().hex
    message_dict["color"] = color
    message_dict["rotation"] = random.randint(-5, 5)
    message_dict["position_x"] = random.randint(0, 100)
    message_dict["position_y"] = random.randint(0, 100)
    message_dict["paid"] = False
    message_dict["approved"] = False
    message_dict["created_at"] = datetime.utcnow()
    message_dict["expires_at"] = None
    
    await db.mural_messages.insert_one(message_dict)
    return MuralMessage(**message_dict)

@router.put("/{message_id}/approve")
async def approve_mural_message(message_id: str):
    result = await db.mural_messages.update_one(
        {"id": message_id},
        {"$set": {"approved": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message approved"}

@router.delete("/{message_id}")
async def delete_mural_message(message_id: str):
    result = await db.mural_messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted"}
