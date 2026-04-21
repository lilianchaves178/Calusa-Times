from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models import Comment, CommentCreate
from routes.auth import require_permission
from datetime import datetime

router = APIRouter(prefix="/api/comments", tags=["comments"])

db = None


def set_db(database):
    global db
    db = database


@router.get("/{article_id}", response_model=List[Comment])
async def get_comments(article_id: str, approved_only: bool = True):
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if not article.get("comments_enabled", True):
        return []

    query = {"article_id": article_id}
    if approved_only:
        query["approved"] = True

    comments = await db.comments.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [Comment(**c) for c in comments]


@router.post("", response_model=Comment)
async def create_comment(comment: CommentCreate):
    article = await db.articles.find_one({"id": comment.article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if not article.get("comments_enabled", True):
        raise HTTPException(status_code=403, detail="Comments are disabled for this article")

    obj = Comment(**comment.dict())
    await db.comments.insert_one(obj.dict())
    return obj


@router.put("/{comment_id}/approve")
async def approve_comment(comment_id: str, _=Depends(require_permission("approve_comments"))):
    result = await db.comments.update_one({"id": comment_id}, {"$set": {"approved": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment approved"}


@router.delete("/{comment_id}")
async def delete_comment(comment_id: str, _=Depends(require_permission("approve_comments"))):
    result = await db.comments.delete_one({"id": comment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment deleted"}


@router.get("/pending/all", response_model=List[Comment])
async def get_pending_comments(_=Depends(require_permission("approve_comments"))):
    comments = await db.comments.find({"approved": False}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [Comment(**c) for c in comments]
