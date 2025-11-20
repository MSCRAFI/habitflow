#!/bin/bash

# HabitFlow - Start Both Backend and Frontend
# This script starts both services in the background

set -e

WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "🚀 Starting HabitFlow Project..."
echo "================================"

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo "• Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo "• Frontend stopped"
    fi
    echo "✅ All services stopped"
}

trap cleanup EXIT

echo "🔧 Starting Backend (Django)..."
cd "$WORKSPACE_DIR/backend"
./run_backend.sh > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "• Backend started (PID: $BACKEND_PID)"
echo "• Logs: $WORKSPACE_DIR/backend.log"

# Wait a moment for backend to start
sleep 3

echo ""
echo "⚛️ Starting Frontend (React)..."
cd "$WORKSPACE_DIR/frontend"
./run_frontend_dev.sh > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "• Frontend started (PID: $FRONTEND_PID)"
echo "• Logs: $WORKSPACE_DIR/frontend.log"

echo ""
echo "✅ Both services are running!"
echo "=============================="
echo "• Frontend: http://localhost:3000"
echo "• Backend API: http://localhost:8000/api/v1/"
echo "• Django Admin: http://localhost:8000/admin/"
echo ""
echo "📋 Service Status:"
echo "• Backend PID: $BACKEND_PID"
echo "• Frontend PID: $FRONTEND_PID"
echo ""
echo "💡 Tips:"
echo "• Press Ctrl+C to stop both services"
echo "• View backend logs: tail -f $WORKSPACE_DIR/backend.log"
echo "• View frontend logs: tail -f $WORKSPACE_DIR/frontend.log"
echo ""
echo "⏳ Waiting for services to be ready..."

# Wait for services to be fully ready
echo "Checking backend health..."
for i in {1..30}; do
    if curl -s http://localhost:8000/api/v1/ > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️ Backend took longer than expected to start"
    fi
    sleep 1
done

echo "Checking frontend health..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️ Frontend took longer than expected to start"
    fi
    sleep 1
done

echo ""
echo "🎉 HabitFlow is ready! Visit http://localhost:3000"
echo "Press Ctrl+C to stop all services..."

# Keep script running until interrupted
wait