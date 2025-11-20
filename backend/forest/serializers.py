"""
Forest Game Serializers - API data serialization for forest features
"""
from rest_framework import serializers
from .models import (
    ForestLayout, TreePosition, ForestAction, ForestDecoration,
    ForestCreature, WeatherEvent, ForestAchievement, UserForestAchievement,
    DailyChallenge, UserDailyChallenge
)
from habits.serializers import HabitSerializer


class ForestLayoutSerializer(serializers.ModelSerializer):
    """Serialize user's forest layout and settings"""
    
    class Meta:
        model = ForestLayout
        fields = [
            'forest_level', 'total_points', 'current_season', 'weather_state', 'is_night',
            'unlocked_tree_types', 'unlocked_decorations', 'unlocked_creatures',
            'auto_weather', 'sound_enabled', 'day_night_cycle',
            'total_waterings', 'total_prunings', 'total_fertilizations', 'trees_planted',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TreePositionSerializer(serializers.ModelSerializer):
    """Serialize tree positions and states"""
    habit = HabitSerializer(read_only=True)
    habit_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = TreePosition
        fields = [
            'id', 'habit', 'habit_id', 'x', 'y', 'z_index',
            'size_multiplier', 'health_bonus', 'last_watered', 'last_pruned', 'last_fertilized',
            'tree_type', 'custom_color', 'growth_stage', 'is_diseased', 'disease_cure_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ForestActionSerializer(serializers.ModelSerializer):
    """Serialize forest actions for tracking and history"""
    habit_title = serializers.CharField(source='habit.title', read_only=True)
    
    class Meta:
        model = ForestAction
        fields = [
            'id', 'action_type', 'habit', 'habit_title', 'tree_position',
            'points_earned', 'metadata', 'weather_at_time', 'season_at_time',
            'timestamp'
        ]
        read_only_fields = ['timestamp']


class ForestDecorationSerializer(serializers.ModelSerializer):
    """Serialize forest decorations"""
    
    class Meta:
        model = ForestDecoration
        fields = [
            'id', 'decoration_type', 'decoration_id', 'x', 'y', 'z_index',
            'scale', 'rotation', 'opacity', 'required_level', 'required_points',
            'created_at'
        ]
        read_only_fields = ['created_at']


class ForestCreatureSerializer(serializers.ModelSerializer):
    """Serialize forest creatures"""
    tree_habit_title = serializers.CharField(source='tree_position.habit.title', read_only=True)
    
    class Meta:
        model = ForestCreature
        fields = [
            'id', 'creature_type', 'tree_position', 'tree_habit_title',
            'visit_start', 'visit_duration', 'is_active',
            'animation_state', 'x_offset', 'y_offset'
        ]
        read_only_fields = ['visit_start']


class WeatherEventSerializer(serializers.ModelSerializer):
    """Serialize weather events"""
    
    class Meta:
        model = WeatherEvent
        fields = [
            'id', 'weather_type', 'start_time', 'duration_hours', 'is_active',
            'growth_multiplier', 'points_multiplier', 'special_effects'
        ]
        read_only_fields = ['start_time']


class ForestAchievementSerializer(serializers.ModelSerializer):
    """Serialize forest achievements"""
    
    class Meta:
        model = ForestAchievement
        fields = [
            'code', 'achievement_type', 'name', 'description', 'icon',
            'required_level', 'required_points', 'required_actions',
            'points_reward', 'unlocks'
        ]


class UserForestAchievementSerializer(serializers.ModelSerializer):
    """Serialize user's earned achievements"""
    achievement = ForestAchievementSerializer(read_only=True)
    
    class Meta:
        model = UserForestAchievement
        fields = ['achievement', 'earned_at', 'progress']


class DailyChallengeSerializer(serializers.ModelSerializer):
    """Serialize daily challenges"""
    
    class Meta:
        model = DailyChallenge
        fields = [
            'date', 'challenge_type', 'title', 'description',
            'target_value', 'requirements', 'points_reward', 'special_rewards'
        ]


class UserDailyChallengeSerializer(serializers.ModelSerializer):
    """Serialize user's daily challenge progress"""
    challenge = DailyChallengeSerializer(read_only=True)
    
    class Meta:
        model = UserDailyChallenge
        fields = ['challenge', 'progress', 'completed', 'completed_at']


class ForestOverviewSerializer(serializers.Serializer):
    """Combined forest data for efficient loading"""
    layout = ForestLayoutSerializer()
    tree_positions = TreePositionSerializer(many=True)
    decorations = ForestDecorationSerializer(many=True)
    active_creatures = ForestCreatureSerializer(many=True)
    current_weather = WeatherEventSerializer()
    daily_challenge = UserDailyChallengeSerializer()
    recent_actions = ForestActionSerializer(many=True)
    achievements = UserForestAchievementSerializer(many=True)