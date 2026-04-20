from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Optional
from pydantic import BaseModel
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
    id: str = uuid.uuid4().hex
    name: str
    tier: str  # platinum, gold, silver, bronze
    logo_url: str
    website_url: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = datetime.utcnow()

class SponsorCreate(BaseModel):
    name: str
    tier: str
    website_url: Optional[str] = None
    description: Optional[str] = None

@router.get("", response_model=List[Sponsor])
async def get_sponsors(active_only: bool = True):
    query = {}
    if active_only:
        query["is_active"] = True
    
    sponsors = await db.sponsors.find(query).sort("tier", 1).to_list(100)
    return sponsors

@router.post("", response_model=Sponsor)
async def create_sponsor(sponsor: SponsorCreate):
    sponsor_dict = sponsor.dict()
    sponsor_dict["id"] = uuid.uuid4().hex
    sponsor_dict["logo_url"] = ""
    sponsor_dict["is_active"] = True
    sponsor_dict["created_at"] = datetime.utcnow()
    
    await db.sponsors.insert_one(sponsor_dict)
    return Sponsor(**sponsor_dict)

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
        {"$set": {"logo_url": logo_url}}
    )
    
    return {"logo_url": logo_url}

@router.delete("/{sponsor_id}")
async def delete_sponsor(sponsor_id: str):
    result = await db.sponsors.delete_one({"id": sponsor_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    return {"message": "Sponsor deleted"}
