from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import sentry_sdk
from app.config import get_settings
from app.database import engine, Base, init_db

# Import routers (will create these next)
from app.api import auth, reports, incidents, users, alerts, analytics, webhooks, public_api, bots

settings = get_settings()

# Initialize Sentry for error tracking (only if configured)
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=0.1,
        profiles_sample_rate=0.1,
    )

# Rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

# Create FastAPI app
app = FastAPI(
    title="Flood Watch API",
    description="""
## 🌊 Flood Watch - Community Flood Monitoring & Early Warning System

A production-ready API for real-time flood reporting, verification, and alerting.

### Key Features

* **Citizen Reporting**: WhatsApp & Telegram bot integration for easy flood reporting
* **AI Verification**: Multi-layer verification (AI + Weather + Community + Duplicates)
* **Automated Alerts**: Geofenced alert delivery via WhatsApp, Telegram, and SMS
* **Real-time Dashboard**: Admin interface with live incident map and analytics
* **Multi-language**: Support for English, Swahili, and extensible to 8+ languages

### Architecture

* **Backend**: FastAPI (Python 3.11+)
* **Database**: PostgreSQL with PostGIS for spatial queries
* **Caching**: Redis
* **Message Queue**: RabbitMQ
* **AI/ML**: EfficientNetB0 for flood detection
* **Maps**: Leaflet with OpenStreetMap

### Authentication

Most endpoints require JWT authentication. Use `/api/auth/login` to obtain a token.

```python
# Login
response = requests.post('/api/auth/login', data={
    'username': 'admin',
    'password': 'your_password'
})
token = response.json()['access_token']

# Use token
headers = {'Authorization': f'Bearer {token}'}
requests.get('/api/reports/', headers=headers)
```

### Rate Limiting

* Default: 100 requests/minute
* Auth endpoints: 10 requests/minute  
* Webhooks: 1000 requests/minute

### Support

* **Documentation**: See `/docs` (this page) or `/redoc`
* **Health Check**: `/health`
* **API Version**: v1.0.0
    """,
    version="1.0.0",
    contact={
        "name": "Flood Watch Team",
        "email": "support@floodwatch.org",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_tags=[
        {
            "name": "Authentication",
            "description": "Admin authentication and user management"
        },
        {
            "name": "Reports",
            "description": "Flood report submission and verification"
        },
        {
            "name": "Incidents",
            "description": "Flood incident management and tracking"
        },
        {
            "name": "Alerts",
            "description": "Alert generation and delivery management"
        },
        {
            "name": "Users",
            "description": "Citizen user management"
        },
        {
            "name": "Analytics",
            "description": "Statistics and trend analysis"
        },
        {
            "name": "Webhooks",
            "description": "WhatsApp and Telegram webhook endpoints"
        },
        {
            "name": "Public",
            "description": "Public API endpoints (no authentication)"
        },
    ]
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware (security) - Disabled for development
# if settings.ENVIRONMENT == "production":
#     app.add_middleware(
#         TrustedHostMiddleware,
#         allowed_hosts=["*.floodwatch.org", "floodwatch.org"]
#     )


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")


@app.get("/")
@limiter.limit("10/minute")
async def root(request: Request):
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "redis": "connected",
        "rabbitmq": "connected"
    }


# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(incidents.router, prefix="/api/incidents", tags=["Incidents"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])
app.include_router(bots.router, prefix="/api/bots", tags=["Bots"])
app.include_router(public_api.router, prefix="/api/public", tags=["Public API"])


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    if settings.DEBUG:
        raise exc
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "type": "server_error"
        }
    )
