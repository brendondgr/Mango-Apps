/**
 * ShortSpork - waiter.js
 * Dynamic filtering logic for the recipe menu
 * 
 * Handles ingredient checkbox interactions, primary filters, and recipe grid updates
 */

(function () {
    'use strict';

    // DOM Elements
    const recipeGrid = document.getElementById('recipe-grid');
    const loadingOverlay = document.getElementById('loading-overlay');
    const emptyState = document.getElementById('empty-state');
    const countNumber = document.getElementById('count-number');
    const clearFiltersBtn = document.getElementById('clear-filters');

    // Primary filter containers
    const cuisineFilterOptions = document.getElementById('cuisine-filter-options');
    const mealFilterOptions = document.getElementById('meal-filter-options');
    const cuisineActiveCount = document.getElementById('cuisine-active-count');
    const mealActiveCount = document.getElementById('meal-active-count');
    const cuisineTotalCount = document.getElementById('cuisine-total-count');
    const mealTotalCount = document.getElementById('meal-total-count');

    // Debounce timer
    let debounceTimer = null;
    const DEBOUNCE_DELAY = 300;

    /**
     * Initialize the filter system
     */
    async function initializeFilters() {
        // Fetch and render primary filters first
        await fetchAndRenderPrimaryFilters();

        // Attach listeners to all ingredient checkboxes
        const checkboxes = document.querySelectorAll('.ingredient-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleCheckboxChange);
        });

        // Clear filters button
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', clearAllFilters);
            updateClearButtonVisibility();
        }

        // Category toggle buttons (unified for both primary and ingredient categories)
        const categoryToggles = document.querySelectorAll('.category-toggle');
        categoryToggles.forEach(toggle => {
            toggle.addEventListener('click', handleCategoryToggle);
        });

        // Make initial recipe cards clickable
        initializeCardClickHandlers();

        console.log('Filters initialized with', checkboxes.length, 'ingredients');

        if (window.Fridge) {
            window.Fridge.restore(); // This checks the boxes
            // Now update search if we restored anything
            const checkedCount = document.querySelectorAll('.ingredient-checkbox:checked').length;
            const primaryCheckedCount = document.querySelectorAll('.primary-filter-checkbox:checked').length;
            if (checkedCount > 0 || primaryCheckedCount > 0) {
                // Update primary counts if they were restored (though Fridge only does ingredients for now)
                updatePrimaryFilterCount('cuisine');
                updatePrimaryFilterCount('meal');
                updatePrimaryFilterCount('meal');
                updateSearch();
            }
            updateClearButtonVisibility();
        }

        // Initialize Sidebar Toggle
        initSidebar();
    }

    /**
     * Sidebar Toggle Logic
     */
    function initSidebar() {
        const layout = document.querySelector('.menu-layout');
        const sidebar = document.querySelector('.filter-sidebar');
        const collapseBtn = document.getElementById('sidebar-collapse-btn');
        const expandBtn = document.getElementById('sidebar-expand-btn');

        if (!collapseBtn || !expandBtn) return;

        // Restore state
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            setSidebarState(true);
        }

        collapseBtn.addEventListener('click', () => {
            setSidebarState(true);
            localStorage.setItem('sidebarCollapsed', 'true');
        });

        expandBtn.addEventListener('click', () => {
            setSidebarState(false);
            localStorage.setItem('sidebarCollapsed', 'false');
        });

        function setSidebarState(collapsed) {
            if (collapsed) {
                sidebar.classList.add('collapsed');
                layout.classList.add('sidebar-collapsed');
                expandBtn.style.display = 'flex';
            } else {
                sidebar.classList.remove('collapsed');
                layout.classList.remove('sidebar-collapsed');
                expandBtn.style.display = 'none';
            }
        }
    }

    /**
     * Fetch filter options from API and render them
     */
    async function fetchAndRenderPrimaryFilters() {
        try {
            const response = await fetch('/api/filter-options');
            if (!response.ok) {
                throw new Error('Failed to fetch filter options');
            }
            const data = await response.json();

            // Render cuisine region options
            if (data.cuisine_regions) {
                if (cuisineTotalCount) cuisineTotalCount.textContent = data.cuisine_regions.length;
                if (cuisineFilterOptions) renderPrimaryFilterOptions(cuisineFilterOptions, data.cuisine_regions, 'cuisine');
            }

            // Render meal type options
            if (data.meal_types) {
                if (mealTotalCount) mealTotalCount.textContent = data.meal_types.length;
                if (mealFilterOptions) renderPrimaryFilterOptions(mealFilterOptions, data.meal_types, 'meal');
            }
        } catch (error) {
            console.error('Error fetching filter options:', error);
            // Show error state in filter sections
            if (cuisineFilterOptions) {
                cuisineFilterOptions.innerHTML = '<p class="filter-error">No filters available</p>';
            }
            if (mealFilterOptions) {
                mealFilterOptions.innerHTML = '<p class="filter-error">No filters available</p>';
            }
        }
    }

    /**
     * Render filter options as checkboxes
     * @param {HTMLElement} container - Container element
     * @param {Array} options - Array of {value, count} objects
     * @param {string} filterType - 'cuisine' or 'meal'
     */
    function renderPrimaryFilterOptions(container, options, filterType) {
        if (options.length === 0) {
            container.innerHTML = '<p class="filter-empty">No options available</p>';
            return;
        }

        container.innerHTML = options.map(opt => `
            <label class="primary-filter-item">
                <input type="checkbox" class="checkbox primary-filter-checkbox" 
                       data-filter-type="${filterType}"
                       data-filter-value="${escapeHtml(opt.value)}">
                <span class="filter-option-name">${escapeHtml(opt.value)}</span>
                <span class="filter-option-count">(${opt.count})</span>
            </label>
        `).join('');

        // Add change listeners to the new checkboxes
        const checkboxes = container.querySelectorAll('.primary-filter-checkbox');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                updatePrimaryFilterCount(filterType);
                handleCheckboxChange();
            });
        });
    }

    /**
     * Update the active count badge for a filter type
     * @param {string} filterType - 'cuisine' or 'meal'
     */
    function updatePrimaryFilterCount(filterType) {
        const checkboxes = document.querySelectorAll(`.primary-filter-checkbox[data-filter-type="${filterType}"]:checked`);
        const countBadge = filterType === 'cuisine' ? cuisineActiveCount : mealActiveCount;

        if (countBadge) {
            if (checkboxes.length > 0) {
                countBadge.textContent = checkboxes.length;
                countBadge.style.display = 'inline-block';
            } else {
                countBadge.style.display = 'none';
            }
        }
    }

    /**
     * Initialize click handlers for recipe cards (initial HTML cards)
     */
    function initializeCardClickHandlers() {
        const cards = document.querySelectorAll('.card-recipe');
        cards.forEach(card => {
            const recipeId = card.dataset.recipeId;
            if (recipeId) {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    window.location.href = `/recipe/${recipeId}`;
                });
            }
        });
    }

    /**
     * Handle checkbox change events with debouncing
     */
    function handleCheckboxChange() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateSearch, DEBOUNCE_DELAY);
    }

    /**
     * Toggle category visibility (unified function)
     */
    function handleCategoryToggle(event) {
        const button = event.currentTarget;
        const category = button.closest('.filter-category');
        const items = category.querySelector('.category-items');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        button.setAttribute('aria-expanded', !isExpanded);
        items.classList.toggle('collapsed', isExpanded);
    }

    /**
     * Clear all selected filters
     */
    function clearAllFilters() {
        // Clear ingredient checkboxes
        const ingredientCheckboxes = document.querySelectorAll('.ingredient-checkbox:checked');
        ingredientCheckboxes.forEach(cb => cb.checked = false);

        // Clear primary filter checkboxes
        const primaryCheckboxes = document.querySelectorAll('.primary-filter-checkbox:checked');
        primaryCheckboxes.forEach(cb => cb.checked = false);

        // Update count badges
        updatePrimaryFilterCount('cuisine');
        updatePrimaryFilterCount('meal');

        if (window.Fridge) {
            window.Fridge.clear();
        }

        updateSearch();
        updateClearButtonVisibility();
    }

    /**
     * Collect selected filters and update the recipe grid
     */
    async function updateSearch() {
        // Collect checked ingredient IDs
        const checkedIngredients = document.querySelectorAll('.ingredient-checkbox:checked');
        const ingredientIds = Array.from(checkedIngredients).map(cb =>
            parseInt(cb.dataset.ingredientId, 10)
        );

        // Collect selected meal types
        const checkedMealTypes = document.querySelectorAll('.primary-filter-checkbox[data-filter-type="meal"]:checked');
        const mealTypes = Array.from(checkedMealTypes).map(cb => cb.dataset.filterValue);

        // Collect selected cuisine regions
        const checkedCuisines = document.querySelectorAll('.primary-filter-checkbox[data-filter-type="cuisine"]:checked');
        const cuisineRegions = Array.from(checkedCuisines).map(cb => cb.dataset.filterValue);

        // Save ingredient state
        if (window.Fridge) {
            window.Fridge.save(ingredientIds);
        }

        // Add transition class for smooth update
        recipeGrid.classList.add('recipe-grid-transitioning');
        recipeGrid.classList.remove('recipe-grid-ready');

        // Show loading state
        showLoading(true);

        try {
            const response = await fetch('/api/filter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ingredient_ids: ingredientIds,
                    meal_types: mealTypes,
                    cuisine_regions: cuisineRegions
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const recipes = await response.json();

            // Check if ingredient filtering is active (for match badge display)
            const showMatchBadge = ingredientIds.length > 0;

            // Render the recipes
            renderRecipeCards(recipes, showMatchBadge);

        } catch (error) {
            console.error('Error filtering recipes:', error);
            showError('Failed to filter recipes. Please try again.');
        } finally {
            showLoading(false);
        }
        updateClearButtonVisibility();
    }

    /**
     * Update visibility of the clear filters button
     */
    function updateClearButtonVisibility() {
        if (!clearFiltersBtn) return;

        const hasIngredients = document.querySelectorAll('.ingredient-checkbox:checked').length > 0;
        const hasPrimary = document.querySelectorAll('.primary-filter-checkbox:checked').length > 0;

        if (hasIngredients || hasPrimary) {
            clearFiltersBtn.style.display = 'inline-flex';
        } else {
            clearFiltersBtn.style.display = 'none';
        }
    }

    /**
     * Render recipe cards to the grid
     * @param {Array} recipes - Array of recipe objects
     * @param {boolean} showMatch - Whether to show match percentage badges
     */
    function renderRecipeCards(recipes, showMatch = false) {
        // Clear existing cards
        recipeGrid.innerHTML = '';

        // Update count
        if (countNumber) {
            countNumber.textContent = recipes.length;
        }

        // Show empty state if no recipes
        if (recipes.length === 0) {
            recipeGrid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        // Hide empty state, show grid
        recipeGrid.style.display = 'grid';
        emptyState.style.none = 'none'; // Fixed: should be display: none
        emptyState.style.display = 'none';

        // Create cards
        recipes.forEach((recipe, index) => {
            const card = createRecipeCard(recipe, showMatch, index);
            recipeGrid.appendChild(card);
        });

        // Initialize carousels for new cards
        if (window.initCarousels) {
            window.initCarousels(recipeGrid);
        }

        // Trigger safe transition after render
        requestAnimationFrame(() => {
            recipeGrid.classList.remove('recipe-grid-transitioning');
            recipeGrid.classList.add('recipe-grid-ready');
        });
    }

    /**
     * Create a recipe card element
     * @param {Object} recipe - Recipe data
     * @param {boolean} showMatch - Whether to show match badge
     * @param {number} index - Card index for animation delay
     * @returns {HTMLElement}
     */
    function createRecipeCard(recipe, showMatch, index) {
        const article = document.createElement('article');
        article.className = 'card-recipe';
        article.dataset.recipeId = recipe.id;
        article.style.animationDelay = `${Math.min(index * 50, 400)}ms`;

        // Match badge HTML
        let matchBadge = '';
        if (showMatch && recipe.match_percentage !== undefined && recipe.match_percentage !== null) {
            const matchClass = getMatchClass(recipe.match_percentage);
            matchBadge = `
                <span class="match-badge ${matchClass}">
                    ${recipe.match_percentage}% match
                </span>
            `;
        }

        // Images Logic
        const images = (recipe.images && recipe.images.length > 0)
            ? recipe.images
            : [recipe.image_url || 'https://placehold.co/400x250/CCCCCC/666?text=Recipe'];

        let imagesHtml = '';
        images.forEach((url, idx) => {
            imagesHtml += `<img src="${url}" alt="${escapeHtml(recipe.title)}" class="carousel-image ${idx === 0 ? 'active' : ''}">`;
        });

        const navHtml = images.length > 1 ? `
            <button class="carousel-nav carousel-prev" aria-label="Previous">&lsaquo;</button>
            <button class="carousel-nav carousel-next" aria-label="Next">&rsaquo;</button>
        ` : '';

        // Build card HTML
        article.innerHTML = `
            <div class="card-recipe-image-container recipe-carousel">
                <div class="card-badges-overlay" style="z-index: 5;">
                    ${matchBadge}
                </div>
                <div class="carousel-images">
                    ${imagesHtml}
                </div>
                ${navHtml}
            </div>
            <div class="card-recipe-content">
                <h3 class="card-recipe-title">${escapeHtml(recipe.title)}</h3>
                <p class="card-recipe-description">${escapeHtml(recipe.description || '')}</p>
                <div class="card-recipe-meta">
                    <div class="meta-tags-right">
                        ${recipe.cuisine_region ? (() => {
                const tags = recipe.cuisine_region.split(',').map(t => t.trim()).filter(t => t);
                if (tags.length === 0) return '';
                const displayText = tags.length > 1 ? `${tags[0]} + ${tags.length - 1}` : tags[0];
                return `<span class="badge badge-sm badge-${getTagColor(tags[0])}">${escapeHtml(displayText)}</span>`;
            })() : ''}
                        ${recipe.meal_type ? (() => {
                const tags = recipe.meal_type.split(',').map(t => t.trim()).filter(t => t);
                if (tags.length === 0) return '';
                const displayText = tags.length > 1 ? `${tags[0]} + ${tags.length - 1}` : tags[0];
                return `<span class="badge badge-sm badge-${getTagColor(tags[0])}">${escapeHtml(displayText)}</span>`;
            })() : ''}
                    </div>
                </div>
            </div>
        `;

        // Make card clickable to navigate to recipe detail
        article.style.cursor = 'pointer';
        article.addEventListener('click', () => {
            window.location.href = `/recipe/${recipe.id}`;
        });

        return article;
    }

    /**
     * Get consistent color for tag text
     * @param {string} text - The text to hash
     * @returns {string} One of the available color names
     */
    function getTagColor(text) {
        if (!text) return 'muted-gray';

        const colors = [
            'yellow-orange', 'orange', 'red', 'blue', 'purple', 'teal',
            'green', 'brown', 'rose', 'kiwi', 'light-purple'
        ];

        // Simple hash matching the Python version
        let hash = 0;
        const str = text.toLowerCase();
        for (let i = 0; i < str.length; i++) {
            hash += str.charCodeAt(i);
        }

        return colors[hash % colors.length];
    }

    /**
     * Get CSS class for match percentage
     * @param {number} percentage
     * @returns {string}
     */
    function getMatchClass(percentage) {
        if (percentage >= 70) return 'match-high';
        if (percentage >= 40) return 'match-medium';
        return 'match-low';
    }

    /**
     * Show/hide loading overlay
     * @param {boolean} show
     */
    function showLoading(show) {
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Show error message
     * @param {string} message
     */
    function showError(message) {
        // For now, just log to console
        // Future: Show a toast notification
        console.error(message);
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text
     * @returns {string}
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFilters);
    } else {
        initializeFilters();
    }

})();
