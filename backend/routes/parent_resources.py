"""Parent Resources — PTA links, group chats, portals, forms, etc."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
import uuid

from routes.auth import require_permission

router = APIRouter(prefix="/api/parent-resources", tags=["parent-resources"])

db = None


def set_db(database):
    global db
    db = database


CATEGORY_CHOICES = {"PTA", "INFO", "CHAT", "FORMS", "VOLUNTEER", "OTHER"}


class ParentResource(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    category: str = "OTHER"
    order: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ParentResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    category: str = "OTHER"
    order: int = 0
    is_active: bool = True


class ParentResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    category: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


@router.get("", response_model=List[ParentResource])
async def list_resources(active_only: bool = True):
    query = {"is_active": True} if active_only else {}
    items = (
        await db.parent_resources.find(query, {"_id": 0})
        .sort([("order", 1), ("created_at", -1)])
        .to_list(200)
    )
    return [ParentResource(**i) for i in items]


@router.post("", response_model=ParentResource)
async def create_resource(
    payload: ParentResourceCreate,
    _=Depends(require_permission("edit")),
):
    if payload.category not in CATEGORY_CHOICES:
        raise HTTPException(status_code=400, detail="Invalid category")
    obj = ParentResource(**payload.dict())
    await db.parent_resources.insert_one(obj.dict())
    return obj


@router.put("/{resource_id}", response_model=ParentResource)
async def update_resource(
    resource_id: str,
    payload: ParentResourceUpdate,
    _=Depends(require_permission("edit")),
):
    existing = await db.parent_resources.find_one({"id": resource_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Resource not found")
    updates = {k: v for k, v in payload.dict(exclude_none=True).items()}
    if "category" in updates and updates["category"] not in CATEGORY_CHOICES:
        raise HTTPException(status_code=400, detail="Invalid category")
    if updates:
        await db.parent_resources.update_one({"id": resource_id}, {"$set": updates})
    updated = await db.parent_resources.find_one({"id": resource_id}, {"_id": 0})
    return ParentResource(**updated)


@router.delete("/{resource_id}")
async def delete_resource(
    resource_id: str,
    _=Depends(require_permission("delete")),
):
    res = await db.parent_resources.delete_one({"id": resource_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"message": "Deleted"}
