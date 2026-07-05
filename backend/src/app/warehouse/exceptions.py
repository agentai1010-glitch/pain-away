"""Warehouse — Exceptions"""

from fastapi import HTTPException, status

class WarehouseNotFoundException(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found"
        )

class WarehouseAlreadyExistsException(HTTPException):
    def __init__(self, message: str) -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=message
        )
