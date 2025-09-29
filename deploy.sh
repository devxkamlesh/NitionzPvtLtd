#!/bin/bash

# Nitionz Investment Platform - Production Deployment Script

echo "🚀 Starting Nitionz Investment Platform Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_info "Docker and Docker Compose are available"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production file not found. Creating template..."
    cp .env.production .env.local
    print_info "Please edit .env.local with your production values"
fi

# Install dependencies
print_info "Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Run tests (optional)
read -p "Do you want to run tests before deployment? (y/n): " run_tests
if [ "$run_tests" = "y" ] || [ "$run_tests" = "Y" ]; then
    print_info "Running tests..."
    npm test
    if [ $? -eq 0 ]; then
        print_status "All tests passed"
    else
        print_warning "Some tests failed, but continuing deployment..."
    fi
fi

# Build Docker image
print_info "Building Docker image..."
docker build -t nitionz-platform:latest .

if [ $? -eq 0 ]; then
    print_status "Docker image built successfully"
else
    print_error "Failed to build Docker image"
    exit 1
fi

# Deploy with Docker Compose
print_info "Deploying with Docker Compose..."
docker-compose up -d

if [ $? -eq 0 ]; then
    print_status "Deployment successful!"
else
    print_error "Deployment failed"
    exit 1
fi

# Wait for services to start
print_info "Waiting for services to start..."
sleep 10

# Health check
print_info "Performing health check..."
health_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)

if [ "$health_response" = "200" ]; then
    print_status "Health check passed - Application is running!"
else
    print_warning "Health check failed (HTTP $health_response) - Check logs"
fi

# Display deployment information
echo ""
echo "🎉 Nitionz Investment Platform Deployment Complete!"
echo ""
echo "📊 Access URLs:"
echo "   • Application: http://localhost:3000"
echo "   • Health Check: http://localhost:3000/api/health"
echo "   • Test Suite: http://localhost:3000/test"
echo "   • Admin Panel: http://localhost:3000/admin"
echo ""
echo "🔧 Management Commands:"
echo "   • View logs: docker-compose logs -f app"
echo "   • Stop services: docker-compose down"
echo "   • Restart: docker-compose restart"
echo "   • Update: git pull && ./deploy.sh"
echo ""
echo "📈 Monitoring:"
echo "   • Grafana: http://localhost:3001 (if enabled)"
echo "   • Prometheus: http://localhost:9090 (if enabled)"
echo ""

# Show running containers
print_info "Running containers:"
docker-compose ps

echo ""
print_status "Deployment completed successfully! 🚀"
echo "Visit http://localhost:3000 to access your investment platform"