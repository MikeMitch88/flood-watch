#!/bin/bash

# Flood Watch Deployment Script
# This script deploys the Flood Watch system to production

set -e  # Exit on error

echo "🌊 Flood Watch Deployment Script"
echo "=================================="

# Check if .env file exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production with required environment variables."
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

# Verify critical environment variables
REQUIRED_VARS=(
    "DATABASE_PASSWORD"
    "REDIS_PASSWORD"
    "RABBITMQ_PASSWORD"
    "SECRET_KEY"
    "WHATSAPP_API_KEY"
    "TELEGRAM_BOT_TOKEN"
)

echo "✓ Checking required environment variables..."
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set!"
        exit 1
    fi
done

echo "✓ All required variables are set"

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker-compose -f docker-compose.production.yml pull

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.production.yml down

# Backup database
echo "💾 Creating database backup..."
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
mkdir -p $BACKUP_DIR

docker-compose -f docker-compose.production.yml run --rm db \
    pg_dump -h db -U ${DATABASE_USER:-floodwatch} ${DATABASE_NAME:-floodwatch} > $BACKUP_FILE

echo "✓ Database backed up to $BACKUP_FILE"

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.production.yml ps

# Run database migrations
echo "📊 Running database migrations..."
docker-compose -f docker-compose.production.yml exec -T backend \
    alembic upgrade head

# Verify deployment
echo "✅ Verifying deployment..."
HEALTH_URL="http://localhost/health"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Health check passed!"
else
    echo "❌ Health check failed! HTTP code: $HTTP_CODE"
    echo "Rolling back..."
    docker-compose -f docker-compose.production.yml down
    exit 1
fi

# Show logs
echo "📝 Recent logs:"
docker-compose -f docker-compose.production.yml logs --tail=50

echo ""
echo "🎉 Deployment successful!"
echo "=================================="
echo "Services running:"
echo "  - Frontend: http://localhost"
echo "  - Backend API: http://localhost/api"
echo "  - API Docs: http://localhost/docs"
echo ""
echo "Monitor logs with:"
echo "  docker-compose -f docker-compose.production.yml logs -f"
