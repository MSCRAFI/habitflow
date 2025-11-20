"""
Admin configuration for habits app.
Includes color preview and note excerpt for faster moderation.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Habit, HabitEntry, HabitStack


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'category', 'frequency', 'color_preview', 'icon', 'is_active', 'current_streak', 'created_at')
    list_filter = ('category', 'frequency', 'is_active', 'is_micro_habit', 'created_at')
    search_fields = ('title', 'description', 'user__username', 'user__email')
    ordering = ('-created_at',)
    readonly_fields = ('public_id', 'created_at', 'updated_at', 'current_streak', 'best_streak')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'title', 'description', 'category')
        }),
        ('Configuration', {
            'fields': ('frequency', 'start_date', 'color_code', 'icon', 'is_micro_habit')
        }),
        ('Status', {
            'fields': ('is_active', 'current_streak', 'best_streak')
        }),
        ('Metadata', {
            'fields': ('public_id', 'metadata', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def color_preview(self, obj):
        return format_html(
            '<div style="width: 20px; height: 20px; background-color: {}; border-radius: 50%; display: inline-block;"></div>',
            obj.color_code
        )
    color_preview.short_description = 'Color'


@admin.register(HabitEntry)
class HabitEntryAdmin(admin.ModelAdmin):
    list_display = ('habit', 'date', 'completed', 'note_preview', 'completed_at')
    list_filter = ('completed', 'date', 'completed_at')
    search_fields = ('habit__title', 'habit__user__username', 'note')
    ordering = ('-date', '-completed_at')
    readonly_fields = ('completed_at',)
    
    def note_preview(self, obj):
        if obj.note:
            return obj.note[:50] + "..." if len(obj.note) > 50 else obj.note
        return "No note"
    note_preview.short_description = 'Note'


# Commenting out HabitStack admin until model is properly implemented
# @admin.register(HabitStack)
# class HabitStackAdmin(admin.ModelAdmin):
#     pass
