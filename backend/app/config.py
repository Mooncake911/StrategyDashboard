from urllib.parse import urlparse

from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/strategy.db"
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:8000",
    ]
    APP_TITLE: str = "StrategyDashboard API"
    APP_VERSION: str = "2.0.0"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()

# Автоисправление схемы: postgresql:// → postgresql+asyncpg:// (Neon отдаёт без +asyncpg)
# + удаление параметров, несовместимых с asyncpg на Vercel
if settings.DATABASE_URL.startswith("postgresql://"):
    raw = settings.DATABASE_URL
    # замена схемы
    raw = raw.replace("postgresql://", "postgresql+asyncpg://", 1)
    # удаляем все query-параметры (старые asyncpg не поддерживают sslmode, channel_binding и т.д.)
    parsed = urlparse(raw)
    if parsed.query:
        raw = raw.replace(f"?{parsed.query}", "")
    settings.DATABASE_URL = raw

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
