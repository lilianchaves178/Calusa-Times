from fastapi import APIRouter, HTTPException, UploadFile, File, Request
from typing import List, Optional
from models import Article, ArticleCreate, ArticleUpdate
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
from datetime import datetime
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
async def get_articles(featured: Optional[bool] = None, category: Optional[str] = None):
    query = {}
    if featured is not None:
        query["featured"] = featured
    if category:
        query["category"] = category
    
    articles = await db.articles.find(query).sort("date", -1).to_list(100)
    return [Article(**article) for article in articles]

@router.get("/{article_id}", response_model=Article)
async def get_article(article_id: str, request: Request):
    article = await db.articles.find_one({"id": article_id})
    if not article:
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
    article_obj = Article(**article_dict)
    await db.articles.insert_one(article_obj.dict())
    return article_obj

@router.put("/{article_id}", response_model=Article)
async def update_article(article_id: str, article_update: ArticleUpdate):
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    update_data = {k: v for k, v in article_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.articles.update_one(
        {"id": article_id},
        {"$set": update_data}
    )
    
    updated_article = await db.articles.find_one({"id": article_id})
    return Article(**updated_article)

@router.delete("/{article_id}")
async def delete_article(article_id: str):
    result = await db.articles.delete_one({"id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Delete associated comments
    await db.comments.delete_many({"article_id": article_id})
    
    return {"message": "Article deleted successfully"}

@router.post("/{article_id}/upload-image")
async def upload_article_image(article_id: str, file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOADS_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update article with image URL
    image_url = f"/api/uploads/articles/{unique_filename}"
    await db.articles.update_one(
        {"id": article_id},
        {"$set": {"image_url": image_url, "updated_at": datetime.utcnow()}}
    )
    
    return {"image_url": image_url}

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
async def get_article_analytics(article_id: str):
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Get analytics data
    views = article.get("views", 0)
    clicks = article.get("clicks", 0)
    
    # Get detailed analytics
    analytics = await db.analytics.find({"article_id": article_id}).to_list(1000)
    
    return {
        "article_id": article_id,
        "title": article.get("title"),
        "total_views": views,
        "total_clicks": clicks,
        "click_through_rate": round((clicks / views * 100) if views > 0 else 0, 2),
        "recent_activity": analytics[-50:]  # Last 50 activities
    }
