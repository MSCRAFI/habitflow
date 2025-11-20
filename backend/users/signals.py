"""
Users app signals - Automatically create UserProfile when User is created
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, UserProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Create a UserProfile instance when a new User is created.
    This ensures all new users start with proper default stats (best_streak=0, etc.)
    """
    if created:
        UserProfile.objects.create(
            user=instance,
            total_habits_created=0,
            total_completions=0,
            current_streak=0,
            best_streak=0,  # Explicitly set to 0 to prevent -Infinity
            total_points=0,
            level=1,
            identity_progress=0,
        )


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Save the UserProfile whenever the User is saved.
    Creates profile if it doesn't exist (safety net).
    """
    if not hasattr(instance, 'profile'):
        UserProfile.objects.create(
            user=instance,
            total_habits_created=0,
            total_completions=0,
            current_streak=0,
            best_streak=0,
            total_points=0,
            level=1,
            identity_progress=0,
        )
    else:
        instance.profile.save()