"""
User app URLs
"""
from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'public', views.UserViewSet, basename='public-users')

# Routes organized by concern
urlpatterns = [
    # --- Authentication ---
    path('register/', views.RegisterView.as_view(), name='register'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/avatar/', views.AvatarUploadView.as_view(), name='user-avatar-upload'),
    path('me/', views.UserDetailView.as_view(), name='user-detail'),

    # --- Community ---
    path('community/stats/', views.CommunityStatsView.as_view(), name='community-stats'),
    path('community/leaderboard/', views.LeaderboardView.as_view(), name='community-leaderboard'),

    # --- Social / Search ---
    path('follow/', views.FollowView.as_view(), name='follow'),
    path('search/', views.UserSearchView.as_view(), name='user-search'),

    # --- Badges, Points, Level ---
    path('badges/', views.UserBadgesView.as_view(), name='user-badges'),
    path('points/', views.PointsAwardView.as_view(), name='user-points'),
    path('level/', views.UserLevelView.as_view(), name='user-level'),
    
    # --- Account Recovery ---
    path('password-reset/', views.PasswordResetRequestView.as_view(), name='password-reset'),
    path('verify-email/', views.VerifyEmailView.as_view(), name='verify-email'),
] + router.urls