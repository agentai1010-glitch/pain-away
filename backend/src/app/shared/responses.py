"""Standard API response schemas."""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Health check endpoint response."""

    status: str
    app_name: str
    environment: str


class SuccessResponse(BaseModel):
    """Generic success response wrapper."""

    success: bool = True
    message: str | None = None
