"""Supplier — Exceptions"""

from fastapi import HTTPException, status

class SupplierNotFoundException(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )

class SupplierAlreadyExistsException(HTTPException):
    def __init__(self, name: str) -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Supplier with name '{name}' already exists"
        )
