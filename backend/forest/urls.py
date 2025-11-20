"""
Forest Game URLs
"""
from django.urls import path
from . import views

urlpatterns = [
    # Main forest endpoints
    path('overview/', views.ForestGameViewSet.as_view({'get': 'overview'}), name='forest-overview'),
    path('statistics/', views.ForestGameViewSet.as_view({'get': 'statistics'}), name='forest-statistics'),
    
    # Tree care actions
    path('water/', views.ForestGameViewSet.as_view({'post': 'water_tree'}), name='forest-water'),
    path('prune/', views.ForestGameViewSet.as_view({'post': 'prune_tree'}), name='forest-prune'),
    path('fertilize/', views.ForestGameViewSet.as_view({'post': 'fertilize_tree'}), name='forest-fertilize'),
    path('move/', views.ForestGameViewSet.as_view({'post': 'move_tree'}), name='forest-move'),
    
    # Environmental controls
    path('weather/', views.ForestGameViewSet.as_view({'post': 'change_weather'}), name='forest-weather'),
]