"""Product — Exceptions"""

from fastapi import HTTPException, status

class ProductNotFound(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

class DuplicateProductSKU(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail="A product with this SKU already exists.")
