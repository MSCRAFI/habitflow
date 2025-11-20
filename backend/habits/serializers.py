"""
Serializers for Habit API endpoints
"""
from rest_framework import serializers
from habits.models import Habit, HabitEntry, HabitStack, Badge, UserBadge, PointsTransaction, Challenge, ChallengeParticipant, FeedItem, Comment, Reaction


class HabitEntrySerializer(serializers.ModelSerializer):
    """Serializer for habit entries (daily completions)"""
    
    class Meta:
        model = HabitEntry
        fields = ['id', 'date', 'completed', 'note', 'completed_at', 'points_earned']
        read_only_fields = ['completed_at', 'id']


class HabitSerializer(serializers.ModelSerializer):
    """Main serializer for habits.
    Includes nested entries (read-only) and computed fields for analytics.
    """
    entries = HabitEntrySerializer(many=True, read_only=True)
    completion_rate = serializers.SerializerMethodField()
    total_completions = serializers.SerializerMethodField()
    
    class Meta:
        model = Habit
        fields = [
            'id', 'public_id', 'title', 'description', 'category', 'frequency',
            'color_code', 'icon', 'current_streak', 'best_streak', 'last_completed',
            'is_active', 'is_micro_habit', 'reminder_enabled', 'reminder_time',
            'completion_rate', 'total_completions', 'entries', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'public_id', 'current_streak', 'best_streak', 
                           'last_completed', 'created_at', 'updated_at']
    
    def get_completion_rate(self, obj):
        return obj.completion_rate
    
    def get_total_completions(self, obj):
        return obj.total_completions


class HabitCreateUpdateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating/updating habits.
    Only accepts mutable fields to prevent client-side overwrites of server-derived values.
    """
    
    class Meta:
        model = Habit
        fields = [
            'title', 'description', 'category', 'frequency',
            'color_code', 'icon', 'is_active', 'is_micro_habit',
            'reminder_enabled', 'reminder_time'
        ]


class HabitStackSerializer(serializers.ModelSerializer):
    """Serializer for habit stacks linking anchor habit -> new habit.
    Provides titles for convenience while keeping FK ids writable.
    """
    habit_title = serializers.CharField(source='habit.title', read_only=True)
    anchor_habit_title = serializers.CharField(source='anchor_habit.title', read_only=True)
    
    class Meta:
        model = HabitStack
        fields = ['id', 'habit', 'habit_title', 'anchor_habit', 'anchor_habit_title', 'position']
        read_only_fields = ['id']


class HabitAnalyticsSerializer(serializers.Serializer):
    """Serializer for habit analytics/stats"""
    total_habits = serializers.IntegerField()
    active_habits = serializers.IntegerField()
    total_completions = serializers.IntegerField()
    average_streak = serializers.FloatField()
    completion_rate = serializers.FloatField()
    this_week_completions = serializers.IntegerField()
    this_month_completions = serializers.IntegerField()


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
    
        fields = ['id', 'code', 'name', 'description', 'icon', 'points']


class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'awarded_at']


class PointsTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointsTransaction
        fields = ['id', 'amount', 'reason', 'habit', 'entry', 'created_at']


class ChallengeSerializer(serializers.ModelSerializer):
    participants_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Challenge
        fields = ['id', 'public_id', 'title', 'description', 'start_date', 'end_date', 'goal', 'participants_count']
        read_only_fields = ['id', 'public_id']


class ChallengeParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeParticipant
        fields = ['id', 'challenge', 'user', 'joined_at', 'progress']
        read_only_fields = ['id', 'user', 'joined_at']


class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'user_name', 'text', 'created_at']
        read_only_fields = ['id', 'user', 'user_name', 'created_at']


class ReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reaction
        fields = ['id', 'user', 'emoji', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class FeedItemSerializer(serializers.ModelSerializer):
    """Community feed item with embedded comments and reactions (read-only).
    Write endpoints should operate on related models directly to avoid nested writes.
    """
    comments = CommentSerializer(many=True, read_only=True)
    reactions = ReactionSerializer(many=True, read_only=True)
    
    class Meta:
        model = FeedItem
        fields = ['id', 'type', 'message', 'habit', 'badge', 'challenge', 'entry', 'created_at', 'comments', 'reactions']
        read_only_fields = ['id', 'created_at', 'comments', 'reactions']