"""
Forest Game Models - Enhanced interactive forest with data persistence
"""
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from habits.models import Habit


class ForestLayout(models.Model):
    """Stores user's forest layout and custom configurations"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forest_layout')
    forest_level = models.IntegerField(default=1)
    total_points = models.IntegerField(default=0)
    current_season = models.CharField(max_length=20, default='spring', 
                                    choices=[('spring', 'Spring'), ('summer', 'Summer'), 
                                            ('autumn', 'Autumn'), ('winter', 'Winter')])
    weather_state = models.CharField(max_length=20, default='sunny',
                                   choices=[('sunny', 'Sunny'), ('cloudy', 'Cloudy'), 
                                           ('rainy', 'Rainy'), ('stormy', 'Stormy')])
    is_night = models.BooleanField(default=False)
    
    # Unlocked features
    unlocked_tree_types = models.JSONField(default=list, blank=True)  # ['cherry_blossom', 'oak', etc.]
    unlocked_decorations = models.JSONField(default=list, blank=True)  # ['rock_1', 'stream', etc.]
    unlocked_creatures = models.JSONField(default=list, blank=True)    # ['rabbit', 'bird', etc.]
    
    # Custom settings
    auto_weather = models.BooleanField(default=True)
    sound_enabled = models.BooleanField(default=True)
    day_night_cycle = models.BooleanField(default=True)
    
    # Statistics
    total_waterings = models.IntegerField(default=0)
    total_prunings = models.IntegerField(default=0)
    total_fertilizations = models.IntegerField(default=0)
    trees_planted = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'forest_layout'


class TreePosition(models.Model):
    """Custom tree positions and states in the forest"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tree_positions')
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='tree_position')
    
    # Position
    x = models.FloatField()
    y = models.FloatField()
    z_index = models.IntegerField(default=0)
    
    # Tree state
    size_multiplier = models.FloatField(default=1.0)  # Custom scaling
    health_bonus = models.FloatField(default=0.0)     # From care actions
    last_watered = models.DateTimeField(null=True, blank=True)
    last_pruned = models.DateTimeField(null=True, blank=True)
    last_fertilized = models.DateTimeField(null=True, blank=True)
    
    # Custom appearance
    tree_type = models.CharField(max_length=50, blank=True)  # Override default based on category
    custom_color = models.CharField(max_length=7, blank=True)  # Hex color override
    
    # Growth stages and special states
    growth_stage = models.CharField(max_length=20, default='sapling',
                                  choices=[('seed', 'Seed'), ('sapling', 'Sapling'), 
                                          ('young', 'Young'), ('mature', 'Mature'), 
                                          ('ancient', 'Ancient')])
    is_diseased = models.BooleanField(default=False)
    disease_cure_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'forest_tree_position'
        unique_together = ['user', 'habit']


class ForestAction(models.Model):
    """Track all forest interactions for persistence and analytics"""
    ACTION_TYPES = [
        ('water', 'Water Tree'),
        ('prune', 'Prune Tree'),
        ('fertilize', 'Fertilize Tree'),
        ('plant', 'Plant Tree'),
        ('move', 'Move Tree'),
        ('decorate', 'Add Decoration'),
        ('weather_change', 'Weather Change'),
        ('season_change', 'Season Change'),
        ('creature_visit', 'Creature Visit'),
        ('achievement', 'Achievement Unlock'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forest_actions')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, null=True, blank=True)
    tree_position = models.ForeignKey(TreePosition, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Action details
    points_earned = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)  # Store action-specific data
    
    # Weather/season context
    weather_at_time = models.CharField(max_length=20, blank=True)
    season_at_time = models.CharField(max_length=20, blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'forest_action'
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['user', 'action_type']),
        ]


class ForestDecoration(models.Model):
    """Decorative elements placed in the forest"""
    DECORATION_TYPES = [
        ('rock', 'Rock'),
        ('flower', 'Flower'),
        ('stream', 'Stream'),
        ('path', 'Path'),
        ('bench', 'Bench'),
        ('fountain', 'Fountain'),
        ('bridge', 'Bridge'),
        ('mushroom', 'Mushroom'),
        ('bush', 'Bush'),
        ('statue', 'Statue'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forest_decorations')
    decoration_type = models.CharField(max_length=20, choices=DECORATION_TYPES)
    decoration_id = models.CharField(max_length=50)  # Specific decoration variant
    
    # Position
    x = models.FloatField()
    y = models.FloatField()
    z_index = models.IntegerField(default=0)
    
    # Appearance
    scale = models.FloatField(default=1.0)
    rotation = models.FloatField(default=0.0)  # Degrees
    opacity = models.FloatField(default=1.0)
    
    # Unlock requirements
    required_level = models.IntegerField(default=1)
    required_points = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'forest_decoration'


class ForestCreature(models.Model):
    """Animated creatures that visit healthy trees"""
    CREATURE_TYPES = [
        ('rabbit', 'Rabbit'),
        ('bird', 'Bird'),
        ('butterfly', 'Butterfly'),
        ('squirrel', 'Squirrel'),
        ('owl', 'Owl'),
        ('deer', 'Deer'),
        ('firefly', 'Firefly'),
        ('bee', 'Bee'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forest_creatures')
    creature_type = models.CharField(max_length=20, choices=CREATURE_TYPES)
    tree_position = models.ForeignKey(TreePosition, on_delete=models.CASCADE, related_name='creatures')
    
    # Visit details
    visit_start = models.DateTimeField(auto_now_add=True)
    visit_duration = models.IntegerField(default=30)  # Seconds
    is_active = models.BooleanField(default=True)
    
    # Animation state
    animation_state = models.CharField(max_length=20, default='idle')
    x_offset = models.FloatField(default=0.0)
    y_offset = models.FloatField(default=0.0)
    
    class Meta:
        db_table = 'forest_creature'


class WeatherEvent(models.Model):
    """Weather system with effects on tree growth"""
    WEATHER_TYPES = [
        ('sunny', 'Sunny'),
        ('cloudy', 'Cloudy'),
        ('rainy', 'Rainy'),
        ('stormy', 'Stormy'),
        ('drought', 'Drought'),
        ('foggy', 'Foggy'),
        ('snowy', 'Snowy'),
        ('windy', 'Windy'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='weather_events')
    weather_type = models.CharField(max_length=20, choices=WEATHER_TYPES)
    
    # Duration
    start_time = models.DateTimeField(auto_now_add=True)
    duration_hours = models.IntegerField(default=6)
    is_active = models.BooleanField(default=True)
    
    # Effects
    growth_multiplier = models.FloatField(default=1.0)  # Effect on tree growth
    points_multiplier = models.FloatField(default=1.0)  # Effect on points earned
    special_effects = models.JSONField(default=dict, blank=True)  # Animation/visual effects
    
    class Meta:
        db_table = 'forest_weather'


class ForestAchievement(models.Model):
    """Forest-specific achievements and unlocks"""
    ACHIEVEMENT_TYPES = [
        ('first_tree', 'First Tree Planted'),
        ('forest_level', 'Forest Level Milestone'),
        ('care_streak', 'Daily Care Streak'),
        ('weather_master', 'Weather Event Master'),
        ('decorator', 'Forest Decorator'),
        ('creature_friend', 'Creature Whisperer'),
        ('ancient_tree', 'Ancient Tree Grower'),
        ('seasonal', 'Seasonal Champion'),
    ]
    
    code = models.CharField(max_length=50, unique=True)
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50)
    
    # Requirements
    required_level = models.IntegerField(default=1)
    required_points = models.IntegerField(default=0)
    required_actions = models.JSONField(default=dict, blank=True)
    
    # Rewards
    points_reward = models.IntegerField(default=0)
    unlocks = models.JSONField(default=list, blank=True)  # What this achievement unlocks
    
    class Meta:
        db_table = 'forest_achievement'


class UserForestAchievement(models.Model):
    """Track which achievements users have earned"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forest_achievements')
    achievement = models.ForeignKey(ForestAchievement, on_delete=models.CASCADE, related_name='user_achievements')
    earned_at = models.DateTimeField(auto_now_add=True)
    progress = models.JSONField(default=dict, blank=True)  # Track progress toward achievement
    
    class Meta:
        db_table = 'forest_user_achievement'
        unique_together = ['user', 'achievement']


class DailyChallenge(models.Model):
    """Daily forest challenges for engagement"""
    CHALLENGE_TYPES = [
        ('water_trees', 'Water Multiple Trees'),
        ('care_variety', 'Different Care Actions'),
        ('weather_bonus', 'Weather-based Challenge'),
        ('creature_attract', 'Attract Forest Creatures'),
        ('growth_target', 'Tree Growth Target'),
        ('decoration_place', 'Forest Decoration'),
    ]
    
    date = models.DateField(unique=True)
    challenge_type = models.CharField(max_length=20, choices=CHALLENGE_TYPES)
    title = models.CharField(max_length=100)
    description = models.TextField()
    
    # Requirements
    target_value = models.IntegerField()
    requirements = models.JSONField(default=dict, blank=True)
    
    # Rewards
    points_reward = models.IntegerField(default=50)
    special_rewards = models.JSONField(default=list, blank=True)
    
    class Meta:
        db_table = 'forest_daily_challenge'


class UserDailyChallenge(models.Model):
    """Track user progress on daily challenges"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_challenges')
    challenge = models.ForeignKey(DailyChallenge, on_delete=models.CASCADE, related_name='user_progress')
    progress = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'forest_user_daily_challenge'
        unique_together = ['user', 'challenge']