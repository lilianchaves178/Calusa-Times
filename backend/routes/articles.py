from fastapi import APIRouter, HTTPException, UploadFile, File, Request, Depends
from typing import List, Optional
from models import Article, ArticleCreate, ArticleUpdate
from motor.motor_asyncio import AsyncIOMotorClient
from routes.auth import require_permission
from services import email_service
import os
import uuid
from datetime import datetime, timedelta
import shutil
from pathlib import Path

router = APIRouter(prefix="/api/articles", tags=["articles"])

# MongoDB client will be injected
db = None

def set_db(database):
    global db
    db = database

# Create uploads directory
UPLOADS_DIR = Path("/app/uploads/articles")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

@router.get("", response_model=List[Article])
async def get_articles(
    featured: Optional[bool] = None,
    category: Optional[str] = None,
    approved_only: bool = True,
):
    query = {}
    if featured is not None:
        query["featured"] = featured
    if category:
        query["category"] = category
    if approved_only:
        query["approved"] = True

    articles = await db.articles.find(query, {"_id": 0}).sort("date", -1).to_list(100)
    return [Article(**article) for article in articles]


@router.get("/pending", response_model=List[Article])
async def get_pending_articles(_=Depends(require_permission("edit"))):
    articles = await db.articles.find({"approved": False}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [Article(**a) for a in articles]


@router.get("/admin/all", response_model=List[Article])
async def get_all_articles_admin(_=Depends(require_permission("edit"))):
    articles = await db.articles.find({}, {"_id": 0}).sort("date", -1).to_list(500)
    return [Article(**a) for a in articles]


@router.get("/photos-of-the-week")
async def get_photos_of_the_week(limit: int = 8):
    """Flatten approved-article images into a small slideshow-friendly list.

    Prefers articles from the last 14 days; if fewer than ``limit`` photos are
    found there, backfills with the most recent approved articles.
    """
    limit = max(1, min(limit, 20))
    recent_cutoff = datetime.utcnow() - timedelta(days=14)

    def flatten(article_docs):
        out = []
        for a in article_docs:
            photos = list(a.get("images") or [])
            if a.get("image_url") and a["image_url"] not in photos:
                photos.insert(0, a["image_url"])
            for url in photos:
                if not url:
                    continue
                out.append({
                    "article_id": a["id"],
                    "title": a["title"],
                    "author": a.get("author"),
                    "category": a.get("category"),
                    "image_url": url,
                    "date": a.get("date"),
                })
        return out

    primary = await db.articles.find(
        {"approved": True, "date": {"$gte": recent_cutoff}},
        {"_id": 0},
    ).sort("date", -1).to_list(60)

    photos = flatten(primary)[:limit]

    if len(photos) < limit:
        backfill = await db.articles.find(
            {"approved": True, "date": {"$lt": recent_cutoff}},
            {"_id": 0},
        ).sort("date", -1).to_list(60)
        photos.extend(flatten(backfill)[: (limit - len(photos))])

    return {"photos": photos}


@router.get("/{article_id}", response_model=Article)
async def get_article(article_id: str, request: Request):
    article = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Hide unapproved articles from public detail view
    if not article.get("approved", False):
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Track view
    await db.articles.update_one(
        {"id": article_id},
        {"$inc": {"views": 1}}
    )
    
    # Log analytics
    await db.analytics.insert_one({
        "article_id": article_id,
        "action": "view",
        "timestamp": datetime.utcnow(),
        "ip_address": request.client.host if request.client else None
    })
    
    return Article(**article)

@router.post("", response_model=Article)
async def create_article(article: ArticleCreate):
    article_dict = article.dict()
    if article_dict.get("images") is None:
        article_dict["images"] = []
    article_obj = Article(**article_dict)
    await db.articles.insert_one(article_obj.dict())
    # Fire off admin email notification (no-op if RESEND_API_KEY is unset)
    email_service.fire_and_forget(email_service.notify_new_article(db, article_obj.dict()))
    return article_obj

@router.put("/{article_id}/approve", response_model=Article)
async def approve_article(article_id: str, _=Depends(require_permission("edit"))):
    existing = await db.articles.find_one({"id": article_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Article not found")
    await db.articles.update_one(
        {"id": article_id},
        {"$set": {"approved": True, "updated_at": datetime.utcnow()}},
    )
    updated = await db.articles.find_one({"id": article_id}, {"_id": 0})
    return Article(**updated)


@router.put("/{article_id}", response_model=Article)
async def update_article(article_id: str, article_update: ArticleUpdate, _=Depends(require_permission("edit"))):
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    update_data = {k: v for k, v in article_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.articles.update_one(
        {"id": article_id},
        {"$set": update_data}
    )
    
    updated_article = await db.articles.find_one({"id": article_id}, {"_id": 0})
    return Article(**updated_article)

@router.delete("/{article_id}")
async def delete_article(article_id: str, _=Depends(require_permission("delete"))):
    result = await db.articles.delete_one({"id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Delete associated comments
    await db.comments.delete_many({"article_id": article_id})
    
    return {"message": "Article deleted successfully"}

@router.post("/upload-image")
async def upload_image_standalone(file: UploadFile = File(...)):
    """Upload an image and get back a URL. Used both by the public Submit Story flow
    (articles default to approved=false, so this is safe) and the admin new-article flow."""
    """Upload an image and get back a URL. Useful for new article creation flow."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOADS_DIR / unique_filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"image_url": f"/api/uploads/articles/{unique_filename}"}


@router.post("/{article_id}/upload-image")
async def upload_article_image(article_id: str, file: UploadFile = File(...), _=Depends(require_permission("upload"))):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOADS_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    image_url = f"/api/uploads/articles/{unique_filename}"

    # Append to article's image gallery. The first image also becomes
    # the cover (image_url) for backward-compatibility with article previews.
    existing_images = list(article.get("images") or [])
    if article.get("image_url") and article["image_url"] not in existing_images:
        existing_images.insert(0, article["image_url"])
    existing_images.append(image_url)

    update = {"images": existing_images, "updated_at": datetime.utcnow()}
    if not article.get("image_url"):
        update["image_url"] = image_url

    await db.articles.update_one({"id": article_id}, {"$set": update})

    return {"image_url": image_url, "images": existing_images}


@router.delete("/{article_id}/images")
async def remove_article_image(article_id: str, image_url: str, _=Depends(require_permission("edit"))):
    """Remove a specific image from an article's gallery. Pass ?image_url=..."""
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    images = [u for u in (article.get("images") or []) if u != image_url]

    update = {"images": images, "updated_at": datetime.utcnow()}
    # If we removed the cover, promote the next image (or clear it)
    if article.get("image_url") == image_url:
        update["image_url"] = images[0] if images else None

    await db.articles.update_one({"id": article_id}, {"$set": update})
    return {"images": images, "image_url": update.get("image_url")}

@router.post("/{article_id}/click")
async def track_click(article_id: str, request: Request):
    # Increment click count
    await db.articles.update_one(
        {"id": article_id},
        {"$inc": {"clicks": 1}}
    )
    
    # Log analytics
    await db.analytics.insert_one({
        "article_id": article_id,
        "action": "click",
        "timestamp": datetime.utcnow(),
        "ip_address": request.client.host if request.client else None
    })
    
    return {"message": "Click tracked"}

@router.get("/{article_id}/analytics")
async def get_article_analytics(article_id: str, _=Depends(require_permission("edit"))):
    article = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Get analytics data
    views = article.get("views", 0)
    clicks = article.get("clicks", 0)
    
    # Get detailed analytics (exclude Mongo _id)
    analytics = await db.analytics.find({"article_id": article_id}, {"_id": 0}).to_list(1000)
    
    return {
        "article_id": article_id,
        "title": article.get("title"),
        "total_views": views,
        "total_clicks": clicks,
        "click_through_rate": round((clicks / views * 100) if views > 0 else 0, 2),
        "recent_activity": analytics[-50:]  # Last 50 activities
    }
