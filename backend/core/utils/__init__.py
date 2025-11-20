"""
Utility functions and helpers
"""
import uuid
from typing import Any, Dict


def generate_public_id() -> str:
    """Generate a public ID for resources"""
    return str(uuid.uuid4())


def paginate_queryset(queryset, page: int = 1, page_size: int = 20):
    """Paginate a queryset"""
    start = (page - 1) * page_size
    return queryset[start:start + page_size]
