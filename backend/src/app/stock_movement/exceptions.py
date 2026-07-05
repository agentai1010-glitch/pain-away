"""Stock Movement — Exceptions"""

from fastapi import HTTPException, status

class InvalidStockMovementException(HTTPException):
    def __init__(self, message: str) -> None:
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )

class InsufficientStockException(HTTPException):
    def __init__(self, message: str = "Insufficient stock to complete this movement") -> None:
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
