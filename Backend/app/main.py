from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.database import engine

from app.models.cloud_file import CloudFile

# Routers
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.devices import router as devices_router
from app.routers.otp import router as otp_router
from app.routers.password_reset import (
    router as password_reset_router,
)
from app.routers.security import router as security_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown events.
    """

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("✅ Database connected successfully.")

    except Exception as error:
        print(f"❌ Database connection failed: {error}")

    yield

    print("🛑 PenX Backend stopped.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# ==========================
# CORS Configuration
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Register Routers
# ==========================

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(devices_router)
app.include_router(otp_router)
app.include_router(password_reset_router)
app.include_router(security_router)

# ==========================
# Root Endpoint
# ==========================


@app.get("/", tags=["Root"])
async def root():
    return {
        "success": True,
        "message": "Welcome to PenX Backend 🚀",
        "version": settings.APP_VERSION,
    }


# ==========================
# Health Check
# ==========================


@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "healthy",
        "database": "connected",
    }

# ==========================
# CORS Configuration
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "penx://app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)