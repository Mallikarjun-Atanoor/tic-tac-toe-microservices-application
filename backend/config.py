import os


def get_env(name: str, default: str | None = None, required: bool = False) -> str:
    value = os.getenv(name, default)

    if required and (value is None or value.strip() == ""):
        raise ValueError(f"Missing required environment variable: {name}")

    return value


class Settings:
    # -------- Database (strict) --------
    DB_USER: str = get_env("DB_USER", required=True)
    DB_PASS: str = get_env("DB_PASS", required=True)
    DB_HOST: str = get_env("DB_HOST", required=True)
    DB_PORT: int = int(get_env("DB_PORT", "5432"))
    DB_NAME: str = get_env("DB_NAME", required=True)

    # -------- App --------
    APP_ENV: str = get_env("APP_ENV", "prod")
    LOG_LEVEL: str = get_env("LOG_LEVEL", "INFO").upper()

    # -------- Derived (single source of truth) --------
    DATABASE_URL: str = (
        f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )


settings = Settings()