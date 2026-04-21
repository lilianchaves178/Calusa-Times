from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class Article(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    title: str
    description: str
    content: str
    author: str
    grade: Optional[str] = None
    image_url: Optional[str] = None
    images: List[str] = Field(default_factory=list)
    featured: bool = False
    comments_enabled: bool = True
    approved: bool = False
    ai_summary: Optional[str] = None
    views: int = 0
    clicks: int = 0
    date: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ArticleCreate(BaseModel):
    category: str
    title: str
    description: str
    content: str
    author: str
    grade: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    featured: bool = False
    comments_enabled: bool = True

class ArticleUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None
    grade: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    featured: Optional[bool] = None
    comments_enabled: Optional[bool] = None
    approved: Optional[bool] = None

class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    article_id: str
    author_name: str
    content: str
    approved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CommentCreate(BaseModel):
    article_id: str
    author_name: str
    content: str

class Analytics(BaseModel):
    article_id: str
    action: str  # 'view' or 'click'
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
