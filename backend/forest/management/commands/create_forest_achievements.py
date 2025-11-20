"""
Management command to create initial forest achievements
"""
from django.core.management.base import BaseCommand
from forest.models import ForestAchievement


class Command(BaseCommand):
    help = 'Create initial forest achievements'

    def handle(self, *args, **options):
        achievements = [
            {
                'code': 'first_tree',
                'achievement_type': 'first_tree',
                'name': 'First Sprout',
                'description': 'Plant your first tree in the forest',
                'icon': '🌱',
                'required_level': 1,
                'required_points': 0,
                'required_actions': {'plant': 1},
                'points_reward': 50,
                'unlocks': ['basic_decorations']
            },
            {
                'code': 'water_streak_7',
                'achievement_type': 'care_streak',
                'name': 'Dedicated Gardener',
                'description': 'Water trees for 7 consecutive days',
                'icon': '💧',
                'required_level': 1,
                'required_points': 0,
                'required_actions': {'water_streak': 7},
                'points_reward': 100,
                'unlocks': ['water_effects']
            },
            {
                'code': 'forest_level_5',
                'achievement_type': 'forest_level',
                'name': 'Forest Guardian',
                'description': 'Reach forest level 5',
                'icon': '🌲',
                'required_level': 5,
                'required_points': 500,
                'required_actions': {},
                'points_reward': 200,
                'unlocks': ['weather_control', 'premium_trees']
            },
            {
                'code': 'prune_master',
                'achievement_type': 'care_streak',
                'name': 'Master Pruner',
                'description': 'Prune 10 different trees',
                'icon': '✂️',
                'required_level': 2,
                'required_points': 0,
                'required_actions': {'prune_unique': 10},
                'points_reward': 150,
                'unlocks': ['pruning_tools']
            },
            {
                'code': 'ancient_tree',
                'achievement_type': 'ancient_tree',
                'name': 'Ancient Wisdom',
                'description': 'Grow a tree to ancient stage',
                'icon': '🏛️',
                'required_level': 10,
                'required_points': 1000,
                'required_actions': {'ancient_trees': 1},
                'points_reward': 500,
                'unlocks': ['ancient_decorations', 'wisdom_creatures']
            },
            {
                'code': 'weather_master',
                'achievement_type': 'weather_master',
                'name': 'Storm Caller',
                'description': 'Experience all weather types',
                'icon': '⛈️',
                'required_level': 3,
                'required_points': 0,
                'required_actions': {'weather_types': 4},
                'points_reward': 250,
                'unlocks': ['weather_prediction', 'storm_effects']
            },
            {
                'code': 'creature_friend',
                'achievement_type': 'creature_friend',
                'name': 'Forest Whisperer',
                'description': 'Attract 20 forest creatures',
                'icon': '🦋',
                'required_level': 4,
                'required_points': 0,
                'required_actions': {'creatures_attracted': 20},
                'points_reward': 300,
                'unlocks': ['rare_creatures', 'creature_interactions']
            },
            {
                'code': 'decorator',
                'achievement_type': 'decorator',
                'name': 'Forest Architect',
                'description': 'Place 15 decorations in your forest',
                'icon': '🏗️',
                'required_level': 6,
                'required_points': 0,
                'required_actions': {'decorations_placed': 15},
                'points_reward': 400,
                'unlocks': ['advanced_decorations', 'custom_themes']
            },
            {
                'code': 'seasonal_spring',
                'achievement_type': 'seasonal',
                'name': 'Spring Awakening',
                'description': 'Experience the full spring season',
                'icon': '🌸',
                'required_level': 1,
                'required_points': 0,
                'required_actions': {'spring_days': 30},
                'points_reward': 200,
                'unlocks': ['spring_decorations']
            },
            {
                'code': 'fertilizer_expert',
                'achievement_type': 'care_streak',
                'name': 'Growth Expert',
                'description': 'Fertilize 5 trees successfully',
                'icon': '🌱',
                'required_level': 3,
                'required_points': 0,
                'required_actions': {'fertilize_count': 5},
                'points_reward': 175,
                'unlocks': ['super_fertilizer', 'growth_boosts']
            }
        ]

        created_count = 0
        for achievement_data in achievements:
            achievement, created = ForestAchievement.objects.get_or_create(
                code=achievement_data['code'],
                defaults=achievement_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created achievement: {achievement.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Achievement already exists: {achievement.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new achievements')
        )