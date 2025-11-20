"""
Habits app URLs
"""
from django.urls import path
from habits import views

# REST endpoints grouped by resource
urlpatterns = [
  # Habit-specific actions first (most specific patterns)
  path('today/', views.HabitViewSet.as_view({'get': 'today'}), name='habit-today'),
  path('statistics/', views.HabitViewSet.as_view({'get': 'statistics'}), name='habit-statistics'),
  
  # Other specific endpoints
  path('badges/', views.BadgeListView.as_view(), name='badges'),
  path('feed/', views.FeedView.as_view(), name='feed'),
  path('analytics/weekly/', views.WeeklyAnalyticsView.as_view(), name='weekly-analytics'),
  path('analytics/monthly/', views.MonthlyAnalyticsView.as_view(), name='monthly-analytics'),
  
  # Challenges
  path('challenges/', views.ChallengeViewSet.as_view({'get': 'list', 'post': 'create'}), name='challenge-list'),
  path('challenges/<int:pk>/', views.ChallengeViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='challenge-detail'),
  path('challenges/<int:pk>/join/', views.ChallengeViewSet.as_view({'post': 'join'}), name='challenge-join'),
  
  # Habit entries endpoints
  path('entries/', views.HabitEntryViewSet.as_view({'get': 'list', 'post': 'create'}), name='habit-entry-list'),
  path('entries/<int:pk>/', views.HabitEntryViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='habit-entry-detail'),
  path('entries/bulk_create/', views.HabitEntryViewSet.as_view({'post': 'bulk_create'}), name='habit-entry-bulk'),
  
  # Habit stacks endpoints
  path('stacks/', views.HabitStackViewSet.as_view({'get': 'list', 'post': 'create'}), name='habit-stack-list'),
  path('stacks/<int:pk>/', views.HabitStackViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='habit-stack-detail'),
  
  # Habit detail actions (with pk)
  path('<int:pk>/mark_complete/', views.HabitViewSet.as_view({'post': 'mark_complete'}), name='habit-mark-complete'),
  path('<int:pk>/mark_incomplete/', views.HabitViewSet.as_view({'post': 'mark_incomplete'}), name='habit-mark-incomplete'),
  path('<int:pk>/entries/', views.HabitViewSet.as_view({'get': 'entries'}), name='habit-entries'),
  path('<int:pk>/analytics/', views.HabitViewSet.as_view({'get': 'analytics'}), name='habit-analytics'),
  path('<int:pk>/', views.HabitViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='habit-detail'),
  
  # Habit CRUD operations (root level)
  path('', views.HabitViewSet.as_view({'get': 'list', 'post': 'create'}), name='habit-list'),
]