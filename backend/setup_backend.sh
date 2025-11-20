#!/bin/bash

# HabitFlow Backend Setup Script
# Sets up Django backend with virtual environment isolation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$BACKEND_DIR")"
VENV_DIR="$BACKEND_DIR/venv"

echo -e "${BLUE}=== HabitFlow Backend Setup ===${NC}"
echo "Backend directory: $BACKEND_DIR"
echo "Virtual environment: $VENV_DIR"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Python version
print_status "Checking Python version..."
PYTHON_VERSION=$(python3 --version 2>&1 | sed 's/Python //' | cut -d' ' -f1)
REQUIRED_MAJOR=3
REQUIRED_MINOR=11

PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)

if [ "$PYTHON_MAJOR" -gt "$REQUIRED_MAJOR" ] || ([ "$PYTHON_MAJOR" -eq "$REQUIRED_MAJOR" ] && [ "$PYTHON_MINOR" -ge "$REQUIRED_MINOR" ]); then
    print_status "Python $PYTHON_VERSION found (required: $REQUIRED_MAJOR.$REQUIRED_MINOR+)"
else
    print_error "Python $REQUIRED_MAJOR.$REQUIRED_MINOR+ required, but found $PYTHON_VERSION"
    print_error "Please install Python 3.11+ and try again"
    exit 1
fi

# Check if virtual environment exists
if [ -d "$VENV_DIR" ]; then
    print_warning "Virtual environment already exists at $VENV_DIR"
    read -p "Do you want to recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Removing existing virtual environment..."
        rm -rf "$VENV_DIR"
    else
        print_status "Using existing virtual environment"
    fi
fi

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source "$VENV_DIR/bin/activate"

# Upgrade pip
print_status "Upgrading pip..."
pip install --upgrade pip

# Install Poetry in virtual environment
print_status "Installing Poetry..."
pip install poetry

# Configure Poetry to use the virtual environment
print_status "Configuring Poetry..."
poetry config virtualenvs.create false  # Use existing venv
poetry config virtualenvs.in-project false

# Install dependencies
print_status "Installing Python dependencies with Poetry..."
cd "$BACKEND_DIR"
poetry install

# Create .env file if it doesn't exist
ENV_FILE="$BACKEND_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    print_status "Creating .env file from template..."
    cp "$BACKEND_DIR/.env.example" "$ENV_FILE"
    
    # Generate Django secret key
    DJANGO_SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(50))")
    JWT_SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(50))")
    
    # Update .env file with generated keys
    sed -i "s/DJANGO_SECRET_KEY=your-secret-key-here-change-in-production/DJANGO_SECRET_KEY=$DJANGO_SECRET_KEY/" "$ENV_FILE"
    sed -i "s/JWT_SECRET_KEY=your-jwt-secret-key/JWT_SECRET_KEY=$JWT_SECRET_KEY/" "$ENV_FILE"
    
    print_status "Generated secure secret keys in .env file"
else
    print_warning ".env file already exists, skipping creation"
fi

print_status "Backend setup completed successfully!"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Activate the virtual environment: source $VENV_DIR/bin/activate"
echo "2. Choose your database setup:"
echo "   - For local SQLite (simple): ./run_local_sqlite.sh"
echo "   - For PostgreSQL + Redis (recommended): ./run_with_docker_db.sh"
echo "   - For full Docker setup: cd .. && docker-compose up"
echo "3. Run migrations and create superuser"
echo "4. Start the development server"
echo ""
echo -e "${GREEN}Setup completed!${NC}"