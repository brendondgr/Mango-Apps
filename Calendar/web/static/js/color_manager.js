export let currentColorScheme = {};

// Track which categories are hidden
const hiddenCategories = new Set();

export function isCategoryHidden(category) {
    return hiddenCategories.has(category);
}

export function resetCategoryVisibility() {
    hiddenCategories.clear();
    // Update all event cards to visible
    document.querySelectorAll('.event-card[data-category]').forEach(card => {
        card.classList.remove('category-hidden');
    });
    // Reset legend item styling
    document.querySelectorAll('.legend-item[data-category]').forEach(item => {
        item.classList.remove('hidden-category');
    });
}

export function toggleCategoryVisibility(category) {
    if (hiddenCategories.has(category)) {
        hiddenCategories.delete(category);
    } else {
        hiddenCategories.add(category);
    }

    const isHidden = hiddenCategories.has(category);

    // Toggle visibility of all event cards with this category
    document.querySelectorAll(`.event-card[data-category="${category}"]`).forEach(card => {
        card.classList.toggle('category-hidden', isHidden);
    });

    // Update legend item styling
    const legendItem = document.querySelector(`.legend-item[data-category="${category}"]`);
    if (legendItem) {
        legendItem.classList.toggle('hidden-category', isHidden);
    }
}

export function updateLegend(colorScheme) {
    currentColorScheme = colorScheme;
    const legendContainer = document.getElementById('categoryLegend');
    const template = document.getElementById('legend-item-template');

    if (!legendContainer || !template) return;

    legendContainer.innerHTML = '';

    // Sort keys mostly for stability, or custom order if provided
    Object.keys(colorScheme).sort().forEach(type => {
        const style = colorScheme[type];
        const clone = template.content.cloneNode(true);

        const legendItem = clone.querySelector('.legend-item');
        legendItem.setAttribute('data-category', type);

        // Apply hidden styling if this category was previously hidden
        if (hiddenCategories.has(type)) {
            legendItem.classList.add('hidden-category');
        }

        const colorDiv = clone.querySelector('.legend-color');
        // Add classes safely, keeping base classes
        colorDiv.className = `legend-color w-3 h-3 rounded border ${style.bg} ${style.border}`;

        clone.querySelector('.legend-label').textContent = type;

        // Add click handler for toggling visibility
        legendItem.addEventListener('click', () => {
            toggleCategoryVisibility(type);
        });

        legendContainer.appendChild(clone);
    });
}

export function getColorClasses(type) {
    return currentColorScheme[type] || {
        bg: 'bg-gray-100',
        border: 'border-gray-400',
        text: 'text-gray-800',
        hover: 'hover:bg-gray-200'
    };
}

export function getHiddenCategories() {
    return Array.from(hiddenCategories);
}
