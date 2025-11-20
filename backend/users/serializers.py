"""
Serializers for User API endpoints
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from users.models import User, UserProfile


class UserSerializer(serializers.ModelSerializer):
    """Public user profile fields for API responses.

    Notes:
    - Read-only identifiers ensure immutability from the API.
    - Email verification status is exposed but cannot be changed here.
    """
    
    class Meta:
        model = User
        fields = [
            'id', 'public_id', 'username', 'email', 'first_name', 
            'last_name', 'bio', 'avatar', 'email_verified', 'created_at'
        ]
        read_only_fields = ['id', 'public_id', 'email_verified', 'created_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile details nested with basic user info.
    The nested user is read-only to avoid accidental writes.
    """
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'user', 'bio', 'location', 'website', 'identity', 'identity_progress',
            'total_habits_created', 'total_completions', 'current_streak',
            'best_streak', 'total_points', 'level', 'profile_public', 'show_statistics'
        ]
        read_only_fields = [
            'total_habits_created', 'total_completions', 'current_streak',
            'best_streak', 'total_points', 'level'
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration.
    Validates username, email uniqueness, and password strength.
    """
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate_username(self, value):
        """Validate username requirements"""
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        if not value.replace('_', '').replace('-', '').isalnum():
            raise serializers.ValidationError("Username can only contain letters, numbers, hyphens, and underscores.")
        return value
    
    def validate_email(self, value):
        """Validate email format and uniqueness"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_password(self, value):
        """Validate password strength"""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value
    
    def validate(self, data):
        """Validate password confirmation and overall data"""
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match'
            })
        
        # Additional username uniqueness check (field validation should catch this)
        # This is a backup check in case the field validation was bypassed
        username = data.get('username')
        if username and User.objects.filter(username=username).exists():
            raise serializers.ValidationError({
                'username': 'A user with that username already exists.'
            })
            
        return data
    
    def create(self, validated_data):
        """Create new user and profile"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            username=validated_data.get('username'),
            email=validated_data.get('email'),
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Create user profile if it doesn't exist
        UserProfile.objects.get_or_create(user=user)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login. Delegates authentication to Django auth."""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        """Authenticate user"""
        user = authenticate(
            username=data.get('username'),
            password=data.get('password')
        )
        
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        
        data['user'] = user
        return data