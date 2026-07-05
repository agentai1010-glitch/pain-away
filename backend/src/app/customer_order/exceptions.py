from fastapi import HTTPException, status

class CustomerOrderNotFoundException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail="Customer Order not found")

class InvalidOrderStatusException(HTTPException):
    def __init__(self, message: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

class ProductNotFoundException(HTTPException):
    def __init__(self, product_id: str):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with id {product_id} not found")

class OrderImmutabilityException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail="Only DRAFT orders can be edited or deleted")
