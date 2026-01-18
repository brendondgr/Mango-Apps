/**
 * Toast Notification System
 * Provides slide-in notifications with auto-dismiss
 */

const TOAST_DURATION = 5000; // 5 seconds

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of toast: 'success', 'error', 'info'
 */
export function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.warn('Toast container not found');
        return;
    }

    const toast = createToastElement(message, type);
    container.appendChild(toast);

    // Trigger reflow for animation
    toast.offsetHeight;

    // Auto-dismiss after duration
    const timeoutId = setTimeout(() => {
        dismissToast(toast);
    }, TOAST_DURATION);

    // Store timeout ID for manual dismiss
    toast.dataset.timeoutId = timeoutId;
}

/**
 * Create a toast DOM element
 */
function createToastElement(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icon = getIconForType(type);

    toast.innerHTML = `
        <div class="toast__icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="toast__content">
            <p class="toast__message">${escapeHtml(message)}</p>
        </div>
        <button class="toast__close" aria-label="Dismiss">
            <i class="fas fa-times"></i>
        </button>
        <div class="toast__progress"></div>
    `;

    // Add click handler for dismiss button
    const closeBtn = toast.querySelector('.toast__close');
    closeBtn.addEventListener('click', () => {
        const timeoutId = toast.dataset.timeoutId;
        if (timeoutId) clearTimeout(parseInt(timeoutId));
        dismissToast(toast);
    });

    return toast;
}

/**
 * Get Font Awesome icon class for toast type
 */
function getIconForType(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'info':
        default:
            return 'fa-info-circle';
    }
}

/**
 * Dismiss a toast with animation
 */
function dismissToast(toast) {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => {
        toast.remove();
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Convenience methods
export const toast = {
    success: (message) => showToast(message, 'success'),
    error: (message) => showToast(message, 'error'),
    info: (message) => showToast(message, 'info')
};
