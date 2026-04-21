from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid
import shutil
from pathlib import Path

router = APIRouter(prefix="/api/sponsors", tags=["sponsors"])

db = None


def set_db(database):
    global db
    db = database


UPLOADS_DIR = Path("/app/uploads/sponsors")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


class Sponsor(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    name: str
    tier: str  # platinum, gold, silver, bronze
    logo_url: str = ""
    website_url: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SponsorCreate(BaseModel):
    name: str
    tier: str
    website_url: Optional[str] = None
    description: Optional[str] = None


class SponsorUpdate(BaseModel):
    name: Optional[str] = None
    tier: Optional[str] = None
    website_url: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    logo_url: Optional[str] = None


@router.get("", response_model=List[Sponsor])
async def get_sponsors(active_only: bool = True):
    query = {}
    if active_only:
        query["is_active"] = True

    sponsors = await db.sponsors.find(query, {"_id": 0}).sort("tier", 1).to_list(200)
    return [Sponsor(**s) for s in sponsors]


@router.post("", response_model=Sponsor)
async def create_sponsor(sponsor: SponsorCreate):
    obj = Sponsor(**sponsor.dict())
    await db.sponsors.insert_one(obj.dict())
    return obj


@router.put("/{sponsor_id}", response_model=Sponsor)
async def update_sponsor(sponsor_id: str, update: SponsorUpdate):
    existing = await db.sponsors.find_one({"id": sponsor_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Sponsor not found")

    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if update_data:
        await db.sponsors.update_one({"id": sponsor_id}, {"$set": update_data})

    updated = await db.sponsors.find_one({"id": sponsor_id}, {"_id": 0})
    return Sponsor(**updated)


@router.post("/{sponsor_id}/upload-logo")
async def upload_sponsor_logo(sponsor_id: str, file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOADS_DIR / unique_filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    logo_url = f"/api/uploads/sponsors/{unique_filename}"
    await db.sponsors.update_one(
        {"id": sponsor_id},
        {"$set": {"logo_url": logo_url}},
    )

    return {"logo_url": logo_url}


@router.delete("/{sponsor_id}")
async def delete_sponsor(sponsor_id: str):
    result = await db.sponsors.delete_one({"id": sponsor_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    return {"message": "Sponsor deleted"}
