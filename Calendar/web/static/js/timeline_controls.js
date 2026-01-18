/**
 * Timeline View Controls Module
 * Manages zoom, time range, and day range for the schedule grid
 */

// Default view state
const DEFAULT_VIEW_STATE = {
    zoomLevel: 1.0,
    timeRange: { startHour: null, endHour: null }, // null = auto
    daysRange: null, // null = all days, or array of day indices [0-6]
    preset: 'auto'
};

// Zoom constraints
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.25;

// Storage key for session persistence
const STORAGE_KEY = 'timeline_view_state';

let currentState = { ...DEFAULT_VIEW_STATE };
let onStateChangeCallback = null;

/**
 * Initialize timeline controls
 * @param {Function} onStateChange - Callback when view state changes
 */
export function initTimelineControls(onStateChange) {
    onStateChangeCallback = onStateChange;

    // Load persisted state from session storage
    loadState();

    // Bind control events
    bindZoomControls();
    bindTimeRangeControls();
    bindDaysRangeControls();
    bindPresetButtons();
    bindMobileToggle();

    // Update UI to reflect current state
    updateUI();
}

/**
 * Load state from sessionStorage
 */
function loadState() {
    try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            currentState = { ...DEFAULT_VIEW_STATE, ...parsed };
        }
    } catch (e) {
        console.warn('Failed to load timeline state:', e);
    }
}

/**
 * Save state to sessionStorage
 */
function saveState() {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    } catch (e) {
        console.warn('Failed to save timeline state:', e);
    }
}

/**
 * Notify parent about state change
 */
function notifyStateChange() {
    saveState();
    updateUI();
    if (onStateChangeCallback) {
        onStateChangeCallback(currentState);
    }
}

/**
 * Update UI to reflect current state
 */
function updateUI() {
    // Update zoom level display
    const zoomDisplay = document.getElementById('zoomLevelDisplay');
    if (zoomDisplay) {
        zoomDisplay.textContent = `${currentState.zoomLevel.toFixed(2)}x`;
    }

    // Update zoom button states
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    if (zoomInBtn) zoomInBtn.disabled = currentState.zoomLevel >= MAX_ZOOM;
    if (zoomOutBtn) zoomOutBtn.disabled = currentState.zoomLevel <= MIN_ZOOM;

    // Update time range inputs
    const startHourInput = document.getElementById('startHourInput');
    const endHourInput = document.getElementById('endHourInput');
    if (startHourInput && currentState.timeRange.startHour !== null) {
        startHourInput.value = currentState.timeRange.startHour;
    }
    if (endHourInput && currentState.timeRange.endHour !== null) {
        endHourInput.value = currentState.timeRange.endHour;
    }

    // Update day checkboxes
    const dayCheckboxes = document.querySelectorAll('.day-checkbox');
    dayCheckboxes.forEach((checkbox, index) => {
        if (currentState.daysRange === null) {
            checkbox.checked = true;
        } else {
            checkbox.checked = currentState.daysRange.includes(index);
        }
    });

    // Update preset button active states
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === currentState.preset);
    });
}

/**
 * Bind zoom control events
 */
function bindZoomControls() {
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', handleZoomIn);
    }
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', handleZoomOut);
    }
}

/**
 * Handle zoom in
 */
export function handleZoomIn() {
    if (currentState.zoomLevel < MAX_ZOOM) {
        currentState.zoomLevel = Math.min(MAX_ZOOM, currentState.zoomLevel + ZOOM_STEP);
        currentState.preset = 'custom';
        notifyStateChange();
    }
}

/**
 * Handle zoom out
 */
export function handleZoomOut() {
    if (currentState.zoomLevel > MIN_ZOOM) {
        currentState.zoomLevel = Math.max(MIN_ZOOM, currentState.zoomLevel - ZOOM_STEP);
        currentState.preset = 'custom';
        notifyStateChange();
    }
}

/**
 * Bind time range control events
 */
function bindTimeRangeControls() {
    const startHourInput = document.getElementById('startHourInput');
    const endHourInput = document.getElementById('endHourInput');

    if (startHourInput) {
        startHourInput.addEventListener('change', () => {
            const start = parseInt(startHourInput.value, 10);
            const end = currentState.timeRange.endHour;
            handleTimeRangeChange(start, end);
        });
    }

    if (endHourInput) {
        endHourInput.addEventListener('change', () => {
            const start = currentState.timeRange.startHour;
            const end = parseInt(endHourInput.value, 10);
            handleTimeRangeChange(start, end);
        });
    }
}

/**
 * Handle time range change
 * @param {number|null} startHour 
 * @param {number|null} endHour 
 */
export function handleTimeRangeChange(startHour, endHour) {
    // Validate inputs
    if (startHour !== null && endHour !== null && startHour >= endHour) {
        console.warn('Invalid time range: start must be before end');
        return;
    }

    currentState.timeRange = { startHour, endHour };
    currentState.preset = 'custom';
    notifyStateChange();
}

/**
 * Bind day range control events
 */
function bindDaysRangeControls() {
    const dayCheckboxes = document.querySelectorAll('.day-checkbox');

    dayCheckboxes.forEach((checkbox, index) => {
        checkbox.addEventListener('change', () => {
            const selectedDays = [];
            document.querySelectorAll('.day-checkbox').forEach((cb, i) => {
                if (cb.checked) selectedDays.push(i);
            });
            handleDaysRangeChange(selectedDays.length === 7 ? null : selectedDays);
        });
    });
}

/**
 * Handle days range change
 * @param {number[]|null} selectedDays - Array of selected day indices, or null for all days
 */
export function handleDaysRangeChange(selectedDays) {
    if (selectedDays && selectedDays.length === 0) {
        console.warn('Must select at least one day');
        return;
    }

    currentState.daysRange = selectedDays;
    currentState.preset = 'custom';
    notifyStateChange();
}

/**
 * Bind preset button events
 */
function bindPresetButtons() {
    const presetBtns = document.querySelectorAll('.preset-btn');

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            applyPreset(btn.dataset.preset);
        });
    });
}

/**
 * Apply a preset configuration
 * @param {string} presetName - 'auto', 'work-week', 'full-week', 'weekend'
 */
export function applyPreset(presetName) {
    switch (presetName) {
        case 'auto':
            resetToAuto();
            break;
        case 'work-week':
            currentState.daysRange = [0, 1, 2, 3, 4]; // Mon-Fri
            currentState.timeRange = { startHour: 8, endHour: 18 };
            currentState.zoomLevel = 1.0;
            currentState.preset = 'work-week';
            notifyStateChange();
            break;
        case 'full-week':
            currentState.daysRange = null; // All days
            currentState.timeRange = { startHour: null, endHour: null };
            currentState.zoomLevel = 1.0;
            currentState.preset = 'full-week';
            notifyStateChange();
            break;
        case 'weekend':
            currentState.daysRange = [5, 6]; // Sat-Sun
            currentState.timeRange = { startHour: null, endHour: null };
            currentState.zoomLevel = 1.0;
            currentState.preset = 'weekend';
            notifyStateChange();
            break;
        default:
            console.warn('Unknown preset:', presetName);
    }
}

/**
 * Reset to auto-calculated range
 */
export function resetToAuto() {
    currentState = { ...DEFAULT_VIEW_STATE };
    notifyStateChange();
}

/**
 * Get current view state
 * @returns {Object} Current view state
 */
export function getCurrentViewState() {
    return { ...currentState };
}

/**
 * Bind mobile toggle control
 */
function bindMobileToggle() {
    const toggleBtn = document.getElementById('timelineControlsToggle');
    const controlsPanel = document.getElementById('timelineControlsPanel');

    if (toggleBtn && controlsPanel) {
        toggleBtn.addEventListener('click', () => {
            controlsPanel.classList.toggle('collapsed');
            toggleBtn.classList.toggle('expanded');

            // Update toggle icon
            const icon = toggleBtn.querySelector('.toggle-icon');
            if (icon) {
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            }
        });
    }
}

/**
 * Set zoom level directly
 * @param {number} level - Zoom level between MIN_ZOOM and MAX_ZOOM
 */
export function setZoomLevel(level) {
    const clampedLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level));
    currentState.zoomLevel = clampedLevel;
    currentState.preset = 'custom';
    notifyStateChange();
}
