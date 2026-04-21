from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel, Field
from routes.auth import require_permission
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/popups", tags=["popups"])

db = None


def set_db(database):
    global db
    db = database


class Popup(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    title: str
    message: str
    type: str = "info"  # info, warning, success, announcement
    is_active: bool = True
    show_once: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None


class PopupCreate(BaseModel):
    title: str
    message: str
    type: str = "info"
    show_once: bool = False
    expires_at: Optional[datetime] = None


class PopupUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    type: Optional[str] = None
    is_active: Optional[bool] = None
    show_once: Optional[bool] = None
    expires_at: Optional[datetime] = None


@router.get("", response_model=List[Popup])
async def get_active_popups():
    now = datetime.utcnow()
    query = {
        "is_active": True,
        "$or": [
            {"expires_at": None},
            {"expires_at": {"$gt": now}},
        ],
    }

    popups = await db.popups.find(query, {"_id": 0}).sort("created_at", -1).to_list(10)
    return [Popup(**p) for p in popups]


@router.get("/all", response_model=List[Popup])
async def get_all_popups(_=Depends(require_permission("edit"))):
    popups = await db.popups.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [Popup(**p) for p in popups]


@router.post("", response_model=Popup)
async def create_popup(popup: PopupCreate, _=Depends(require_permission("edit"))):
    obj = Popup(**popup.dict())
    await db.popups.insert_one(obj.dict())
    return obj


@router.put("/{popup_id}", response_model=Popup)
async def update_popup(popup_id: str, update: PopupUpdate, _=Depends(require_permission("edit"))):
    existing = await db.popups.find_one({"id": popup_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Popup not found")

    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if update_data:
        await db.popups.update_one({"id": popup_id}, {"$set": update_data})

    updated = await db.popups.find_one({"id": popup_id}, {"_id": 0})
    return Popup(**updated)


@router.put("/{popup_id}/deactivate")
async def deactivate_popup(popup_id: str, _=Depends(require_permission("edit"))):
    result = await db.popups.update_one(
        {"id": popup_id},
        {"$set": {"is_active": False}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Popup not found")
    return {"message": "Popup deactivated"}


@router.delete("/{popup_id}")
async def delete_popup(popup_id: str, _=Depends(require_permission("delete"))):
    result = await db.popups.delete_one({"id": popup_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Popup not found")
    return {"message": "Popup deleted"}
