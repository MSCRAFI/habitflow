"""
Lightweight middleware utilities for the API layer.
Currently includes a request logger stub; integrate with your logging stack if needed.
"""


class RequestLoggingMiddleware:
    """Request logging middleware.
    Kept intentionally minimal; hook into process_view/process_exception if extended.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response
