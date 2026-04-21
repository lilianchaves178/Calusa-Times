from fastapi import APIRouter, HTTPException, UploadFile, File, Request, Depends
from typing import List, Optional
from models import Article, ArticleCreate, ArticleUpdate
from motor.motor_asyncio import AsyncIOMotorClient
from routes.auth import require_permission
from services import email_service
from services import summarizer
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
    """Aggregate fresh imagery from across the site for the homepage slideshow.

    Pulls photos (preferring the last 14 days, then backfilling) from:
      • approved articles (each image in ``images`` + fallback ``image_url``)
      • active achievements with an ``image_url``
      • approved student art submissions
      • approved + active student spotlight entries

    Each photo carries a ``source`` label so the frontend can tag and link to
    the right destination page.
    """
    limit = max(1, min(limit, 20))
    recent_cutoff = datetime.utcnow() - timedelta(days=14)

    def _art_entries(docs):
        out = []
        for a in docs:
            photos = list(a.get("images") or [])
            if a.get("image_url") and a["image_url"] not in photos:
                photos.insert(0, a["image_url"])
            for url in photos:
                if not url:
                    continue
                out.append({
                    "source": "article",
                    "article_id": a["id"],
                    "link": f"/article/{a['id']}",
                    "title": a["title"],
                    "subtitle": a.get("author"),
                    "category": a.get("category"),
                    "image_url": url,
                    "date": a.get("date"),
                })
        return out

    def _achievement_entries(docs):
        return [
            {
                "source": "achievement",
                "link": "/achievements",
                "title": d["title"],
                "subtitle": d.get("recipient"),
                "category": d.get("category"),
                "image_url": d["image_url"],
                "date": d.get("date") or d.get("created_at"),
            }
            for d in docs
            if d.get("image_url")
        ]

    def _art_submission_entries(docs):
        return [
            {
                "source": "art",
                "link": "/student-art",
                "title": d["title"],
                "subtitle": d.get("artist_name"),
                "category": "STUDENT ART",
                "image_url": d["image_url"],
                "date": d.get("created_at"),
            }
            for d in docs
            if d.get("image_url")
        ]

    def _spotlight_entries(docs):
        return [
            {
                "source": "spotlight",
                "link": "/spotlight",
                "title": d["name"],
                "subtitle": d.get("grade") or "Student Spotlight",
                "category": "SPOTLIGHT",
                "image_url": d["image_url"],
                "date": d.get("created_at"),
            }
            for d in docs
            if d.get("image_url")
        ]

    # --- gather from all sources -------------------------------------------------
    fresh = []

    articles_recent = await db.articles.find(
        {"approved": True, "date": {"$gte": recent_cutoff}}, {"_id": 0}
    ).sort("date", -1).to_list(60)
    fresh.extend(_art_entries(articles_recent))

    achievements_recent = await db.achievements.find(
        {"is_active": True, "image_url": {"$nin": [None, ""]},
         "created_at": {"$gte": recent_cutoff}},
        {"_id": 0},
    ).sort("created_at", -1).to_list(60)
    fresh.extend(_achievement_entries(achievements_recent))

    art_recent = await db.art_submissions.find(
        {"approved": True, "image_url": {"$nin": [None, ""]},
         "created_at": {"$gte": recent_cutoff}},
        {"_id": 0},
    ).sort("created_at", -1).to_list(60)
    fresh.extend(_art_submission_entries(art_recent))

    spotlight_recent = await db.spotlight.find(
        {"approved": True, "is_active": True, "image_url": {"$nin": [None, ""]},
         "created_at": {"$gte": recent_cutoff}},
        {"_id": 0},
    ).sort("created_at", -1).to_list(60)
    fresh.extend(_spotlight_entries(spotlight_recent))

    # Newest first, trimmed to limit
    fresh.sort(key=lambda p: p.get("date") or datetime.min, reverse=True)
    photos = fresh[:limit]

    # --- backfill if we're short ------------------------------------------------
    if len(photos) < limit:
        used_urls = {p["image_url"] for p in photos}
        older = []

        a_old = await db.articles.find(
            {"approved": True, "date": {"$lt": recent_cutoff}}, {"_id": 0}
        ).sort("date", -1).to_list(60)
        older.extend(_art_entries(a_old))

        ach_old = await db.achievements.find(
            {"is_active": True, "image_url": {"$nin": [None, ""]},
             "created_at": {"$lt": recent_cutoff}},
            {"_id": 0},
        ).sort("created_at", -1).to_list(60)
        older.extend(_achievement_entries(ach_old))

        art_old = await db.art_submissions.find(
            {"approved": True, "image_url": {"$nin": [None, ""]},
             "created_at": {"$lt": recent_cutoff}},
            {"_id": 0},
        ).sort("created_at", -1).to_list(60)
        older.extend(_art_submission_entries(art_old))

        sp_old = await db.spotlight.find(
            {"approved": True, "is_active": True, "image_url": {"$nin": [None, ""]},
             "created_at": {"$lt": recent_cutoff}},
            {"_id": 0},
        ).sort("created_at", -1).to_list(60)
        older.extend(_spotlight_entries(sp_old))

        older.sort(key=lambda p: p.get("date") or datetime.min, reverse=True)
        for p in older:
            if len(photos) >= limit:
                break
            if p["image_url"] in used_urls:
                continue
            photos.append(p)
            used_urls.add(p["image_url"])

    return {"photos": photos}


@router.get("/print-edition")
async def get_print_edition(month: str):
    """Return approved articles + active achievements for a YYYY-MM month, with
    AI-generated summaries (cached on the article doc once generated)."""
    try:
        year_s, month_s = month.split("-", 1)
        year, month_i = int(year_s), int(month_s)
        if month_i < 1 or month_i > 12:
            raise ValueError
    except ValueError:
        raise HTTPException(status_code=400, detail="month must be YYYY-MM")

    start = datetime(year, month_i, 1)
    end = datetime(year + (1 if month_i == 12 else 0), 1 if month_i == 12 else month_i + 1, 1)

    articles_raw = await db.articles.find(
        {"approved": True, "date": {"$gte": start, "$lt": end}},
        {"_id": 0},
    ).sort("date", -1).to_list(50)

    out_articles = []
    for a in articles_raw:
        summary = a.get("ai_summary")
        if not summary:
            body = f"{a.get('description', '')}\n\n{a.get('content', '')}"
            summary = await summarizer.summarize_article(a.get("title", ""), body)
            if summary:
                await db.articles.update_one(
                    {"id": a["id"]}, {"$set": {"ai_summary": summary}}
                )
                a["ai_summary"] = summary
        out_articles.append(a)

    achievements = await db.achievements.find(
        {"is_active": True, "created_at": {"$gte": start, "$lt": end}},
        {"_id": 0},
    ).sort([("order", 1), ("created_at", -1)]).to_list(50)

    # Normalize dates to ISO so FastAPI serializes predictably
    for coll in (out_articles, achievements):
        for doc in coll:
            for key in ("date", "created_at", "updated_at"):
                if isinstance(doc.get(key), datetime):
                    doc[key] = doc[key].isoformat()

    return {"articles": out_articles, "achievements": achievements}


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
