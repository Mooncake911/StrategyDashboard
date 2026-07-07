from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse


class Settings(BaseSettings):
    DATABASE_URL: str = ""
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:8000",
    ]
    APP_TITLE: str = "StrategyDashboard API"
    APP_VERSION: str = "2.0.0"
    SECRET: str = ""
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @model_validator(mode="after")
    def validate_settings(self) -> "Settings":
        if not self.SECRET:
            raise ValueError("SECRET must be set in .env")
        if len(self.SECRET) < 32:
            raise ValueError("SECRET must be at least 32 characters long")

        raw = self.DATABASE_URL
        if not raw:
            raise ValueError("DATABASE_URL must be set in .env")

        if raw.startswith("postgresql://"):
            raw = raw.replace("postgresql://", "postgresql+asyncpg://", 1)
            parsed = urlparse(raw)
            if parsed.query:
                params = parse_qs(parsed.query, keep_blank_values=True)
                if "sslmode" in params:
                    params["ssl"] = params.pop("sslmode")
                params.pop("channel_binding", None)
                new_query = urlencode(params, doseq=True)
                raw = urlunparse((
                    parsed.scheme,
                    parsed.netloc,
                    parsed.path,
                    parsed.params,
                    new_query,
                    parsed.fragment,
                ))

        self.DATABASE_URL = raw

        if not self.CORS_ORIGINS:
            raise ValueError("CORS_ORIGINS must be set")

        return self


settings = Settings()
