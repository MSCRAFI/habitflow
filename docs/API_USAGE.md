# 🔌 HabitFlow API Documentation

This comprehensive guide covers all API endpoints, authentication methods, request/response formats, and usage examples for the HabitFlow platform.

## 📋 Table of Contents

- [Overview](#-overview)
- [Authentication](#-authentication)
- [Error Handling](#-error-handling)
- [Rate Limiting](#-rate-limiting)
- [Habit Management](#-habit-management)
- [User Management](#-user-management)
- [Social Features](#-social-features)
- [Forest Game](#-forest-game)
- [Analytics](#-analytics)
- [WebSocket Events](#-websocket-events)
- [SDKs and Examples](#-sdks-and-examples)

## 🎯 Overview

**Base URL**: `http://localhost:8000/api/v1/`  
**API Version**: v1  
**Response Format**: JSON  
**Date Format**: ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)

### Quick Start
```bash
# Get API health status
curl http://localhost:8000/api/v1/health/

# Register new user
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"securepass123"}'
```

## 🔐 Authentication

HabitFlow uses JWT (JSON Web Tokens) for authentication. All API requests require authentication except for registration, login, and public endpoints.

### Authentication Flow

#### 1. User Registration
```http
POST /api/v1/auth/register/
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com", 
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "public_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "avatar": null,
    "date_joined": "2025-11-20T10:30:00Z"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### 2. User Login
```http
POST /api/v1/auth/login/
Content-Type: application/json

{
  "username": "johndoe", // or email
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "profile": {
      "total_habits_created": 5,
      "current_streak": 12,
      "total_points": 850,
      "level": 3
    }
  }
}
```

#### 3. Token Refresh
```http
POST /api/v1/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### 4. Token Verification
```http
POST /api/v1/auth/verify/
Content-Type: application/json

{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Authorization Header
Include the access token in all authenticated requests:
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Token Lifecycle
- **Access Token**: Valid for 15 minutes
- **Refresh Token**: Valid for 7 days
- **Automatic Refresh**: Clients should refresh tokens when they expire

## 🚨 Error Handling

The API uses standard HTTP status codes and returns JSON error responses.

### Standard Error Format
```json
{
  "error": "Human readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": ["Field-specific error message"]
  },
  "timestamp": "2025-11-20T10:30:00Z"
}
```

### HTTP Status Codes
| Code | Status | Description |
|------|--------|-------------|
| **2xx** | **Success** | |
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 204 | No Content | Successful with no response body |
| **4xx** | **Client Errors** | |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| **5xx** | **Server Errors** | |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Examples

#### Validation Error (400)
```json
{
  "error": "Validation failed",
  "details": {
    "title": ["This field is required"],
    "category": ["Invalid choice: 'invalid_category'"]
  }
}
```

#### Authentication Error (401)
```json
{
  "error": "Authentication credentials were not provided",
  "code": "AUTHENTICATION_REQUIRED"
}
```

#### Permission Error (403)
```json
{
  "error": "You do not have permission to perform this action",
  "code": "PERMISSION_DENIED"
}
```

## ⚡ Rate Limiting

API endpoints are rate limited to ensure fair usage and prevent abuse.

### Rate Limits
| User Type | Limit | Window |
|-----------|-------|---------|
| **Anonymous** | 100 requests | 1 hour |
| **Authenticated** | 1000 requests | 1 hour |
| **Premium** | 5000 requests | 1 hour |

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642234800
```

### Rate Limit Exceeded (429)
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "limit": 1000,
    "reset_time": "2025-11-20T11:00:00Z"
  }
}
```

## 🎯 Habit Management

### Habit CRUD Operations

#### List User's Habits
```http
GET /api/v1/habits/
Authorization: Bearer <token>
```

**Query Parameters:**
- `search`: Filter by habit title or description
- `category`: Filter by category (health, productivity, learning, fitness, mindfulness, social, other)
- `frequency`: Filter by frequency (daily, weekly, custom)
- `is_active`: Filter by active status (true/false)
- `ordering`: Sort by field (title, created_at, current_streak, -created_at)

**Response (200 OK):**
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/v1/habits/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "public_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Morning Exercise",
      "description": "30 minutes of morning workout",
      "category": "fitness",
      "frequency": "daily",
      "color_code": "#FF6B6B",
      "icon": "🏃‍♂️",
      "current_streak": 7,
      "best_streak": 15,
      "last_completed": "2025-11-20",
      "is_active": true,
      "is_micro_habit": false,
      "reminder_enabled": true,
      "reminder_time": "07:00:00",
      "completion_rate": 85.5,
      "total_completions": 42,
      "created_at": "2025-11-20T08:00:00Z",
      "updated_at": "2025-11-20T07:30:00Z"
    }
  ]
}
```

#### Create New Habit
```http
POST /api/v1/habits/
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Daily Reading",
  "description": "Read for 30 minutes before bed",
  "category": "learning",
  "frequency": "daily",
  "color_code": "#4ECDC4",
  "icon": "📚",
  "is_micro_habit": false,
  "reminder_enabled": true,
  "reminder_time": "21:00:00"
}
```

#### Mark Habit Complete
```http
POST /api/v1/habits/{id}/mark_complete/
Authorization: Bearer <token>
Content-Type: application/json

{
  "note": "Great workout session today!"
}
```

**Response (200 OK):**
```json
{
  "message": "Habit marked complete for today",
  "entry": {
    "id": 123,
    "date": "2025-11-15",
    "completed": true,
    "note": "Great workout session today!",
    "points_earned": 10
  },
  "current_streak": 8,
  "points_awarded": 10
}
```

#### Get Habit Analytics
```http
GET /api/v1/habits/{id}/analytics/
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "habit": {
    "id": 1,
    "title": "Morning Exercise",
    "current_streak": 7,
    "best_streak": 15
  },
  "completion_rate": 85.5,
  "total_completions": 42,
  "weekly_stats": [
    {"week": "2025-W45", "completions": 6},
    {"week": "2025-W46", "completions": 7}
  ],
  "monthly_stats": [
    {"month": "2025-11", "completions": 28}
  ],
  "streak_history": [
    {"start_date": "2025-11-01", "end_date": "2025-11-07", "length": 7},
    {"start_date": "2025-11-09", "end_date": "2025-11-15", "length": 7}
  ]
}
```

## 👤 User Management

#### Get Current User Profile
```http
GET /api/v1/users/me/
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "avatar": "https://cdn.example.com/avatars/john.jpg",
  "profile": {
    "bio": "Habit enthusiast and productivity lover",
    "location": "San Francisco, CA",
    "website": "https://johnblog.com",
    "identity": "Fitness Enthusiast",
    "identity_progress": 75,
    "total_habits_created": 15,
    "total_completions": 342,
    "current_streak": 12,
    "best_streak": 28,
    "total_points": 3420,
    "level": 5,
    "profile_public": true,
    "show_statistics": true
  }
}
```

#### Update User Profile
```http
PATCH /api/v1/users/profile/
Authorization: Bearer <token>
Content-Type: application/json

{
  "bio": "Updated bio about my habit journey",
  "identity": "Productivity Master",
  "profile_public": true
}
```

#### Upload Avatar
```http
POST /api/v1/users/profile/avatar/
Authorization: Bearer <token>
Content-Type: multipart/form-data

avatar: <file>
```

#### Community Leaderboard
```http
GET /api/v1/users/community/leaderboard/?type=weekly
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "type": "weekly",
  "period": "2025-W46",
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "username": "habitmaster",
        "avatar": "https://cdn.example.com/avatars/master.jpg",
        "level": 8
      },
      "score": 150,
      "completions": 21
    }
  ],
  "user_rank": {
    "rank": 15,
    "score": 85,
    "completions": 12
  }
}
```

## 👥 Social Features

#### Follow User
```http
POST /api/v1/users/follow/
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 42
}
```

#### Social Feed
```http
GET /api/v1/habits/feed/
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "count": 50,
  "results": [
    {
      "id": 123,
      "type": "completion",
      "user": {
        "username": "friend_user",
        "avatar": "https://cdn.example.com/avatars/friend.jpg"
      },
      "message": "completed Morning Exercise for the 5th day in a row! 🔥",
      "habit": {
        "title": "Morning Exercise",
        "icon": "🏃‍♂️"
      },
      "created_at": "2025-11-15T07:30:00Z",
      "reactions": [
        {"emoji": "👏", "count": 5},
        {"emoji": "🔥", "count": 2}
      ],
      "comments_count": 3
    }
  ]
}
```

## 🌳 Forest Game

#### Forest Overview
```http
GET /api/v1/forest/overview/
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "forest_level": 5,
  "total_points": 1250,
  "current_season": "spring",
  "weather_state": "sunny",
  "is_night": false,
  "trees": [
    {
      "habit": {
        "id": 1,
        "title": "Morning Exercise",
        "icon": "🏃‍♂️"
      },
      "position": {"x": 150.5, "y": 200.0, "z_index": 0},
      "tree_type": "oak",
      "growth_stage": "mature",
      "size_multiplier": 1.2,
      "health_bonus": 0.15,
      "last_watered": "2025-11-15T07:30:00Z"
    }
  ],
  "decorations": [
    {
      "decoration_type": "rock",
      "decoration_id": "rock_1",
      "position": {"x": 100.0, "y": 150.0}
    }
  ],
  "active_creatures": [
    {
      "creature_type": "butterfly",
      "tree_id": 1,
      "animation_state": "flying"
    }
  ]
}
```

#### Water Tree
```http
POST /api/v1/forest/water/
Authorization: Bearer <token>
Content-Type: application/json

{
  "habit_id": 1,
  "water_type": "regular"
}
```

**Response (200 OK):**
```json
{
  "message": "Tree watered successfully!",
  "points_earned": 5,
  "effects": {
    "growth_boost": 1.1,
    "health_increase": 0.05
  },
  "new_creatures": ["butterfly"]
}
```

## 📊 Analytics

#### Today's Habits
```http
GET /api/v1/habits/today/
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "date": "2025-11-15",
  "habits": [
    {
      "habit": {
        "id": 1,
        "title": "Morning Exercise",
        "icon": "🏃‍♂️"
      },
      "completed": true,
      "completed_at": "2025-11-15T07:30:00Z",
      "note": "Great workout!"
    }
  ],
  "completion_stats": {
    "total_habits": 5,
    "completed": 3,
    "completion_rate": 60.0
  },
  "points_earned_today": 30
}
```

#### Overall Statistics
```http
GET /api/v1/habits/statistics/
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "user": {
    "total_habits": 15,
    "active_habits": 8,
    "total_completions": 342,
    "current_streak": 12,
    "best_streak": 28,
    "total_points": 3420,
    "level": 5
  },
  "this_week": {
    "completions": 25,
    "completion_rate": 89.3,
    "points_earned": 125
  },
  "this_month": {
    "completions": 108,
    "completion_rate": 87.1,
    "points_earned": 540
  },
  "top_categories": [
    {"category": "fitness", "completions": 98},
    {"category": "learning", "completions": 76}
  ]
}
```

## 🔧 WebSocket Events

For real-time updates, connect to the WebSocket endpoint:

**WebSocket URL**: `ws://localhost:8000/ws/habits/`

### Authentication
Include the JWT token in the WebSocket connection:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/habits/?token=' + accessToken);
```

### Event Types
```json
// Habit completed
{
  "type": "habit_completed",
  "data": {
    "habit_id": 1,
    "user": "johndoe",
    "streak": 8,
    "points_earned": 10
  }
}

// Forest creature appeared
{
  "type": "creature_appeared",
  "data": {
    "creature_type": "butterfly",
    "tree_id": 1,
    "duration": 30
  }
}

// Level up
{
  "type": "level_up",
  "data": {
    "old_level": 4,
    "new_level": 5,
    "rewards": ["new_tree_type", "decoration_pack"]
  }
}
```

## 🛠️ SDKs and Examples

### JavaScript/TypeScript SDK
*Note: This SDK is an example of what could be built. Use the documented API endpoints directly.*

```bash
# npm install habitflow-sdk  # Not yet available
```

```javascript
import { HabitFlowClient } from 'habitflow-sdk';

const client = new HabitFlowClient({
  baseURL: 'http://localhost:8000/api/v1',
  apiKey: 'your-api-key'
});

// Create a habit
const habit = await client.habits.create({
  title: 'Morning Exercise',
  category: 'fitness',
  frequency: 'daily'
});

// Mark habit complete
await client.habits.markComplete(habit.id, {
  note: 'Great workout!'
});

// Get today's habits
const todayHabits = await client.habits.getToday();
```

### Python SDK
*Note: This SDK is an example of what could be built. Use the documented API endpoints directly.*

```bash
# pip install habitflow-python  # Not yet available
```

```python
from habitflow import HabitFlowClient

client = HabitFlowClient(
    base_url='http://localhost:8000/api/v1',
    api_key='your-api-key'
)

# Create habit
habit = client.habits.create(
    title='Daily Reading',
    category='learning',
    frequency='daily'
)

# Get analytics
analytics = client.habits.get_analytics(habit['id'])
```

### cURL Examples
```bash
# Complete a habit
curl -X POST http://localhost:8000/api/v1/habits/1/mark_complete/ \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note": "Completed successfully!"}'

# Get forest overview
curl -X GET http://localhost:8000/api/v1/forest/overview/ \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Follow a user
curl -X POST http://localhost:8000/api/v1/users/follow/ \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 42}'
```

## 🔗 Additional Resources

- **Interactive API Documentation**: https://habitflow.scrafi.dev/api/schema/swagger-ui/
- **API Schema**: https://habitflow.scrafi.dev/api/schema/
- **API Reference**: Available in this documentation
- **GitHub Repository**: https://github.com/MSCRAFI/habitflow

### Generate OpenAPI Schema
```bash
# Generate OpenAPI JSON schema
python manage.py generateschema --format openapi-json > openapi.json

# Generate for specific endpoints
python manage.py generateschema --format openapi --patterns /api/v1/habits/ > habits-api.json
```

---

**Need help?** Contact MD Salman Chowdhury at [salman@scrafi.dev](mailto:salman@scrafi.dev) or join our [Discord Community](https://discord.gg/zDtbnA45mM).
