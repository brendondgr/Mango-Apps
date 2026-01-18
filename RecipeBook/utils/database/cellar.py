"""
ShortSpork - cellar.py
Database Connection Manager

Provides thread-safe SQLite database connections for the Flask application.
"""

import os
import sqlite3
from contextlib import contextmanager


class Cellar:
    """
    Database connection manager for ShortSpork.
    Handles thread-safe SQLite connections.
    """
    
    # Default database path relative to project root
    DEFAULT_DB_PATH = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
        'data',
        'RecipeBook',
        'RecipeBook.db'
    )
    
    def __init__(self, db_path: str = None):
        """
        Initialize the Cellar with optional custom database path.
        
        Args:
            db_path: Path to SQLite database file. Defaults to data/cookbook.db
        """
        self.db_path = db_path or self.DEFAULT_DB_PATH
        self._ensure_data_directory()
    
    def _ensure_data_directory(self):
        """Create the data directory if it doesn't exist."""
        data_dir = os.path.dirname(self.db_path)
        if data_dir and not os.path.exists(data_dir):
            os.makedirs(data_dir)
    
    def get_db_connection(self) -> sqlite3.Connection:
        """
        Get a new database connection.
        
        Returns:
            sqlite3.Connection with Row factory for dict-like access
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        # Enable foreign key support
        conn.execute("PRAGMA foreign_keys = ON")
        return conn
    
    @contextmanager
    def get_connection(self):
        """
        Context manager for database connections.
        Automatically commits on success and rolls back on error.
        
        Usage:
            with cellar.get_connection() as conn:
                cursor = conn.execute("SELECT * FROM recipes")
        """
        conn = self.get_db_connection()
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()


# Global instance for convenience
_cellar = None


def get_cellar() -> Cellar:
    """Get or create the global Cellar instance."""
    global _cellar
    if _cellar is None:
        _cellar = Cellar()
    return _cellar
