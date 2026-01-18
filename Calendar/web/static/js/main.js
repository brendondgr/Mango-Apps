/**
 * Main Application Entry Point
 * Initializes calendar view FIRST, then schedule editor functionality
 */

import { fetchScheduleList, fetchSchedule, fetchCalendar } from './api.js';
import { getCurrentRoute, navigateToEditor, navigateToCalendar, initRouter } from './router.js';
import { renderScheduleGrid } from './schedule_renderer.js';
import { renderSummaryTable } from './summary_table.js';
import { updateLegend, resetCategoryVisibility, getHiddenCategories } from './color_manager.js';
import { initScheduleSelector, initUploadModal, initInfoModal, initNewScheduleModal, initNewEventButton, initDeleteScheduleModal, initViewToggle } from './ui_controls.js';
import { toast } from './toast.js';
import { initTimelineControls, getCurrentViewState } from './timeline_controls.js';
import { initEventEditor, setCurrentFilename, setColorMappings, updateEventTypes, openCreateModal, openEditModal } from './event_editor.js';
import {
    initCalendarView,
    handleDirectEventSubmit,
    handleDirectEventDelete,
    handleConfigEntrySubmit,
    renderConfigEntries,
    initDirectEventDeleteModal
} from './calendar_view.js';

// State
let currentScheduleData = null;
let currentViewState = {};
let currentFilename = null;
let currentTab = 'calendar';

/**
 * Load a schedule for the Schedule Editor tab
 */
async function loadSchedule(filename, updateUrl = true) {
    try {
        if (updateUrl) {
            navigateToEditor(filename);
        }
        resetCategoryVisibility();

        const data = await fetchSchedule(filename);
        currentScheduleData = data;
        currentFilename = filename;

        setCurrentFilename(filename);
        setColorMappings(data.schedule.color_mappings || {});
        const types = Object.keys(data.colors || {});
        updateEventTypes(types);

        // Update header when in Schedule Editor tab
        if (currentTab === 'schedule-editor') {
            document.getElementById('scheduleTitle').textContent = data.schedule.name || 'Schedule';
            const desc = data.schedule.description || '';
            document.getElementById('scheduleDesc').textContent = desc.length > 120 ? desc.substring(0, 117) + '...' : desc;
        }

        updateLegend(data.colors);
        renderCurrentSchedule();
        renderSummaryTable(data.stats.by_category, data.breakdowns, data.stats.total);

    } catch (err) {
        console.error(err);
        toast.error("Failed to load schedule: " + err.message);
    }
}

/**
 * Re-render the current schedule with the current view state
 */
function renderCurrentSchedule() {
    if (!currentScheduleData) return;

    const container = document.getElementById('scheduleContainer');
    if (!container) return;

    currentViewState = getCurrentViewState();

    currentViewState.onCellClick = (day, startTime) => {
        openCreateModal(day, startTime);
    };
    currentViewState.onEventClick = (eventData, eventIndex) => {
        const indexToUse = (eventData._originalIndex !== undefined) ? eventData._originalIndex : eventIndex;

        // Find all events that share the same _originalIndex to reconstruct the full event
        const siblingEvents = currentScheduleData.schedule.events
            .map((evt, idx) => ({ ...evt, _originalIndex: (evt._original_idx !== undefined) ? evt._original_idx : idx }))
            .filter(evt => evt._originalIndex === indexToUse);

        // Sort by day for consistent ordering
        siblingEvents.sort((a, b) => {
            const dayA = Array.isArray(a.day) ? a.day[0] : a.day;
            const dayB = Array.isArray(b.day) ? b.day[0] : b.day;
            return dayA - dayB;
        });

        openEditModal(siblingEvents, indexToUse);
    };

    const annotatedEvents = currentScheduleData.schedule.events.map((evt, idx) => ({
        ...evt,
        _originalIndex: (evt._original_idx !== undefined) ? evt._original_idx : idx
    }));

    renderScheduleGrid(container, annotatedEvents, currentViewState);
}

/**
 * Handle view state changes from timeline controls
 */
function handleViewStateChange(newState) {
    currentViewState = newState;
    renderCurrentSchedule();
}

/**
 * Handle print schedule button click - generates PDF
 */
async function handlePrintSchedule() {
    if (!currentFilename || !currentScheduleData) {
        toast.error("No schedule loaded to print");
        return;
    }

    try {
        toast.info("Generating PDF...");

        // Get current view state
        const viewState = getCurrentViewState();

        // Get hidden categories
        const hiddenCategories = getHiddenCategories();

        // Build request payload - timeRange is nested in viewState
        const payload = {
            timeRange: {
                startHour: viewState.timeRange?.startHour,
                endHour: viewState.timeRange?.endHour
            },
            daysRange: viewState.daysRange,
            hiddenCategories: hiddenCategories
        };

        // Fetch PDF from backend
        // Fetch PDF from backend
        // Use hardcoded base URL for consistency with api.js
        const API_BASE = '/pr/calendar';
        const response = await fetch(`${API_BASE}/api/schedules/${currentFilename}/print`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate PDF');
        }

        // Get PDF blob and trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Get filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'schedule.pdf';
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/);
            if (match) filename = match[1];
        }

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("PDF downloaded successfully!");
    } catch (err) {
        console.error('Print error:', err);
        toast.error("Failed to generate PDF: " + err.message);
    }
}

/**
 * Switch between Calendar and Schedule Editor tabs
 */
function switchTab(tabName, updateUrl = true) {
    currentTab = tabName;

    if (updateUrl) {
        if (tabName === 'calendar') {
            navigateToCalendar();
        } else if (currentFilename) {
            navigateToEditor(currentFilename);
        }
    }

    // Update tab buttons
    const tabButtons = document.querySelectorAll('.segmented-control button[data-tab]');
    const indicator = document.getElementById('mainTabIndicator');

    tabButtons.forEach(btn => {
        const isActive = btn.dataset.tab === tabName;
        btn.classList.toggle('active', isActive);

        if (isActive && indicator) {
            const control = btn.parentElement;
            const controlRect = control.getBoundingClientRect();
            const btnRect = btn.getBoundingClientRect();
            // Adjust relative to the container
            const left = btnRect.left - controlRect.left;
            indicator.style.width = `${btnRect.width}px`;
            indicator.style.transform = `translateX(${left}px)`;
        }
    });

    // Show/hide tab content
    const calendarTab = document.getElementById('calendarTab');
    const scheduleEditorTab = document.getElementById('scheduleEditorTab');
    const scheduleEditorControls = document.getElementById('scheduleEditorControls');

    if (tabName === 'calendar') {
        calendarTab?.classList.add('active');
        scheduleEditorTab?.classList.remove('active');
        scheduleEditorControls?.classList.add('hidden');

        // Update header for calendar
        document.getElementById('scheduleTitle').textContent = 'Calendar';
        document.getElementById('scheduleDesc').textContent = 'View and manage your schedule';
    } else {
        calendarTab?.classList.remove('active');
        scheduleEditorTab?.classList.add('active');
        scheduleEditorControls?.classList.remove('hidden');
        scheduleEditorControls?.classList.add('flex');

        // Update header for current schedule
        if (currentScheduleData) {
            document.getElementById('scheduleTitle').textContent = currentScheduleData.schedule.name || 'Schedule';
            const desc = currentScheduleData.schedule.description || '';
            document.getElementById('scheduleDesc').textContent = desc.length > 120 ? desc.substring(0, 117) + '...' : desc;

            // Re-render schedule to fix layout since container is now visible
            renderCurrentSchedule();
        }
    }
}

/**
 * Initialize tab system
 */
function initTabSystem() {
    const tabButtons = document.querySelectorAll('.segmented-control button[data-tab]');
    const indicator = document.getElementById('mainTabIndicator');

    // Initial position
    const activeBtn = document.querySelector('.segmented-control button[data-tab].active');
    if (activeBtn && indicator) {
        // Tiny delay to ensure layout is computed
        setTimeout(() => {
            const control = activeBtn.parentElement;
            const controlRect = control.getBoundingClientRect();
            const btnRect = activeBtn.getBoundingClientRect();
            const left = btnRect.left - controlRect.left;
            indicator.style.width = `${btnRect.width}px`;
            indicator.style.transform = `translateX(${left}px)`;
        }, 50);
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            if (tab) switchTab(tab);
        });
    });
}

/**
 * Initialize calendar modals
 */
function initCalendarModals() {
    // Direct Event Form
    const eventForm = document.getElementById('calendarEventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', handleDirectEventSubmit);
    }

    // Delete button
    const deleteBtn = document.getElementById('eventDeleteBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDirectEventDelete);
    }

    // Initialize direct event delete confirmation modal
    initDirectEventDeleteModal();

    // Config Entry Form
    const entryForm = document.getElementById('calendarEntryForm');
    if (entryForm) {
        entryForm.addEventListener('submit', handleConfigEntrySubmit);
    }

    // Modal close handlers
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', () => {
            backdrop.closest('.modal')?.classList.add('hidden');
        });
    });

    // Add Event button in calendar controls
    const addEventBtn = document.getElementById('calendarAddEventBtn');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', () => {
            // Open event modal with today's date
            const today = new Date().toISOString().split('T')[0];
            const modal = document.getElementById('calendarEventModal');
            if (modal) {
                modal.querySelector('#eventDate').value = today;
                modal.querySelector('#eventTitle').value = '';
                modal.querySelector('#eventStart').value = '09:00';
                modal.querySelector('#eventEnd').value = '10:00';
                modal.querySelector('#eventSub').value = '';
                modal.querySelector('.modal-title').textContent = 'Add Event';
                modal.querySelector('#eventSubmitBtn').textContent = 'Add Event';
                modal.querySelector('#eventDeleteBtn').classList.add('hidden');
                delete modal.dataset.eventIndex;
                modal.classList.add('active');
            }
        });
    }
}

/**
 * Populate schedule dropdown in config modal
 */
async function populateScheduleDropdown() {
    const select = document.getElementById('entrySchedule');
    if (!select) return;

    try {
        const schedules = await fetchScheduleList();
        select.innerHTML = '<option value="">Select a schedule...</option>';
        schedules.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name.replace('.json', '');
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Failed to populate schedule dropdown:', err);
    }
}

/**
 * Main initialization
 */
async function init() {
    try {
        // Initialize Router
        initRouter((route) => {
            handlePopState(route);
        });

        // Determine initial state
        const initialRoute = getCurrentRoute();
        const startView = window.INITIAL_CONTEXT?.view || initialRoute.view || 'calendar';
        const startSchedule = window.INITIAL_CONTEXT?.schedule || initialRoute.schedule;

        // PRIORITY: Initialize Calendar FIRST
        const calendarContainer = document.getElementById('calendarTab');
        if (calendarContainer) {
            await initCalendarView(calendarContainer);
        }

        // Initialize tab system
        initTabSystem();

        // Initialize calendar modals
        initCalendarModals();

        // Populate schedule dropdown in config modal
        await populateScheduleDropdown();

        // Fetch schedule list for Schedule Editor
        const schedules = await fetchScheduleList();

        if (schedules.length > 0) {
            // Initialize Schedule Editor components
            initScheduleSelector(schedules, (filename) => loadSchedule(filename, true));

            initUploadModal(async () => {
                const newSchedules = await fetchScheduleList();
                initScheduleSelector(newSchedules, (filename) => loadSchedule(filename, true));
                await populateScheduleDropdown();
                toast.success("Schedule uploaded successfully!");
            });

            initNewScheduleModal(async (newFilename) => {
                const newSchedules = await fetchScheduleList();
                initScheduleSelector(newSchedules, (filename) => loadSchedule(filename, true));
                await populateScheduleDropdown();

                const selector = document.getElementById('scheduleSelector');
                if (selector) selector.value = newFilename;
                await loadSchedule(newFilename, true);
            });

            initNewEventButton(() => {
                openCreateModal();
            });

            // Initialize delete schedule modal
            initDeleteScheduleModal(
                () => currentFilename,
                async () => {
                    const newSchedules = await fetchScheduleList();
                    await populateScheduleDropdown();

                    if (newSchedules.length > 0) {
                        initScheduleSelector(newSchedules, (filename) => loadSchedule(filename, true));
                        await loadSchedule(newSchedules[0], true);
                    } else {
                        // No schedules left
                        currentFilename = null;
                        currentScheduleData = null;
                        showEmptyState();
                    }
                }
            );

            initTimelineControls(handleViewStateChange);

            // Initialize print buttons
            const printBtnDesktop = document.getElementById('printScheduleBtn');
            const printBtnMobile = document.getElementById('printScheduleBtnMobile');
            if (printBtnDesktop) {
                printBtnDesktop.addEventListener('click', handlePrintSchedule);
            }
            if (printBtnMobile) {
                printBtnMobile.addEventListener('click', handlePrintSchedule);
            }

            initEventEditor(async () => {
                if (currentFilename) {
                    await loadSchedule(currentFilename, false); // Don't push state on refresh
                }
            });

            // Handle initial view
            if (startView === 'schedule-editor') {
                switchTab('schedule-editor', false); // View already set in URL

                // If specific schedule requested
                if (startSchedule) {
                    // Check if exists in list
                    const exists = schedules.some(s => s === startSchedule || s === startSchedule + '.json');
                    if (exists) {
                        const selector = document.getElementById('scheduleSelector');
                        if (selector) selector.value = startSchedule.endsWith('.json') ? startSchedule : startSchedule + '.json';
                        await loadSchedule(startSchedule.endsWith('.json') ? startSchedule : startSchedule + '.json', false);
                    } else {
                        toast.error(`Schedule "${startSchedule}" not found. Loading default.`);
                        await loadSchedule(schedules[0], false);
                    }
                } else {
                    await loadSchedule(schedules[0], false);
                }
            } else {
                switchTab('calendar', false);
                // Pre-load editor in background if needed, or just leave it blank until clicked
                // But better to load one so it's ready
                await loadSchedule(schedules[0], false);
            }
        }

        initInfoModal();

        // Initialize view toggle for schedule editor (Timeline/Summary)
        // Uses the shared UI control with animation
        initViewToggle();

    } catch (err) {
        console.error('Initialization error:', err);
        toast.error("Failed to initialize application");
    }
}

/**
 * Handle browser back/forward navigation
 */
async function handlePopState(route) {
    if (route.view === 'calendar') {
        switchTab('calendar', false);
        // Calendar view updates (date/view) are handled by calendar_view.js listening to popstate or url check
        // We might need to trigger a calendar update here if calendar_view doesn't do it itself
        // But since router.js is a singleton, maybe we can expose a listener mechanism or just dispatch a custom event
        window.dispatchEvent(new CustomEvent('calendar-navigate', { detail: route }));
    } else if (route.view === 'schedule-editor') {
        switchTab('schedule-editor', false);
        if (route.schedule && route.schedule !== currentFilename) {
            const selector = document.getElementById('scheduleSelector');
            if (selector) selector.value = route.schedule;
            await loadSchedule(route.schedule, false);
        }
    }
}

/**
 * Initialize the Timeline/Summary toggle in Schedule Editor tab
 */
// Duplicate function removed in favor of ui_controls.js initViewToggle

function showEmptyState() {
    const template = document.getElementById('empty-state-template');
    if (template) {
        const scheduleWrapper = document.querySelector('.schedule-wrapper');
        if (scheduleWrapper) {
            const clone = template.content.cloneNode(true);
            scheduleWrapper.innerHTML = '';
            scheduleWrapper.appendChild(clone);
        }
    }
    toast.info("No schedules found. Upload one to get started!");
}

document.addEventListener('DOMContentLoaded', init);
