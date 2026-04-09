from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = f"sqlite:///{Path(__file__).resolve().parent.parent / 'data' / 'maintenance.db'}"
    debug: bool = False

    model_config = {"env_prefix": "APP_"}


settings = Settings()
