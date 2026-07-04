"""Patient — Domain Rules"""

# Domain rules for Patient
# Mobile number formatting, etc. could go here.

def normalize_mobile_number(mobile_number: str) -> str:
    """Normalize the mobile number before processing."""
    return mobile_number.strip().replace(" ", "")
