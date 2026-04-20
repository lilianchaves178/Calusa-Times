from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/popups", tags=["popups"])

db = None

def set_db(database):
    global db
    db = database

class Popup(BaseModel):
    id: str = uuid.uuid4().hex
    title: str
    message: str
    type: str = "info"  # info, warning, success, announcement
    is_active: bool = True
    show_once: bool = False
    created_at: datetime = datetime.utcnow()
    expires_at: Optional[datetime] = None

class PopupCreate(BaseModel):
    title: str
    message: str
    type: str = "info"
    show_once: bool = False
    expires_at: Optional[datetime] = None

@router.get("", response_model=List[Popup])
async def get_active_popups():
    now = datetime.utcnow()
    query = {
        "is_active": True,
        "$or": [
            {"expires_at": None},
            {"expires_at": {"$gt": now}}
        ]
    }
    
    popups = await db.popups.find(query).sort("created_at", -1).to_list(10)
    return popups

@router.post("", response_model=Popup)
async def create_popup(popup: PopupCreate):
    popup_dict = popup.dict()
    popup_dict["id"] = uuid.uuid4().hex
    popup_dict["is_active"] = True
    popup_dict["created_at"] = datetime.utcnow()
    
    await db.popups.insert_one(popup_dict)
    return Popup(**popup_dict)

@router.put("/{popup_id}/deactivate")
async def deactivate_popup(popup_id: str):
    result = await db.popups.update_one(
        {"id": popup_id},
        {"$set": {"is_active": False}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Popup not found")
    return {"message": "Popup deactivated"}

@router.delete("/{popup_id}")
async def delete_popup(popup_id: str):
    result = await db.popups.delete_one({"id": popup_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Popup not found")
    return {"message": "Popup deleted"}
