"""
Habits app - Core habit tracking logic
"""
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class Habit(models.Model):
    """Track a user's habit with streaks, categories, and simple analytics."""
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('custom', 'Custom'),
    ]
    
    CATEGORY_CHOICES = [
        ('health', 'Health'),
        ('productivity', 'Productivity'),
        ('learning', 'Learning'),
        ('fitness', 'Fitness'),
        ('mindfulness', 'Mindfulness'),
        ('social', 'Social'),
        ('other', 'Other'),
    ]
    
    # IDs
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='habits')
    
    # Core fields
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='daily')
    
    # Appearance
    color_code = models.CharField(max_length=7, default='#3B82F6')  # Hex color
    icon = models.CharField(max_length=50, blank=True)  # Emoji or icon identifier
    
    # Streak tracking
    current_streak = models.IntegerField(default=0)
    best_streak = models.IntegerField(default=0)
    last_completed = models.DateField(null=True, blank=True)
    
    # Settings
    is_active = models.BooleanField(default=True)
    is_micro_habit = models.BooleanField(default=False)  # Tiny habits
    reminder_enabled = models.BooleanField(default=True)
    reminder_time = models.TimeField(null=True, blank=True)
    
    # Metadata for flexibility
    metadata = models.JSONField(default=dict, blank=True)  # For storing custom data
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'habits_habit'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['user', 'category']),
        ]
        unique_together = ['user', 'title']  # Prevent duplicate habit names per user
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    @property
    def completion_rate(self) -> float:
        """Calculate completion rate as percentage"""
        entries = self.entries.filter(completed=True).count()
        total = self.entries.count()
        return (entries / total * 100) if total > 0 else 0
    
    @property
    def total_completions(self) -> int:
        """Get total number of completions"""
        return self.entries.filter(completed=True).count()
    
    def update_streak(self):
        """Update habit streak based on completion entries."""
        entries = self.entries.filter(completed=True).order_by('-date')
        
        if not entries.exists():
            self.current_streak = 0
            self.last_completed = None
            return
        
        streak = 1
        last_date = entries.first().date
        self.last_completed = last_date
        
        # Count consecutive days
        for entry in entries[1:]:
            expected_date = last_date - timezone.timedelta(days=1)
            if entry.date == expected_date:
                streak += 1
                last_date = entry.date
            else:
                break
        
        self.current_streak = streak
        if streak > self.best_streak:
            self.best_streak = streak


class HabitEntry(models.Model):
    """
    Records each time a habit is completed.
    
    Enables tracking of daily completions and analytics.
    """
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='entries')
    date = models.DateField(auto_now_add=True)
    completed = models.BooleanField(default=True)
    note = models.TextField(blank=True, max_length=500)
    completed_at = models.DateTimeField(auto_now_add=True)
    
    # For gamification/analytics
    points_earned = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'habits_entry'
        ordering = ['-date']
        unique_together = ['habit', 'date']  # One entry per habit per day
        verbose_name_plural = 'Habit Entries'
        indexes = [
            models.Index(fields=['habit', '-date']),
            models.Index(fields=['habit', 'completed']),
        ]
    
    def __str__(self):
        status = "✓" if self.completed else "✗"
        return f"{status} {self.habit.title} - {self.date}"


class HabitStack(models.Model):
    """
    Habit stacking - linking habits together for behavioral chaining.
    
    Implement "Never Miss Twice" and habit stacking strategies.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='habit_stacks')
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='stacks')
    anchor_habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='stacked_habits')
    
    # "After [anchor_habit], I will [habit]"
    position = models.PositiveIntegerField(default=0)  # Order in the stack
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'habits_stack'
        unique_together = ['habit', 'anchor_habit']
    
    def __str__(self):
        return f"{self.anchor_habit.title} -> {self.habit.title}"


class Badge(models.Model):
    """Achievement badges e.g., 7-day streak, 30-day streak"""
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    points = models.IntegerField(default=0)

    class Meta:
        db_table = 'habits_badge'

    def __str__(self):
        return self.name


class UserBadge(models.Model):
    """Link a badge to a user with timestamp"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='awards')
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'habits_user_badge'
        unique_together = ('user', 'badge')


class PointsTransaction(models.Model):
    """Points/XP for gamification"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='points_transactions')
    amount = models.IntegerField()
    reason = models.CharField(max_length=200)
    habit = models.ForeignKey(Habit, null=True, blank=True, on_delete=models.SET_NULL)
    entry = models.ForeignKey('HabitEntry', null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'habits_points'
        ordering = ['-created_at']


class Challenge(models.Model):
    """Social challenges that users can join"""
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_challenges')
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    goal = models.IntegerField(default=0, help_text='Target completions or points')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'habits_challenge'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ChallengeParticipant(models.Model):
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='challenge_participations')
    joined_at = models.DateTimeField(auto_now_add=True)
    progress = models.IntegerField(default=0)

    class Meta:
        db_table = 'habits_challenge_participant'
        unique_together = ('challenge', 'user')


class HabitContract(models.Model):
    """Accountability partnership/contract"""
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='contracts_created')
    partner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='contracts_partnered')
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='contracts')
    terms = models.TextField()
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'habits_contract'
        unique_together = ('creator', 'partner', 'habit')


class FeedItem(models.Model):
    """Social feed items: habit completions, badges, challenges"""
    TYPE_CHOICES = [
        ('completion', 'Completion'),
        ('badge', 'Badge'),
        ('challenge', 'Challenge'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='feed_items')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    message = models.TextField()
    habit = models.ForeignKey(Habit, null=True, blank=True, on_delete=models.SET_NULL)
    badge = models.ForeignKey(Badge, null=True, blank=True, on_delete=models.SET_NULL)
    challenge = models.ForeignKey(Challenge, null=True, blank=True, on_delete=models.SET_NULL)
    entry = models.ForeignKey('HabitEntry', null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'habits_feed_item'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', '-created_at'])]


class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    feed_item = models.ForeignKey(FeedItem, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'habits_comment'


class Reaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    feed_item = models.ForeignKey(FeedItem, on_delete=models.CASCADE, related_name='reactions')
    emoji = models.CharField(max_length=10, default='👍')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'habits_reaction'
        unique_together = ('user', 'feed_item', 'emoji')