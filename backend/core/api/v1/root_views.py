"""
API Root Views for HabitFlow
"""
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

@api_view(['GET'])
def api_root(request):
    """
    API Root endpoint - shows available endpoints
    """
    return Response({
        'message': 'Welcome to HabitFlow API v1',
        'version': '1.0.0',
        'release_date': '2025-11-20',
        'status': 'Production Ready - Initial Public Release',
        'endpoints': {
            'habits': '/api/v1/habits/',
            'users': '/api/v1/users/', 
            'forest': '/api/v1/forest/',
            'admin': '/admin/'
        },
        'documentation': {
            'interactive': '/api/schema/swagger-ui/',
            'schema': '/api/schema/',
            'github': 'https://github.com/MSCRAFI/habitflow'
        }
    })

@api_view(['GET'])
def habits_root(request):
    """
    Habits API root endpoint
    """
    return Response({
        'message': 'HabitFlow Habits API',
        'available_endpoints': [
            '/api/v1/habits/today/',
            '/api/v1/habits/statistics/',
            '/api/v1/habits/badges/',
            '/api/v1/habits/feed/',
        ]
    })

@api_view(['GET']) 
def users_root(request):
    """
    Users API root endpoint
    """
    return Response({
        'message': 'HabitFlow Users API',
        'available_endpoints': [
            '/api/v1/users/register/',
            '/api/v1/users/profile/',
            '/api/v1/users/me/',
        ]
    })

@api_view(['GET'])
def forest_root(request):
    """
    Forest Game API root endpoint
    """
    return Response({
        'message': 'HabitFlow Forest Game API',
        'available_endpoints': [
            '/api/v1/forest/overview/',
            '/api/v1/forest/statistics/',
            '/api/v1/forest/water/',
        ]
    })