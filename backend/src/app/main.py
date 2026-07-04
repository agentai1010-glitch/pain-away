"""Pain Away — FastAPI Application Entry Point."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging
from app.db.session import engine
from app.shared.responses import HealthResponse
from app.catalog.api import router as catalog_router
from app.scheduling.api import router as scheduling_router
from app.patient.api import router as patient_router
from app.billing.api import router as billing_router
from app.orchestration.api import router as orchestration_router
from app.reception.api import router as reception_router
from app.director.api import router as director_router


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Manage application startup and shutdown."""
    # ── Startup ──
    setup_logging()
    logger = structlog.get_logger("app.main")
    logger.info(
        "Starting application",
        app_name=settings.APP_NAME,
        environment=settings.APP_ENV,
        timezone=settings.TIMEZONE,
    )
    yield
    # ── Shutdown ──
    logger.info("Shutting down application")
    await engine.dispose()
    logger.info("Database connections closed")


def create_app() -> FastAPI:
    """Application factory."""
    application = FastAPI(
        title=settings.APP_NAME,
        description="Clinic Operating System for Pain Away, Pune",
        version="0.1.0",
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
        lifespan=lifespan,
    )

    # CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global exception handlers
    register_exception_handlers(application)

    # ── System routes ──

    @application.get("/health", response_model=HealthResponse, tags=["System"])
    async def health_check() -> HealthResponse:
        """Health check endpoint."""
        return HealthResponse(
            status="healthy",
            app_name=settings.APP_NAME,
            environment=settings.APP_ENV,
        )

    application.include_router(catalog_router, prefix="/api/v1")
    application.include_router(scheduling_router, prefix="/api/v1")
    application.include_router(patient_router, prefix="/api/v1")
    application.include_router(billing_router, prefix="/api/v1")
    application.include_router(orchestration_router, prefix="/api/v1")
    application.include_router(reception_router, prefix="/api/v1")
    application.include_router(director_router, prefix="/api/v1")

    return application


app = create_app()
