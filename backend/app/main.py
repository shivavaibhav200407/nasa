"""ASTRA Backend Main Application.

FastAPI entrypoint with:
- Dynamic CORS configuration from environment variables
- Database schema initialization
- Versioned API routes
- Clear structured error responses
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .api.routes import router
from .db.database import init_db
from .settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    init_db()
    yield


app = FastAPI(
    title="astra-mission-trainer",
    description="Educational 90-day lunar outpost simulation backend for 2026 NASA Space Apps Challenge.",
    version="1.0.0",
    lifespan=lifespan,
)

from pathlib import Path
from fastapi.staticfiles import StaticFiles

# Configure CORS
origins = settings.cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True if origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API router
app.include_router(router)

# Serve built frontend at root if dist/ exists; otherwise fallback to JSON
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
else:
    @app.get("/")
    def root():
        return {
            "app": "astra-mission-trainer",
            "version": "1.0.0",
            "status": "operational",
            "docs_url": "/docs",
            "disclaimer": "Independent educational project; not affiliated with, endorsed by, or certified by NASA.",
        }
