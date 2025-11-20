#!/bin/bash

# =============================================================================
# HABITFLOW REPOSITORY CLEANUP SCRIPT
# Removes files that should not be in version control
# =============================================================================

echo "🧹 Starting HabitFlow repository cleanup..."

# Function to safely remove files/directories
safe_remove() {
    if [ -e "$1" ]; then
        echo "  Removing: $1"
        rm -rf "$1"
    fi
}

# Remove Python cache files
echo "🐍 Cleaning Python cache files..."
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -type f -delete 2>/dev/null || true
find . -name "*.pyo" -type f -delete 2>/dev/null || true
find . -name "*.pyd" -type f -delete 2>/dev/null || true

# Remove OS files
echo "💻 Cleaning OS-specific files..."
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
find . -name "desktop.ini" -type f -delete 2>/dev/null || true

# Remove IDE files (keeping configurations that might be useful)
echo "📝 Cleaning IDE files..."
safe_remove ".vscode/settings.json"
safe_remove ".idea/workspace.xml"
safe_remove ".idea/tasks.xml"

# Remove temporary files
echo "🗑️ Cleaning temporary files..."
find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name "*.temp" -type f -delete 2>/dev/null || true
find . -name "*.bak" -type f -delete 2>/dev/null || true
find . -name "*.backup" -type f -delete 2>/dev/null || true
find . -name "*~" -type f -delete 2>/dev/null || true

# Remove log files
echo "📋 Cleaning log files..."
find . -name "*.log" -type f -delete 2>/dev/null || true
safe_remove "logs/"
safe_remove "log/"

# Remove development databases
echo "🗄️ Cleaning development databases..."
find . -name "*.sqlite3" -not -path "./backend/db.sqlite3" -delete 2>/dev/null || true
find . -name "*.sqlite3-journal" -delete 2>/dev/null || true

# Remove build artifacts
echo "🏗️ Cleaning build artifacts..."
safe_remove "frontend/build/"
safe_remove "frontend/dist/"
safe_remove "dist/"
safe_remove "build/"

# Remove coverage files
echo "📊 Cleaning coverage files..."
safe_remove ".coverage"
safe_remove "htmlcov/"
safe_remove "coverage/"

# Remove node_modules if they exist
echo "📦 Cleaning Node.js artifacts..."
safe_remove "node_modules/"
safe_remove "frontend/node_modules/"

# Remove internal documentation
echo "📚 Cleaning internal documentation..."
safe_remove "UPLOAD_CHECKLIST.md"
safe_remove "TODO.md"
safe_remove "NOTES.md"
safe_remove ".todo"
safe_remove ".notes"

# Remove any tmp_rovodev_ files
echo "🤖 Cleaning Rovo Dev temporary files..."
find . -name "tmp_rovodev_*" -delete 2>/dev/null || true

echo "✅ Repository cleanup complete!"
echo ""
echo "📋 Summary of what was cleaned:"
echo "   - Python cache files (__pycache__, *.pyc, *.pyo)"
echo "   - OS-specific files (.DS_Store, Thumbs.db)"
echo "   - IDE workspace files (non-shared configs)"
echo "   - Temporary and backup files"
echo "   - Log files"
echo "   - Development databases (except main db.sqlite3)"
echo "   - Build artifacts"
echo "   - Coverage reports"
echo "   - Internal documentation files"
echo ""
echo "🚀 Your repository is now clean and ready for GitHub!"