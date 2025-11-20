#!/bin/bash

# HabitFlow Backend - Run Development Server
# This script activates the virtual environment and runs the Django development server

set -e

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BACKEND_DIR"

echo "🚀 Starting HabitFlow Backend..."
echo "================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run ./setup_backend.sh first"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️ No .env file found, copying from .env.example..."
    cp .env.example .env
fi

echo "🔧 Environment: $(python --version)"
echo "📁 Working directory: $BACKEND_DIR"
echo "🗄️ Database: $(grep -E '^DATABASE_URL|^DB_ENGINE' .env || echo 'Default SQLite')"

# Run migrations if needed
echo ""
echo "🔄 Checking for pending migrations..."
python manage.py showmigrations --plan | grep -q '\[ \]' && {
    echo "📦 Running migrations..."
    python manage.py migrate
} || echo "✅ All migrations up to date"

# Create superuser if needed (using custom User model)
if ! python manage.py shell -c "from users.models import User; exit(0 if User.objects.filter(is_superuser=True).exists() else 1)" 2>/dev/null; then
    echo ""
    echo "👤 No superuser found. Creating admin user..."
    echo "Username: admin"
    echo "Email: admin@habitflow.com" 
    echo "Password: admin123"
    python manage.py shell -c "
from users.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@habitflow.com', 'admin123')
    print('✅ Superuser created successfully!')
else:
    print('✅ Admin user already exists')
"
fi

echo ""
echo "🌱 Starting development server..."
echo "• API will be available at: http://localhost:8000/api/v1/"
echo "• Django Admin: http://localhost:8000/admin/"
echo "• Use admin/admin123 to login to admin panel"
echo ""

# Start the development server
python manage.py runserver 0.0.0.0:8000