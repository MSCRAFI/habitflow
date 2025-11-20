"""
Service layer for habit business logic

This layer encapsulates all business logic and keeps views/APIs thin.
Follows domain-driven design principles.
"""
from datetime import timedelta
from django.utils import timezone
from django.db.models import Q, Count
from habits.models import Habit, HabitEntry, HabitStack, PointsTransaction, FeedItem, Badge, UserBadge


class HabitService:
    """Service for managing habit operations"""
    
    @staticmethod
    def create_habit(user, **kwargs):
        """Create a new habit for a user"""
        habit = Habit.objects.create(user=user, **kwargs)
        return habit
    
    @staticmethod
    def mark_complete(habit: Habit, date=None, note='') -> HabitEntry:
        """Mark a habit as complete for a given date"""
        if date is None:
            date = timezone.now().date()
        
        entry, created = HabitEntry.objects.get_or_create(
            habit=habit,
            date=date,
            defaults={'completed': True, 'note': note}
        )
        
        if created or not entry.completed:
            entry.completed = True
            entry.note = note
            entry.save()
            
            # Update streak
            habit.update_streak()
            habit.save()

            # Award points (micro habits less points)
            base_points = 5 if habit.is_micro_habit else 10
            PointsTransaction.objects.create(
                user=habit.user,
                amount=base_points,
                reason=f"Completed habit: {habit.title}",
                habit=habit,
                entry=entry,
            )
            # Update profile totals and level
            profile = habit.user.profile
            profile.total_points += base_points
            profile.total_completions += 1
            # Simple level formula: 100 pts per level
            profile.level = max(1, (profile.total_points // 100) + 1)
            profile.current_streak = max(profile.current_streak, habit.current_streak)
            profile.best_streak = max(profile.best_streak, habit.best_streak)
            profile.save()

            # Create feed item
            FeedItem.objects.create(
                user=habit.user,
                type='completion',
                message=f"completed {habit.title}",
                habit=habit,
                entry=entry,
            )

            # Check simple badge awards for streaks
            for code, days, name in [
                ("streak_7", 7, "7 Day Streak"),
                ("streak_30", 30, "30 Day Streak"),
            ]:
                if habit.current_streak >= days:
                    badge, _ = Badge.objects.get_or_create(code=code, defaults={
                        'name': name,
                        'description': f"Achieved a {days}-day streak",
                        'points': days,
                    })
                    UserBadge.objects.get_or_create(user=habit.user, badge=badge)
        
        return entry
    
    @staticmethod
    def mark_incomplete(habit: Habit, date=None) -> HabitEntry:
        """Mark a habit as incomplete for a given date"""
        if date is None:
            date = timezone.now().date()
        
        entry, created = HabitEntry.objects.get_or_create(
            habit=habit,
            date=date,
            defaults={'completed': False}
        )
        
        if not created:
            entry.completed = False
            entry.save()
            
            # Update streak
            habit.update_streak()
            habit.save()
        
        return entry
    
    @staticmethod
    def calculate_streak(habit: Habit) -> int:
        """Calculate current streak for a habit"""
        entries = habit.entries.filter(completed=True).order_by('-date')
        
        if not entries.exists():
            return 0
        
        streak = 1
        last_date = entries.first().date
        
        for entry in entries[1:]:
            expected_date = last_date - timedelta(days=1)
            if entry.date == expected_date:
                streak += 1
                last_date = entry.date
            else:
                break
        
        return streak
    
    @staticmethod
    def get_user_stats(user) -> dict:
        """Get comprehensive stats for a user"""
        habits = user.habits.all()
        entries = HabitEntry.objects.filter(habit__user=user)
        
        # Calculate week/month boundaries
        now = timezone.now()
        week_ago = (now - timedelta(days=7)).date()
        month_ago = (now - timedelta(days=30)).date()
        
        week_entries = entries.filter(date__gte=week_ago, completed=True).count()
        month_entries = entries.filter(date__gte=month_ago, completed=True).count()
        
        total_completions = entries.filter(completed=True).count()
        total_habits = habits.count()
        active_habits = habits.filter(is_active=True).count()
        
        # Average streak
        average_streak = 0
        if total_habits > 0:
            total_streak = sum(h.current_streak for h in habits)
            average_streak = total_streak / total_habits
        
        completion_rate = 0
        if entries.exists():
            completion_rate = (total_completions / entries.count()) * 100
        
        return {
            'total_habits': total_habits,
            'active_habits': active_habits,
            'total_completions': total_completions,
            'average_streak': average_streak,
            'completion_rate': completion_rate,
            'this_week_completions': week_entries,
            'this_month_completions': month_entries,
        }
    
    @staticmethod
    def get_habits_for_date(user, date=None):
        """Get all habits with entries for a specific date"""
        if date is None:
            date = timezone.now().date()
        
        habits = user.habits.filter(is_active=True)
        habits_with_entries = []
        
        for habit in habits:
            entry = habit.entries.filter(date=date).first()
            habits_with_entries.append({
                'habit': habit,
                'entry': entry,
                'completed': entry.completed if entry else False,
            })
        
        return habits_with_entries


class StreakService:
    """Service for streak-related operations"""
    
    @staticmethod
    def get_all_user_streaks(user) -> dict:
        """Get all streak information for user"""
        habits = user.habits.all()
        return {
            'current_total': sum(h.current_streak for h in habits),
            'best_total': sum(h.best_streak for h in habits),
            'habits': [
                {
                    'id': h.id,
                    'title': h.title,
                    'current_streak': h.current_streak,
                    'best_streak': h.best_streak,
                    'last_completed': h.last_completed,
                }
                for h in habits
            ]
        }
    
    @staticmethod
    def check_never_miss_twice(habit: Habit) -> bool:
        """Check if habit violates 'Never Miss Twice' rule"""
        entries = habit.entries.filter(completed=False).order_by('-date')
        
        if entries.count() < 2:
            return True
        
        latest = entries[0].date
        second_latest = entries[1].date
        
        # If both misses are consecutive, rule is broken
        return (latest - second_latest).days != 1

    @staticmethod
    def calculate_streak(habit: Habit):
        """Calculate current streak for a habit"""
        today = timezone.now().date()
        entries = habit.entries.filter(completed=True).order_by('-date')
        
        if not entries.exists():
            return 0
            
        streak = 0
        current_date = today
        
        for entry in entries:
            if entry.date == current_date:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break
                
        return streak


class AnalyticsService:
    """Service for analytics and reporting"""
    
    @staticmethod
    def get_user_stats(user):
        """Get comprehensive user statistics"""
        habits = Habit.objects.filter(user=user)
        entries = HabitEntry.objects.filter(habit__user=user)
        completed_entries = entries.filter(completed=True)
        
        now = timezone.now().date()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        # Initialize stats with safe defaults for new users
        stats = {
            'total_habits': habits.count(),
            'active_habits': habits.filter(is_active=True).count(),
            'total_completions': completed_entries.count(),
            'completion_rate': 0,
            'average_streak': 0,
            'this_week_completions': completed_entries.filter(date__gte=week_ago).count(),
            'this_month_completions': completed_entries.filter(date__gte=month_ago).count(),
            'current_streak': 0,
            'best_streak': 0,
            'total_points': 0
        }
        
        # Calculate completion rate safely
        if entries.count() > 0:
            stats['completion_rate'] = (completed_entries.count() / entries.count()) * 100
            
        # Calculate streak data safely for users with habits
        if habits.exists():
            streaks = [h.current_streak for h in habits if h.current_streak is not None]
            best_streaks = [h.best_streak for h in habits if h.best_streak is not None]
            
            if streaks:
                stats['average_streak'] = sum(streaks) / len(streaks)
                stats['current_streak'] = max(streaks)
            if best_streaks:
                stats['best_streak'] = max(best_streaks)
            
        # Get data from user profile (created by signals)
        if hasattr(user, 'profile'):
            profile = user.profile
            stats['total_points'] = profile.total_points or 0
            stats['current_streak'] = max(stats['current_streak'], profile.current_streak or 0)
            stats['best_streak'] = max(stats['best_streak'], profile.best_streak or 0)
            
        return stats

    @staticmethod
    def get_weekly_data(user):
        """Get weekly completion data"""
        now = timezone.now().date()
        week_ago = now - timedelta(days=6)
        
        data = []
        for i in range(7):
            day = week_ago + timedelta(days=i)
            count = HabitEntry.objects.filter(
                habit__user=user, 
                completed=True, 
                date=day
            ).count()
            data.append({
                'date': day.isoformat(),
                'completions': count,
                'day_name': day.strftime('%a')
            })
        
        return data

    @staticmethod
    def get_monthly_data(user):
        """Get monthly completion data"""
        now = timezone.now().date()
        month_ago = now - timedelta(days=29)
        
        data = []
        for i in range(30):
            day = month_ago + timedelta(days=i)
            count = HabitEntry.objects.filter(
                habit__user=user,
                completed=True,
                date=day
            ).count()
            data.append({
                'date': day.isoformat(),
                'completions': count
            })
            
        return data


class BadgeService:
    """Service for badge management and achievement logic"""
    
    BADGE_DEFINITIONS = {
        'FIRST_HABIT': {
            'name': 'Getting Started',
            'description': 'Created your first habit',
            'icon': '🌱',
            'points': 50
        },
        'STREAK_7': {
            'name': '7-Day Warrior', 
            'description': 'Maintained a 7-day streak',
            'icon': '🔥',
            'points': 100
        },
        'STREAK_30': {
            'name': 'Monthly Master',
            'description': 'Maintained a 30-day streak',
            'icon': '🏆',
            'points': 300
        },
        'STREAK_100': {
            'name': 'Centurion',
            'description': 'Maintained a 100-day streak',
            'icon': '👑',
            'points': 1000
        },
        'COMPLETIONS_100': {
            'name': 'Century Club',
            'description': 'Completed 100 habits',
            'icon': '💯',
            'points': 500
        },
        'MICRO_MASTER': {
            'name': 'Micro Master',
            'description': 'Completed 50 micro-habits',
            'icon': '⚡',
            'points': 200
        }
    }
    
    @classmethod
    def create_default_badges(cls):
        """Create default badge definitions"""
        for code, definition in cls.BADGE_DEFINITIONS.items():
            Badge.objects.get_or_create(
                code=code,
                defaults=definition
            )
    
    @classmethod 
    def check_and_award_badges(cls, user, habit, entry):
        """Check if user qualifies for any badges and award them"""
        # First habit badge
        if user.habits.count() == 1:
            cls._award_badge_if_not_owned(user, 'FIRST_HABIT')
            
        # Streak badges
        if habit.current_streak == 7:
            cls._award_badge_if_not_owned(user, 'STREAK_7')
        elif habit.current_streak == 30:
            cls._award_badge_if_not_owned(user, 'STREAK_30')
        elif habit.current_streak == 100:
            cls._award_badge_if_not_owned(user, 'STREAK_100')
            
        # Completion badges
        total_completions = HabitEntry.objects.filter(
            habit__user=user, 
            completed=True
        ).count()
        if total_completions == 100:
            cls._award_badge_if_not_owned(user, 'COMPLETIONS_100')
            
        # Micro habit badge
        micro_completions = HabitEntry.objects.filter(
            habit__user=user,
            habit__is_micro_habit=True,
            completed=True
        ).count()
        if micro_completions == 50:
            cls._award_badge_if_not_owned(user, 'MICRO_MASTER')
    
    @classmethod
    def _award_badge_if_not_owned(cls, user, badge_code):
        """Award badge if user doesn't already have it"""
        try:
            badge = Badge.objects.get(code=badge_code)
            user_badge, created = UserBadge.objects.get_or_create(
                user=user,
                badge=badge
            )
            
            if created:
                # Award points for the badge
                PointsTransaction.objects.create(
                    user=user,
                    amount=badge.points,
                    reason=f'Badge earned: {badge.name}'
                )
                
                # Update user total points
                profile = getattr(user, 'profile', None)
                if profile:
                    profile.total_points += badge.points
                    profile.save()
                    
                return user_badge
        except Badge.DoesNotExist:
            pass
        
        return None
