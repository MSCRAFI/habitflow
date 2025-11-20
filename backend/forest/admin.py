"""
Forest Game Admin Interface
"""
from django.contrib import admin
from .models import (
    ForestLayout, TreePosition, ForestAction, ForestDecoration,
    ForestCreature, WeatherEvent, ForestAchievement, UserForestAchievement,
    DailyChallenge, UserDailyChallenge
)


@admin.register(ForestLayout)
class ForestLayoutAdmin(admin.ModelAdmin):
    list_display = ['user', 'forest_level', 'total_points', 'current_season', 'weather_state']
    list_filter = ['current_season', 'weather_state', 'forest_level']
    search_fields = ['user__username']


@admin.register(TreePosition)
class TreePositionAdmin(admin.ModelAdmin):
    list_display = ['user', 'habit', 'x', 'y', 'growth_stage', 'health_bonus']
    list_filter = ['growth_stage', 'tree_type']
    search_fields = ['user__username', 'habit__title']


@admin.register(ForestAction)
class ForestActionAdmin(admin.ModelAdmin):
    list_display = ['user', 'action_type', 'habit', 'points_earned', 'timestamp']
    list_filter = ['action_type', 'weather_at_time', 'season_at_time']
    search_fields = ['user__username', 'habit__title']
    date_hierarchy = 'timestamp'


@admin.register(ForestDecoration)
class ForestDecorationAdmin(admin.ModelAdmin):
    list_display = ['user', 'decoration_type', 'decoration_id', 'x', 'y']
    list_filter = ['decoration_type']
    search_fields = ['user__username']


@admin.register(ForestCreature)
class ForestCreatureAdmin(admin.ModelAdmin):
    list_display = ['user', 'creature_type', 'tree_position', 'is_active', 'visit_start']
    list_filter = ['creature_type', 'is_active']
    search_fields = ['user__username']


@admin.register(WeatherEvent)
class WeatherEventAdmin(admin.ModelAdmin):
    list_display = ['user', 'weather_type', 'start_time', 'duration_hours', 'is_active']
    list_filter = ['weather_type', 'is_active']
    search_fields = ['user__username']


@admin.register(ForestAchievement)
class ForestAchievementAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'achievement_type', 'required_level', 'points_reward']
    list_filter = ['achievement_type']
    search_fields = ['name', 'code']


@admin.register(UserForestAchievement)
class UserForestAchievementAdmin(admin.ModelAdmin):
    list_display = ['user', 'achievement', 'earned_at']
    list_filter = ['achievement__achievement_type']
    search_fields = ['user__username', 'achievement__name']


@admin.register(DailyChallenge)
class DailyChallengeAdmin(admin.ModelAdmin):
    list_display = ['date', 'challenge_type', 'title', 'target_value', 'points_reward']
    list_filter = ['challenge_type']
    date_hierarchy = 'date'


@admin.register(UserDailyChallenge)
class UserDailyChallengeAdmin(admin.ModelAdmin):
    list_display = ['user', 'challenge', 'progress', 'completed', 'completed_at']
    list_filter = ['completed', 'challenge__challenge_type']
    search_fields = ['user__username']