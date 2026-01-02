# 🌊 Flood Watch

> **Production-ready, community-driven flood monitoring and early warning system**

Flood Watch enables citizens to report and respond to flooding events in real-time via WhatsApp and Telegram, with AI-powered verification, geofenced alerts, and a comprehensive admin dashboard.

## 🎯 Project Status

**Current Phase**: MVP Foundation Complete ✅  
**Next Phase**: Bot Integration & AI Verification

### ✅ Completed
- ✅ Project structure scaffolding
- ✅ Docker development environment (PostgreSQL/PostGIS, Redis, RabbitMQ)
- ✅ Complete database schema with geospatial support
- ✅ Core backend services (User, Report, Incident)
- ✅ REST API endpoints with authentication
- ✅ Admin authentication with JWT

### 🚧 In Progress
- Database migrations with Alembic
- WhatsApp Business API integration
- Telegram Bot integration

### 📋 Upcoming
- AI flood detection model
- Alert delivery system
- Admin dashboard (React)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│         USER INTERFACES                         │
│  WhatsApp │ Telegram │ SMS │ Admin Dashboard   │
└────────────┬────────────────────────────┬───────┘
             │                            │
┌────────────┴────────────────────────────┴───────┐
│          FastAPI Backend (Python)                │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Report  │  │ Incident │  │ Alert Engine │  │
│  │ Service  │  │ Service  │  │              │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │   User   │  │    AI    │  │  Analytics   │  │
│  │ Service  │  │  Model   │  │   Service    │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└──────────────────────────────────────────────────┘
             │                            │
┌────────────┴────────────────────────────┴───────┐
│        DATA & INFRASTRUCTURE                     │
│  Supabase (PostgreSQL+PostGIS) │ Redis │ S3     │
│  Optional: Supabase Auth, Storage, Realtime     │
└──────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Supabase Account** (free tier available at [supabase.com](https://supabase.com))
- Docker & Docker Compose
- Python 3.11+ (for local development)
- Node.js 18+ (for frontend development)

### 1. Clone and Setup

```bash
cd flood-watch
cp .env.example .env
```

### 2. Setup Supabase

**Follow the detailed guide: [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)**

Quick steps:
1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Enable PostGIS extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
4. Copy your connection string from Project Settings → Database

### 3. Configure Environment

Edit `.env` with your Supabase credentials:

```bash
# Supabase Database (Required)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.your-project-ref.supabase.co:5432/postgres

# Security (Required)
SECRET_KEY=your-super-secret-key-change-this

# Infrastructure (Required)
REDIS_URL=redis://redis:6379/0

# Supabase Optional Features
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
USE_SUPABASE_STORAGE=false  # Set true to use Supabase Storage instead of S3
USE_SUPABASE_REALTIME=false # Set true for live updates

# Optional - external services (add later)
WHATSAPP_API_KEY=your-key
TELEGRAM_BOT_TOKEN=your-token
OPENWEATHER_API_KEY=your-key
```

### 4. Run Database Migrations

```bash
# Start services (using Supabase for database)
docker-compose up -d

# Run migrations to create tables in Supabase
docker-compose exec backend alembic upgrade head

# Check logs
docker-compose logs -f backend
```

**Alternative:** Use Supabase-only mode (no local PostgreSQL):
```bash
docker-compose -f docker-compose.supabase.yml up -d
```

**Local Development:** Use local PostgreSQL (optional):
```bash
docker-compose --profile local-db up -d
```

Services will be available at:
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Frontend Dashboard**: http://localhost:3000
- **Supabase Dashboard**: https://app.supabase.com (your project)
- **Redis**: localhost:6379
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

Optional (with `--profile local-db`):
- **Local PostgreSQL**: localhost:5432
- **PgAdmin**: http://localhost:5050 (admin@floodwatch.org / admin)

### 5. Create Initial Admin User

```bash
# Access the backend container
docker-compose exec backend bash

# Run Python shell
python

# Create admin user
from app.database import SessionLocal, init_db
from app.auth import get_password_hash
from app.models import AdminUser, UserRole

init_db()
db = SessionLocal()

admin = AdminUser(
    username="admin",
    email="admin@floodwatch.org",
    password_hash=get_password_hash("admin123"),
    role=UserRole.ADMIN
)

db.add(admin)
db.commit()
print(f"✅ Admin user created: {admin.username}")
```

### 6. Test the API

```bash
# Register admin (or use the one created above)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Copy the access_token from response and use it for authenticated requests
```

---

## 📁 Project Structure

```
flood-watch/
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── reports.py
│   │   │   ├── incidents.py
│   │   │   ├── users.py
│   │   │   ├── alerts.py
│   │   │   ├── analytics.py
│   │   │   ├── webhooks.py
│   │   │   └── public_api.py
│   │   ├── services/      # Business logic
│   │   │   ├── user_service.py
│   │   │   ├── report_service.py
│   │   │   └── incident_service.py
│   │   ├── models/        # Database models
│   │   │   └── models.py
│   │   ├── bots/          # WhatsApp/Telegram handlers (TODO)
│   │   ├── ml/            # AI models (TODO)
│   │   ├── integrations/  # External APIs (TODO)
│   │   ├── config.py      # Configuration
│   │   ├── database.py    # DB setup
│   │   ├── auth.py        # Authentication
│   │   ├── schemas.py     # Pydantic schemas
│   │   └── main.py        # FastAPI app
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/              # React dashboard (TODO)
├── docker/                # Docker configs
├── docs/                  # Documentation (TODO)
├── docker-compose.yml
└── .env.example
```

---

## 🔧 Development

### Backend Development

```bash
# Local development without Docker
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload
```

### Database Migrations

```bash
# Generate migration
docker-compose exec backend alembic revision --autogenerate -m "Description"

# Apply migrations
docker-compose exec backend alembic upgrade head

# Rollback
docker-compose exec backend alembic downgrade -1
```

### Testing

```bash
# Run tests
docker-compose exec backend pytest

# With coverage
docker-compose exec backend pytest --cov=app --cov-report=html
```

---

## 📚 API Documentation

When the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register admin user
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user

#### Reports
- `POST /api/reports/` - Submit flood report
- `GET /api/reports/` - List reports (filtered)
- `GET /api/reports/pending` - Get pending reports
- `POST /api/reports/{id}/verify` - Verify report
- `POST /api/reports/{id}/reject` - Reject report

#### Incidents
- `GET /api/incidents/` - List incidents
- `GET /api/incidents/active` - Get active incidents
- `GET /api/incidents/map` - Get incidents for map view
- `POST /api/incidents/{id}/resolve` - Resolve incident

#### Analytics
- `GET /api/analytics/summary` - Dashboard summary
- `GET /api/analytics/reports-by-date` - Time series data
- `GET /api/analytics/severity-breakdown` - Severity statistics

---

## 🌍 External Services Setup

### WhatsApp Business API

1. Sign up for WhatsApp Business API (360Dialog recommended)
2. Get API key and phone number ID
3. Set webhook URL: `https://your-domain.com/api/webhooks/whatsapp`
4. Add to `.env`:
   ```
   WHATSAPP_API_KEY=your-key
   WHATSAPP_PHONE_NUMBER_ID=your-id
   ```

### Telegram Bot

1. Create bot via @BotFather on Telegram
2. Get bot token
3. Set webhook: `https://your-domain.com/api/webhooks/telegram`
4. Add to `.env`:
   ```
   TELEGRAM_BOT_TOKEN=your-token
   ```

### Weather API

1. Sign up at OpenWeatherMap
2. Get API key
3. Add to `.env`:
   ```
   OPENWEATHER_API_KEY=your-key
   ```

---

## 🧪 Testing the System

### 1. Create a Test User (via API)

```python
# This would normally happen via bot, but for testing:
import requests

# Create user
user_data = {
    "phone_number": "+254700000000",
    "platform": "whatsapp",
    "platform_id": "test123",
    "language_code": "en",
    "location": {"lat": -1.2921, "lon": 36.8219}
}
# Use admin token to create via backend
```

### 2. Submit a Test Report

```python
report_data = {
    "user_id": "user-uuid-from-above",
    "location": {"lat": -1.2921, "lon": 36.8219},
    "severity": "high",
    "description": "Water rising rapidly on Main Street",
    "water_depth_cm": 50
}
# POST to /api/reports/
```

### 3. Verify and Create Incident

```bash
# Admin verifies the report
POST /api/reports/{report_id}/verify

# System automatically creates incident if criteria met
```

---

## 🚢 Deployment

### Production Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `DEBUG=false` in `.env`
- [ ] Configure production database (AWS RDS recommended)
- [ ] Set up Redis cluster
- [ ] Configure S3 bucket for media storage
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS for production domain
- [ ] Set up monitoring (Sentry, Datadog)
- [ ] Configure log aggregation
- [ ] Set up automated backups
- [ ] Enable auto-scaling

### Deploy to AWS/GCP/Azure

```bash
# Build production images
docker build -t floodwatch-backend:latest -f backend/Dockerfile backend/

# Push to container registry
# Deploy to Kubernetes/ECS/GKE
```

---

## 📖 Documentation

- **[Supabase Setup Guide](docs/SUPABASE_SETUP.md)** - Complete setup instructions
- **[Supabase Features](docs/SUPABASE_FEATURES.md)** - Optional feature integration
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
- [API Documentation](http://localhost:8000/docs)
- [Database Schema](docs/DATABASE.md) (TODO)
- [Bot Integration Guide](docs/BOTS.md) (TODO)
- [Deployment Guide](docs/DEPLOYMENT.md) (TODO)

---

## 🤝 Contributing

This is a life-saving platform. Contributions are welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Python: Follow PEP 8
- Use type hints
- Write docstrings for all functions
- Minimum 80% test coverage
- All tests must pass

---

## 📝 License

MIT License - feel free to use this system to save lives worldwide.

---

## 🙏 Acknowledgments

Built with:
- [Supabase](https://supabase.com/) - PostgreSQL database with PostGIS, auth, storage, realtime
- [FastAPI](https://fastapi.tiangolo.com/) - Modern web framework
- [PostgreSQL](https://www.postgresql.org/) + [PostGIS](https://postgis.net/) - Spatial database
- [SQLAlchemy](https://www.sqlalchemy.org/) - ORM
- [Redis](https://redis.io/) - Caching
- [RabbitMQ](https://www.rabbitmq.com/) - Message queue

---

## 📧 Contact

For questions or support:
- **Email**: support@floodwatch.org
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/flood-watch/issues)

---

**🌊 Together, we can save lives through early flood warnings! 💙**
