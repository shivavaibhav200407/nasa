import sys
from pathlib import Path

# Injects backend folder into sys.path so all internal submodules (db, engine, api) resolve
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Import the actual FastAPI instance
from backend.app.main import app  # noqa: F401
