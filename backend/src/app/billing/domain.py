"""Billing — Domain Rules"""

import uuid
from datetime import datetime

def generate_receipt_number() -> str:
    """Generate a unique receipt number based on timestamp and short UUID."""
    timestamp = datetime.now().strftime("%Y%m%d")
    short_id = str(uuid.uuid4())[:6].upper()
    return f"REC-{timestamp}-{short_id}"

def calculate_remaining_amount(total: int, advance: int) -> int:
    """Calculate remaining amount. Ensure it doesn't go below 0."""
    return max(0, total - advance)
