"""
ShortSpork - app.py
Flask Application Entry Point

This module initializes the Flask application with proper configuration
for templates, static files, and environment variables.
"""

import os
from flask import Flask, render_template, jsonify, request, abort
from dotenv import load_dotenv
import uuid

from utils.database.pantry import get_ingredients_by_category
from utils.database.pantry import get_ingredients_by_category, search_ingredients
from utils.database.cookbook import get_recipes_with_pantry_comparison, get_all_recipes, get_recipe_by_id, save_new_recipe, update_recipe, delete_recipe, get_distinct_meal_types, get_distinct_cuisine_regions
from utils.database.food_processor import parse_recipe_text

# Load environment variables from .env file
load_dotenv()

# Initialize Flask application
app = Flask(
    __name__,
    template_folder='web/templates',
    static_folder='web/static',
    static_url_path='/static'
)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['PERPLEXITY_API_KEY'] = os.environ.get('PERPLEXITY_API_KEY', '')


def get_tag_color(text):
    """
    Deterministically map a string to a Vibrant UI color set.
    """
    if not text:
        return 'muted-gray'
    
    colors = [
        'yellow-orange', 'orange', 'red', 'blue', 'purple', 'teal', 
        'green', 'brown', 'rose', 'kiwi', 'light-purple'
    ]
    
    # Simple hash of text to pick a color
    hash_val = sum(ord(c) for c in text.lower())
    return colors[hash_val % len(colors)]


def split_tags(value):
    """
    Splits a comma-separated string into a list of tags.
    """
    if not value: return []
    return [t.strip() for t in value.split(',') if t.strip()]


@app.context_processor
def utility_processor():
    return dict(get_tag_color=get_tag_color, split_tags=split_tags)


@app.route('/')
def index():
    """
    Homepage route.
    Shows the recipe menu as the main landing page.
    """
    ingredients = get_ingredients_by_category()
    recipes = get_all_recipes()
    return render_template('menu.html', ingredients=ingredients, recipes=recipes)


@app.route('/menu')
def menu():
    """
    Recipe browsing page with filtering (alias for index).
    """
    return index()


@app.route('/api/ingredients')
def api_ingredients():
    """
    API endpoint to get all ingredients grouped by category.
    Used for populating the sidebar filter.
    
    Returns:
        JSON: {"Produce": [{"id": 1, "name": "Tomato"}, ...], "Dairy": [...], ...}
    """
    ingredients = get_ingredients_by_category()
    return jsonify(ingredients)


@app.route('/api/search-ingredients')
def api_search_ingredients():
    """
    Search ingredients endpoint.
    """
    query = request.args.get('q', '')
    if not query:
        return jsonify([])
        
    results = search_ingredients(query)
    return jsonify(results)


@app.route('/api/filter-options')
def api_filter_options():
    """
    API endpoint to get distinct filter options.
    
    Returns:
        JSON: {"meal_types": [...], "cuisine_regions": [...]}
    """
    meal_types = get_distinct_meal_types()
    cuisine_regions = get_distinct_cuisine_regions()
    return jsonify({
        "meal_types": meal_types,
        "cuisine_regions": cuisine_regions
    })


@app.route('/api/filter', methods=['POST'])
def api_filter():
    """
    API endpoint to filter recipes by selected ingredients and primary filters.
    
    Request Body:
        {
            "ingredient_ids": [1, 2, 3, ...],
            "meal_types": ["Dinner", "Lunch", ...],
            "cuisine_regions": ["Italian", "Asian", ...]
        }
    
    Returns:
        JSON array of recipes with match percentages
    """
    data = request.get_json() or {}
    ingredient_ids = data.get('ingredient_ids', [])
    meal_types = data.get('meal_types', [])
    cuisine_regions = data.get('cuisine_regions', [])
    
    # Validate ingredient_ids are integers
    try:
        ingredient_ids = [int(id) for id in ingredient_ids]
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid ingredient IDs"}), 400
    
    # Validate meal_types and cuisine_regions are strings
    meal_types = [str(mt) for mt in meal_types if mt]
    cuisine_regions = [str(cr) for cr in cuisine_regions if cr]
    
    recipes = get_recipes_with_pantry_comparison(ingredient_ids, meal_types, cuisine_regions)
    return jsonify(recipes)


@app.route('/prep-station')
def prep_station():
    """
    Recipe entry page.
    Allows manual entry, AI text parsing, or editing existing recipes.
    """
    edit_id = request.args.get('edit')
    if edit_id:
        recipe = get_recipe_by_id(edit_id)
        if recipe:
            return render_template('prep_station.html', recipe_data=recipe, is_edit_mode=True)
    
    return render_template('prep_station.html')


@app.route('/api/parse-recipe', methods=['POST'])
def api_parse_recipe():
    """
    AI Recipe Parser endpoint.
    Accepts text, returns parsed recipe JSON.
    """
    data = request.get_json() or {}
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "No recipe text provided"}), 400
        
    api_key = app.config.get('PERPLEXITY_API_KEY')
    if not api_key:
        return jsonify({"error": "Server configuration error: Missing API Key"}), 500
        
    try:
        recipe_data = parse_recipe_text(text, api_key)
        return jsonify(recipe_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/save-recipe', methods=['POST'])
def save_recipe():
    """
    Save a new recipe.
    Accepts JSON data, calls database function.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        recipe_id = save_new_recipe(data)
        
        return jsonify({
            "success": True, 
            "recipe_id": recipe_id,
            "message": "Recipe saved successfully"
        })
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to save recipe: {str(e)}"}), 500


@app.route('/update-recipe/<int:recipe_id>', methods=['POST'])
def update_recipe_route(recipe_id):
    """
    Update an existing recipe.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        update_recipe(recipe_id, data)
        
        return jsonify({
            "success": True, 
            "recipe_id": recipe_id,
            "message": "Recipe updated successfully"
        })
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to update recipe: {str(e)}"}), 500


@app.route('/delete-recipe/<int:recipe_id>', methods=['POST'])
def delete_recipe_route(recipe_id):
    """
    Delete a recipe.
    """
    try:
        delete_recipe(recipe_id)
        return jsonify({"success": True, "message": "Recipe deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500




@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    """
    Handle direct file uploads.
    Saves file to static/images/recipes/ and returns local path.
    """
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file:
        try:
            # Validate extension
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in ['.jpg', '.jpeg', '.png', '.webp', '.gif']:
                return jsonify({"error": "Invalid file type. Allowed: jpg, jpeg, png, webp, gif"}), 400
            
            # Generate unique filename
            filename = f"{uuid.uuid4()}{ext}"
            
            # Paths
            relative_path = f"images/recipes/{filename}"
            full_path = os.path.join(app.static_folder, 'images', 'recipes', filename)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            # Save file
            file.save(full_path)
            
            return jsonify({
                "success": True, 
                "url": f"/static/{relative_path}"
            })
            
        except Exception as e:
            return jsonify({"error": f"Failed to upload image: {str(e)}"}), 500

    return jsonify({"error": "Unknown error"}), 500


@app.route('/recipe/<int:recipe_id>')
def recipe_detail(recipe_id):
    """
    Recipe detail page with adjustable servings.
    Shows ingredients and steps in a split-screen layout.
    """
    recipe = get_recipe_by_id(recipe_id)
    if not recipe:
        abort(404)
    return render_template('plate.html', recipe=recipe)


@app.route('/health')
def health():
    """
    Health check endpoint.
    Returns a simple status for monitoring.
    """
    return {'status': 'healthy', 'app': 'ShortSpork'}


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5555)

