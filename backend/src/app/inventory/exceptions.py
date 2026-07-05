"""Inventory — Exceptions"""

from fastapi import HTTPException, status

class InventoryNotFoundException(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found"
        )
