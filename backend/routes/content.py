"""Spotlight, Achievements, and School Info CMS routes."""
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from typing import List, Optional
from pydantic import BaseModel, Field
from routes.auth import require_permission
from datetime import datetime
from pathlib import Path
import uuid
import shutil


spotlight_router = APIRouter(prefix="/api/spotlight", tags=["spotlight"])
achievements_router = APIRouter(prefix="/api/achievements", tags=["achievements"])
school_info_router = APIRouter(prefix="/api/school-info", tags=["school-info"])

UPLOADS_DIR = Path("/app/uploads/spotlight")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

db = None


def set_db(database):
    global db
    db = database


# =============================================================================
# SPOTLIGHT
# =============================================================================
class SpotlightStudent(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    name: str
    grade: Optional[str] = None
    quote: str
    image_url: Optional[str] = None
    order: int = 0
    is_active: bool = True
    approved: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SpotlightCreate(BaseModel):
    name: str
    grade: Optional[str] = None
    quote: str
    image_url: Optional[str] = None
    order: int = 0
    is_active: bool = True


class SpotlightPublicSubmit(BaseModel):
    name: str
    grade: Optional[str] = None
    quote: str
    image_url: Optional[str] = None


class SpotlightUpdate(BaseModel):
    name: Optional[str] = None
    grade: Optional[str] = None
    quote: Optional[str] = None
    image_url: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None
    approved: Optional[bool] = None


@spotlight_router.get("", response_model=List[SpotlightStudent])
async def get_spotlight(active_only: bool = True):
    if active_only:
        query = {"approved": True, "is_active": True}
    else:
        query = {}
    items = await db.spotlight.find(query, {"_id": 0}).sort("order", 1).to_list(200)
    return [SpotlightStudent(**i) for i in items]


@spotlight_router.get("/pending", response_model=List[SpotlightStudent])
async def get_pending_spotlight(_=Depends(require_permission("edit"))):
    items = await db.spotlight.find({"approved": False}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [SpotlightStudent(**i) for i in items]


@spotlight_router.post("/submit", response_model=SpotlightStudent)
async def public_submit_spotlight(payload: SpotlightPublicSubmit):
    """Public endpoint — students/parents submit their own shine-worthy story.

    Saved as pending (approved=false) until an admin approves it.
    """
    obj = SpotlightStudent(
        name=payload.name,
        grade=payload.grade,
        quote=payload.quote,
        image_url=payload.image_url,
        approved=False,
        is_active=True,
        order=0,
    )
    await db.spotlight.insert_one(obj.dict())
    # Notify admins so they can approve it (reuses the existing Resend pipeline).
    try:
        from services import email_service
        email_service.fire_and_forget(
            email_service.notify_new_spotlight(db, obj.dict())
        )
    except Exception:
        pass
    return obj


@spotlight_router.post("/{student_id}/upload-image-public")
async def upload_spotlight_image_public(student_id: str, file: UploadFile = File(...)):
    """Public: attach an image to a just-created submission.

    Only works on unapproved submissions so this can't be used to replace an
    already-published student's photo.
    """
    existing = await db.spotlight.find_one({"id": student_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Submission not found")
    if existing.get("approved"):
        raise HTTPException(status_code=403, detail="This submission is already approved")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    ext = file.filename.split(".")[-1]
    unique = f"{uuid.uuid4()}.{ext}"
    out = UPLOADS_DIR / unique
    with open(out, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    image_url = f"/api/uploads/spotlight/{unique}"
    await db.spotlight.update_one({"id": student_id}, {"$set": {"image_url": image_url}})
    return {"image_url": image_url}


@spotlight_router.put("/{student_id}/approve", response_model=SpotlightStudent)
async def approve_spotlight(student_id: str, _=Depends(require_permission("edit"))):
    res = await db.spotlight.update_one(
        {"id": student_id},
        {"$set": {"approved": True, "is_active": True}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    updated = await db.spotlight.find_one({"id": student_id}, {"_id": 0})
    return SpotlightStudent(**updated)


@spotlight_router.post("", response_model=SpotlightStudent)
async def create_spotlight(payload: SpotlightCreate, _=Depends(require_permission("edit"))):
    obj = SpotlightStudent(**payload.dict())
    await db.spotlight.insert_one(obj.dict())
    return obj


@spotlight_router.put("/{student_id}", response_model=SpotlightStudent)
async def update_spotlight(student_id: str, payload: SpotlightUpdate, _=Depends(require_permission("edit"))):
    existing = await db.spotlight.find_one({"id": student_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Spotlight student not found")
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    if update_data:
        await db.spotlight.update_one({"id": student_id}, {"$set": update_data})
    updated = await db.spotlight.find_one({"id": student_id}, {"_id": 0})
    return SpotlightStudent(**updated)


@spotlight_router.post("/{student_id}/upload-image")
async def upload_spotlight_image(student_id: str, file: UploadFile = File(...), _=Depends(require_permission("edit"))):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    ext = file.filename.split(".")[-1]
    unique = f"{uuid.uuid4()}.{ext}"
    out = UPLOADS_DIR / unique
    with open(out, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    image_url = f"/api/uploads/spotlight/{unique}"
    await db.spotlight.update_one({"id": student_id}, {"$set": {"image_url": image_url}})
    return {"image_url": image_url}


@spotlight_router.delete("/{student_id}")
async def delete_spotlight(student_id: str, _=Depends(require_permission("delete"))):
    result = await db.spotlight.delete_one({"id": student_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}


# =============================================================================
# ACHIEVEMENTS
# =============================================================================
class Achievement(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    title: str
    recipient: str
    category: str  # ACADEMIC, SPORTS, LEADERSHIP, ARTS, ATTENDANCE, STEM
    description: Optional[str] = None
    image_url: Optional[str] = None
    date: Optional[datetime] = Field(default_factory=datetime.utcnow)
    order: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AchievementCreate(BaseModel):
    title: str
    recipient: str
    category: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    order: int = 0
    is_active: bool = True


class AchievementUpdate(BaseModel):
    title: Optional[str] = None
    recipient: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


@achievements_router.get("", response_model=List[Achievement])
async def get_achievements(active_only: bool = True, limit: int = 100):
    query = {"is_active": True} if active_only else {}
    items = await db.achievements.find(query, {"_id": 0}).sort([("order", 1), ("created_at", -1)]).to_list(limit)
    return [Achievement(**i) for i in items]


@achievements_router.post("", response_model=Achievement)
async def create_achievement(payload: AchievementCreate, _=Depends(require_permission("edit"))):
    obj = Achievement(**payload.dict())
    await db.achievements.insert_one(obj.dict())
    return obj


@achievements_router.put("/{aid}", response_model=Achievement)
async def update_achievement(aid: str, payload: AchievementUpdate, _=Depends(require_permission("edit"))):
    existing = await db.achievements.find_one({"id": aid})
    if not existing:
        raise HTTPException(status_code=404, detail="Achievement not found")
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    if update_data:
        await db.achievements.update_one({"id": aid}, {"$set": update_data})
    updated = await db.achievements.find_one({"id": aid}, {"_id": 0})
    return Achievement(**updated)


@achievements_router.delete("/{aid}")
async def delete_achievement(aid: str, _=Depends(require_permission("delete"))):
    result = await db.achievements.delete_one({"id": aid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}


@achievements_router.post("/{aid}/upload-image")
async def upload_achievement_image(
    aid: str,
    file: UploadFile = File(...),
    _=Depends(require_permission("edit")),
):
    existing = await db.achievements.find_one({"id": aid})
    if not existing:
        raise HTTPException(status_code=404, detail="Achievement not found")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    ext = (file.filename.split(".")[-1] or "jpg").lower()
    unique = f"{uuid.uuid4()}.{ext}"
    out_dir = Path("/app/uploads/achievements")
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / unique
    with open(out, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    image_url = f"/api/uploads/achievements/{unique}"
    await db.achievements.update_one({"id": aid}, {"$set": {"image_url": image_url}})
    return {"image_url": image_url}


# =============================================================================
# SCHOOL INFO (singleton doc with id="main")
# =============================================================================
class AboutParagraph(BaseModel):
    text: str


class SchoolInfo(BaseModel):
    id: str = "main"
    school_name: str = "Calusa Elementary School"
    address: str = "9580 SW 147th Avenue\nMiami, FL 33186"
    phone: str = "(305) 385-6555"
    email: str = "info@calusaelementary.edu"
    website: str = "https://www.calusaschool.org"
    hours: str = "Monday - Friday\n8:00 AM - 3:00 PM"
    tagline: str = "A Step Ahead"
    about_paragraphs: List[str] = Field(default_factory=lambda: [
        "Calusa Elementary School has been a cornerstone of educational excellence.",
        "Our mission is to provide a nurturing and challenging environment where every student can reach their full potential.",
    ])
    notable_achievements: List[str] = Field(default_factory=lambda: [
        "Platinum STEM School - 7 Years",
        "Award-Winning Student Newspaper",
    ])
    image_url: Optional[str] = "/branding/calusa-school.png"
    instagram_url: Optional[str] = "https://www.instagram.com/calusaelemschool/"
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SchoolInfoUpdate(BaseModel):
    school_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    hours: Optional[str] = None
    tagline: Optional[str] = None
    about_paragraphs: Optional[List[str]] = None
    notable_achievements: Optional[List[str]] = None
    image_url: Optional[str] = None
    instagram_url: Optional[str] = None


async def _ensure_school_info():
    doc = await db.school_info.find_one({"id": "main"})
    if not doc:
        default = SchoolInfo().dict()
        await db.school_info.insert_one(default)
        return default
    return doc


@school_info_router.get("", response_model=SchoolInfo)
async def get_school_info():
    doc = await _ensure_school_info()
    doc.pop("_id", None)
    return SchoolInfo(**doc)


@school_info_router.put("", response_model=SchoolInfo)
async def update_school_info(payload: SchoolInfoUpdate, _=Depends(require_permission("edit"))):
    await _ensure_school_info()
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    await db.school_info.update_one({"id": "main"}, {"$set": update_data})
    doc = await db.school_info.find_one({"id": "main"}, {"_id": 0})
    return SchoolInfo(**doc)


@school_info_router.post("/upload-image")
async def upload_school_image(file: UploadFile = File(...), _=Depends(require_permission("edit"))):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    ext = file.filename.split(".")[-1]
    unique = f"{uuid.uuid4()}.{ext}"
    out_dir = Path("/app/uploads/school")
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / unique
    with open(out, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    image_url = f"/api/uploads/school/{unique}"
    await _ensure_school_info()
    await db.school_info.update_one({"id": "main"}, {"$set": {"image_url": image_url, "updated_at": datetime.utcnow()}})
    return {"image_url": image_url}
