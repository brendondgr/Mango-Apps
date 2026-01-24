import os
from pathlib import Path
from dotenv import load_dotenv

# Get the apps root directory (apps/ProjectManager -> apps)
APPS_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(APPS_ROOT / '.env')
DATA_DIR = APPS_ROOT / 'data' / 'ProjectManager'
DB_PATH = DATA_DIR / 'projectmanager.db'

# Ensure the data directory exists
DATA_DIR.mkdir(parents=True, exist_ok=True)

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess-octopus-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f'sqlite:///{DB_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
