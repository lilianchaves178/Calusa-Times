"""Parent Resource category pages — one editable article per category.

Each of the 6 categories (PTA, INFO, CHAT, FORMS, VOLUNTEER, OTHER) gets a
single article-like page with title, subtitle, hero image, and markdown body.
"""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from pathlib import Path
import shutil
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from pymongo import ReturnDocument

from routes.auth import require_permission

router = APIRouter(prefix="/api/parent-resource-pages", tags=["parent-resource-pages"])

db = None


def set_db(database):
    global db
    db = database


CATEGORY_CHOICES = ["PTA", "INFO", "CHAT", "FORMS", "VOLUNTEER", "OTHER"]
CATEGORY_SET = set(CATEGORY_CHOICES)

DEFAULT_META = {
    "PTA": {"title": "Parent-Teacher Association", "subtitle": "Get involved with the Calusa PTA"},
    "INFO": {"title": "Information & Portals", "subtitle": "Where to find everything you need"},
    "CHAT": {"title": "Connect with Other Parents", "subtitle": "Class chats, grade-level groups"},
    "FORMS": {"title": "Forms & Requests", "subtitle": "Absences, pick-ups, permissions"},
    "VOLUNTEER": {"title": "Volunteer at Calusa", "subtitle": "Ways to help, big or small"},
    "OTHER": {"title": "Other Helpful Links", "subtitle": "Everything else parents ask about"},
}


class ParentResourcePage(BaseModel):
    category: str
    title: str
    subtitle: Optional[str] = None
    body: str = ""  # Plain-text with blank-line-separated paragraphs; ** for bold, - for bullets
    hero_image_url: Optional[str] = None
    is_active: bool = True
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ParentResourcePageUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    body: Optional[str] = None
    hero_image_url: Optional[str] = None
    is_active: Optional[bool] = None


async def _ensure_page(category: str) -> dict:
    """Create the category stub if it doesn't exist so the admin always sees all 6.

    Uses an atomic upsert (rather than find-then-insert) so two requests
    arriving at nearly the same time can't both decide the page is missing
    and each insert their own copy, which previously produced duplicate
    cards on the public PTA Corner page.
    """
    meta = DEFAULT_META[category]
    stub = ParentResourcePage(
        category=category,
        title=meta["title"],
        subtitle=meta["subtitle"],
        body="",
        is_active=True,
    )
    doc = await db.parent_resource_pages.find_one_and_update(
        {"category": category},
        {"$setOnInsert": stub.dict()},
        upsert=True,
        return_document=ReturnDocument.AFTER,
        projection={"_id": 0},
    )
    return doc


@router.get("", response_model=List[ParentResourcePage])
async def list_pages(active_only: bool = True):
    # Ensure all 6 stubs exist, then return them in canonical order
    for cat in CATEGORY_CHOICES:
        await _ensure_page(cat)
    query = {"is_active": True} if active_only else {}
    items = await db.parent_resource_pages.find(query, {"_id": 0}).to_list(50)
    items.sort(key=lambda p: CATEGORY_CHOICES.index(p["category"]) if p["category"] in CATEGORY_SET else 99)
    return [ParentResourcePage(**i) for i in items]


@router.get("/{category}", response_model=ParentResourcePage)
async def get_page(category: str):
    category = category.upper()
    if category not in CATEGORY_SET:
        raise HTTPException(status_code=404, detail="Unknown category")
    page = await _ensure_page(category)
    return ParentResourcePage(**page)


@router.put("/{category}", response_model=ParentResourcePage)
async def update_page(
    category: str,
    payload: ParentResourcePageUpdate,
    _=Depends(require_permission("edit")),
):
    category = category.upper()
    if category not in CATEGORY_SET:
        raise HTTPException(status_code=400, detail="Unknown category")
    await _ensure_page(category)
    updates = {k: v for k, v in payload.dict(exclude_none=True).items()}
    updates["updated_at"] = datetime.utcnow()
    await db.parent_resource_pages.update_one(
        {"category": category}, {"$set": updates}
    )
    updated = await db.parent_resource_pages.find_one(
        {"category": category}, {"_id": 0}
    )
    return ParentResourcePage(**updated)


@router.post("/{category}/upload-hero")
async def upload_hero_image(
    category: str,
    file: UploadFile = File(...),
    _=Depends(require_permission("edit")),
):
    category = category.upper()
    if category not in CATEGORY_SET:
        raise HTTPException(status_code=400, detail="Unknown category")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    ext = (file.filename.split(".")[-1] or "jpg").lower()
    unique = f"{uuid.uuid4()}.{ext}"
    out_dir = Path("/app/uploads/parent-resources")
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / unique
    with open(out, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    url = f"/api/uploads/parent-resources/{unique}"
    await _ensure_page(category)
    await db.parent_resource_pages.update_one(
        {"category": category},
        {"$set": {"hero_image_url": url, "updated_at": datetime.utcnow()}},
    )
    return {"hero_image_url": url}


@router.post("/{category}/upload-image")
async def upload_body_image(
    category: str,
    file: UploadFile = File(...),
    _=Depends(require_permission("edit")),
):
    """Upload an illustration/photo to embed inline in the article body
    (as opposed to /upload-hero, which sets the one banner image at top)."""
    category = category.upper()
    if category not in CATEGORY_SET:
        raise HTTPException(status_code=400, detail="Unknown category")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    ext = (file.filename.split(".")[-1] or "jpg").lower()
    unique = f"{uuid.uuid4()}.{ext}"
    out_dir = Path("/app/uploads/parent-resources")
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / unique
    with open(out, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    url = f"/api/uploads/parent-resources/{unique}"
    return {"image_url": url}
