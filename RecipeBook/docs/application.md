# Application Documentation

## Tech Stack
- **Backend Logic**: Python (Flask)
- **Database**: SQLite
- **Frontend**: HTML, JavaScript, CSS (Vanilla, using Variables)
- **AI Integration**: Perplexity (via SONAR API for recipe parsing). Implementation details found in [howtouse.md](file:///e:/Projects/ShortSpork/docs/perplexity/howtouse.md).

## Repository Rules & AI Generation Guidelines
1.  **Logic Separation**: 
    - Specific backend logic, especially database interactions, must be placed in `utils/database/`.
    - Create separate `.py` files for distinct logical domains (e.g., `recipe_logic.py`, `ingredient_logic.py`).
2.  **File Size Limits**:
    - No file should exceed **800 lines of code**.
    - If a file approaches this limit, it must be split into multiple smaller, modular files (e.g., `module_part_1.py`, `module_part_2.py`).
3.  **Documentation**:
    - This file (`docs/application.md`) serves as the central knowledge base.
    - Update this file after implementing major logic.
    - **Do NOT** include actual Python code blocks here.
    - **DO** include relative file paths (e.g., `utils/database/recipes.py`) and descriptions of key classes/functions.

## Proposed File Structure

### Root Directory
- `chef.py`: Main Flask application entry point (formerly `app.py`).
- `requirements.txt`: Python dependencies.
- `.env`: API keys and environment variables.

### Logic & Database (`utils/database/`)
- `utils/database/cellar.py`: Thread-safe SQLite connection management (formerly `db_manager.py`).
- `utils/database/recipe_box.py`: Database initialization and schema definitions (formerly `schema.py`).
- `utils/database/cookbook.py`: CRUD operations and complex recipe queries (formerly `recipes.py`).
- `utils/database/pantry.py`: Management of the global ingredient registry (formerly `ingredients.py`).
- `utils/database/sous_chef.py`: Core logic for inventory-to-recipe matching algorithms (formerly `search.py`).
- `utils/database/food_processor.py`: Perplexity API integration for text parsing (formerly `ai_parser.py`).

### Web Interface (`web/`)
- `web/static/css/spices.css`: Vibrant UI design tokens (formerly `variables.css`).
- `web/static/css/plating.css`: Core layout and component styling (formerly `main.css`).
- `web/static/js/waiter.js`: AJAX-based filtering and search logic (formerly `search_manager.js`).
- `web/static/js/measuring_cup.js`: Dynamic quantity scaling (formerly `servings_calculator.js`).
- `web/templates/kitchen.html`: Main base template with navigation (formerly `layout.html`).
- `web/templates/menu.html`: Recipe grid and pantry filtering sidebar (formerly `index.html`).
- `web/templates/plate.html`: Detailed split-screen view (formerly `recipe.html`).
- `web/templates/prep_station.html`: Recipe entry and AI parse interface (formerly `add_recipe.html`).
- `web/templates/garnish/`: Reusable template fragments (formerly `parts/`).

## Core Logic Highlights

### Enhanced Image Handling
- **Multi-Source Upload**: The Prep Station (`web/templates/prep_station.html`) supports drag-and-drop, direct file selection, and external URL inputs for recipe images.
- **Asynchronous Upload**: Local files are uploaded via `fetch` to the `/api/upload-image` endpoint in `app.py`, which validates types (JPG, PNG, WebP, GIF) and saves them with UUID filenames to `web/static/images/recipes/`.
- **Smooth Reordering**: Image previews can be reordered using a custom Pointer Events system (`web/static/js/prep_station.js`). This system uses a floating clone and placeholder mechanism to provide smooth visual feedback without native ghosting.
- **Persistence**: Image order is preserved upon form submission based on the final DOM order in the preview grid. The backend `utils/database/cookbook.py` handles saving these relationships.
