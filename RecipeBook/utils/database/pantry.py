"""
ShortSpork - pantry.py
Ingredient Query Functions

Functions for retrieving and organizing ingredient data.
"""

from .cellar import get_cellar


# Define category display order
CATEGORY_ORDER = [
    'Produce', 'Dairy & Eggs', 'Pantry / Dry Goods', 
    'Canned / Jarred', 'Proteins', 'Spices & Baking', 'Other'
]


def get_ingredients_by_category() -> dict:
    """
    Get all ingredients grouped by category.
    
    Returns:
        Dictionary with category names as keys and lists of ingredient dicts as values.
        Categories are ordered according to CATEGORY_ORDER.
        Example: {"Produce": [{"id": 1, "name": "Tomato"}, ...], "Dairy & Eggs": [...]}
    """
    cellar = get_cellar()
    
    with cellar.get_connection() as conn:
        cursor = conn.execute(
            "SELECT id, name, category FROM ingredients ORDER BY category, name"
        )
        rows = cursor.fetchall()
    
    # Group by category
    categories = {}
    for row in rows:
        category = row["category"]
        if category not in categories:
            categories[category] = []
        categories[category].append({
            "id": row["id"],
            "name": row["name"]
        })
    
    # Sort by custom order
    ordered = {}
    for cat in CATEGORY_ORDER:
        if cat in categories:
            ordered[cat] = categories[cat]
    # Add any categories not in CATEGORY_ORDER at the end
    for cat in categories:
        if cat not in ordered:
            ordered[cat] = categories[cat]
    
    return ordered


def get_all_ingredients() -> list:
    """
    Get all ingredients as a flat list.
    
    Returns:
        List of ingredient dictionaries with id, name, category.
    """
    cellar = get_cellar()
    
    with cellar.get_connection() as conn:
        cursor = conn.execute(
            "SELECT id, name, category FROM ingredients ORDER BY name"
        )
        return [dict(row) for row in cursor.fetchall()]


def search_ingredients(query: str, limit: int = 10) -> list:
    """
    Search ingredients by name pattern.
    
    Args:
        query (str): Search term
        limit (int): Max number of results
        
    Returns:
        List of ingredient dicts
    """
    if not query:
        return []
        
    cellar = get_cellar()
    term = f"%{query}%"
    
    with cellar.get_connection() as conn:
        cursor = conn.execute(
            """
            SELECT id, name, category 
            FROM ingredients 
            WHERE name LIKE ? 
            ORDER BY 
                CASE WHEN name LIKE ? THEN 0 ELSE 1 END,
                name
            LIMIT ?
            """,
            (term, f"{query}%", limit)
        )
        return [dict(row) for row in cursor.fetchall()]
