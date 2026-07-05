"""Brand — Exceptions"""

from fastapi import HTTPException, status

class BrandNotFoundException(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brand not found"
        )

class BrandAlreadyExistsException(HTTPException):
    def __init__(self, name: str) -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Brand with name '{name}' already exists"
        )
