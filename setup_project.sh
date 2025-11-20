#!/bin/bash

# HabitFlow - Complete Project Setup Script
# This script sets up both backend and frontend with complete isolation

set -e

echo "🌱 Setting up HabitFlow Project with complete isolation..."
echo "============================================="

# Get the absolute path of the workspace
WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📁 Workspace: $WORKSPACE_DIR"

echo ""
echo "🔧 Setting up Backend (Django + PostgreSQL)..."
echo "-----------------------------------------------"
cd "$WORKSPACE_DIR/backend"

# Make backend scripts executable
chmod +x setup_backend.sh run_backend.sh

# Run backend setup
./setup_backend.sh

echo ""
echo "⚛️ Setting up Frontend (React)..."
echo "---------------------------------"
cd "$WORKSPACE_DIR/frontend"

# Make frontend scripts executable
chmod +x *.sh

# Run frontend setup
./setup_frontend.sh

echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "🚀 To start the project:"
echo "------------------------"
echo "1. Start Backend (Django):"
echo "   cd $WORKSPACE_DIR/backend && ./run_backend.sh"
echo ""
echo "2. Start Frontend (React) - in a new terminal:"
echo "   cd $WORKSPACE_DIR/frontend && ./run_frontend_dev.sh"
echo ""
echo "3. Visit your app at: http://localhost:3000"
echo ""
echo "📖 Additional commands:"
echo "----------------------"
echo "• Backend Django admin: http://localhost:8000/admin/"
echo "• API documentation: http://localhost:8000/api/v1/"
echo "• Build frontend for production: cd frontend && ./build_frontend.sh"
echo "• Serve production build: cd frontend && ./serve_frontend_prod.sh"
echo ""
echo "🔧 Environments:"
echo "---------------"
echo "• Backend: Python virtual environment in backend/venv/"
echo "• Frontend: Local Node.js via nvm in frontend/.nvm/"
echo "• Database: SQLite (default) or PostgreSQL (configurable)"
echo ""
echo "Happy coding! 🎉"