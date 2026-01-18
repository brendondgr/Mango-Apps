# ShortSpork Implementation Plan

This document outlines the systematic plan to build the ShortSpork application. Tasks must be executed in the definition order. Each rule details the purpose, required files, and specific logic.

---

## Rule 1: Project Initialization & Design Foundation
**Purpose**: Establish the core environment and the "Vibrant UI" visual language.
**Files to Create/Modify**:
- `requirements.txt`: Add `flask`, `requests`, `python-dotenv`.
- `web/static/css/spices.css`: Port all color codes and font definitions from `docs/ui.md` (formerly `variables.css`).
- `web/static/css/plating.css`: Define global resets and import `spices.css` (formerly `main.css`).
- `chef.py`: Standard Flask scaffolding (formerly `app.py`).

**Detailed Logic**:
1.  **Environment Setup**: Utilize `.env` for the `PERPLEXITY_API_KEY` to keep it secure.
2.  **UI Foundation**: `spices.css` must include the 16 categorization tones as CSS variables (e.g., `--color-red-bg`, `--color-red-border`).
3.  **Base Layout**: Create `web/templates/kitchen.html` (Jinja2) containing the `<head>` with Google Fonts (Space Grotesk, DM Sans) and the navigation skeleton (formerly `layout.html`).

## Rule 2: Persistent Storage (SQLite) & Schema Logic
**Purpose**: Build the backbone of the recipe and ingredient management.
**Files to Create**:
- `utils/database/recipe_box.py` (formerly `schema.py`)
- `utils/database/cellar.py` (formerly `db_manager.py`)
- `data/cookbook.db` (auto-generated)

**Detailed Logic**:
1.  **`Cellar` Class**: Create a class in `cellar.py` that handles `get_db_connection()` and ensuring thread-safe SQLite access in Flask.
2.  **Schema Definition**:
    -   `recipes`: `id (PK)`, `title`, `description`, `image_url`, `servings (INT)`, `cuisine_region`, `meal_type` (Breakfast/Lunch/Dinner/Dessert/etc).
    -   `ingredients`: `id (PK)`, `name (UNIQUE)`, `category` (Produce/Dairy/Pantry/etc).
    -   `recipe_ingredients`: `recipe_id`, `ingredient_id`, `quantity (FLOAT)`, `unit (STR)`, `is_optional (BOOL)`.
    -   `steps`: `recipe_id`, `step_number (INT)`, `instruction (TEXT)`.
3.  **Initialization**: Run a script that executes `CREATE TABLE IF NOT EXISTS` for all tables.

## Rule 3: The Recipe Grid & Advanced Filtering Logic
**Purpose**: Create the main portal where users interact with existing recipes and filtering.
**Files to Create/Modify**:
- `utils/database/cookbook.py`: Function `get_recipes_with_pantry_comparison(pantry_ids)` (formerly `recipes.py`).
- `web/templates/menu.html`: The multi-column layout (formerly `index.html`).
- `web/static/js/waiter.js`: Logic for dynamic filtering (formerly `search_manager.js`).

**Detailed Logic**:
1.  **Sidebar Filtering**:
    -   Fetch all unique ingredients from the database grouped by category.
    -   Render as a vertical list of checkboxes.
2.  **Live Updates**:
    -   JavaScript `updateSearch()` function: Listens to checkbox changes, sends an AJAX `POST` to `/api/filter` with the list of checked `ingredient_ids`.
    -   The server should return JSON of recipes ordered by "Inventory Match Percentage".
3.  **Recipe Cards**: 
    -   Implement the "Hover Lift" effect (`translateY(-5px)`).
    -   Display "Match %" badge on each card if filtering is active.

## Rule 4: Dynamic Recipe Detailed View [DONE]
**Purpose**: A dedicated page for cooking, featuring a servings adjuster and smart instructions.
**Files to Create/Modify**:
- `web/templates/plate.html`
- `web/static/js/measuring_cup.js`
- `web/static/js/ingredient_replacer.js` [NEW]

**Detailed Logic**:
1.  **Split Screen Layout**:
    -   Left Side (33%): Ingredients list with quantity spans that have a `data-base-qty` attribute.
    -   Right Side (66%): Steps list using `JetBrains Mono` for a precise "manual" feel.
2.  **Calculation Engine**:
    -   When the "Servings" input changes, JS loops through all `data-base-qty` elements.
    -   `new_qty = base_qty * (new_servings / original_servings)`.
    -   Update the text inner content smoothly.
3.  **Instruction Replacement**:
    -   The `ingredient_replacer.js` module extracts current quantities from the DOM.
    -   Fuzzy-matches ingredient names (handling plurals/singulars) within instruction text.
    -   Replaces first occurrence of each ingredient in a step with `qty + unit + name`.
    -   Synchronized with the calculation engine to update instructions live when servings change.

## Rule 5: Perplexity AI Recipe Parser Integration
**Purpose**: Allow massive time savings by using Perplexity to turn text into database entries.
**Files to Create**:
- `utils/database/food_processor.py` (Ref cite: [howtouse.md](file:///e:/Projects/ShortSpork/docs/perplexity/howtouse.md)) (formerly `ai_parser.py`)
- `web/templates/prep_station.html` (formerly `add_recipe.html`)

**Detailed Logic**:
1.  **API Integration**:
    -   Use `requests` to POST to `https://api.perplexity.ai/chat/completions`.
    -   Model: `sonar`.
    -   **Strict System Prompt**: "You are a recipe parser. Return ONLY a JSON object with keys: title, description, servings (integer), cuisine, meal_type, ingredients (list of objects with name, qty, unit), and steps (list of strings)."
2.  **UI Interaction**:
    -   "Paste" textarea + "Magic Parse" button.
    -   Loading spinner using the "Vivid Teal" (`#00D9C0`) color.
    -   On success, populate a hidden form or a preview area with the results for the user to "Confirm and Save".

## Rule 6: Manual Entry & Recipe Submission
**Purpose**: Provide a fallback for manual typing and finalize the data capture.
**Files to Create/Modify**:
- `utils/database/cookbook.py`: Function `save_new_recipe(data_dict)`.
- `chef.py`: POST route for `/save-recipe`.

**Detailed Logic**:
1.  **Multi-Select Parameters**:
    -   Implement "Food Type" and "Meal Type" as clickable tag clouds.
    -   Allow multiple tags (e.g., a recipe can be "Lunch" AND "Snack").
2.  **Data Extraction & Cleaning**:
    -   Normalize ingredient names (lowercase, trim) before checking if they exist in the global `ingredients` table.
    -   Atomic transactions: Ensure recipe, ingredients, and steps are all saved, or none are (integrity).

## Rule 7: State Persistence & UI Polish
**Purpose**: Finalizing the "Premium" feel and UX stability.
**Files to Create/Modify**:
- `web/static/js/fridge.js` (formerly `pantry_storage.js`)
- `web/static/css/garnishes.css` (formerly `animations.css`)

**Detailed Logic**:
1.  **Fridge (Pantry) Persistence**: Save checked ingredient IDs in `localStorage` so they remain checked across sessions.
2.  **Dynamic Transitions**: Add `opacity` and `blur` transitions when the recipe list updates.
3.  **Image Optimization**: Implement CSS `object-fit: cover` for recipe thumbnails to handle various aspect ratios elegantly.
