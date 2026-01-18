/**
 * URL Router Module
 * Handles client-side routing and URL synchronization
 */

const BASE_TITLE = 'Calendar/Scheduler';
const BASE_PATH = '/pr/calendar';

/**
 * Get current route information from URL
 * @returns {Object} Route info { view, schedule, date, calendarView }
 */
export function getCurrentRoute() {
    const path = window.location.pathname.replace(BASE_PATH, '') || '/';
    const searchParams = new URLSearchParams(window.location.search);

    let view = 'calendar';
    let schedule = null;

    if (path.startsWith('/editor/')) {
        view = 'schedule-editor';
        // Extract schedule name from /editor/Spring_2026.json or /editor/Spring_2026
        const parts = path.split('/');
        if (parts.length > 2) {
            schedule = decodeURIComponent(parts[2]);
            // Ensure .json extension for consistency if missing, though typically handled by loadSchedule
            if (schedule && !schedule.endsWith('.json')) {
                schedule += '.json';
            }
        }
    } else if (path.startsWith('/calendar/') || path === '/' || path === '') {
        view = 'calendar';
    }

    return {
        view,
        schedule,
        date: searchParams.get('date'),
        calendarView: searchParams.get('view')
    };
}

/**
 * Navigate to Calendar view
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} view - 'year', 'month', 'week'
 */
export function navigateToCalendar(date, view) {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (view) params.set('view', view);

    const url = `${BASE_PATH}/?${params.toString()}`;

    if (window.location.pathname !== `${BASE_PATH}/`) {
        pushState(url, 'Calendar');
    } else {
        replaceState(url, 'Calendar');
    }
}

/**
 * Navigate to Schedule Editor
 * @param {string} scheduleName - Schedule filename
 */
export function navigateToEditor(scheduleName) {
    if (!scheduleName) return;

    // Remove .json for cleaner URL if present, or keep it? 
    // User request example: /editor/schedule_name.json
    // Let's keep it consistent with the filename

    const url = `${BASE_PATH}/editor/${encodeURIComponent(scheduleName)}`;
    pushState(url, `Editor - ${scheduleName.replace('.json', '')}`);
}

/**
 * Update query parameters without changing path
 * @param {Object} params - Key-value pairs to update
 */
export function updateQueryParams(params) {
    const searchParams = new URLSearchParams(window.location.search);

    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            searchParams.delete(key);
        } else {
            searchParams.set(key, value);
        }
    });

    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    replaceState(newUrl, document.title);
}

/**
 * Push state to history
 * @param {string} url - New URL
 * @param {string} title - Page title suffix
 */
function pushState(url, title) {
    if (window.location.pathname + window.location.search === url) return;

    window.history.pushState({}, '', url);
    updateTitle(title);
}

/**
 * Replace current state in history
 * @param {string} url - New URL
 * @param {string} title - Page title suffix
 */
function replaceState(url, title) {
    if (window.location.pathname + window.location.search === url) return;

    window.history.replaceState({}, '', url);
    updateTitle(title);
}

/**
 * Update document title
 * @param {string} suffix - Title suffix
 */
function updateTitle(suffix) {
    if (suffix) {
        document.title = `${BASE_TITLE} | ${suffix}`;
    } else {
        document.title = BASE_TITLE;
    }
}

/**
 * Initialize router event listeners
 * @param {Function} onPopState - Callback when browser navigation occurs
 */
export function initRouter(onPopState) {
    window.addEventListener('popstate', (event) => {
        const route = getCurrentRoute();
        if (onPopState) {
            onPopState(route);
        }
    });
}
