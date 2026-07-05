"""Category — Exceptions"""

from fastapi import HTTPException, status

class CategoryNotFoundException(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

class CategoryAlreadyExistsException(HTTPException):
    def __init__(self, name: str) -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Category with name '{name}' already exists"
        )

class InvalidParentCategoryException(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid parent category. A category cannot be its own parent, and the parent must exist."
        )
