"""One-time import of the 2026-2027 Calusa Elementary PTA calendar flyer into
the Events collection. Safe to re-run — each event is upserted by matching on
(title, start), so running it twice won't create duplicates.

Usage (inside the backend container):
    docker compose exec backend python seed_calendar_2026.py
"""
import asyncio
import os
import uuid
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")


def dt(y, m, d, hh=0, mm=0):
    return datetime(y, m, d, hh, mm)


# (title, category, start, end, all_day, description)
EVENTS = [
    # ---- AUGUST ----
    ("Meet & Greet, Popup Shop, Coffee Truck & Ice Cream", "OTHER", dt(2026, 8, 12), None, True, None),
    ("First Day of School & Pizzarello Giveback Night", "ACADEMIC", dt(2026, 8, 13), None, True, None),
    ("Back to School Dance", "OTHER", dt(2026, 8, 19), None, True, None),
    ("Kona Ice", "OTHER", dt(2026, 8, 20), None, True, None),
    ("Miami Dolphins Family Night", "SPORTS", dt(2026, 8, 22), None, True, None),
    ("Community PTA Meeting", "PARENT", dt(2026, 8, 26, 9, 0), None, False, None),
    ("Dress Down Day ($1)", "FUNDRAISER", dt(2026, 8, 28), None, True, None),
    ("Off the Wall 5th Grade Fundraiser", "FUNDRAISER", dt(2026, 8, 28), None, True, None),
    ("Ready Set Fund - Miami Heat Fundraiser", "FUNDRAISER", dt(2026, 8, 31), None, True, None),

    # ---- SEPTEMBER ----
    ("PTA Membership Contest Deadline", "PARENT", dt(2026, 9, 4), None, True, None),
    ("Grandparents Day", "OTHER", dt(2026, 9, 9), None, True, None),
    ("Technology Donation Contest Deadline", "OTHER", dt(2026, 9, 11), None, True, None),
    ("Dress Down Day", "FUNDRAISER", dt(2026, 9, 12), None, True, None),
    ("Scholastic Book Fair", "ACADEMIC", dt(2026, 9, 14), dt(2026, 9, 18), True, None),
    ("After-Hours Book Fair", "ACADEMIC", dt(2026, 9, 16), dt(2026, 9, 18), True, None),
    ("Papa John's Niffy Fifty Sale Begins", "FUNDRAISER", dt(2026, 9, 20), None, True, None),
    ("No School", "HOLIDAY", dt(2026, 9, 23), None, True, None),
    ("Hispanic Heritage Dance", "OTHER", dt(2026, 9, 23), None, True, None),
    ("Ice Cream Truck Afterschool Sale", "FUNDRAISER", dt(2026, 9, 24), None, True, None),
    ("Chuck E. Cheese Fundraiser Night", "FUNDRAISER", dt(2026, 9, 25), None, True, None),
    ("Cookies & Canvas 5th Grade Fundraiser", "FUNDRAISER", dt(2026, 9, 30), None, True, None),

    # ---- OCTOBER ----
    ("Fright Night Ticket Pre-Sale", "OTHER", dt(2026, 10, 1), dt(2026, 10, 16), True, None),
    ("Movie Night", "OTHER", dt(2026, 10, 2), None, True, None),
    ("Pumpkin Decorating 5th Grade Fundraiser", "FUNDRAISER", dt(2026, 10, 7), None, True, None),
    ("Top Golf 5th Grade Fundraiser Event", "FUNDRAISER", dt(2026, 10, 9), None, True, None),
    ("Community PTA Meeting", "PARENT", dt(2026, 10, 14, 17, 0), None, False, None),
    ("Gold Pass / Red Ribbon Week", "OTHER", dt(2026, 10, 19), dt(2026, 10, 30), True, None),
    ("Kona Ice", "OTHER", dt(2026, 10, 29), None, True, None),
    ("Fright Night", "OTHER", dt(2026, 10, 23), None, True, None),
    ("Boo Dance & Parade", "OTHER", dt(2026, 10, 30), None, True, None),

    # ---- NOVEMBER ----
    ("No School", "HOLIDAY", dt(2026, 11, 3), None, True, None),
    ("Fluid Bear 5th Grade Fundraiser", "FUNDRAISER", dt(2026, 11, 4), None, True, None),
    ("Dress Down Day ($1)", "FUNDRAISER", dt(2026, 11, 10), None, True, None),
    ("Veteran's Day - No School", "HOLIDAY", dt(2026, 11, 11), None, True, None),
    ("Chuck E. Cheese Fundraiser", "FUNDRAISER", dt(2026, 11, 13), None, True, None),
    ("Holiday Pictures", "OTHER", dt(2026, 11, 16), dt(2026, 11, 17), True, None),
    ("Autumn Harvest Dance", "OTHER", dt(2026, 11, 20), None, True, None),
    ("Thanksgiving Break", "HOLIDAY", dt(2026, 11, 23), dt(2026, 11, 27), True, None),

    # ---- DECEMBER ----
    ("Holiday Grams & Gingerbread House Pre-Sales", "FUNDRAISER", dt(2026, 12, 1), None, True, None),
    ("Community PTA Meeting", "PARENT", dt(2026, 12, 2, 9, 0), None, False, None),
    ("Kona Ice", "OTHER", dt(2026, 12, 4), None, True, None),
    ("Holiday Shoppe Open", "FUNDRAISER", dt(2026, 12, 7), dt(2026, 12, 11), True, None),
    ("Gingerbread House 5th Grade Fundraiser", "FUNDRAISER", dt(2026, 12, 9), None, True, None),
    ("Career Day & Holiday Dance", "OTHER", dt(2026, 12, 16), None, True, None),
    ("Dress Down Day ($1)", "FUNDRAISER", dt(2026, 12, 17), None, True, None),
    ("No School", "HOLIDAY", dt(2026, 12, 18), None, True, None),
    ("Berry Farms Calusa Family Winter Festival", "OTHER", dt(2026, 12, 18), None, True, None),
    ("Winter Break", "HOLIDAY", dt(2026, 12, 21), dt(2027, 1, 1), True, None),
    ("Back to School", "ACADEMIC", dt(2027, 1, 4), None, True, None),
]


async def main():
    mongo_url = os.environ["MONGO_URL"]
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ["DB_NAME"]]

    inserted = 0
    updated = 0
    for title, category, start, end, all_day, description in EVENTS:
        existing = await db.events.find_one({"title": title, "start": start})
        doc = {
            "title": title,
            "category": category,
            "start": start,
            "end": end,
            "all_day": all_day,
            "description": description,
            "location": None,
            "is_active": True,
        }
        if existing:
            await db.events.update_one({"id": existing["id"]}, {"$set": doc})
            updated += 1
        else:
            doc["id"] = uuid.uuid4().hex
            doc["created_at"] = datetime.utcnow()
            await db.events.insert_one(doc)
            inserted += 1

    print(f"Done. Inserted {inserted} new events, updated {updated} existing ones.")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
