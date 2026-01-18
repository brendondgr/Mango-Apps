/**
 * ShortSpork - ingredient_replacer.js
 * Dynamic ingredient replacement in recipe instructions
 * 
 * Replaces ingredient mentions in instruction steps with current quantities/units
 * Updates automatically when servings change
 */

(function () {
    'use strict';

    /**
     * Build a map of ingredient names to their current quantities and units
     * @returns {Map<string, {quantity: string, unit: string, name: string}>}
     */
    function buildIngredientMap() {
        const map = new Map();
        const ingredients = document.querySelectorAll('.ing-item');

        ingredients.forEach(item => {
            const nameEl = item.querySelector('.ing-name');
            const qtyEl = item.querySelector('.ing-qty');
            const unitEl = item.querySelector('.ing-unit');

            if (!nameEl) return;

            const name = nameEl.textContent.trim().toLowerCase();
            const quantity = qtyEl ? qtyEl.textContent.trim() : '';
            const unit = unitEl ? unitEl.textContent.trim() : '';

            if (name) {
                map.set(name, { quantity, unit, name: nameEl.textContent.trim() });
            }
        });

        return map;
    }

    /**
     * Generate singular/plural variants of a word
     * @param {string} word - The word to generate variants for
     * @returns {string[]} Array of variants
     */
    function getWordVariants(word) {
        const variants = [word];

        // Handle common plural patterns
        if (word.endsWith('es')) {
            // tomatoes -> tomato, potatoes -> potato
            variants.push(word.slice(0, -2));
            // dishes -> dish
            variants.push(word.slice(0, -1));
        } else if (word.endsWith('ies')) {
            // berries -> berry
            variants.push(word.slice(0, -3) + 'y');
        } else if (word.endsWith('s') && !word.endsWith('ss')) {
            // eggs -> egg
            variants.push(word.slice(0, -1));
        }

        // Add plural forms for singular words
        if (!word.endsWith('s')) {
            variants.push(word + 's');
            if (word.endsWith('y')) {
                // berry -> berries
                variants.push(word.slice(0, -1) + 'ies');
            } else if (word.endsWith('o') || word.endsWith('ch') || word.endsWith('sh')) {
                // tomato -> tomatoes, dish -> dishes
                variants.push(word + 'es');
            }
        }

        return variants;
    }

    /**
     * Find the first match of an ingredient name in text using word boundaries
     * @param {string} text - The instruction text to search
     * @param {string} ingredientName - The ingredient name to find
     * @returns {{start: number, end: number, matched: string}|null}
     */
    function fuzzyMatchIngredient(text, ingredientName) {
        const lowerText = text.toLowerCase();
        const lowerName = ingredientName.toLowerCase();

        // Get all variants to try
        const variants = getWordVariants(lowerName);

        // Sort by length descending to match longer forms first
        variants.sort((a, b) => b.length - a.length);

        for (const variant of variants) {
            // Use word boundary regex to avoid partial matches
            // This prevents "egg" from matching "eggplant"
            const regex = new RegExp(`\\b${escapeRegex(variant)}\\b`, 'i');
            const match = regex.exec(text);

            if (match) {
                return {
                    start: match.index,
                    end: match.index + match[0].length,
                    matched: match[0]
                };
            }
        }

        return null;
    }

    /**
     * Escape special regex characters in a string
     * @param {string} str 
     * @returns {string}
     */
    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Format the replacement string for an ingredient
     * @param {string} quantity 
     * @param {string} unit 
     * @param {string} matchedText - The original matched text to preserve case pattern
     * @returns {string}
     */
    function formatReplacement(quantity, unit, matchedText) {
        // Skip unit if it's empty or "each"
        const skipUnit = !unit || unit.toLowerCase() === 'each';

        let displayText;
        if (skipUnit) {
            displayText = `${quantity} ${matchedText}`;
        } else {
            displayText = `${quantity} ${unit} ${matchedText}`;
        }

        // Wrap in styled span for visual highlighting
        return `<span class="instruction-ingredient">${displayText}</span>`;
    }

    /**
     * Replace ingredient mentions in a single step element
     * @param {HTMLElement} stepElement - The .step-text element
     * @param {Map} ingredientMap - Map of ingredients
     */
    function replaceIngredientsInStep(stepElement, ingredientMap) {
        // Get original text from data attribute
        const originalText = stepElement.dataset.originalText;
        if (!originalText) return;

        let newText = originalText;
        const replacedIngredients = new Set();

        // Process each ingredient, replacing only first occurrence
        for (const [name, data] of ingredientMap) {
            // Skip if already replaced this ingredient
            if (replacedIngredients.has(name)) continue;

            const match = fuzzyMatchIngredient(newText, name);
            if (match) {
                const before = newText.slice(0, match.start);
                const after = newText.slice(match.end);
                const replacement = formatReplacement(data.quantity, data.unit, match.matched);

                newText = before + replacement + after;
                replacedIngredients.add(name);
            }
        }

        // Update DOM if changed (use innerHTML for styled spans)
        if (stepElement.innerHTML !== newText) {
            stepElement.innerHTML = newText;
        }
    }

    /**
     * Update all instruction steps with current ingredient quantities
     */
    function updateAllInstructions() {
        const ingredientMap = buildIngredientMap();
        const steps = document.querySelectorAll('.step-text[data-original-text]');

        steps.forEach(step => {
            replaceIngredientsInStep(step, ingredientMap);
        });
    }

    /**
     * Initialize the ingredient replacer
     */
    function initialize() {
        // Run initial replacement
        updateAllInstructions();

        console.log('Ingredient replacer initialized');
    }

    // Expose the update function globally for measuring_cup.js integration
    window.ingredientReplacer = {
        updateAllInstructions: updateAllInstructions
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
