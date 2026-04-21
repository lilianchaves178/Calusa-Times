"""Events calendar — admin CRUD + public list + ICS feed for calendar subscription."""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
import uuid

from routes.auth import require_permission

router = APIRouter(prefix="/api/events", tags=["events"])

db = None


def set_db(database):
    global db
    db = database


# Event categories with display colors (used by the calendar frontend)
CATEGORY_CHOICES = {
    "FIELD_TRIP", "HOLIDAY", "ASSEMBLY", "PARENT", "SPORTS",
    "ARTS", "FUNDRAISER", "ACADEMIC", "OTHER",
}


class Event(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    category: str = "OTHER"
    start: datetime
    end: Optional[datetime] = None
    all_day: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    category: str = "OTHER"
    start: datetime
    end: Optional[datetime] = None
    all_day: bool = False
    is_active: bool = True


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    all_day: Optional[bool] = None
    is_active: Optional[bool] = None


# ---------------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------------

@router.get("", response_model=List[Event])
async def list_events(
    active_only: bool = True,
    start_after: Optional[datetime] = None,
    end_before: Optional[datetime] = None,
):
    query = {}
    if active_only:
        query["is_active"] = True
    range_clause = {}
    if start_after:
        range_clause["$gte"] = start_after
    if end_before:
        range_clause["$lte"] = end_before
    if range_clause:
        query["start"] = range_clause
    items = await db.events.find(query, {"_id": 0}).sort("start", 1).to_list(500)
    return [Event(**i) for i in items]


@router.get("/upcoming", response_model=List[Event])
async def upcoming_events(limit: int = 6):
    now = datetime.utcnow()
    items = (
        await db.events.find(
            {"is_active": True, "start": {"$gte": now - timedelta(hours=6)}},
            {"_id": 0},
        )
        .sort("start", 1)
        .to_list(max(1, min(limit, 30)))
    )
    return [Event(**i) for i in items]


# ---------- ICS calendar feed (RFC 5545) ----------

def _ics_escape(text: str) -> str:
    if text is None:
        return ""
    return (
        text.replace("\\", "\\\\")
        .replace(";", "\\;")
        .replace(",", "\\,")
        .replace("\n", "\\n")
    )


def _fmt_dt(dt: datetime, all_day: bool = False) -> str:
    if all_day:
        return dt.strftime("%Y%m%d")
    return dt.strftime("%Y%m%dT%H%M%SZ")


def _build_ics(events: List[dict]) -> str:
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//The Calusa Times//Events//EN",
        "X-WR-CALNAME:The Calusa Times — Events",
        "X-WR-CALDESC:Calusa Elementary student newspaper events",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
    ]
    for e in events:
        start = e["start"]
        end = e.get("end") or (start + timedelta(hours=1))
        all_day = bool(e.get("all_day"))

        dtstart_key = "DTSTART;VALUE=DATE" if all_day else "DTSTART"
        dtend_key = "DTEND;VALUE=DATE" if all_day else "DTEND"

        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{e['id']}@calusakidnews",
            f"DTSTAMP:{_fmt_dt(datetime.utcnow())}",
            f"{dtstart_key}:{_fmt_dt(start, all_day)}",
            f"{dtend_key}:{_fmt_dt(end, all_day)}",
            f"SUMMARY:{_ics_escape(e['title'])}",
        ])
        if e.get("description"):
            lines.append(f"DESCRIPTION:{_ics_escape(e['description'])}")
        if e.get("location"):
            lines.append(f"LOCATION:{_ics_escape(e['location'])}")
        if e.get("category"):
            lines.append(f"CATEGORIES:{_ics_escape(e['category'])}")
        lines.append("END:VEVENT")

    lines.append("END:VCALENDAR")
    # ICS lines must end with CRLF
    return "\r\n".join(lines) + "\r\n"


@router.get("/calendar.ics")
async def calendar_feed():
    items = await db.events.find(
        {"is_active": True}, {"_id": 0}
    ).sort("start", 1).to_list(1000)
    ics = _build_ics(items)
    return Response(
        content=ics,
        media_type="text/calendar; charset=utf-8",
        headers={
            "Content-Disposition": 'inline; filename="calusa-events.ics"',
            "Cache-Control": "public, max-age=900",
        },
    )


@router.get("/{event_id}.ics")
async def event_ics(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    ics = _build_ics([event])
    return Response(
        content=ics,
        media_type="text/calendar; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="calusa-{event_id}.ics"',
        },
    )


# ---------------------------------------------------------------------------
# Admin endpoints
# ---------------------------------------------------------------------------

@router.post("", response_model=Event)
async def create_event(
    payload: EventCreate,
    _=Depends(require_permission("edit")),
):
    if payload.category not in CATEGORY_CHOICES:
        raise HTTPException(status_code=400, detail="Invalid category")
    obj = Event(**payload.dict())
    await db.events.insert_one(obj.dict())
    return obj


@router.put("/{event_id}", response_model=Event)
async def update_event(
    event_id: str,
    payload: EventUpdate,
    _=Depends(require_permission("edit")),
):
    existing = await db.events.find_one({"id": event_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
    updates = {k: v for k, v in payload.dict(exclude_none=True).items()}
    if "category" in updates and updates["category"] not in CATEGORY_CHOICES:
        raise HTTPException(status_code=400, detail="Invalid category")
    if updates:
        await db.events.update_one({"id": event_id}, {"$set": updates})
    updated = await db.events.find_one({"id": event_id}, {"_id": 0})
    return Event(**updated)


@router.delete("/{event_id}")
async def delete_event(event_id: str, _=Depends(require_permission("delete"))):
    res = await db.events.delete_one({"id": event_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Deleted"}
