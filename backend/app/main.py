from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from fastapi.responses import Response
from sqlalchemy import text as sa_text
from app.config import settings
from app.database import engine, async_session
from app.models import Base
from app.routers import auth, users, groups, initiatives, contacts, analytics, import_export

limiter = Limiter(key_func=get_remote_address, default_limits=[])

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "0"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "font-src 'self'; "
            "connect-src 'self'"
        )
        return response

class MaxBodySizeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        content_length = request.headers.get("content-length")
        max_size = settings.MAX_UPLOAD_SIZE
        if content_length and int(content_length) > max_size:
            return JSONResponse(
                status_code=413,
                content={"detail": f"Request body too large. Max {max_size // (1024*1024)} MB."},
            )
        return await call_next(request)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        migrations = [
            "ALTER TABLE contacts ADD COLUMN IF NOT EXISTS group_id INTEGER REFERENCES groups(id)",
            "ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS group_id INTEGER REFERENCES groups(id)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) DEFAULT ''",
        ]
        for stmt in migrations:
            await conn.execute(sa_text(stmt))
    yield
    await engine.dispose()


app = FastAPI(title=settings.APP_TITLE, version=settings.APP_VERSION, lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(MaxBodySizeMiddleware)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(groups.router)
app.include_router(initiatives.router)
app.include_router(contacts.router)
app.include_router(analytics.router)
app.include_router(import_export.router)

def _apply_login_rate_limit(routes):
    for r in routes:
        if hasattr(r, "original_router"):
            _apply_login_rate_limit(r.original_router.routes)
        if getattr(r, "path", "") == "/login" and "POST" in r.methods:
            r.endpoint = limiter.limit("5/minute")(r.endpoint)

_apply_login_rate_limit(app.routes)


@app.get("/api/health")
async def health():
    try:
        async with async_session() as session:
            await session.execute(sa_text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False
    return {"status": "ok" if db_ok else "degraded", "database": "connected" if db_ok else "unreachable"}
