from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from typing import List, Optional
from pydantic import BaseModel, Field
from routes.auth import require_permission
from datetime import datetime
import uuid
import shutil
from pathlib import Path

router = APIRouter(prefix="/api/art", tags=["art"])

db = None


def set_db(database):
    global db
    db = database


UPLOADS_DIR = Path("/app/uploads/art")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


class ArtSubmission(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    title: str
    description: Optional[str] = None
    artist_name: str
    grade: Optional[str] = None
    image_url: str = ""
    approved: bool = False
    featured: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ArtSubmissionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    artist_name: str
    grade: Optional[str] = None


@router.get("", response_model=List[ArtSubmission])
async def get_art_submissions(approved_only: bool = True, featured: Optional[bool] = None):
    query = {}
    if approved_only:
        query["approved"] = True
    if featured is not None:
        query["featured"] = featured

    art_list = await db.art_submissions.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [ArtSubmission(**a) for a in art_list]


@router.get("/pending", response_model=List[ArtSubmission])
async def get_pending_art(_=Depends(require_permission("edit"))):
    art_list = await db.art_submissions.find({"approved": False}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [ArtSubmission(**a) for a in art_list]


@router.post("", response_model=ArtSubmission)
async def create_art_submission(submission: ArtSubmissionCreate):
    obj = ArtSubmission(**submission.dict())
    await db.art_submissions.insert_one(obj.dict())
    return obj


@router.post("/{art_id}/upload-image")
async def upload_art_image(art_id: str, file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOADS_DIR / unique_filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"/api/uploads/art/{unique_filename}"
    await db.art_submissions.update_one(
        {"id": art_id},
        {"$set": {"image_url": image_url}},
    )

    return {"image_url": image_url}


@router.put("/{art_id}/approve")
async def approve_art(art_id: str, _=Depends(require_permission("edit"))):
    result = await db.art_submissions.update_one(
        {"id": art_id},
        {"$set": {"approved": True}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Art submission not found")
    return {"message": "Art approved"}


@router.put("/{art_id}/feature")
async def toggle_feature_art(art_id: str, _=Depends(require_permission("edit"))):
    existing = await db.art_submissions.find_one({"id": art_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Art submission not found")
    new_val = not existing.get("featured", False)
    await db.art_submissions.update_one({"id": art_id}, {"$set": {"featured": new_val}})
    return {"featured": new_val}


@router.delete("/{art_id}")
async def delete_art(art_id: str, _=Depends(require_permission("delete"))):
    result = await db.art_submissions.delete_one({"id": art_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Art submission not found")
    return {"message": "Art deleted"}
