"""
Agent Configuration

API keys, model constants, and prompt templates.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
APPS_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent
ENV_PATH = APPS_ROOT / ".env"
load_dotenv(ENV_PATH)

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY", "")

# Model Constants (STRICTLY these models only, no Pro)
GEMINI_MODEL = "gemini-3-flash-preview"
PERPLEXITY_MODEL = "sonar"

# Retry Configuration
MAX_RETRIES = 3
REQUEST_TIMEOUT = 60  # seconds

# Perplexity API endpoint
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"


def get_api_keys() -> dict[str, str]:
    """Return current API keys, reloading from .env if needed."""
    load_dotenv(ENV_PATH, override=True)
    return {
        "gemini": os.getenv("GEMINI_API_KEY", ""),
        "perplexity": os.getenv("PERPLEXITY_API_KEY", ""),
    }


def save_api_keys(gemini_key: str = "", perplexity_key: str = "") -> None:
    """Save API keys to .env file."""
    lines = []
    
    # Read existing .env if it exists
    if ENV_PATH.exists():
        with open(ENV_PATH, "r") as f:
            for line in f:
                # Skip existing API key lines
                if not line.startswith("GEMINI_API_KEY=") and not line.startswith("PERPLEXITY_API_KEY="):
                    lines.append(line.rstrip("\n"))
    
    # Add/update API keys
    if gemini_key:
        lines.append(f"GEMINI_API_KEY={gemini_key}")
    if perplexity_key:
        lines.append(f"PERPLEXITY_API_KEY={perplexity_key}")
    
    # Write back
    with open(ENV_PATH, "w") as f:
        f.write("\n".join(lines) + "\n")
    
    # Reload environment
    load_dotenv(ENV_PATH, override=True)


def has_valid_keys() -> dict[str, bool]:
    """Check if API keys are configured."""
    keys = get_api_keys()
    return {
        "gemini": bool(keys["gemini"] and keys["gemini"] != "your_gemini_api_key_here"),
        "perplexity": bool(keys["perplexity"] and keys["perplexity"] != "your_perplexity_api_key_here"),
    }
