"""Pexels free-image search + import."""
from __future__ import annotations

import os
import shutil
import uuid
from pathlib import Path
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from routes.auth import require_permission

router = APIRouter(prefix="/api/pexels", tags=["pexels"])

PEXELS_BASE = "https://api.pexels.com/v1"


def _api_key() -> Optional[str]:
    return os.environ.get("PEXELS_API_KEY")


UPLOADS_ROOT = Path("/app/uploads")


class ImportImageRequest(BaseModel):
    url: str
    target: str  # "articles", "spotlight", "school", "art", "sponsors"


@router.get("/search")
async def search_images(q: str = Query(..., min_length=1), per_page: int = 12, page: int = 1):
    """Search Pexels. Open to all (students using Submit Story), rate-limited by Pexels."""
    if not _api_key():
        raise HTTPException(status_code=503, detail="Pexels is not configured")
    per_page = max(1, min(per_page, 24))
    page = max(1, page)

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(
                f"{PEXELS_BASE}/search",
                params={"query": q, "per_page": per_page, "page": page},
                headers={"Authorization": _api_key()},
            )
            resp.raise_for_status()
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Pexels error: {exc}") from exc

    data = resp.json()
    photos = [
        {
            "id": p["id"],
            "photographer": p.get("photographer"),
            "photographer_url": p.get("photographer_url"),
            "pexels_url": p.get("url"),
            "thumb": (p.get("src") or {}).get("medium"),
            "full": (p.get("src") or {}).get("large"),
            "original": (p.get("src") or {}).get("original"),
            "alt": p.get("alt"),
        }
        for p in data.get("photos", [])
    ]
    return {
        "page": data.get("page", page),
        "per_page": data.get("per_page", per_page),
        "total_results": data.get("total_results", 0),
        "photos": photos,
    }


@router.post("/import")
async def import_pexels_image(payload: ImportImageRequest):
    """Download an image URL into our uploads and return the local URL.

    Accepts any HTTPS URL (not just Pexels) so the same endpoint can
    be reused later. Restricted to a known set of target directories.
    """
    if payload.target not in {"articles", "spotlight", "school", "art", "sponsors", "achievements", "parent-resources"}:
        raise HTTPException(status_code=400, detail="Invalid target directory")
    if not payload.url.startswith("https://"):
        raise HTTPException(status_code=400, detail="URL must be HTTPS")

    target_dir = UPLOADS_ROOT / payload.target
    target_dir.mkdir(parents=True, exist_ok=True)

    async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
        try:
            resp = await client.get(payload.url)
            resp.raise_for_status()
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Download failed: {exc}") from exc

        content_type = resp.headers.get("content-type", "image/jpeg")
        if not content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="URL did not return an image")
        ext = content_type.split("/")[-1].split(";")[0].strip() or "jpg"
        if ext == "jpeg":
            ext = "jpg"

        filename = f"{uuid.uuid4()}.{ext}"
        out_path = target_dir / filename
        out_path.write_bytes(resp.content)

    return {"image_url": f"/api/uploads/{payload.target}/{filename}"}
