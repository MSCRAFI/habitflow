"""
Forest Game Views - API endpoints for enhanced forest functionality
"""
import random
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Q, F
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import (
    ForestLayout, TreePosition, ForestAction, ForestDecoration,
    ForestCreature, WeatherEvent, ForestAchievement, UserForestAchievement,
    DailyChallenge, UserDailyChallenge
)
from .serializers import (
    ForestLayoutSerializer, TreePositionSerializer, ForestActionSerializer,
    ForestDecorationSerializer, ForestCreatureSerializer, WeatherEventSerializer,
    ForestAchievementSerializer, UserForestAchievementSerializer,
    DailyChallengeSerializer, UserDailyChallengeSerializer, ForestOverviewSerializer
)
from habits.models import Habit


class ForestGameViewSet(viewsets.ViewSet):
    """
    Forest game API endpoints for managing user's virtual forest.

    Authentication: JWT (Bearer)
    Permissions: IsAuthenticated

    Provides dashboard-style composite reads (`overview`) and granular actions.
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def overview(self, request):
        """
        Get complete forest state in one request for efficient loading.

        GET /api/v1/forest/overview/
        Response: layout, tree_positions, decorations, active_creatures, current_weather,
        daily_challenge, recent_actions, achievements
        """
        user = request.user
        
        # Get or create forest layout
        layout, created = ForestLayout.objects.get_or_create(user=user)
        
        # Get tree positions
        tree_positions = TreePosition.objects.filter(user=user).select_related('habit')
        
        # Get decorations
        decorations = ForestDecoration.objects.filter(user=user)
        
        # Get active creatures
        active_creatures = ForestCreature.objects.filter(
            user=user, 
            is_active=True,
            visit_start__gte=timezone.now() - timedelta(hours=1)
        ).select_related('tree_position__habit')
        
        # Get current weather
        current_weather = WeatherEvent.objects.filter(
            user=user, 
            is_active=True,
            start_time__gte=timezone.now() - timedelta(hours=24)
        ).first()
        
        # Get today's daily challenge
        today = timezone.now().date()
        daily_challenge = None
        try:
            daily_challenge_obj = DailyChallenge.objects.get(date=today)
            daily_challenge = UserDailyChallenge.objects.get_or_create(
                user=user, challenge=daily_challenge_obj
            )[0]
        except DailyChallenge.DoesNotExist:
            pass
        
        # Get recent actions (last 10)
        recent_actions = ForestAction.objects.filter(user=user)[:10]
        
        # Get user achievements
        achievements = UserForestAchievement.objects.filter(user=user).select_related('achievement')
        
        data = {
            'layout': ForestLayoutSerializer(layout).data,
            'tree_positions': TreePositionSerializer(tree_positions, many=True).data,
            'decorations': ForestDecorationSerializer(decorations, many=True).data,
            'active_creatures': ForestCreatureSerializer(active_creatures, many=True).data,
            'current_weather': WeatherEventSerializer(current_weather).data if current_weather else None,
            'daily_challenge': UserDailyChallengeSerializer(daily_challenge).data if daily_challenge else None,
            'recent_actions': ForestActionSerializer(recent_actions, many=True).data,
            'achievements': UserForestAchievementSerializer(achievements, many=True).data,
        }
        
        return Response(data)

    @action(detail=False, methods=['post'])
    def water_tree(self, request):
        """
        Water a tree with optional intensity.

        POST /api/v1/forest/water/
        Body: { habit_id: int, water_type: 'mist'|'normal'|'heavy' }
        Response: points_earned, tree_health, weather_bonus, message
        """
        user = request.user
        habit_id = request.data.get('habit_id')
        water_type = request.data.get('water_type', 'normal')  # normal, heavy, mist
        
        try:
            habit = Habit.objects.get(id=habit_id, user=user)
            tree_position, created = TreePosition.objects.get_or_create(
                user=user, habit=habit,
                defaults={'x': 100, 'y': 200}  # Default position if new
            )
            
            # Calculate points based on water type and current conditions
            base_points = {'mist': 5, 'normal': 10, 'heavy': 15}[water_type]
            
            # Weather multiplier
            current_weather = WeatherEvent.objects.filter(
                user=user, is_active=True
            ).first()
            weather_multiplier = current_weather.points_multiplier if current_weather else 1.0
            
            points_earned = int(base_points * weather_multiplier)
            
            # Update tree
            tree_position.last_watered = timezone.now()
            if water_type == 'heavy':
                tree_position.health_bonus += 0.1
            tree_position.save()
            
            # Update forest layout stats
            layout, _ = ForestLayout.objects.get_or_create(user=user)
            layout.total_waterings += 1
            layout.total_points += points_earned
            layout.save()
            
            # Record action
            ForestAction.objects.create(
                user=user,
                action_type='water',
                habit=habit,
                tree_position=tree_position,
                points_earned=points_earned,
                metadata={'water_type': water_type, 'weather_bonus': weather_multiplier > 1},
                weather_at_time=current_weather.weather_type if current_weather else 'sunny'
            )
            
            # Check for creature visits (healthy trees attract creatures)
            if tree_position.health_bonus > 0.5 and random.random() < 0.3:
                self._spawn_creature(user, tree_position)
            
            # Mark habit as complete for today
            from habits.models import HabitEntry
            today = timezone.now().date()
            entry, created = HabitEntry.objects.get_or_create(
                habit=habit, date=today,
                defaults={'completed': True, 'points_earned': points_earned}
            )
            
            return Response({
                'success': True,
                'points_earned': points_earned,
                'tree_health': tree_position.health_bonus,
                'weather_bonus': weather_multiplier > 1,
                'message': f'Tree watered with {water_type} watering! +{points_earned} points'
            })
            
        except Habit.DoesNotExist:
            return Response({'error': 'Habit not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def prune_tree(self, request):
        """Prune a tree to improve its health"""
        user = request.user
        habit_id = request.data.get('habit_id')
        
        try:
            habit = Habit.objects.get(id=habit_id, user=user)
            tree_position = TreePosition.objects.get(user=user, habit=habit)
            
            # Check if tree can be pruned (once per week)
            if tree_position.last_pruned:
                time_since_prune = timezone.now() - tree_position.last_pruned
                if time_since_prune.days < 7:
                    return Response({
                        'error': f'Tree can be pruned again in {7 - time_since_prune.days} days'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Prune the tree
            tree_position.last_pruned = timezone.now()
            tree_position.health_bonus += 0.2
            tree_position.save()
            
            points_earned = 25
            
            # Update layout
            layout, _ = ForestLayout.objects.get_or_create(user=user)
            layout.total_prunings += 1
            layout.total_points += points_earned
            layout.save()
            
            # Record action
            ForestAction.objects.create(
                user=user,
                action_type='prune',
                habit=habit,
                tree_position=tree_position,
                points_earned=points_earned,
                metadata={'health_gained': 0.2}
            )
            
            return Response({
                'success': True,
                'points_earned': points_earned,
                'tree_health': tree_position.health_bonus,
                'message': 'Tree pruned successfully! Health improved.'
            })
            
        except (Habit.DoesNotExist, TreePosition.DoesNotExist):
            return Response({'error': 'Tree not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def fertilize_tree(self, request):
        """Fertilize a tree to boost growth speed"""
        user = request.user
        habit_id = request.data.get('habit_id')
        
        try:
            habit = Habit.objects.get(id=habit_id, user=user)
            tree_position = TreePosition.objects.get(user=user, habit=habit)
            
            # Check if tree can be fertilized (once per month)
            if tree_position.last_fertilized:
                time_since_fertilize = timezone.now() - tree_position.last_fertilized
                if time_since_fertilize.days < 30:
                    return Response({
                        'error': f'Tree can be fertilized again in {30 - time_since_fertilize.days} days'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Fertilize the tree
            tree_position.last_fertilized = timezone.now()
            tree_position.size_multiplier += 0.3
            tree_position.save()
            
            points_earned = 50
            
            # Update layout
            layout, _ = ForestLayout.objects.get_or_create(user=user)
            layout.total_fertilizations += 1
            layout.total_points += points_earned
            layout.save()
            
            # Record action
            ForestAction.objects.create(
                user=user,
                action_type='fertilize',
                habit=habit,
                tree_position=tree_position,
                points_earned=points_earned,
                metadata={'growth_boost': 0.3}
            )
            
            return Response({
                'success': True,
                'points_earned': points_earned,
                'tree_size': tree_position.size_multiplier,
                'message': 'Tree fertilized! Growth speed increased.'
            })
            
        except (Habit.DoesNotExist, TreePosition.DoesNotExist):
            return Response({'error': 'Tree not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def move_tree(self, request):
        """Move a tree to a new position"""
        user = request.user
        habit_id = request.data.get('habit_id')
        new_x = request.data.get('x')
        new_y = request.data.get('y')
        
        try:
            habit = Habit.objects.get(id=habit_id, user=user)
            tree_position = TreePosition.objects.get(user=user, habit=habit)
            
            # Update position
            old_x, old_y = tree_position.x, tree_position.y
            tree_position.x = new_x
            tree_position.y = new_y
            tree_position.save()
            
            # Record action
            ForestAction.objects.create(
                user=user,
                action_type='move',
                habit=habit,
                tree_position=tree_position,
                points_earned=0,
                metadata={'old_position': {'x': old_x, 'y': old_y}, 'new_position': {'x': new_x, 'y': new_y}}
            )
            
            return Response({
                'success': True,
                'message': 'Tree moved successfully!'
            })
            
        except (Habit.DoesNotExist, TreePosition.DoesNotExist):
            return Response({'error': 'Tree not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def change_weather(self, request):
        """Trigger weather change (for testing or premium feature)"""
        user = request.user
        weather_type = request.data.get('weather_type')
        duration_hours = request.data.get('duration_hours', 6)
        
        # End current weather
        WeatherEvent.objects.filter(user=user, is_active=True).update(is_active=False)
        
        # Weather effects
        weather_effects = {
            'rainy': {'growth_multiplier': 1.5, 'points_multiplier': 1.2},
            'sunny': {'growth_multiplier': 1.0, 'points_multiplier': 1.0},
            'stormy': {'growth_multiplier': 0.8, 'points_multiplier': 1.3},
            'drought': {'growth_multiplier': 0.5, 'points_multiplier': 0.8},
        }
        
        effects = weather_effects.get(weather_type, weather_effects['sunny'])
        
        # Create new weather event
        weather = WeatherEvent.objects.create(
            user=user,
            weather_type=weather_type,
            duration_hours=duration_hours,
            **effects
        )
        
        # Update forest layout
        layout, _ = ForestLayout.objects.get_or_create(user=user)
        layout.weather_state = weather_type
        layout.save()
        
        # Record action
        ForestAction.objects.create(
            user=user,
            action_type='weather_change',
            points_earned=0,
            metadata={'new_weather': weather_type, 'duration': duration_hours},
            weather_at_time=weather_type
        )
        
        return Response({
            'success': True,
            'weather': WeatherEventSerializer(weather).data,
            'message': f'Weather changed to {weather_type}!'
        })

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get detailed forest statistics"""
        user = request.user
        
        # Get layout stats
        layout = ForestLayout.objects.filter(user=user).first()
        if not layout:
            return Response({
                'error': 'No forest data found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate additional stats
        total_trees = TreePosition.objects.filter(user=user).count()
        healthy_trees = TreePosition.objects.filter(user=user, health_bonus__gt=0).count()
        mature_trees = TreePosition.objects.filter(user=user, growth_stage__in=['mature', 'ancient']).count()
        
        # Recent activity
        recent_actions = ForestAction.objects.filter(user=user)[:20]
        
        # Achievement progress
        total_achievements = ForestAchievement.objects.count()
        earned_achievements = UserForestAchievement.objects.filter(user=user).count()
        
        return Response({
            'forest_level': layout.forest_level,
            'total_points': layout.total_points,
            'total_trees': total_trees,
            'healthy_trees': healthy_trees,
            'mature_trees': mature_trees,
            'total_waterings': layout.total_waterings,
            'total_prunings': layout.total_prunings,
            'total_fertilizations': layout.total_fertilizations,
            'achievements_earned': earned_achievements,
            'achievements_total': total_achievements,
            'achievement_percentage': round((earned_achievements / total_achievements * 100) if total_achievements > 0 else 0, 1),
            'recent_actions': ForestActionSerializer(recent_actions, many=True).data
        })

    def _spawn_creature(self, user, tree_position):
        """Helper method to spawn a creature at a tree"""
        creature_types = ['rabbit', 'bird', 'butterfly', 'squirrel']
        creature_type = random.choice(creature_types)
        
        # Remove old creatures at this tree
        ForestCreature.objects.filter(tree_position=tree_position, is_active=True).update(is_active=False)
        
        # Spawn new creature
        ForestCreature.objects.create(
            user=user,
            creature_type=creature_type,
            tree_position=tree_position,
            visit_duration=random.randint(30, 300),  # 30 seconds to 5 minutes
            x_offset=random.uniform(-20, 20),
            y_offset=random.uniform(-20, 20)
        )
        
        # Record action
        ForestAction.objects.create(
            user=user,
            action_type='creature_visit',
            tree_position=tree_position,
            points_earned=5,
            metadata={'creature_type': creature_type}
        )