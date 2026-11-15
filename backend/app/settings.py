"""ASTRA Backend Configuration Settings.

Reads configuration from environment variables with sensible local defaults.
"""

import os
from typing import List


class Settings:
    # SQLite Database URL or path.
    # Note: On Render deployment, persistent disk or external DB is needed.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./astra.db")

    # Allowed CORS Origins (comma-separated or wildcard in local dev)
    CORS_ORIGINS_RAW: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,https://nasa-teal-psi.vercel.app",
    )

    @property
    def cors_origins(self) -> List[str]:
        if self.CORS_ORIGINS_RAW.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS_RAW.split(",") if origin.strip()]

    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))


settings = Settings()
