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
if settings.DATABASE_URL.startswith("postgresql://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
