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
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": "admin@calusaschool.org"})
    
    if existing_admin:
        print("Admin user already exists!")
        return
    
    # Create admin user
    admin_user = {
        "id": "admin-001",
        "email": "admin@calusaschool.org",
        "hashed_password": get_password_hash("Calusa2024!"),
        "full_name": "Calusa Admin",
        "role": "admin",
        "permissions": ROLE_PERMISSIONS["admin"],
        "is_active": True,
        "created_at": None,
        "last_login": None
    }
    
    await db.users.insert_one(admin_user)
    print("✓ Admin user created successfully!")
    print("\n=== LOGIN CREDENTIALS ===")
    print("Email: admin@calusaschool.org")
    print("Password: Calusa2024!")
    print("========================\n")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())
