/**
 * Loading States Manager
 * Provides skeleton loading and spinner functionality
 */

/**
 * Show loading skeleton in a container
 * @param {string} containerId - ID of the container element
 * @param {string} type - Type of skeleton: 'grid', 'cards', 'table'
 * @param {number} count - Number of skeleton items to show
 */
export function showLoading(containerId, type = 'cards', count = 5) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.classList.add('loading');

    let skeletonHtml = '';

    switch (type) {
        case 'grid':
            skeletonHtml = createGridSkeleton();
            break;
        case 'cards':
            skeletonHtml = createCardSkeletons(count);
            break;
        case 'table':
            skeletonHtml = createTableSkeleton(count);
            break;
        default:
            skeletonHtml = createCardSkeletons(count);
    }

    container.innerHTML = `<div class="skeleton-wrapper animate-fade-in">${skeletonHtml}</div>`;
}

/**
 * Hide loading skeleton from a container
 * @param {string} containerId - ID of the container element
 */
export function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.classList.remove('loading');

    const wrapper = container.querySelector('.skeleton-wrapper');
    if (wrapper) {
        wrapper.classList.add('animate-fade-out');
        setTimeout(() => wrapper.remove(), 200);
    }
}

/**
 * Create skeleton for schedule grid
 */
function createGridSkeleton() {
    let html = '<div class="skeleton skeleton-shimmer skeleton-header mb-2" style="height: 40px; border-radius: var(--radius-md);"></div>';

    // Create mock grid rows
    for (let i = 0; i < 8; i++) {
        html += `<div class="skeleton skeleton-shimmer" style="height: 60px; border-radius: var(--radius-sm); margin-bottom: 4px;"></div>`;
    }

    return html;
}

/**
 * Create skeleton cards for summary view
 */
function createCardSkeletons(count) {
    let html = '';

    for (let i = 0; i < count; i++) {
        html += `
            <div class="skeleton-card skeleton-shimmer" style="border-radius: var(--radius-lg); margin-bottom: var(--space-3);">
                <div class="p-4">
                    <div class="flex items-center justify-between">
                        <div class="skeleton skeleton-shimmer" style="width: 100px; height: 24px; border-radius: var(--radius-full);"></div>
                        <div class="skeleton skeleton-shimmer" style="width: 60px; height: 20px; border-radius: var(--radius-sm);"></div>
                    </div>
                    <div class="skeleton skeleton-shimmer mt-3" style="width: 100%; height: 6px; border-radius: var(--radius-full);"></div>
                </div>
            </div>
        `;
    }

    return html;
}

/**
 * Create skeleton for table view
 */
function createTableSkeleton(count) {
    let html = '<div class="space-y-2">';

    for (let i = 0; i < count; i++) {
        html += `
            <div class="flex items-center gap-4 p-3">
                <div class="skeleton skeleton-shimmer" style="width: 12px; height: 12px; border-radius: 50%;"></div>
                <div class="skeleton skeleton-shimmer flex-1" style="height: 16px; border-radius: var(--radius-sm);"></div>
                <div class="skeleton skeleton-shimmer" style="width: 60px; height: 16px; border-radius: var(--radius-sm);"></div>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

/**
 * Create a spinner element
 * @param {string} size - Size of spinner: 'sm', 'md', 'lg'
 * @returns {HTMLElement} Spinner element
 */
export function createSpinner(size = 'md') {
    const sizes = {
        sm: '16px',
        md: '24px',
        lg: '32px'
    };

    const spinner = document.createElement('div');
    spinner.className = 'spinner animate-spin';
    spinner.style.cssText = `
        width: ${sizes[size]};
        height: ${sizes[size]};
        border: 2px solid var(--color-border-light);
        border-top-color: var(--color-primary);
        border-radius: 50%;
    `;

    return spinner;
}

/**
 * Show inline loading spinner in a button
 * @param {HTMLElement} button - Button element
 * @param {string} loadingText - Text to show while loading
 */
export function setButtonLoading(button, loadingText = 'Loading...') {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;

    const spinner = createSpinner('sm');
    button.innerHTML = '';
    button.appendChild(spinner);
    button.appendChild(document.createTextNode(` ${loadingText}`));
}

/**
 * Reset button from loading state
 * @param {HTMLElement} button - Button element
 */
export function resetButton(button) {
    button.disabled = false;
    if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
        delete button.dataset.originalText;
    }
}
