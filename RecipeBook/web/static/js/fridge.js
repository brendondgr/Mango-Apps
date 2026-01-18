/**
 * ShortSpork - fridge.js
 * Pantry state persistence using localStorage
 * 
 * Manages saving and restoring checked ingredient selections
 * across browser sessions.
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'shortspork_pantry';

    /**
     * Save the current list of checked ingredient IDs to localStorage
     * @param {Array<number>} ingredientIds - Array of ingredient IDs (integers)
     */
    function savePantryState(ingredientIds) {
        try {
            const data = JSON.stringify(ingredientIds);
            localStorage.setItem(STORAGE_KEY, data);
            console.log('ShortSpork Fridge: Saved ' + ingredientIds.length + ' ingredients.');
        } catch (e) {
            console.warn('ShortSpork Fridge: Failed to save to localStorage.', e);
        }
    }

    /**
     * Load the saved list of ingredient IDs from localStorage
     * @returns {Array<number>} Array of ingredient IDs, or empty array if none found/error
     */
    function loadPantryState() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return [];

            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                // Ensure all items are numbers (integers)
                return parsed.filter(item => Number.isInteger(item));
            }
            return [];
        } catch (e) {
            console.warn('ShortSpork Fridge: Failed to load from localStorage.', e);
            return [];
        }
    }

    /**
     * Restore checkbox states based on saved pantry data
     * And triggers the search update if items were restored.
     */
    function restorePantryCheckboxes() {
        const savedIds = loadPantryState();
        if (savedIds.length === 0) return;

        console.log('ShortSpork Fridge: Restoring ' + savedIds.length + ' ingredients...');

        const checkboxes = document.querySelectorAll('.ingredient-checkbox');
        let restoredCount = 0;

        checkboxes.forEach(checkbox => {
            const id = parseInt(checkbox.dataset.ingredientId, 10);
            if (savedIds.includes(id)) {
                checkbox.checked = true;
                restoredCount++;
            }
        });

        console.log('ShortSpork Fridge: Restored ' + restoredCount + ' checkboxes.');
    }

    /**
     * Clear the saved pantry state from localStorage
     */
    function clearPantryState() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            console.log('ShortSpork Fridge: Pantry cleared.');
        } catch (e) {
            console.warn('ShortSpork Fridge: Failed to clear localStorage.', e);
        }
    }

    // Export functions for use in waiter.js and global scope
    window.Fridge = {
        save: savePantryState,
        load: loadPantryState,
        restore: restorePantryCheckboxes,
        clear: clearPantryState
    };

})();
