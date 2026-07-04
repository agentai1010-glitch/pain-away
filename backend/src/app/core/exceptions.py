"""Global exception classes and FastAPI exception handlers."""

import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logger = structlog.get_logger(__name__)


# ---------------------------------------------------------------------------
# Standard error response
# ---------------------------------------------------------------------------


class ErrorResponse(BaseModel):
    """Standard error response body."""

    error: str
    detail: str | None = None


# ---------------------------------------------------------------------------
# Application exception hierarchy
# ---------------------------------------------------------------------------


class AppException(Exception):
    """Base exception for all application errors."""

    def __init__(
        self,
        message: str = "An error occurred",
        status_code: int = 500,
        detail: str | None = None,
    ):
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(self.message)


class NotFoundException(AppException):
    """Raised when a requested resource does not exist."""

    def __init__(self, message: str = "Resource not found", detail: str | None = None):
        super().__init__(message=message, status_code=404, detail=detail)


class ConflictException(AppException):
    """Raised on duplicate or conflicting state (e.g., double-booking)."""

    def __init__(self, message: str = "Conflict", detail: str | None = None):
        super().__init__(message=message, status_code=409, detail=detail)


class ValidationException(AppException):
    """Raised when input fails domain validation."""

    def __init__(self, message: str = "Validation error", detail: str | None = None):
        super().__init__(message=message, status_code=422, detail=detail)


class BusinessRuleException(AppException):
    """Raised when a frozen business rule is violated."""

    def __init__(self, message: str = "Business rule violation", detail: str | None = None):
        super().__init__(message=message, status_code=400, detail=detail)


# ---------------------------------------------------------------------------
# Handler registration
# ---------------------------------------------------------------------------


def register_exception_handlers(app: FastAPI) -> None:
    """Register global exception handlers on the FastAPI application."""

    @app.exception_handler(AppException)
    async def app_exception_handler(_request: Request, exc: AppException) -> JSONResponse:
        logger.warning(
            "Application error",
            error=exc.message,
            status_code=exc.status_code,
            detail=exc.detail,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponse(error=exc.message, detail=exc.detail).model_dump(),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        logger.warning("Request validation error", errors=exc.errors())
        return JSONResponse(
            status_code=422,
            content=ErrorResponse(
                error="Validation error",
                detail=str(exc.errors()),
            ).model_dump(),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        _request: Request, exc: Exception
    ) -> JSONResponse:
        logger.error("Unhandled exception", error=str(exc), exc_info=True)
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(error="Internal server error").model_dump(),
        )
