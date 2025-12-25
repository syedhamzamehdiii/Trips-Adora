#!/bin/bash

# Customer Platform Deployment Script
# Run this on your server to deploy manually or via webhook

set -e  # Exit on error

echo "🚀 Starting Customer Platform Deployment..."
echo "=========================================="

# Configuration
REPO_URL="https://github.com/YOUR_USERNAME/YOUR_REPO.git"  # Update this!
BRANCH="main"
DEPLOY_DIR="/var/www/Trips-Adora"
FRONTEND_DEPLOY_DIR="/var/www/tripsadora/customer"
BACKEND_DIR="$DEPLOY_DIR/customer-platform/backend"
SERVICE_NAME="customer-api.service"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root or with sudo"
    exit 1
fi

# Step 1: Clone/Update repository
echo ""
print_status "Step 1: Updating repository..."
if [ -d "$DEPLOY_DIR" ]; then
    cd "$DEPLOY_DIR"
    git fetch origin
    git reset --hard origin/$BRANCH
    git clean -fd
else
    print_error "Deployment directory not found: $DEPLOY_DIR"
    exit 1
fi

# Step 2: Build Frontend
echo ""
print_status "Step 2: Building frontend..."
cd "$DEPLOY_DIR/customer-platform/frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_warning "Installing npm dependencies..."
    npm ci
fi

# Build
print_status "Running npm build..."
npm run build

# Step 3: Deploy Frontend
echo ""
print_status "Step 3: Deploying frontend..."
rm -rf "$FRONTEND_DEPLOY_DIR"/*
cp -rv dist/* "$FRONTEND_DEPLOY_DIR"/
chown -R www-data:www-data "$FRONTEND_DEPLOY_DIR"
chmod -R 755 "$FRONTEND_DEPLOY_DIR"
print_status "Frontend deployed to $FRONTEND_DEPLOY_DIR"

# Step 4: Deploy Backend
echo ""
print_status "Step 4: Setting up backend..."
cd "$BACKEND_DIR"

# Create/Update virtual environment
if [ ! -d "venv" ]; then
    print_warning "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv and install dependencies
source venv/bin/activate
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

# Step 5: Restart Service
echo ""
print_status "Step 5: Restarting service..."
systemctl restart "$SERVICE_NAME"
sleep 2

# Check service status
if systemctl is-active --quiet "$SERVICE_NAME"; then
    print_status "Service $SERVICE_NAME is running"
    systemctl status "$SERVICE_NAME" --no-pager | head -10
else
    print_error "Service $SERVICE_NAME failed to start!"
    systemctl status "$SERVICE_NAME" --no-pager
    exit 1
fi

# Step 6: Verify
echo ""
print_status "Step 6: Deployment complete!"
echo "=========================================="
echo "Frontend: https://tripsadora.com"
echo "Backend API: https://tripsadora.com/api"
echo "Swagger Docs: https://tripsadora.com/docs"
echo ""

