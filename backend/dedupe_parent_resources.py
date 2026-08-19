"""One-time cleanup: removes duplicate Parent Resource page documents.

A content migration once inserted a second copy of each of the 6 category
stubs (PTA, INFO, CHAT, FORMS, VOLUNTEER, OTHER) because there was no
uniqueness constraint on the `category` field, which made everything on
/pta-corner show up twice.

For each category this keeps the most-recently-updated document (the one
with your actual edited content) and deletes the rest. Safe to re-run —
once there's only one document per category, it does nothing.

Usage (inside the backend container):
    docker compose exec backend python dedupe_parent_resources.py
"""
import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")


async def main():
    mongo_url = os.environ["MONGO_URL"]
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ["DB_NAME"]]

    categories = await db.parent_resource_pages.distinct("category")
    removed = 0
    for category in categories:
        docs = await db.parent_resource_pages.find({"category": category}).to_list(100)
        if len(docs) <= 1:
            continue
        # Keep the one with the newest updated_at (falls back to _id order if missing)
        docs.sort(key=lambda d: d.get("updated_at") or d["_id"].generation_time, reverse=True)
        keeper = docs[0]
        losers = docs[1:]
        for loser in losers:
            await db.parent_resource_pages.delete_one({"_id": loser["_id"]})
            removed += 1
        print(f"{category}: kept doc updated_at={keeper.get('updated_at')}, removed {len(losers)} duplicate(s)")

    print(f"Done. Removed {removed} duplicate document(s) total.")

    # Now that duplicates are gone, this can succeed (the app also tries this
    # on every startup, but doing it here confirms it right away).
    try:
        await db.parent_resource_pages.create_index("category", unique=True)
        print("Unique index on `category` is in place — this can't happen again.")
    except Exception as exc:
        print(f"Could not create unique index yet: {exc}")

    client.close()


if __name__ == "__main__":
    asyncio.run(main())
