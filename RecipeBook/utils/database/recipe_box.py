"""
ShortSpork - recipe_box.py
Database Schema Initialization

Defines and creates all database tables for recipes, ingredients, and steps.
"""

from .cellar import get_cellar


# SQL Schema Definitions
SCHEMA_RECIPES = """
CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    servings INTEGER DEFAULT 4,
    cuisine_region TEXT,
    meal_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

SCHEMA_INGREDIENTS = """
CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'Other'
);
"""

SCHEMA_RECIPE_INGREDIENTS = """
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    quantity REAL,
    unit TEXT,
    is_optional INTEGER DEFAULT 0,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);
"""

SCHEMA_STEPS = """
CREATE TABLE IF NOT EXISTS steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    step_number INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
"""

SCHEMA_RECIPE_IMAGES = """
CREATE TABLE IF NOT EXISTS recipe_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
"""

# Index for faster lookups
INDEX_RECIPE_INGREDIENTS = """
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe 
ON recipe_ingredients(recipe_id);
"""

INDEX_STEPS = """
CREATE INDEX IF NOT EXISTS idx_steps_recipe 
ON steps(recipe_id);
"""

INDEX_RECIPE_IMAGES = """
CREATE INDEX IF NOT EXISTS idx_recipe_images_recipe 
ON recipe_images(recipe_id);
"""


def init_db():
    """
    Initialize the database with all required tables.
    Safe to call multiple times - uses CREATE TABLE IF NOT EXISTS.
    """
    cellar = get_cellar()
    
    with cellar.get_connection() as conn:
        # Create tables
        conn.execute(SCHEMA_RECIPES)
        conn.execute(SCHEMA_INGREDIENTS)
        conn.execute(SCHEMA_RECIPE_INGREDIENTS)
        conn.execute(SCHEMA_STEPS)
        conn.execute(SCHEMA_RECIPE_IMAGES)
        
        # Create indexes
        conn.execute(INDEX_RECIPE_INGREDIENTS)
        conn.execute(INDEX_STEPS)
        conn.execute(INDEX_RECIPE_IMAGES)
        
        # Migrate existing images
        migrate_images(conn)
    
    print(f"Database initialized at: {cellar.db_path}")


def migrate_images(conn):
    """
    Migrates existing image_url from recipes table to recipe_images table.
    """
    # Check if we need to migrate
    cursor = conn.execute("SELECT id, image_url FROM recipes WHERE image_url IS NOT NULL AND image_url != ''")
    recipes = cursor.fetchall()
    
    for recipe in recipes:
        recipe_id = recipe['id']
        image_url = recipe['image_url']
        
        # Check if already in recipe_images
        existing = conn.execute(
            "SELECT 1 FROM recipe_images WHERE recipe_id = ? AND image_url = ?",
            (recipe_id, image_url)
        ).fetchone()
        
        if not existing:
            conn.execute(
                "INSERT INTO recipe_images (recipe_id, image_url, display_order) VALUES (?, ?, 0)",
                (recipe_id, image_url)
            )
            print(f"Migrated image for recipe {recipe_id}")


def seed_sample_data():
    """
    Populate database with sample recipes and ingredients for testing.
    """
    cellar = get_cellar()
    
    # Sample ingredients by category (7 categories)
    ingredients = [
        # Produce - Fresh fruits, vegetables, herbs
        ("Tomato", "Produce"),
        ("Onion", "Produce"),
        ("Garlic", "Produce"),
        ("Bell Pepper", "Produce"),
        ("Lettuce", "Produce"),
        ("Carrot", "Produce"),
        ("Lemon", "Produce"),
        ("Basil", "Produce"),
        ("Spinach", "Produce"),
        ("Avocado", "Produce"),
        # Dairy & Eggs - Milk, butter, yogurt, cheeses, eggs
        ("Butter", "Dairy & Eggs"),
        ("Milk", "Dairy & Eggs"),
        ("Cheddar Cheese", "Dairy & Eggs"),
        ("Parmesan Cheese", "Dairy & Eggs"),
        ("Heavy Cream", "Dairy & Eggs"),
        ("Eggs", "Dairy & Eggs"),
        # Proteins - Meat, poultry, seafood, tofu
        ("Chicken Breast", "Proteins"),
        ("Ground Beef", "Proteins"),
        ("Salmon", "Proteins"),
        ("Shrimp", "Proteins"),
        ("Bacon", "Proteins"),
        # Pantry / Dry Goods - Flour, sugar, rice, pasta, oils, vinegars
        ("Olive Oil", "Pantry / Dry Goods"),
        ("Pasta", "Pantry / Dry Goods"),
        ("Rice", "Pantry / Dry Goods"),
        ("Flour", "Pantry / Dry Goods"),
        ("Sugar", "Pantry / Dry Goods"),
        # Canned / Jarred - Beans, tomato sauce, olives, stocks
        ("Chicken Broth", "Canned / Jarred"),
        ("Soy Sauce", "Canned / Jarred"),
        # Spices & Baking - Salt, pepper, baking powder, dried herbs
        ("Salt", "Spices & Baking"),
        ("Black Pepper", "Spices & Baking"),
    ]
    
    # Sample recipes with placeholder images
    recipes = [
        {
            "title": "Classic Spaghetti Carbonara",
            "description": "A creamy Italian pasta dish with bacon and parmesan",
            "image_url": "https://placehold.co/400x250/FF6B6B/FFF?text=Carbonara",
            "servings": 4,
            "cuisine_region": "Italian",
            "meal_type": "Dinner",
            "ingredients": [
                ("Pasta", 400, "g", False),
                ("Bacon", 200, "g", False),
                ("Eggs", 4, "large", False),
                ("Parmesan Cheese", 100, "g", False),
                ("Black Pepper", 1, "tsp", False),
                ("Garlic", 2, "cloves", True),
            ],
            "steps": [
                "Boil pasta in salted water according to package directions.",
                "Cook bacon in a large skillet until crispy, then set aside.",
                "Whisk eggs and parmesan in a bowl.",
                "Drain pasta, reserving 1 cup of pasta water.",
                "Toss hot pasta with bacon, then remove from heat.",
                "Add egg mixture, tossing quickly to create creamy sauce.",
                "Add pasta water if needed. Season with pepper and serve."
            ]
        },
        {
            "title": "Garlic Butter Salmon",
            "description": "Pan-seared salmon with a rich garlic butter sauce",
            "image_url": "https://placehold.co/400x250/4ECDC4/FFF?text=Salmon",
            "servings": 2,
            "cuisine_region": "American",
            "meal_type": "Dinner",
            "ingredients": [
                ("Salmon", 2, "fillets", False),
                ("Butter", 3, "tbsp", False),
                ("Garlic", 4, "cloves", False),
                ("Lemon", 1, "whole", False),
                ("Salt", 1, "tsp", False),
                ("Black Pepper", 0.5, "tsp", False),
            ],
            "steps": [
                "Season salmon with salt and pepper.",
                "Heat butter in a skillet over medium-high heat.",
                "Sear salmon skin-side up for 4 minutes.",
                "Flip and cook 3 more minutes.",
                "Add minced garlic, cook 30 seconds.",
                "Squeeze lemon over salmon and serve."
            ]
        },
        {
            "title": "Fresh Garden Salad",
            "description": "A light and refreshing salad with seasonal vegetables",
            "image_url": "https://placehold.co/400x250/95E1D3/333?text=Salad",
            "servings": 2,
            "cuisine_region": "Mediterranean",
            "meal_type": "Lunch",
            "ingredients": [
                ("Lettuce", 1, "head", False),
                ("Tomato", 2, "medium", False),
                ("Carrot", 1, "large", False),
                ("Avocado", 1, "whole", False),
                ("Olive Oil", 3, "tbsp", False),
                ("Lemon", 1, "whole", False),
                ("Salt", 0.5, "tsp", False),
            ],
            "steps": [
                "Wash and chop lettuce into bite-sized pieces.",
                "Dice tomatoes and slice carrots thinly.",
                "Slice avocado.",
                "Combine all vegetables in a large bowl.",
                "Whisk olive oil with lemon juice and salt.",
                "Drizzle dressing over salad and toss gently."
            ]
        },
        {
            "title": "Creamy Tomato Basil Soup",
            "description": "A comforting soup with fresh tomatoes and aromatic basil",
            "image_url": "https://placehold.co/400x250/E74C3C/FFF?text=Soup",
            "servings": 6,
            "cuisine_region": "Italian",
            "meal_type": "Lunch",
            "ingredients": [
                ("Tomato", 6, "large", False),
                ("Onion", 1, "medium", False),
                ("Garlic", 3, "cloves", False),
                ("Basil", 1, "cup", False),
                ("Heavy Cream", 0.5, "cup", False),
                ("Chicken Broth", 2, "cups", False),
                ("Olive Oil", 2, "tbsp", False),
                ("Salt", 1, "tsp", False),
            ],
            "steps": [
                "Dice tomatoes and onion, mince garlic.",
                "Heat olive oil in a pot over medium heat.",
                "Sauté onion until soft, about 5 minutes.",
                "Add garlic and cook 1 minute.",
                "Add tomatoes and broth, simmer 20 minutes.",
                "Blend soup until smooth.",
                "Stir in cream and chopped basil.",
                "Season with salt and serve warm."
            ]
        },
        {
            "title": "Stir-Fry Vegetables with Rice",
            "description": "Quick and healthy Asian-inspired stir-fry",
            "image_url": "https://placehold.co/400x250/9B59B6/FFF?text=Stir-Fry",
            "servings": 4,
            "cuisine_region": "Asian",
            "meal_type": "Dinner",
            "ingredients": [
                ("Rice", 2, "cups", False),
                ("Bell Pepper", 2, "medium", False),
                ("Carrot", 2, "large", False),
                ("Onion", 1, "medium", False),
                ("Garlic", 3, "cloves", False),
                ("Soy Sauce", 3, "tbsp", False),
                ("Olive Oil", 2, "tbsp", False),
            ],
            "steps": [
                "Cook rice according to package directions.",
                "Slice bell peppers, carrots, and onion.",
                "Heat oil in a wok over high heat.",
                "Stir-fry vegetables 5-7 minutes until tender-crisp.",
                "Add minced garlic and soy sauce.",
                "Toss well and serve over rice."
            ]
        },
    ]
    
    with cellar.get_connection() as conn:
        # Insert ingredients
        for name, category in ingredients:
            conn.execute(
                "INSERT OR IGNORE INTO ingredients (name, category) VALUES (?, ?)",
                (name, category)
            )
        
        # Insert recipes with their ingredients and steps
        for recipe in recipes:
            cursor = conn.execute(
                """INSERT INTO recipes (title, description, image_url, servings, cuisine_region, meal_type)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (recipe["title"], recipe["description"], recipe["image_url"],
                 recipe["servings"], recipe["cuisine_region"], recipe["meal_type"])
            )
            recipe_id = cursor.lastrowid
            
            # Insert recipe ingredients
            for ing_name, qty, unit, is_optional in recipe["ingredients"]:
                # Get ingredient ID
                ing_row = conn.execute(
                    "SELECT id FROM ingredients WHERE name = ?", (ing_name,)
                ).fetchone()
                if ing_row:
                    conn.execute(
                        """INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, is_optional)
                           VALUES (?, ?, ?, ?, ?)""",
                        (recipe_id, ing_row["id"], qty, unit, 1 if is_optional else 0)
                    )
            
            # Insert steps
            for step_num, instruction in enumerate(recipe["steps"], 1):
                conn.execute(
                    "INSERT INTO steps (recipe_id, step_number, instruction) VALUES (?, ?, ?)",
                    (recipe_id, step_num, instruction)
                )
    
    print("Sample data seeded successfully!")


if __name__ == "__main__":
    init_db()
    seed_sample_data()
