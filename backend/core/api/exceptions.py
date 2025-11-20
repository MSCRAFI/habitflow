"""
Custom exception handler for consistent error responses
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler for consistent error responses across the API
    """
    response = exception_handler(exc, context)

    if response is None:
        return Response(
            {'detail': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Add error code for better client-side handling
    if 'detail' in response.data:
        response.data = {
            'error': {
                'message': str(response.data['detail']),
                'code': exc.__class__.__name__,
            }
        }

    return response
