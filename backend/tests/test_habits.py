"""
Tests for habits app

Comprehensive test suite using pytest and pytest-django
"""
import pytest
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from habits.models import Habit, HabitEntry
from habits.services import HabitService

User = get_user_model()


@pytest.fixture
def api_client():
    """Create API client"""
    return APIClient()


@pytest.fixture
def user(db):
    """Create test user"""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )


@pytest.fixture
def authenticated_client(api_client, user):
    """Create authenticated API client"""
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def habit(db, user):
    """Create test habit"""
    return Habit.objects.create(
        user=user,
        title='Running',
        description='Morning run',
        category='fitness',
        frequency='daily',
        color_code='#FF0000'
    )


class TestHabitCreation:
    """Test habit creation"""
    
    def test_create_habit(self, authenticated_client, user):
        """Test creating a habit"""
        response = authenticated_client.post(
            '/api/v1/habits/',
            {
                'title': 'Meditation',
                'description': 'Daily meditation',
                'category': 'mindfulness',
                'frequency': 'daily'
            },
            format='json'
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert Habit.objects.filter(user=user, title='Meditation').exists()
    
    def test_create_habit_requires_auth(self, api_client):
        """Test that creating habit requires authentication"""
        response = api_client.post(
            '/api/v1/habits/',
            {'title': 'Test'},
            format='json'
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestHabitCompletion:
    """Test habit completion and streak tracking"""
    
    def test_mark_habit_complete(self, authenticated_client, habit):
        """Test marking habit as complete"""
        response = authenticated_client.post(
            f'/api/v1/habits/{habit.id}/mark_complete/',
            {'note': 'Completed 5km run'},
            format='json'
        )
        assert response.status_code == status.HTTP_200_OK
        
        # Check entry was created
        today = timezone.now().date()
        assert HabitEntry.objects.filter(
            habit=habit,
            date=today,
            completed=True
        ).exists()
    
    def test_streak_calculation(self, db, habit):
        """Test streak is calculated correctly"""
        today = timezone.now().date()
        
        # Create entries for 3 consecutive days
        for i in range(3):
            date = today - timedelta(days=i)
            HabitEntry.objects.create(habit=habit, date=date, completed=True)
        
        habit.update_streak()
        assert habit.current_streak == 3
    
    def test_streak_breaks_on_miss(self, db, habit):
        """Test streak breaks when habit is missed"""
        today = timezone.now().date()
        
        # Create entry for today
        HabitEntry.objects.create(habit=habit, date=today, completed=True)
        
        # Skip a day
        day_after = today + timedelta(days=1)
        HabitEntry.objects.create(habit=habit, date=day_after, completed=False)
        
        # Complete today + 2
        day_after_tomorrow = today + timedelta(days=2)
        HabitEntry.objects.create(habit=habit, date=day_after_tomorrow, completed=True)
        
        habit.update_streak()
        # Streak should be 1 (only today)
        assert habit.current_streak == 1


class TestHabitAnalytics:
    """Test analytics and statistics"""
    
    def test_get_user_stats(self, db, user, habit):
        """Test getting user statistics"""
        today = timezone.now().date()
        
        # Create multiple entries
        for i in range(10):
            date = today - timedelta(days=i)
            completed = i % 2 == 0  # Every other day
            HabitEntry.objects.create(habit=habit, date=date, completed=completed)
        
        stats = HabitService.get_user_stats(user)
        
        assert stats['total_habits'] == 1
        assert stats['active_habits'] == 1
        assert stats['total_completions'] == 5  # Half completed
    
    def test_completion_rate(self, db, habit):
        """Test completion rate calculation"""
        today = timezone.now().date()
        
        # Create 10 entries, 7 completed
        for i in range(10):
            date = today - timedelta(days=i)
            completed = i < 7
            HabitEntry.objects.create(habit=habit, date=date, completed=completed)
        
        rate = habit.completion_rate
        assert rate == 70.0


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_user_registration(self, api_client):
        """Test user registration"""
        response = api_client.post(
            '/api/v1/auth/register/',
            {
                'username': 'newuser',
                'email': 'new@example.com',
                'password': 'testpass123',
                'password_confirm': 'testpass123'
            },
            format='json'
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert 'access' in response.data
        assert 'refresh' in response.data
    
    def test_user_login(self, api_client, user):
        """Test user login"""
        response = api_client.post(
            '/api/v1/auth/login/',
            {
                'username': 'testuser',
                'password': 'testpass123'
            },
            format='json'
        )
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
