"""
Users app - User management and authentication
"""
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user with email login and public UUID identifier."""
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    email = models.EmailField(unique=True)
    
    # Profile fields
    bio = models.TextField(blank=True, max_length=500)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    # Settings
    email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    is_active_user = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users_user'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['public_id']),
            models.Index(fields=['username']),
        ]
    
    def __str__(self):
        return f"{self.username} ({self.email})"
    
    def get_public_id(self):
        """Return the public ID instead of database ID"""
        return str(self.public_id)


class UserProfile(models.Model):
    """Extended profile: social fields, stats, privacy, and gamification."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Social
    bio = models.TextField(blank=True, max_length=500)
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    identity = models.CharField(max_length=100, blank=True, help_text="Identity statement e.g., 'Runner', 'Reader'")
    identity_progress = models.IntegerField(default=0, help_text="0-100 percent progress toward identity")
    
    # Statistics
    total_habits_created = models.IntegerField(default=0)
    total_completions = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    best_streak = models.IntegerField(default=0)
    total_points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    
    # Privacy settings
    profile_public = models.BooleanField(default=False)
    show_statistics = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users_profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"Profile: {self.user.username}"


class Follow(models.Model):
    """Follower relationships between users"""
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users_follow'
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.username} -> {self.following.username}"