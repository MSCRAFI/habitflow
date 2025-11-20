#!/bin/bash

# HabitFlow Backend - PostgreSQL + Redis via Docker
# Uses Docker for PostgreSQL and Redis, Django runs locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$BACKEND_DIR")"
VENV_DIR="$BACKEND_DIR/venv"

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if virtual environment exists
if [ ! -d "$VENV_DIR" ]; then
    print_error "Virtual environment not found. Run ./setup_backend.sh first"
    exit 1
fi

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_error "Docker not found. Please install Docker and try again"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose not found. Please install Docker Compose and try again"
    exit 1
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source "$VENV_DIR/bin/activate"

# Check if .env exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
    print_error ".env file not found. Run ./setup_backend.sh first"
    exit 1
fi

# Update .env for PostgreSQL
print_status "Configuring environment for PostgreSQL..."
ENV_FILE="$BACKEND_DIR/.env"

# Update database settings in .env
if ! grep -q "# Updated for PostgreSQL" "$ENV_FILE"; then
    cat >> "$ENV_FILE" << EOF

# Updated for PostgreSQL
DB_ENGINE=django.db.backends.postgresql
DB_NAME=habitflow
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379/0
EOF
fi

# Create PostgreSQL settings override
print_status "Creating PostgreSQL settings..."
cat > "$BACKEND_DIR/core/settings/postgres.py" << EOF
"""
PostgreSQL settings for local development with Docker
"""
import os
from .base import *

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*']

# PostgreSQL Database
DATABASES = {
    'default': {
        'ENGINE': os.environ.get('DB_ENGINE', 'django.db.backends.postgresql'),
        'NAME': os.environ.get('DB_NAME', 'habitflow'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'OPTIONS': {
            'connect_timeout': 10,
        },
    }
}

# Redis Cache
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': REDIS_URL,
    }
}

# Session storage in Redis
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EOF

# Set Django settings for PostgreSQL
export DJANGO_SETTINGS_MODULE=core.settings.postgres

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Start Docker services
print_status "Starting PostgreSQL and Redis containers..."
cd "$PROJECT_ROOT"

# Start only database services
docker-compose up -d db redis

# Wait for services to be ready
print_status "Waiting for database to be ready..."
timeout 60 bash -c 'until docker-compose exec -T db pg_isready -h localhost -p 5432; do sleep 1; done' || {
    print_error "Database failed to start within 60 seconds"
    exit 1
}

print_status "Waiting for Redis to be ready..."
timeout 30 bash -c 'until docker-compose exec -T redis redis-cli ping; do sleep 1; done' || {
    print_error "Redis failed to start within 30 seconds"
    exit 1
}

cd "$BACKEND_DIR"

print_status "Running database migrations..."

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create management commands directory if missing
if [ ! -d "$BACKEND_DIR/forest/management/commands" ]; then
    mkdir -p "$BACKEND_DIR/forest/management/commands"
    touch "$BACKEND_DIR/forest/management/commands/__init__.py"
fi

# Check if forest achievements command exists and run it
if [ -f "$BACKEND_DIR/forest/management/commands/create_forest_achievements.py" ]; then
    print_status "Creating forest achievements..."
    python manage.py create_forest_achievements
fi

# Offer to create superuser
echo ""
read -p "Do you want to create a superuser account? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python manage.py createsuperuser
fi

print_status "Starting Django development server with PostgreSQL..."
echo ""
echo -e "${BLUE}Server will be available at: http://localhost:8000${NC}"
echo -e "${BLUE}Admin interface: http://localhost:8000/admin/${NC}"
echo -e "${BLUE}API documentation: http://localhost:8000/api/v1/docs/${NC}"
echo -e "${BLUE}Database: PostgreSQL on localhost:5432${NC}"
echo -e "${BLUE}Redis: localhost:6379${NC}"
echo ""
echo "Press Ctrl+C to stop the server"
echo "Use 'docker-compose down' to stop database services"
echo ""

# Start development server
python manage.py runserver