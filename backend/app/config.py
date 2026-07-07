from urllib.parse import urlparse

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from pathlib import Path


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/strategy.db"
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:8000",
    ]
    APP_TITLE: str = "StrategyDashboard API"
    APP_VERSION: str = "2.0.0"
    SECRET: str = "supersecret-strategydashboard-jwt-key-2026"

    model_config = SettingsConfigDict(env_file=".env")

    @model_validator(mode="after")
    def resolve_database_url(self) -> "Settings":
        raw = self.DATABASE_URL

        # Neon отдаёт postgresql:// без +asyncpg — добавляем
        if raw.startswith("postgresql://"):
            raw = raw.replace("postgresql://", "postgresql+asyncpg://", 1)
            parsed = urlparse(raw)
            if parsed.query:
                raw = raw.replace(f"?{parsed.query}", "")

        # SQLite относительный путь → резолвим относительно backend/
        elif raw.startswith("sqlite"):
            prefix = "sqlite+aiosqlite:///"
            path_part = raw[len(prefix):]
            url_path = Path(path_part)
            if not url_path.is_absolute():
                url_path = (BASE_DIR / path_part).resolve()
                raw = f"{prefix}{url_path.as_posix()}"

        self.DATABASE_URL = raw
        return self


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

settings = Settings()
