#!/bin/bash

# HabitFlow Backend - Local SQLite Setup
# Simple setup using SQLite database for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$BACKEND_DIR/venv"

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if virtual environment exists
if [ ! -d "$VENV_DIR" ]; then
    print_error "Virtual environment not found. Run ./setup_backend.sh first"
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

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Set Django settings for local SQLite
export DJANGO_SETTINGS_MODULE=core.settings.local

print_status "Using SQLite database for local development"
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

print_status "Starting Django development server..."
echo ""
echo -e "${BLUE}Server will be available at: http://localhost:8000${NC}"
echo -e "${BLUE}Admin interface: http://localhost:8000/admin/${NC}"
echo -e "${BLUE}API documentation: http://localhost:8000/api/v1/docs/${NC}"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start development server
python manage.py runserver