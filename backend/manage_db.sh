#!/bin/bash

# HabitFlow Database Management Script
# Handles database operations for different configurations

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

show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  migrate                 Run database migrations"
    echo "  makemigrations         Create new migrations"
    echo "  reset                  Reset database (WARNING: destroys all data)"
    echo "  superuser              Create superuser account"
    echo "  shell                  Open Django shell"
    echo "  dbshell                Open database shell"
    echo "  fixtures               Load initial data fixtures"
    echo "  backup                 Backup database (PostgreSQL only)"
    echo "  restore [file]         Restore database from backup"
    echo ""
    echo "Options:"
    echo "  --sqlite              Use SQLite configuration"
    echo "  --postgres            Use PostgreSQL configuration"
    echo "  --help                Show this help message"
}

# Parse arguments
COMMAND=""
DB_TYPE="auto"

while [[ $# -gt 0 ]]; do
    case $1 in
        --sqlite)
            DB_TYPE="sqlite"
            shift
            ;;
        --postgres)
            DB_TYPE="postgres"
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            if [ -z "$COMMAND" ]; then
                COMMAND="$1"
            else
                RESTORE_FILE="$1"
            fi
            shift
            ;;
    esac
done

if [ -z "$COMMAND" ]; then
    show_usage
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "$VENV_DIR" ]; then
    print_error "Virtual environment not found. Run ./setup_backend.sh first"
    exit 1
fi

# Activate virtual environment
source "$VENV_DIR/bin/activate"
cd "$BACKEND_DIR"

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Auto-detect database type if not specified
if [ "$DB_TYPE" = "auto" ]; then
    if [ -f "core/settings/postgres.py" ] && docker ps | grep -q habitflow_db; then
        DB_TYPE="postgres"
        export DJANGO_SETTINGS_MODULE=core.settings.postgres
        print_status "Auto-detected PostgreSQL setup"
    else
        DB_TYPE="sqlite"
        export DJANGO_SETTINGS_MODULE=core.settings.local
        print_status "Auto-detected SQLite setup"
    fi
elif [ "$DB_TYPE" = "postgres" ]; then
    export DJANGO_SETTINGS_MODULE=core.settings.postgres
elif [ "$DB_TYPE" = "sqlite" ]; then
    export DJANGO_SETTINGS_MODULE=core.settings.local
fi

# Execute commands
case $COMMAND in
    migrate)
        print_status "Running database migrations..."
        python manage.py migrate
        ;;
    
    makemigrations)
        print_status "Creating new migrations..."
        python manage.py makemigrations
        ;;
    
    reset)
        print_warning "This will destroy ALL data in the database!"
        read -p "Are you sure? Type 'yes' to continue: " confirm
        if [ "$confirm" = "yes" ]; then
            if [ "$DB_TYPE" = "sqlite" ]; then
                print_status "Removing SQLite database..."
                rm -f db.sqlite3
            elif [ "$DB_TYPE" = "postgres" ]; then
                print_status "Resetting PostgreSQL database..."
                cd "$PROJECT_ROOT"
                docker-compose exec db psql -U postgres -c "DROP DATABASE IF EXISTS habitflow;"
                docker-compose exec db psql -U postgres -c "CREATE DATABASE habitflow;"
                cd "$BACKEND_DIR"
            fi
            print_status "Running fresh migrations..."
            python manage.py migrate
            print_status "Database reset complete"
        else
            print_status "Database reset cancelled"
        fi
        ;;
    
    superuser)
        print_status "Creating superuser account..."
        python manage.py createsuperuser
        ;;
    
    shell)
        print_status "Opening Django shell..."
        python manage.py shell
        ;;
    
    dbshell)
        print_status "Opening database shell..."
        python manage.py dbshell
        ;;
    
    fixtures)
        print_status "Loading initial data fixtures..."
        # Create forest achievements if management command exists
        if [ -f "forest/management/commands/create_forest_achievements.py" ]; then
            print_status "Creating forest achievements..."
            python manage.py create_forest_achievements
        fi
        print_status "Fixtures loaded"
        ;;
    
    backup)
        if [ "$DB_TYPE" = "postgres" ]; then
            BACKUP_FILE="habitflow_backup_$(date +%Y%m%d_%H%M%S).sql"
            print_status "Creating database backup: $BACKUP_FILE"
            cd "$PROJECT_ROOT"
            docker-compose exec db pg_dump -U postgres habitflow > "$BACKUP_FILE"
            print_status "Backup saved to: $PROJECT_ROOT/$BACKUP_FILE"
        else
            print_warning "Backup is only supported for PostgreSQL"
            print_status "For SQLite, simply copy the db.sqlite3 file"
        fi
        ;;
    
    restore)
        if [ "$DB_TYPE" = "postgres" ]; then
            if [ -z "$RESTORE_FILE" ]; then
                print_error "Please specify backup file to restore"
                exit 1
            fi
            if [ ! -f "$RESTORE_FILE" ]; then
                print_error "Backup file not found: $RESTORE_FILE"
                exit 1
            fi
            print_warning "This will overwrite the current database!"
            read -p "Are you sure? Type 'yes' to continue: " confirm
            if [ "$confirm" = "yes" ]; then
                print_status "Restoring database from: $RESTORE_FILE"
                cd "$PROJECT_ROOT"
                docker-compose exec -T db psql -U postgres -c "DROP DATABASE IF EXISTS habitflow;"
                docker-compose exec -T db psql -U postgres -c "CREATE DATABASE habitflow;"
                cat "$RESTORE_FILE" | docker-compose exec -T db psql -U postgres habitflow
                print_status "Database restored successfully"
            else
                print_status "Database restore cancelled"
            fi
        else
            print_warning "Restore is only supported for PostgreSQL"
            print_status "For SQLite, replace the db.sqlite3 file"
        fi
        ;;
    
    *)
        print_error "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac

print_status "Operation completed successfully!"