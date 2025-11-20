"""
User views and authentication endpoints.

Import order: Django/standard lib -> DRF -> third-party -> local apps.
"""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db.models import Q, Count, F
from django.utils import timezone

from rest_framework import generics, serializers, status, views, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from habits.models import Badge, Habit, HabitEntry, PointsTransaction, UserBadge
from habits.serializers import UserBadgeSerializer
from users.models import Follow, UserProfile
from users.serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserProfileSerializer,
)

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Enhanced token serializer with user data and email/username login support"""
    
    username_field = 'username'  # Keep the field name as 'username' for compatibility
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make the username field accept email addresses too
        self.fields[self.username_field].help_text = 'Username or email address'
    
    def validate(self, attrs):
        username = attrs.get(self.username_field)
        password = attrs.get('password')
        
        if username and password:
            # Try to find user by username or email
            user = None
            
            # First try to authenticate with username as provided
            try:
                from django.contrib.auth import authenticate
                user = authenticate(username=username, password=password)
            except Exception:
                user = None
            
            # If that fails and the username looks like an email, 
            # try to find the user by email and authenticate with their username
            if not user and '@' in username:
                try:
                    user_obj = User.objects.get(email=username)
                    user = authenticate(username=user_obj.username, password=password)
                except (User.DoesNotExist, User.MultipleObjectsReturned):
                    user = None
            
            if user:
                if not user.is_active:
                    raise serializers.ValidationError(
                        'User account is disabled.',
                        code='authorization',
                    )
                
                # Store the authenticated user for token generation
                self.user = user
                
                # Continue with the original token generation logic
                refresh = self.get_token(user)
                
                return {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            else:
                raise serializers.ValidationError(
                    'No active account found with the given credentials',
                    code='authorization',
                )
        else:
            raise serializers.ValidationError(
                'Must include "username" and "password".',
                code='authorization',
            )
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['email'] = user.email
        token['username'] = user.username
        return token


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Obtain JWT tokens with username or email login.

    Endpoint: POST /api/v1/auth/login/
    Body: { username: string|email, password: string }
    Responses:
    - 200: { access, refresh, user }
    - 401/400: invalid credentials
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # Get the user from the validated data
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                user = serializer.user
                # Add user data to response
                response.data['user'] = UserSerializer(user).data
        return response


class RegisterView(generics.CreateAPIView):
    """
    Register a new user and return JWT tokens on success.

    Endpoint: POST /api/v1/auth/register/
    Body: JSON with username, email, password, and optional profile fields
    Responses:
    - 201: { user, refresh, access }
    - 400: serializer field errors
    - 500: generic error with message
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                # Return detailed field errors
                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user = serializer.save()
            
            # Generate tokens for new user
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            
            return Response(
                {
                    'user': UserSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Registration error: {str(e)}")
            
            return Response(
                {'error': 'Registration failed. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the current user's profile (user + profile fields).

    Endpoints:
    - GET /api/v1/users/profile/
    - PATCH /api/v1/users/profile/

    Use PATCH to update account and profile fields atomically.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    def patch(self, request, *args, **kwargs):
        """Handle both user fields and profile fields in one request"""
        user = request.user
        profile = self.get_object()
        
        # Extract user fields
        user_fields = ['first_name', 'last_name', 'email', 'bio']
        user_data = {k: v for k, v in request.data.items() if k in user_fields}
        
        # Extract profile fields  
        profile_fields = ['identity', 'location', 'website', 'profile_public', 'show_statistics']
        profile_data = {k: v for k, v in request.data.items() if k in profile_fields}
        
        # Update user fields
        for field, value in user_data.items():
            setattr(user, field, value)
        user.save()
        
        # Update profile fields
        for field, value in profile_data.items():
            setattr(profile, field, value)
        profile.save()
        
        # Return updated profile data
        serializer = self.get_serializer(profile)
        return Response(serializer.data)


class UserDetailView(generics.RetrieveAPIView):
    """
    Get current user's details.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to public user profiles for authenticated users."""
    queryset = User.objects.filter(profile__profile_public=True)
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['username', 'email']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'username']

    @action(detail=True, methods=['post'])
    def follow(self, request, pk=None):
        target = self.get_object()
        if target == request.user:
            return Response({'error': 'Cannot follow yourself'}, status=400)
        Follow.objects.get_or_create(follower=request.user, following=target)
        return Response({'message': 'Followed'})

    @action(detail=True, methods=['delete'])
    def unfollow(self, request, pk=None):
        target = self.get_object()
        Follow.objects.filter(follower=request.user, following=target).delete()
        return Response({'message': 'Unfollowed'})


class PasswordResetRequestView(views.APIView):
    """
    Request password reset via email.
    
    POST: Send password reset email
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            # TODO: Generate token and send email
            return Response(
                {'message': 'If the email exists, a reset link has been sent'},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            # Return same message for security
            return Response(
                {'message': 'If the email exists, a reset link has been sent'},
                status=status.HTTP_200_OK
            )


class VerifyEmailView(views.APIView):
    """
    Verify user email address.
    
    POST: Verify email with token
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        
        if not token:
            return Response(
                {'error': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # TODO: Verify token and mark email as verified
        return Response(
            {'message': 'Email verified successfully'},
            status=status.HTTP_200_OK
        )


class AvatarUploadView(views.APIView):
    """
    Upload user avatar image.
    
    POST: Upload new avatar
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        if 'avatar' not in request.FILES:
            return Response(
                {'error': 'No avatar file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        user.avatar = request.FILES['avatar']
        user.save()
        
        # Return updated user data
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


class FollowView(views.APIView):
    """
    Follow/unfollow users.
    
    POST: Follow a user
    DELETE: Unfollow a user
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        target_id = request.data.get('user_id')
        if not target_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            target_user = User.objects.get(id=target_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if target_user == request.user:
            return Response(
                {'error': 'Cannot follow yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            following=target_user
        )
        
        if created:
            return Response({'message': 'Successfully followed user'})
        else:
            return Response({'message': 'Already following this user'})
    
    def delete(self, request):
        target_id = request.data.get('user_id')
        if not target_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            target_user = User.objects.get(id=target_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        Follow.objects.filter(
            follower=request.user,
            following=target_user
        ).delete()
        
        return Response({'message': 'Successfully unfollowed user'})


class UserSearchView(views.APIView):
    """
    Search for users by username, email, or name.
    
    GET: Search users with query parameter
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        if not query or len(query) < 2:
            return Response(
                {'error': 'Query must be at least 2 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        users = User.objects.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(email__icontains=query),
            profile__profile_public=True
        ).exclude(id=request.user.id)[:20]
        
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class UserBadgesView(views.APIView):
    """
    Get user's earned badges.
    
    GET: Get all badges for current user
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_badges = UserBadge.objects.filter(
            user=request.user
        ).select_related('badge').order_by('-awarded_at')
        
        serializer = UserBadgeSerializer(user_badges, many=True)
        return Response(serializer.data)


class PointsAwardView(views.APIView):
    """
    Award points to user (admin function).
    
    POST: Award points to a user
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # For now, just return user's current points
        # This could be extended for admin point awarding
        user_profile = request.user.profile
        return Response({
            'total_points': user_profile.total_points,
            'level': user_profile.level
        })


class CommunityStatsView(views.APIView):
    """Aggregate community statistics for dashboard/insights."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cache_key = 'community_stats_v1'
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        now = timezone.now()
        last_24h = now - timedelta(hours=24)

        total_users = User.objects.filter(is_active=True).count()
        total_habits = Habit.objects.filter(is_active=True).count()

        # Users with completions in last 24h based on completed_at
        recent_entries = HabitEntry.objects.filter(
            completed=True,
            completed_at__gte=last_24h
        ).select_related('habit')

        completions_today = recent_entries.count()
        active_user_ids = recent_entries.values_list('habit__user_id', flat=True).distinct()
        active_today = active_user_ids.count()

        data = {
            'total_users': total_users,
            'active_today': active_today,
            'total_habits': total_habits,
            'completions_today': completions_today,
        }
        cache.set(cache_key, data, 300)  # 5 minutes
        return Response(data)


class LeaderboardView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        lb_type = request.query_params.get('type', 'weekly')
        now = timezone.now()
        week_ago = now.date() - timedelta(days=7)

        # Weekly completions aggregation
        weekly_qs = HabitEntry.objects.filter(
            completed=True,
            date__gte=week_ago
        ).values('habit__user_id').annotate(
            weekly_completions=Count('id')
        )
        weekly_map = {row['habit__user_id']: row['weekly_completions'] for row in weekly_qs}

        # Current streaks approximation: use max habit.current_streak per user
        streak_qs = Habit.objects.filter(is_active=True).values('user_id').annotate(
            current_streak=Count('id')  # placeholder, override with max below
        )
        # We will compute max current_streak per user efficiently
        streak_map = {}
        for h in Habit.objects.filter(is_active=True).values('user_id', 'current_streak'):
            uid = h['user_id']
            cs = h['current_streak'] or 0
            if uid not in streak_map or cs > streak_map[uid]:
                streak_map[uid] = cs

        # Total points from profile
        profile_fields = UserProfile.objects.values('user_id', 'total_points')
        points_map = {p['user_id']: p['total_points'] for p in profile_fields}

        user_ids = set(weekly_map.keys()) | set(streak_map.keys()) | set(points_map.keys())
        users = User.objects.filter(id__in=user_ids).values('id', 'username', 'first_name')

        # Build result list
        results = []
        for u in users:
            uid = u['id']
            results.append({
                'user': {'username': u['username'], 'first_name': u['first_name']},
                'current_streak': int(streak_map.get(uid, 0)),
                'weekly_completions': int(weekly_map.get(uid, 0)),
                'total_points': int(points_map.get(uid, 0)),
            })

        # Sort primarily by weekly_completions desc, then current_streak desc, then points desc
        results.sort(key=lambda r: (r['weekly_completions'], r['current_streak'], r['total_points']), reverse=True)
        results = results[:5]

        return Response({'results': results})


class UserLevelView(views.APIView):
    """
    Get current user level and XP information.
    
    GET: Get user's level, XP, and progress to next level
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_profile = request.user.profile
        
        # Calculate level and XP progression
        total_points = user_profile.total_points
        current_level = user_profile.level
        
        # Simple leveling system: 100 points per level
        points_per_level = 100
        points_for_current_level = (current_level - 1) * points_per_level
        points_for_next_level = current_level * points_per_level
        points_in_current_level = total_points - points_for_current_level
        
        # Update level if needed
        calculated_level = max(1, total_points // points_per_level + 1)
        if calculated_level != current_level:
            user_profile.level = calculated_level
            user_profile.save()
            current_level = calculated_level
        
        return Response({
            'level': current_level,
            'total_points': total_points,
            'points_for_next_level': points_for_next_level - total_points,
            'points_in_current_level': points_in_current_level,
            'progress_percentage': (points_in_current_level / points_per_level) * 100 if points_per_level > 0 else 0
        })