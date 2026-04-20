from fastapi import APIRouter, HTTPException
from typing import List
from models import Comment, CommentCreate
from datetime import datetime

router = APIRouter(prefix="/api/comments", tags=["comments"])

db = None

def set_db(database):
    global db
    db = database

@router.get("/{article_id}", response_model=List[Comment])
async def get_comments(article_id: str, approved_only: bool = True):
    """Get comments for an article"""
    # Check if comments are enabled for this article
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    if not article.get("comments_enabled", True):
        return []
    
    query = {"article_id": article_id}
    if approved_only:
        query["approved"] = True
    
    comments = await db.comments.find(query).sort("created_at", -1).to_list(100)
    return [Comment(**comment) for comment in comments]

@router.post("", response_model=Comment)
async def create_comment(comment: CommentCreate):
    """Create a new comment (requires approval)"""
    # Check if article exists and comments are enabled
    article = await db.articles.find_one({"id": comment.article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    if not article.get("comments_enabled", True):
        raise HTTPException(status_code=403, detail="Comments are disabled for this article")
    
    comment_dict = comment.dict()
    comment_obj = Comment(**comment_dict)
    await db.comments.insert_one(comment_obj.dict())
    return comment_obj

@router.put("/{comment_id}/approve")
async def approve_comment(comment_id: str):
    """Approve a comment (admin only)"""
    result = await db.comments.update_one(
        {"id": comment_id},
        {"$set": {"approved": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    return {"message": "Comment approved"}

@router.delete("/{comment_id}")
async def delete_comment(comment_id: str):
    """Delete a comment (admin only)"""
    result = await db.comments.delete_one({"id": comment_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    return {"message": "Comment deleted"}

@router.get("/pending/all", response_model=List[Comment])
async def get_pending_comments():
    """Get all pending comments (admin only)"""
    comments = await db.comments.find({"approved": False}).sort("created_at", -1).to_list(100)
    return [Comment(**comment) for comment in comments]
