"""
Application configuration.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ==========================
    # Application
    # ==========================
    APP_NAME: str
    APP_VERSION: str
    API_PREFIX: str
    DEBUG: bool

    # ==========================
    # Database
    # ==========================
    DATABASE_HOST: str
    DATABASE_PORT: int
    DATABASE_NAME: str
    DATABASE_USER: str
    DATABASE_PASSWORD: str
    DATABASE_URL: str

    # ==========================
    # JWT
    # ==========================
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # ==========================
    # Email (SMTP)
    # ==========================
    MAIL_SERVER: str
    MAIL_PORT: int
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_STARTTLS: bool
    MAIL_SSL_TLS: bool

    # ==========================
    # Supabase Storage
    # ==========================
    SUPABASE_URL: str
    SUPABASE_SECRET_KEY: str
    SUPABASE_BUCKET: str

    # ==========================
    # Google OAuth
    # ==========================
    GOOGLE_CLIENT_ID: str

    # ==========================
    # Pydantic Settings
    # ==========================
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()