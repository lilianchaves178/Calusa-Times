from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Import routes
from routes import articles, comments, uploads, auth, art, sponsors, popups

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize database for route modules
articles.set_db(db)
comments.set_db(db)
auth.set_db(db)
art.set_db(db)
sponsors.set_db(db)
popups.set_db(db)

# Include routers
app.include_router(articles.router)
app.include_router(comments.router)
app.include_router(uploads.router)
app.include_router(auth.router)
app.include_router(art.router)
app.include_router(sponsors.router)
app.include_router(popups.router)

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Calusa Times API - Running"}

# Include the api router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
