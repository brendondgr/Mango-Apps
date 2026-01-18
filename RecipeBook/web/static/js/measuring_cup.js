/**
 * ShortSpork - measuring_cup.js
 * Dynamic serving size calculator
 * 
 * Updates ingredient quantities based on user-adjusted servings
 */

(function () {
    'use strict';

    // DOM Elements
    const servingsInput = document.getElementById('servings-input');
    const decreaseBtn = document.getElementById('servings-decrease');
    const increaseBtn = document.getElementById('servings-increase');

    if (!servingsInput) {
        console.warn('Servings input not found');
        return;
    }

    // Get original servings from data attribute
    const originalServings = parseFloat(servingsInput.dataset.originalServings) || 1;

    /**
     * Initialize the serving adjuster
     */
    function initialize() {
        // Input change handler
        servingsInput.addEventListener('input', handleServingsChange);
        servingsInput.addEventListener('change', handleServingsChange);

        // Button handlers
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => adjustServings(-1));
        }
        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => adjustServings(1));
        }

        // Keyboard shortcuts for input
        servingsInput.addEventListener('keydown', handleKeydown);

        console.log('Measuring cup initialized with', originalServings, 'original servings');
    }

    /**
     * Handle keyboard input on servings field
     * @param {KeyboardEvent} event 
     */
    function handleKeydown(event) {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            adjustServings(1);
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            adjustServings(-1);
        }
    }

    /**
     * Adjust servings by a delta amount
     * @param {number} delta - Amount to change servings by
     */
    function adjustServings(delta) {
        let currentValue = parseFloat(servingsInput.value) || originalServings;
        let newValue = currentValue + delta;

        // Enforce minimum of 1
        newValue = Math.max(1, newValue);

        // Enforce maximum of 100
        newValue = Math.min(100, newValue);

        servingsInput.value = newValue;
        updateQuantities(newValue);
    }

    /**
     * Handle changes to the servings input
     */
    function handleServingsChange() {
        let newServings = parseFloat(servingsInput.value);

        // Handle edge cases
        if (isNaN(newServings) || newServings <= 0) {
            // Don't update quantities for invalid input
            // But don't reset the input either (let user finish typing)
            return;
        }

        // Clamp to reasonable range
        newServings = Math.max(0.25, Math.min(100, newServings));

        updateQuantities(newServings);
    }

    /**
     * Update all ingredient quantities based on new servings
     * @param {number} newServings - New serving count
     */
    function updateQuantities(newServings) {
        const quantityElements = document.querySelectorAll('[data-base-qty]');

        quantityElements.forEach(element => {
            const baseQty = parseFloat(element.dataset.baseQty);

            if (isNaN(baseQty)) {
                return;
            }

            // Calculate new quantity
            const newQty = baseQty * (newServings / originalServings);

            // Format the number nicely
            const formattedQty = formatQuantity(newQty);

            // Apply with smooth transition
            animateQuantityChange(element, formattedQty);
        });

        // Update ingredient replacements in instructions
        if (window.ingredientReplacer && typeof window.ingredientReplacer.updateAllInstructions === 'function') {
            window.ingredientReplacer.updateAllInstructions();
        }
    }

    /**
     * Format quantity for display
     * @param {number} qty - Raw quantity
     * @returns {string} Formatted quantity string
     */
    function formatQuantity(qty) {
        // Handle very small numbers
        if (qty < 0.01) {
            return '< 0.01';
        }

        // Check if it's a whole number
        if (Number.isInteger(qty)) {
            return qty.toString();
        }

        // Round to 2 decimal places, but remove trailing zeros
        const rounded = Math.round(qty * 100) / 100;

        // Convert common decimals to fractions for better readability
        const fraction = decimalToFraction(rounded);
        if (fraction) {
            return fraction;
        }

        // Otherwise return decimal with up to 2 places
        return rounded.toString();
    }

    /**
     * Convert common decimals to fraction strings
     * @param {number} decimal - Decimal number
     * @returns {string|null} Fraction string or null
     */
    function decimalToFraction(decimal) {
        const wholePart = Math.floor(decimal);
        const fractionalPart = decimal - wholePart;

        // Common fractions
        const fractions = {
            0.25: '¼',
            0.33: '⅓',
            0.5: '½',
            0.66: '⅔',
            0.67: '⅔',
            0.75: '¾',
            0.125: '⅛',
            0.375: '⅜',
            0.625: '⅝',
            0.875: '⅞'
        };

        // Find matching fraction (with small tolerance)
        for (const [key, symbol] of Object.entries(fractions)) {
            if (Math.abs(fractionalPart - parseFloat(key)) < 0.02) {
                if (wholePart === 0) {
                    return symbol;
                }
                return `${wholePart}${symbol}`;
            }
        }

        return null;
    }

    /**
     * Animate quantity change for smooth transitions
     * @param {HTMLElement} element - Element to update
     * @param {string} newValue - New value to display
     */
    function animateQuantityChange(element, newValue) {
        // Skip animation if value hasn't changed
        if (element.textContent === newValue) {
            return;
        }

        // Add transition class
        element.classList.add('quantity-updating');

        // Update value
        element.textContent = newValue;

        // Remove transition class after animation
        setTimeout(() => {
            element.classList.remove('quantity-updating');
        }, 200);
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
