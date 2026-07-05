"""Purchase Order — Exceptions"""

from fastapi import HTTPException, status

class PurchaseOrderNotFoundException(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase order not found"
        )

class InvalidPurchaseOrderStatusException(HTTPException):
    def __init__(self, message: str) -> None:
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
