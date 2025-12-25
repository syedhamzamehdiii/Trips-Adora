#!/bin/bash

# Admin Platform Deployment Script
# Run this on your server to deploy manually or via webhook

set -e  # Exit on error

echo "🚀 Starting Admin Platform Deployment..."
echo "=========================================="

# Configuration
DEPLOY_DIR="/var/www/Trips-Adora"
FRONTEND_DEPLOY_DIR="/var/www/tripsadora/admin"
BACKEND_DIR="$DEPLOY_DIR/admin-platform/backend"
SERVICE_NAME="admin-api.service"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root or with sudo"
    exit 1
fi

# Step 1: Update repository
echo ""
print_status "Step 1: Updating repository..."
cd "$DEPLOY_DIR"
git fetch origin
git reset --hard origin/main
git clean -fd

# Step 2: Build Frontend
echo ""
print_status "Step 2: Building frontend..."
cd "$DEPLOY_DIR/admin-platform/frontend"

if [ ! -d "node_modules" ]; then
    print_warning "Installing npm dependencies..."
    npm ci
fi

print_status "Running npm build..."
npm run build

# Step 3: Deploy Frontend
echo ""
print_status "Step 3: Deploying frontend..."
rm -rf "$FRONTEND_DEPLOY_DIR"/*
cp -rv dist/* "$FRONTEND_DEPLOY_DIR"/
chown -R www-data:www-data "$FRONTEND_DEPLOY_DIR"
chmod -R 755 "$FRONTEND_DEPLOY_DIR"

# Step 4: Deploy Backend
echo ""
print_status "Step 4: Setting up backend..."
cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
    print_warning "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

# Step 5: Restart Service
echo ""
print_status "Step 5: Restarting service..."
systemctl restart "$SERVICE_NAME"
sleep 2

if systemctl is-active --quiet "$SERVICE_NAME"; then
    print_status "Service $SERVICE_NAME is running"
else
    print_error "Service $SERVICE_NAME failed to start!"
    exit 1
fi

echo ""
print_status "Deployment complete!"
echo "Frontend: https://admin.tripsadora.com"
echo "Backend API: https://admin.tripsadora.com/api"

