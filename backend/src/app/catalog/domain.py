"""Catalog — Domain Rules"""

from enum import Enum


class ItemType(str, Enum):
    """Types of items available in the catalog."""
    SERVICE = "SERVICE"
    PACKAGE = "PACKAGE"
    PRODUCT = "PRODUCT"


def can_display_publicly(item_type: ItemType, is_active: bool) -> bool:
    """
    Domain rule: Only active services and packages are visible publicly.
    Products are not displayed in the public booking flow.
    """
    return is_active and item_type in (ItemType.SERVICE, ItemType.PACKAGE)
