# Flood Watch - Deployment Guide

Complete deployment guide for production deployment of the Flood Watch system.

---

## 🚀 Quick Deployment

### Prerequisites

- Docker & Docker Compose installed
- Domain name configured
- SSL certificates (Let's Encrypt recommended)
- Cloud provider account (AWS/GCP/Azure/DigitalOcean)
- Required API keys (WhatsApp, Telegram, OpenWeatherMap, AWS S3)

### 1. Clone Repository

```bash
git clone https://github.com/yourorg/flood-watch.git
cd flood-watch
```

### 2. Create Production Environment File

```bash
cp .env.example .env.production
```

**Edit `.env.production` with production values:**

```bash
# Database
DATABASE_URL=postgresql://floodwatch:STRONG_PASSWORD@db:5432/floodwatch
DATABASE_NAME=floodwatch
DATABASE_USER=floodwatch
DATABASE_PASSWORD=STRONG_PASSWORD_HERE

# Redis
REDIS_URL=redis://:REDIS_PASSWORD@redis:6379/0
REDIS_PASSWORD=STRONG_REDIS_PASSWORD

# RabbitMQ
RABBITMQ_URL=amqp://floodwatch:RABBITMQ_PASSWORD@rabbitmq:5672
RABBITMQ_USER=floodwatch
RABBITMQ_PASSWORD=STRONG_RABBITMQ_PASSWORD

# Security
SECRET_KEY=GENERATE_STRONG_SECRET_KEY_HERE  # openssl rand -hex 32
JWT_SECRET_KEY=GENERATE_JWT_SECRET_HERE

# Backend
BACKEND_IMAGE=ghcr.io/yourorg/flood-watch/backend:latest
FRONTEND_IMAGE=ghcr.io/yourorg/flood-watch/frontend:latest

# External APIs
WHATSAPP_API_KEY=your_360dialog_api_key
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_API_URL=https://waba.360dialog.io/v1

TELEGRAM_BOT_TOKEN=your_telegram_bot_token

OPENWEATHER_API_KEY=your_openweather_api_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=floodwatch-media-prod
AWS_REGION=us-east-1

# Monitoring
SENTRY_DSN=your_sentry_dsn
ENVIRONMENT=production

# CORS
ALLOWED_ORIGINS=https://admin.floodwatch.org,https://floodwatch.org
```

### 3. Deploy

```bash
./deploy.sh
```

The script will:
- ✅ Verify environment variables
- ✅ Pull latest Docker images
- ✅ Backup existing database
- ✅ Start all services
- ✅ Run database migrations
- ✅ Verify deployment health

---

## 🏗️ Infrastructure Options

### Option 1: Single Server (DigitalOcean/Linode)

**Recommended for:** Pilot deployment, single-country rollout

**Specs:**
- 4 CPU cores
- 8GB RAM
- 160GB SSD
- ~$40-60/month

**Steps:**
1. Create droplet/instance
2. Install Docker & Docker Compose
3. Configure firewall (ports 80, 443, 22)
4. Run deployment script
5. Configure domain DNS

### Option 2: AWS/GCP/Azure

**Recommended for:** Multi-region, high-scale deployment

**Services:**
- **Compute**: ECS/EKS (AWS), GKE (GCP), AKS (Azure)
- **Database**: RDS PostgreSQL with PostGIS
- **Cache**: ElastiCache Redis
- **Storage**: S3/Cloud Storage
- **CDN**: CloudFront/Cloud CDN
- **Monitoring**: CloudWatch/Stackdriver

### Option 3: Kubernetes

See `k8s/` directory for Kubernetes manifests.

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yaml
```

---

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d admin.floodwatch.org -d api.floodwatch.org

# Auto-renewal
sudo certbot renew --dry-run
```

### Update Nginx Config

```nginx
server {
    listen 443 ssl http2;
    server_name admin.floodwatch.org;
    
    ssl_certificate /etc/letsencrypt/live/admin.floodwatch.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.floodwatch.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # ... rest of config
}
```

---

## 📊 Monitoring Setup

### Sentry (Error Tracking)

1. Create Sentry project: https://sentry.io
2. Get DSN
3. Add to `.env.production`:
   ```
   SENTRY_DSN=https://xxx@sentry.io/xxx
   ```

### Uptime Monitoring

**Options:**
- UptimeRobot (free)
- Pingdom
- Datadog
- New Relic

**Monitor endpoints:**
- https://api.floodwatch.org/health
- https://admin.floodwatch.org

### Log Aggregation

**Option 1: Docker Logs**
```bash
docker-compose -f docker-compose.production.yml logs -f --tail=100
```

**Option 2: ELK Stack** (Elasticsearch, Logstash, Kibana)
```bash
docker-compose -f docker-compose.elk.yml up -d
```

**Option 3: Cloud Logging**
- AWS CloudWatch Logs
- GCP Cloud Logging
- Azure Monitor

---

## 🗄️ Database Management

### Backups

**Automated Backup Script:**

```bash
#!/bin/bash
# backup-db.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/floodwatch_$DATE.sql"

docker-compose -f docker-compose.production.yml exec -T db \
    pg_dump -U floodwatch floodwatch > $BACKUP_FILE

gzip $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE.gz s3://floodwatch-backups/

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

**Cron job (daily at 2 AM):**
```
0 2 * * * /opt/flood-watch/backup-db.sh
```

### Restore from Backup

```bash
# Stop services
docker-compose -f docker-compose.production.yml down

# Restore database
gunzip -c backup_20241210_020000.sql.gz | \
    docker-compose -f docker-compose.production.yml exec -T db \
    psql -U floodwatch floodwatch

# Start services
docker-compose -f docker-compose.production.yml up -d
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Automatic)

Push to `main` branch triggers:
1. Run tests
2. Build Docker images
3. Push to GitHub Container Registry
4. Deploy to production (manual approval)

### Manual Deploy

```bash
# Pull latest code
git pull origin main

# Re-run deployment
./deploy.sh
```

---

## 📈 Scaling

### Horizontal Scaling

**Docker Compose:**
```bash
docker-compose -f docker-compose.production.yml up -d --scale backend=3
```

**Kubernetes:**
```bash
kubectl scale deployment backend --replicas=5
```

### Database Scaling

- Enable read replicas
- Connection pooling (PgBouncer)
- Partition large tables by date

### Redis Scaling

- Redis Cluster for high availability
- Separate cache from session storage

---

## 🚨 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose -f docker-compose.production.yml logs backend

# Check service status
docker-compose -f docker-compose.production.yml ps

# Restart specific service
docker-compose -f docker-compose.production.yml restart backend
```

### Database Connection Issues

```bash
# Test database connection
docker-compose -f docker-compose.production.yml exec db \
    psql -U floodwatch -d floodwatch -c "SELECT 1"

# Check database logs
docker-compose -f docker-compose.production.yml logs db
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Restart services
docker-compose -f docker-compose.production.yml restart
```

---

## ✅ Post-Deployment Checklist

- [ ] SSL certificates installed and auto-renewal configured
- [ ] Database backups running daily
- [ ] Monitoring alerts configured
- [ ] Error tracking (Sentry) working
- [ ] Webhook URLs updated (WhatsApp, Telegram)
- [ ] Admin user created
- [ ] Health checks passing
- [ ] Load testing completed
- [ ] Disaster recovery plan documented
- [ ] Team trained on deployment process

---

## 🆘 Support & Maintenance

### Regular Maintenance

**Weekly:**
- Check service health
- Review error logs
- Monitor disk usage

**Monthly:**
- Update Docker images
- Review performance metrics
- Database optimization (VACUUM, ANALYZE)
- Security updates

**Quarterly:**
- Load testing
- Disaster recovery drill
- Review and rotate secrets

### Emergency Contacts

- **DevOps Lead**: ops@floodwatch.org
- **On-Call**: +XXX-XXX-XXXX
- **Sentry Alerts**: alerts@floodwatch.org

---

## 📚 Additional Resources

- **API Docs**: https://api.floodwatch.org/docs
- **GitHub**: https://github.com/yourorg/flood-watch
- **Status Page**: https://status.floodwatch.org
- **Support**: support@floodwatch.org

---

**Deployment Date**: _____________  
**Deployed By**: _____________  
**Version**: v1.0.0
