from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

UPLOADS_DIR = Path("/app/uploads")

@router.get("/articles/{filename}")
async def serve_article_image(filename: str):
    file_path = UPLOADS_DIR / "articles" / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)

@router.get("/art/{filename}")
async def serve_art_image(filename: str):
    file_path = UPLOADS_DIR / "art" / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)

@router.get("/sponsors/{filename}")
async def serve_sponsor_logo(filename: str):
    file_path = UPLOADS_DIR / "sponsors" / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)


@router.get("/spotlight/{filename}")
async def serve_spotlight_image(filename: str):
    file_path = UPLOADS_DIR / "spotlight" / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)


@router.get("/school/{filename}")
async def serve_school_image(filename: str):
    file_path = UPLOADS_DIR / "school" / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)
