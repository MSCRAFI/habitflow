"""
Habit views and API endpoints

Implements RESTful API for habit management with user filtering,
streak tracking, and analytics.
"""
from rest_framework import status, viewsets, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta
from users.models import Follow

from habits.models import Habit, HabitEntry, HabitStack, Badge, UserBadge, PointsTransaction, Challenge, ChallengeParticipant, FeedItem, Comment, Reaction
from habits.serializers import (
    HabitSerializer,
    HabitCreateUpdateSerializer,
    HabitEntrySerializer,
    HabitStackSerializer,
    HabitAnalyticsSerializer,
    BadgeSerializer,
    UserBadgeSerializer,
    PointsTransactionSerializer,
    ChallengeSerializer,
    ChallengeParticipantSerializer,
    FeedItemSerializer,
    CommentSerializer,
    ReactionSerializer,
)
from habits.services import HabitService, StreakService, AnalyticsService, BadgeService


# ===================== HABITS =====================
class HabitViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing user habits.

    Responsibilities:
    - CRUD operations on habits owned by the authenticated user
    - Completion/incompletion actions with streak updates
    - Per-habit analytics and user-wide statistics

    Authentication: JWT (Bearer token)
    Permissions: IsAuthenticated

    Filtering:
    - filterset_fields: category, frequency, is_active
    - search_fields: title, description
    - ordering_fields: created_at, current_streak, title

    Responses:
    - 200 OK on reads and successful actions
    - 201 Created on new habit
    - 400 Bad Request on validation errors
    - 404 Not Found when accessing another user's resources
    """
    permission_classes = [IsAuthenticated]
    filterset_fields = ['category', 'frequency', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'current_streak', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return habits filtered by current user"""
        return Habit.objects.filter(user=self.request.user).prefetch_related('entries')
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action in ['create', 'update', 'partial_update']:
            return HabitCreateUpdateSerializer
        return HabitSerializer
    
    def perform_create(self, serializer):
        """Automatically assign habit to current user"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        """
        Mark a habit as completed for today.
        
        POST /api/v1/habits/{id}/mark_complete/
        """
        habit = self.get_object()
        note = request.data.get('note', '')
        
        try:
            entry = HabitService.mark_complete(habit, note=note)
            return Response({
                'message': 'Habit marked as complete',
                'entry': HabitEntrySerializer(entry).data,
                'current_streak': habit.current_streak,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def mark_incomplete(self, request, pk=None):
        """
        Mark a habit as incomplete for a given date.
        
        POST /api/v1/habits/{id}/mark_incomplete/
        """
        habit = self.get_object()
        date = request.data.get('date', timezone.now().date())
        
        try:
            entry = HabitService.mark_incomplete(habit, date)
            return Response({
                'message': 'Habit marked as incomplete',
                'entry': HabitEntrySerializer(entry).data,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def entries(self, request, pk=None):
        """
        Get all entries for this habit.
        
        GET /api/v1/habits/{id}/entries/?date_from=2025-11-01&date_to=2025-11-30
        """
        habit = self.get_object()
        queryset = habit.entries.all()
        
        # Filter by date range if provided
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        serializer = HabitEntrySerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """
        Get analytics for a specific habit.
        
        GET /api/v1/habits/{id}/analytics/
        """
        habit = self.get_object()
        
        entries = habit.entries.all()
        completed = entries.filter(completed=True).count()
        total = entries.count()
        
        # Streak data
        current_streak = StreakService.calculate_streak(habit)
        
        # Weekly and monthly data
        now = timezone.now().date()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        week_completed = entries.filter(
            completed=True,
            date__gte=week_ago
        ).count()
        
        month_completed = entries.filter(
            completed=True,
            date__gte=month_ago
        ).count()
        
        return Response({
            'habit_id': habit.id,
            'title': habit.title,
            'completion_rate': (completed / total * 100) if total > 0 else 0,
            'current_streak': current_streak,
            'best_streak': habit.best_streak,
            'total_completions': completed,
            'total_entries': total,
            'week_completions': week_completed,
            'month_completions': month_completed,
        })
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """
        Get today's habits with completion status.

        GET /api/v1/habits/today/
        Response: simplified list with completion flags for quick rendering
        """
        today = timezone.now().date()
        habits = self.get_queryset().filter(is_active=True)
        
        result = []
        for habit in habits:
            entry = habit.entries.filter(date=today).first()
            result.append({
                'id': habit.id,
                'public_id': habit.public_id,
                'title': habit.title,
                'category': habit.category,
                'color_code': habit.color_code,
                'current_streak': habit.current_streak,
                'completed_today': entry.completed if entry else False,
            })
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get user-wide habit statistics.
        
        GET /api/v1/habits/statistics/
        """
        user = request.user
        stats = AnalyticsService.get_user_stats(user)
        
        serializer = HabitAnalyticsSerializer(stats)
        return Response(serializer.data)


# ===================== ENTRIES =====================
class HabitEntryViewSet(viewsets.ModelViewSet):
    """Manage individual habit entries with bulk and range operations."""
    serializer_class = HabitEntrySerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['date', 'completed']
    ordering = ['-date']
    
    def get_queryset(self):
        """Return entries only for user's habits"""
        return HabitEntry.objects.filter(
            habit__user=self.request.user
        ).select_related('habit')
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Bulk create multiple habit entries.
        
        POST /api/v1/habit-entries/bulk_create/
        {
            "entries": [
                {"habit_id": 1, "date": "2025-11-01", "completed": true},
                {"habit_id": 2, "date": "2025-11-01", "completed": false}
            ]
        }
        """
        entries_data = request.data.get('entries', [])
        created_entries = []
        
        for entry_data in entries_data:
            try:
                habit_id = entry_data.get('habit_id')
                habit = Habit.objects.get(id=habit_id, user=request.user)
                
                entry = HabitEntry.objects.get_or_create(
                    habit=habit,
                    date=entry_data.get('date'),
                    defaults={
                        'completed': entry_data.get('completed', True),
                        'note': entry_data.get('note', '')
                    }
                )[0]
                
                created_entries.append(HabitEntrySerializer(entry).data)
            except Habit.DoesNotExist:
                continue
        
        return Response(created_entries, status=status.HTTP_201_CREATED)


# ===================== STACKS =====================
class HabitStackViewSet(viewsets.ModelViewSet):
    """Manage habit stacks for behavioral chaining ("Never Miss Twice")."""
    serializer_class = HabitStackSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return stacks only for user's habits"""
        return HabitStack.objects.filter(
            user=self.request.user
        ).select_related('habit', 'anchor_habit')
    
    def perform_create(self, serializer):
        """Automatically assign stack to current user"""
        serializer.save(user=self.request.user)


# ===================== BADGES =====================
class BadgeListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_badges = UserBadge.objects.filter(user=request.user).select_related('badge')
        return Response(UserBadgeSerializer(user_badges, many=True).data)


# ===================== CHALLENGES =====================
class ChallengeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ChallengeSerializer

    def get_queryset(self):
        return Challenge.objects.annotate(participants_count=Count('participants'))

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        challenge = self.get_object()
        ChallengeParticipant.objects.get_or_create(challenge=challenge, user=request.user)
        return Response({'message': 'Joined challenge'})


# ===================== SOCIAL FEED =====================
class FeedView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get followed users and self
        followed_ids = list(Follow.objects.filter(follower=request.user).values_list('following_id', flat=True))
        user_ids = followed_ids + [request.user.id]
        items = FeedItem.objects.filter(user_id__in=user_ids).select_related('habit', 'badge', 'challenge').order_by('-created_at')[:200]
        return Response(FeedItemSerializer(items, many=True).data)


# ===================== ANALYTICS =====================
class WeeklyAnalyticsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = AnalyticsService.get_weekly_data(request.user)
        return Response({'range': 'weekly', 'data': data})


class MonthlyAnalyticsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = AnalyticsService.get_monthly_data(request.user)
        return Response({'range': 'monthly', 'data': data})