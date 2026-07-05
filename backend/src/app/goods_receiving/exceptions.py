"""Goods Receiving — Exceptions"""

from fastapi import HTTPException, status

class GoodsReceiptNotFoundException(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goods receipt not found"
        )

class InvalidGoodsReceivingException(HTTPException):
    def __init__(self, message: str) -> None:
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
