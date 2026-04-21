from datetime import datetime
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from auth_models import get_password_hash, ROLE_PERMISSIONS
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def create_admin_user():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Idempotent: upsert admin so credentials are always valid
    now = datetime.utcnow()
    admin_user = {
        "id": "admin-001",
        "email": "admin@calusaschool.org",
        "hashed_password": get_password_hash("Calusa2024!"),
        "full_name": "Calusa Admin",
        "role": "admin",
        "permissions": ROLE_PERMISSIONS["admin"],
        "is_active": True,
        "created_at": now,
        "last_login": None,
    }

    await db.users.update_one(
        {"email": admin_user["email"]},
        {
            "$set": {
                "hashed_password": admin_user["hashed_password"],
                "full_name": admin_user["full_name"],
                "role": admin_user["role"],
                "permissions": admin_user["permissions"],
                "is_active": True,
            },
            "$setOnInsert": {
                "id": admin_user["id"],
                "email": admin_user["email"],
                "created_at": now,
                "last_login": None,
            },
        },
        upsert=True,
    )
    # Ensure created_at exists even on previously-seeded records
    await db.users.update_one(
        {"email": admin_user["email"], "created_at": None},
        {"$set": {"created_at": now}},
    )
    print("Admin user ensured.")
    print("Email: admin@calusaschool.org")
    print("Password: Calusa2024!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())
