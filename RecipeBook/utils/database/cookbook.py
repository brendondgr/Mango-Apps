"""
ShortSpork - cookbook.py
Recipe Query Functions

Functions for retrieving recipes with filtering and match percentage calculations.
"""

from .cellar import get_cellar
import requests
import os
import uuid
from flask import current_app


def get_all_recipes() -> list:
    """
    Get all recipes without filtering.
    
    Returns:
        List of recipe dictionaries.
    """
    cellar = get_cellar()
    
    with cellar.get_connection() as conn:
        cursor = conn.execute("""
            SELECT r.id, r.title, r.description, r.image_url, r.servings, r.cuisine_region, r.meal_type,
                   (SELECT group_concat(image_url, '|') FROM recipe_images ri WHERE ri.recipe_id = r.id ORDER BY display_order) as all_images
            FROM recipes r
            ORDER BY r.title
        """)
        results = []
        for row in cursor.fetchall():
            d = dict(row)
            d['images'] = d['all_images'].split('|') if d['all_images'] else ([d['image_url']] if d['image_url'] else [])
            # Removing internal field if desired, but fine to keep or ignore
            del d['all_images']
            results.append(d)
        return results


def get_distinct_meal_types() -> list:
    """
    Get all distinct meal_type values from recipes.
    Handles comma-separated values by splitting and deduplicating.
    
    Returns:
        List of dicts: [{"value": "Dinner", "count": 5}, ...]
    """
    cellar = get_cellar()
    
    with cellar.get_connection() as conn:
        cursor = conn.execute("SELECT meal_type FROM recipes WHERE meal_type IS NOT NULL AND meal_type != ''")
        rows = cursor.fetchall()
    
    # Count occurrences of each unique value
    value_counts = {}
    for row in rows:
        raw_value = row['meal_type']
        # Split comma-separated values
        values = [v.strip() for v in raw_value.split(',') if v.strip()]
        for val in values:
            value_counts[val] = value_counts.get(val, 0) + 1
    
    # Sort alphabetically and return
    return [{"value": k, "count": v} for k, v in sorted(value_counts.items())]


def get_distinct_cuisine_regions() -> list:
    """
    Get all distinct cuisine_region values from recipes.
    Handles comma-separated values by splitting and deduplicating.
    
    Returns:
        List of dicts: [{"value": "Italian", "count": 3}, ...]
    """
    cellar = get_cellar()
    
    with cellar.get_connection() as conn:
        cursor = conn.execute("SELECT cuisine_region FROM recipes WHERE cuisine_region IS NOT NULL AND cuisine_region != ''")
        rows = cursor.fetchall()
    
    # Count occurrences of each unique value
    value_counts = {}
    for row in rows:
        raw_value = row['cuisine_region']
        # Split comma-separated values
        values = [v.strip() for v in raw_value.split(',') if v.strip()]
        for val in values:
            value_counts[val] = value_counts.get(val, 0) + 1
    
    # Sort alphabetically and return
    return [{"value": k, "count": v} for k, v in sorted(value_counts.items())]


def get_recipes_with_pantry_comparison(pantry_ids: list, meal_types: list = None, cuisine_regions: list = None) -> list:
    """
    Get recipes filtered and ordered by ingredient match percentage.
    
    Args:
        pantry_ids: List of ingredient IDs the user has selected (their 'pantry')
        meal_types: Optional list of meal types to filter by (inclusive OR)
        cuisine_regions: Optional list of cuisine regions to filter by (inclusive OR)
    
    Returns:
        List of recipe dictionaries with match information:
        - All standard recipe fields
        - match_percentage (float, 0-100) - when filtering is active
        - total_ingredients (int) - count of required ingredients
        - matched_ingredients (int) - count of matched ingredients
    
    Logic:
        - If no filters are active, returns all recipes
        - Meal types and cuisine regions use inclusive (OR) matching within category
        - Different filter categories combine with AND logic
        - Match % = (matched ingredients / total required ingredients) × 100
        - Results ordered by match percentage (desc), then title
    """
    cellar = get_cellar()
    
    # Normalize filter inputs
    pantry_ids = pantry_ids or []
    meal_types = meal_types or []
    cuisine_regions = cuisine_regions or []
    
    # If no filters at all, return all recipes
    if not pantry_ids and not meal_types and not cuisine_regions:
        return get_all_recipes()
    
    with cellar.get_connection() as conn:
        # Build WHERE clause conditions for primary filters
        where_conditions = []
        params = []
        
        # Meal type filter (inclusive - match ANY selected)
        if meal_types:
            meal_conditions = []
            for mt in meal_types:
                meal_conditions.append("r.meal_type LIKE ?")
                params.append(f"%{mt}%")
            where_conditions.append("(" + " OR ".join(meal_conditions) + ")")
        
        # Cuisine region filter (inclusive - match ANY selected)
        if cuisine_regions:
            cuisine_conditions = []
            for cr in cuisine_regions:
                cuisine_conditions.append("r.cuisine_region LIKE ?")
                params.append(f"%{cr}%")
            where_conditions.append("(" + " OR ".join(cuisine_conditions) + ")")
        
        # Build WHERE clause
        where_clause = ""
        if where_conditions:
            where_clause = "WHERE " + " AND ".join(where_conditions)
        
        # Build ingredient matching subquery
        if pantry_ids:
            ingredient_placeholders = ",".join("?" * len(pantry_ids))
            matched_subquery = f"""
                (
                    SELECT COUNT(*) 
                    FROM recipe_ingredients ri 
                    WHERE ri.recipe_id = r.id 
                      AND ri.is_optional = 0 
                      AND ri.ingredient_id IN ({ingredient_placeholders})
                ) as matched_ingredients
            """
            params.extend(pantry_ids)
        else:
            matched_subquery = "0 as matched_ingredients"
        
        query = f"""
            SELECT 
                r.id,
                r.title,
                r.description,
                r.image_url,
                r.servings,
                r.cuisine_region,
                r.meal_type,
                (
                    SELECT COUNT(*) 
                    FROM recipe_ingredients ri 
                    WHERE ri.recipe_id = r.id AND ri.is_optional = 0
                ) as total_ingredients,
                {matched_subquery},
                (
                    SELECT group_concat(image_url, '|') 
                    FROM recipe_images ri 
                    WHERE ri.recipe_id = r.id 
                    ORDER BY display_order
                ) as all_images
            FROM recipes r
            {where_clause}
            ORDER BY 
                CAST(matched_ingredients AS FLOAT) / NULLIF(total_ingredients, 0) DESC,
                r.title
        """
        
        cursor = conn.execute(query, params)
        rows = cursor.fetchall()
    
    # Build result list with match percentage
    results = []
    for row in rows:
        recipe = dict(row)
        total = recipe["total_ingredients"]
        matched = recipe["matched_ingredients"]
        
        # Calculate match percentage (only show if ingredient filter is active)
        if pantry_ids and total > 0:
            recipe["match_percentage"] = round((matched / total) * 100, 1)
        else:
            recipe["match_percentage"] = None  # Don't show match badge if no ingredients selected
        
        # Images list
        recipe['images'] = recipe['all_images'].split('|') if recipe['all_images'] else ([recipe['image_url']] if recipe['image_url'] else [])
        del recipe['all_images']
        
        results.append(recipe)
    
    return results


def get_recipe_by_id(recipe_id: int) -> dict:
    """
    Get a single recipe with all its details.
    
    Args:
        recipe_id: The recipe ID
    
    Returns:
        Recipe dictionary with ingredients and steps, or None if not found.
    """
    cellar = get_cellar()
    
    with cellar.get_connection() as conn:
        # Get recipe
        recipe_row = conn.execute(
            "SELECT * FROM recipes WHERE id = ?", (recipe_id,)
        ).fetchone()
        
        if not recipe_row:
            return None
        
        recipe = dict(recipe_row)
        
        # Get images
        images_cursor = conn.execute("""
            SELECT image_url
            FROM recipe_images
            WHERE recipe_id = ?
            ORDER BY display_order
        """, (recipe_id,))
        recipe["images"] = [row["image_url"] for row in images_cursor.fetchall()]
        
        # Backward compatibility if no images in table (shouldn't happen after migrate but safe)
        if not recipe["images"] and recipe.get("image_url"):
            recipe["images"] = [recipe["image_url"]]
            
        # Get ingredients
        ing_cursor = conn.execute("""
            SELECT i.id, i.name, ri.quantity, ri.unit, ri.is_optional
            FROM recipe_ingredients ri
            JOIN ingredients i ON ri.ingredient_id = i.id
            WHERE ri.recipe_id = ?
            ORDER BY ri.id
        """, (recipe_id,))
        recipe["ingredients"] = [dict(row) for row in ing_cursor.fetchall()]
        
        # Get steps
        steps_cursor = conn.execute("""
            SELECT step_number, instruction
            FROM steps
            WHERE recipe_id = ?
            ORDER BY step_number
        """, (recipe_id,))
        recipe["steps"] = [dict(row) for row in steps_cursor.fetchall()]
    
    return recipe


def _process_image_url(url):
    """
    Downloads an image if it's a URL, returns the local path or original URL.
    """
    if not url or not url.startswith('http'):
        return url
        
    try:
        # Create filename
        ext = os.path.splitext(url)[1].split('?')[0] or '.jpg'
        if ext.lower() not in ['.jpg', '.jpeg', '.png', '.webp', '.gif']:
            ext = '.jpg'
        
        filename = f"{uuid.uuid4()}{ext}"
        
        # Paths
        relative_path = f"images/recipes/{filename}"
        full_path = os.path.join(current_app.static_folder, 'images', 'recipes', filename)
        
        # Download
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, 'wb') as f:
                f.write(response.content)
            # Update to local path
            return f"/static/{relative_path}"
    except Exception as e:
        print(f"Failed to download image {url}: {e}")
    
    return url


def save_new_recipe(data: dict) -> int:
    """
    Saves a new recipe to the database with atomic transaction.
    """
    cellar = get_cellar()
    
    # Validation
    if not data.get('title') or not data.get('ingredients') or not data.get('steps'):
        raise ValueError("Missing required recipe fields")
    
    # Handle Images
    # Support both single 'image_url' (old) and 'image_urls' list (new)
    image_list = data.get('image_urls', [])
    if not image_list and data.get('image_url'):
        image_list = [data['image_url']]
        
    # Process all images
    processed_images = [_process_image_url(url) for url in image_list if url]
    
    # Main thumbnail is the first image
    main_image_url = processed_images[0] if processed_images else ''
        
    with cellar.get_connection() as conn:
        cursor = conn.cursor()
        
        try:
            # 1. Insert Recipe
            cursor.execute("""
                INSERT INTO recipes (title, description, image_url, servings, cuisine_region, meal_type)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                data['title'],
                data.get('description', ''),
                main_image_url,
                data.get('servings', 4),
                data.get('cuisine_region', ''),
                data.get('meal_type', '')
            ))
            recipe_id = cursor.lastrowid
            
            # 2. Insert Images
            for idx, img_url in enumerate(processed_images):
                cursor.execute("""
                    INSERT INTO recipe_images (recipe_id, image_url, display_order)
                    VALUES (?, ?, ?)
                """, (recipe_id, img_url, idx))
            
            # 3. Process Ingredients
            for ing in data['ingredients']:
                name = ing['name'].lower().strip()
                
                # Check if ingredient exists, insert if not
                cursor.execute("SELECT id FROM ingredients WHERE name = ?", (name,))
                row = cursor.fetchone()
                
                if row:
                    ingredient_id = row[0]
                else:
                    cursor.execute("INSERT INTO ingredients (name, category) VALUES (?, ?)", 
                                   (name, ing.get('category', 'Other')))
                    ingredient_id = cursor.lastrowid
                
                # Link ingredient to recipe
                cursor.execute("""
                    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, is_optional)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    recipe_id,
                    ingredient_id,
                    ing.get('quantity', ''),
                    ing.get('unit', ''),
                    1 if ing.get('is_optional') else 0
                ))
            
            # 4. Process Steps
            for idx, instruction in enumerate(data['steps']):
                cursor.execute("""
                    INSERT INTO steps (recipe_id, step_number, instruction)
                    VALUES (?, ?, ?)
                """, (recipe_id, idx + 1, instruction))
                
            return recipe_id
            
        except Exception as e:
            raise e


def update_recipe(recipe_id: int, data: dict) -> bool:
    """
    Updates an existing recipe.
    - Updates basic fields (title, desc, etc.)
    - REPLACES all ingredients and steps (simpler than syncing diffs)
    
    Args:
        recipe_id: ID of the recipe to update
        data: New recipe data (same format as save_new_recipe)
            
    Returns:
        bool: True if successful
    """
    cellar = get_cellar()
    
    # Validation
    if not data.get('title') or not data.get('ingredients') or not data.get('steps'):
        raise ValueError("Missing required recipe fields")
        
    image_list = data.get('image_urls', [])
    if not image_list and data.get('image_url'):
        image_list = [data['image_url']]
        
    # Process images (download new ones)
    processed_images = [_process_image_url(url) for url in image_list if url]
    main_image_url = processed_images[0] if processed_images else ''
    
    with cellar.get_connection() as conn:
        cursor = conn.cursor()
        
        try:
            # 1. Update Core Recipe
            cursor.execute("""
                UPDATE recipes 
                SET title = ?, description = ?, image_url = ?, 
                    servings = ?, cuisine_region = ?, meal_type = ?
                WHERE id = ?
            """, (
                data['title'],
                data.get('description', ''),
                main_image_url,
                data.get('servings', 4),
                data.get('cuisine_region', ''),
                data.get('meal_type', ''),
                recipe_id
            ))
            
            # 2. Update Images
            # Delete existing
            cursor.execute("DELETE FROM recipe_images WHERE recipe_id = ?", (recipe_id,))
            
            # Insert new
            for idx, img_url in enumerate(processed_images):
                cursor.execute("""
                    INSERT INTO recipe_images (recipe_id, image_url, display_order)
                    VALUES (?, ?, ?)
                """, (recipe_id, img_url, idx))
            
            # 2. Replace Ingredients (Delete all, then re-insert)
            cursor.execute("DELETE FROM recipe_ingredients WHERE recipe_id = ?", (recipe_id,))
            
            for ing in data['ingredients']:
                name = ing['name'].lower().strip()
                
                # Get or Create Ingredient
                cursor.execute("SELECT id FROM ingredients WHERE name = ?", (name,))
                row = cursor.fetchone()
                if row:
                    ingredient_id = row[0]
                else:
                    cursor.execute("INSERT INTO ingredients (name, category) VALUES (?, ?)", 
                                   (name, ing.get('category', 'Other')))
                    ingredient_id = cursor.lastrowid
                
                cursor.execute("""
                    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, is_optional)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    recipe_id,
                    ingredient_id,
                    ing.get('quantity', ''),
                    ing.get('unit', ''),
                    1 if ing.get('is_optional') else 0
                ))

            # 3. Replace Steps
            cursor.execute("DELETE FROM steps WHERE recipe_id = ?", (recipe_id,))
            
            for idx, instruction in enumerate(data['steps']):
                cursor.execute("""
                    INSERT INTO steps (recipe_id, step_number, instruction)
                    VALUES (?, ?, ?)
                """, (recipe_id, idx + 1, instruction))
                
            return True
            
        except Exception as e:
            raise e


def delete_recipe(recipe_id: int) -> bool:
    """
    Deletes a recipe and its related data.
    """
    cellar = get_cellar()
    
    with cellar.get_connection() as conn:
        cursor = conn.cursor()
        try:
            # Order matters if foreign keys are enforced, though usually CASCADE handles it.
            # Explicit deletion is safer if schema varies.
            cursor.execute("DELETE FROM steps WHERE recipe_id = ?", (recipe_id,))
            cursor.execute("DELETE FROM recipe_ingredients WHERE recipe_id = ?", (recipe_id,))
            cursor.execute("DELETE FROM recipe_images WHERE recipe_id = ?", (recipe_id,))
            cursor.execute("DELETE FROM recipes WHERE id = ?", (recipe_id,))
            return True
        except Exception as e:
            raise e

