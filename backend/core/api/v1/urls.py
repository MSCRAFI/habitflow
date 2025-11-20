"""
API v1 URL Configuration
"""
from django.urls import path, include
from . import root_views

urlpatterns = [
    # API Root
    path('', root_views.api_root, name='api-root'),
    
    # App endpoints
    path('auth/', include('core.api.v1.auth_urls')),
    path('users/', include('users.urls')),
    path('habits/', include('habits.urls')),
    path('forest/', include('forest.urls')),
]
