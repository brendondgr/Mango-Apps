/**
 * Sidebar Toggle Functionality for Recipe Book App
 * (Matching the /pr/ sidebar behavior)
 */

// Global state
let isSidebarOpen = false;

/**
 * Toggle sidebar visibility
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const menuIcon = document.getElementById('sidebar-icon-menu');
    const xIcon = document.getElementById('sidebar-icon-x');

    isSidebarOpen = !isSidebarOpen;

    if (isSidebarOpen) {
        // Open sidebar
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('translate-x-0');
        sidebar.setAttribute('aria-hidden', 'false');

        // Show overlay
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        overlay.classList.add('opacity-100', 'pointer-events-auto');

        // Toggle icons (menu -> x)
        if (menuIcon) menuIcon.classList.add('opacity-0');
        if (xIcon) xIcon.classList.remove('opacity-0');

        // Update ARIA
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');

        // Prevent body scroll when sidebar is open
        document.body.style.overflow = 'hidden';
    } else {
        // Close sidebar
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('translate-x-0');
        sidebar.setAttribute('aria-hidden', 'true');

        // Hide overlay
        overlay.classList.add('opacity-0', 'pointer-events-none');
        overlay.classList.remove('opacity-100', 'pointer-events-auto');

        // Toggle icons (x -> menu)
        if (menuIcon) menuIcon.classList.remove('opacity-0');
        if (xIcon) xIcon.classList.add('opacity-0');

        // Update ARIA
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');

        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// Make function globally available
window.toggleSidebar = toggleSidebar;

/**
 * Initialize Lucide icons when page loads
 */
document.addEventListener('DOMContentLoaded', function () {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

/**
 * Close sidebar on Escape key
 */
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isSidebarOpen) {
        toggleSidebar();
    }
});
