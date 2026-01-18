/**
 * Calendar View Controller
 * Main controller for calendar functionality - handles state and coordinates rendering
 */

import {
    getToday, getWeekRange, formatPeriodLabel,
    navigatePrevious, navigateNext, parseDate, getMonthYear
} from './calendar_navigation.js';
import { renderYearView, renderMonthView, renderWeekView } from './calendar_renderer.js';
import {
    fetchCalendar, fetchCalendarWeek, fetchCalendarRange,
    addDirectEvent, updateDirectEvent, deleteDirectEvent,
    addCalendarEntry, updateCalendarEntry, deleteCalendarEntry
} from './api.js';
import { getCurrentRoute, navigateToCalendar } from './router.js';
import { renderScheduleGrid } from './schedule_renderer.js';
import { updateLegend } from './color_manager.js';
import { toast } from './toast.js';

// Calendar state
let currentDate = getToday();
let currentView = 'week'; // 'year', 'month', 'week'
let calendarConfig = null;
let weekData = null;
let colors = {};
let container = null;
let onViewChange = null;

/**
 * Initialize the calendar view
 * @param {HTMLElement} containerEl - The calendar container element
 * @param {Function} viewChangeCallback - Callback when view state changes
 */
export async function initCalendarView(containerEl, viewChangeCallback = null) {
    container = containerEl;
    onViewChange = viewChangeCallback;

    // Load calendar configuration first (priority)
    try {
        calendarConfig = await fetchCalendar();
    } catch (err) {
        console.error('Failed to load calendar config:', err);
        calendarConfig = { entries: [], direct_events: [] };
    }

    // Set up controls
    setupCalendarControls();

    // Check URL for initial state
    const route = getCurrentRoute();
    if (route.date) currentDate = route.date;
    if (route.calendarView) currentView = route.calendarView;

    // Listen for navigation events from main.js
    window.addEventListener('calendar-navigate', (e) => {
        const detail = e.detail;
        if (detail.date) currentDate = detail.date;
        if (detail.calendarView) currentView = detail.calendarView;

        // Update toggle buttons UI
        const viewButtons = document.querySelectorAll('.calendar-view-toggle button');
        viewButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === currentView);
        });

        loadAndRenderCurrentView(false); // Don't push state again
    });

    // Load current week data and render
    await loadAndRenderCurrentView(false); // Initial load, URL already set or default
}

/**
 * Set up event listeners for calendar controls
 */
function setupCalendarControls() {
    // View toggle buttons
    const viewButtons = document.querySelectorAll('.calendar-view-toggle button');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (view && view !== currentView) {
                switchView(view);
            }
        });
    });

    // Navigation buttons
    const prevBtn = document.getElementById('calendarPrevBtn');
    const nextBtn = document.getElementById('calendarNextBtn');
    const todayBtn = document.getElementById('calendarTodayBtn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => navigateToPrevious());
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => navigateToNext());
    }
    if (todayBtn) {
        todayBtn.addEventListener('click', () => navigateToToday());
    }

    // Config button
    const configBtn = document.getElementById('calendarConfigBtn');
    if (configBtn) {
        configBtn.addEventListener('click', () => openConfigModal());
    }
}

/**
 * Switch between Year/Month/Week views
 * @param {string} view - 'year', 'month', or 'week'
 */
export async function switchView(view) {
    currentView = view;

    // Update toggle buttons
    const viewButtons = document.querySelectorAll('.calendar-view-toggle button');
    viewButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Update URL
    navigateToCalendar(currentDate, currentView);

    await loadAndRenderCurrentView(false);
}

/**
 * Navigate to previous period
 */
async function navigateToPrevious() {
    currentDate = navigatePrevious(currentDate, currentView);
    navigateToCalendar(currentDate, currentView);
    await loadAndRenderCurrentView(false);
}

/**
 * Navigate to next period
 */
async function navigateToNext() {
    currentDate = navigateNext(currentDate, currentView);
    navigateToCalendar(currentDate, currentView);
    await loadAndRenderCurrentView(false);
}

/**
 * Navigate to today
 */
async function navigateToToday() {
    currentDate = getToday();
    navigateToCalendar(currentDate, currentView);
    await loadAndRenderCurrentView(false);
}

/**
 * Navigate to a specific date
 * @param {string} dateStr - Date to navigate to
 * @param {string} view - Optional view to switch to
 */
export async function navigateToDate(dateStr, view = null) {
    currentDate = dateStr;
    if (view) {
        currentView = view;

        const viewButtons = document.querySelectorAll('.calendar-view-toggle button');
        viewButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
    }

    navigateToCalendar(currentDate, currentView);
    await loadAndRenderCurrentView(false);
}

/**
 * Load data and render the current view
 * @param {boolean} updateUrl - whether to update the URL (deprecated, handled by caller)
 */
async function loadAndRenderCurrentView(updateUrl = true) {
    if (!container) return;

    // Update period label
    updatePeriodLabel();

    try {
        switch (currentView) {
            case 'year':
                await renderYear();
                break;
            case 'month':
                await renderMonth();
                break;
            case 'week':
                await renderWeek();
                break;
        }
    } catch (err) {
        console.error('Error rendering calendar view:', err);
        toast.error('Failed to load calendar data');
    }
}

/**
 * Update the period label in controls
 */
function updatePeriodLabel() {
    const label = document.getElementById('calendarDateDisplay');
    if (label) {
        label.textContent = formatPeriodLabel(currentDate, currentView);
    }
}

/**
 * Render year view
 */
async function renderYear() {
    const { year } = getMonthYear(currentDate);

    // Get the inner grid content container
    const gridContainer = container.querySelector('.calendar-grid-container');
    const weekWrapper = gridContainer?.querySelector('.schedule-wrapper');
    const gridContent = gridContainer?.querySelector('#calendarGridContent');

    // Hide week wrapper, show year view directly in grid container
    if (weekWrapper) weekWrapper.style.display = 'none';

    // Create or get year view container
    let yearContainer = gridContainer?.querySelector('.calendar-year-view');
    if (!yearContainer) {
        yearContainer = document.createElement('div');
        gridContainer?.appendChild(yearContainer);
    }
    yearContainer.style.display = '';

    // Hide month view if exists
    const monthContainer = gridContainer?.querySelector('.calendar-month-view');
    if (monthContainer) monthContainer.style.display = 'none';

    renderYearView(yearContainer, year, calendarConfig, {
        onMonthClick: (clickedYear, month) => {
            // Navigate to that month
            const newDate = `${clickedYear}-${String(month + 1).padStart(2, '0')}-01`;
            navigateToDate(newDate, 'month');
        }
    });
}

/**
 * Render month view
 */
async function renderMonth() {
    const { year, month } = getMonthYear(currentDate);

    // Get the full month range data
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

    try {
        const data = await fetchCalendarRange(startStr, endStr);
        weekData = data.days || {};
        colors = data.colors || {};

        // Update color manager for month view events
        updateLegend(colors);
    } catch (err) {
        console.error('Failed to fetch month data:', err);
        weekData = {};
    }

    // Get the inner grid content container
    const gridContainer = container.querySelector('.calendar-grid-container');
    const weekWrapper = gridContainer?.querySelector('.schedule-wrapper');

    // Hide week wrapper
    if (weekWrapper) weekWrapper.style.display = 'none';

    // Hide year view if exists
    const yearContainer = gridContainer?.querySelector('.calendar-year-view');
    if (yearContainer) yearContainer.style.display = 'none';

    // Create or get month view container
    let monthContainer = gridContainer?.querySelector('.calendar-month-view');
    if (!monthContainer) {
        monthContainer = document.createElement('div');
        gridContainer?.appendChild(monthContainer);
    }
    monthContainer.style.display = '';

    renderMonthView(monthContainer, year, month, weekData, colors, {
        onDayClick: (date) => {
            // Navigate to week view for that day
            navigateToDate(date, 'week');
        },
        onEventClick: (event, date) => {
            handleEventClick(event, date);
        }
    });
}

/**
 * Render week view
 */
async function renderWeek() {
    const [weekStart, weekEnd] = getWeekRange(currentDate);

    try {
        const data = await fetchCalendarWeek(currentDate);
        weekData = data.days || {};
        colors = data.colors || {};

        // Update color manager so getColorClasses() has the colors
        updateLegend(colors);
    } catch (err) {
        console.error('Failed to fetch week data:', err);
        weekData = {};
    }

    // Get the inner grid content container
    const gridContainer = container.querySelector('.calendar-grid-container');
    const weekWrapper = gridContainer?.querySelector('.schedule-wrapper');
    const gridContent = gridContainer?.querySelector('#calendarGridContent');

    // Show week wrapper, hide year/month views
    if (weekWrapper) weekWrapper.style.display = '';

    const yearContainer = gridContainer?.querySelector('.calendar-year-view');
    if (yearContainer) yearContainer.style.display = 'none';

    const monthContainer = gridContainer?.querySelector('.calendar-month-view');
    if (monthContainer) monthContainer.style.display = 'none';

    // Prepare data for schedule_renderer
    const weekViewData = renderWeekView(gridContent, weekStart, weekData, colors, {}, {});

    // Use the existing schedule grid renderer
    const viewState = {
        zoomLevel: 1.0,
        timeRange: {
            startHour: 5,
            endHour: 23
        },
        daysRange: [0, 1, 2, 3, 4, 5, 6],
        onCellClick: (day, startTime) => {
            // Map day index back to date
            const dates = weekViewData.dates;
            const date = dates[day];
            handleCellClick(date, startTime);
        },
        onEventClick: (eventData, eventIndex) => {
            handleEventClick(eventData, eventData._date);
        }
    };

    // Add source-based CSS classes to events
    const annotatedEvents = weekViewData.events.map((evt, idx) => ({
        ...evt,
        _originalIndex: idx,
        _cssClass: evt._source === 'direct' ? 'direct-event' :
            evt._split ? `split-event split-${evt._split}` : ''
    }));

    renderScheduleGrid(gridContent, annotatedEvents, viewState);

    // Notify view change
    if (onViewChange) {
        onViewChange({
            view: currentView,
            date: currentDate,
            weekStart,
            weekEnd,
            colors
        });
    }
}

/**
 * Handle click on empty cell
 * @param {string} date - Date string
 * @param {string} startTime - Start time HH:MM
 */
function handleCellClick(date, startTime) {
    // Open direct event creation modal
    openDirectEventModal(date, startTime);
}

/**
 * Handle click on event
 * @param {Object} event - Event data
 * @param {string} date - Date string
 */
function handleEventClick(event, date) {
    if (event._source === 'direct') {
        // Open edit modal for direct event
        openDirectEventModal(date, event.start, event);
    } else {
        // For schedule events, show info (read-only)
        toast.info(`Schedule event: ${event.title || event.name}`);
    }
}

/**
 * Open direct event creation/edit modal
 * @param {string} date - Date string
 * @param {string} startTime - Start time
 * @param {Object} existingEvent - Existing event for editing (optional)
 */
function openDirectEventModal(date, startTime, existingEvent = null) {
    const modal = document.getElementById('calendarEventModal');
    if (!modal) {
        console.error('Calendar event modal not found');
        return;
    }

    // Populate form
    const dateInput = modal.querySelector('#eventDate');
    const titleInput = modal.querySelector('#eventTitle');
    const typeInput = modal.querySelector('#eventType');
    const startInput = modal.querySelector('#eventStart');
    const endInput = modal.querySelector('#eventEnd');
    const subInput = modal.querySelector('#eventSub');
    const submitBtn = modal.querySelector('#eventSubmitBtn');
    const deleteBtn = modal.querySelector('#eventDeleteBtn');
    const modalTitle = modal.querySelector('.modal-title');

    if (dateInput) dateInput.value = date;
    if (startInput) startInput.value = startTime || '09:00';

    if (existingEvent) {
        // Edit mode
        if (modalTitle) modalTitle.textContent = 'Edit Event';
        if (titleInput) titleInput.value = existingEvent.title || '';
        if (typeInput) typeInput.value = existingEvent.type || 'other';
        if (endInput) endInput.value = existingEvent.end || '10:00';
        if (subInput) subInput.value = existingEvent.sub || '';
        if (submitBtn) submitBtn.textContent = 'Update Event';
        if (deleteBtn) deleteBtn.classList.remove('hidden');

        // Store event index for update/delete
        modal.dataset.eventIndex = existingEvent._direct_index;
    } else {
        // Create mode
        if (modalTitle) modalTitle.textContent = 'Add Event';
        if (titleInput) titleInput.value = '';
        if (typeInput) typeInput.value = 'other';
        // Calculate end time (1 hour after start)
        if (endInput) {
            const [hours, mins] = (startTime || '09:00').split(':').map(Number);
            const endHour = Math.min(hours + 1, 23);
            endInput.value = `${String(endHour).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        }
        if (subInput) subInput.value = '';
        if (submitBtn) submitBtn.textContent = 'Add Event';
        if (deleteBtn) deleteBtn.classList.add('hidden');

        delete modal.dataset.eventIndex;
    }

    // Show modal
    modal.classList.add('active');
}

/**
 * Handle direct event form submission
 * @param {Event} e - Form event
 */
export async function handleDirectEventSubmit(e) {
    e.preventDefault();

    const modal = document.getElementById('calendarEventModal');
    const form = e.target;

    const eventData = {
        date: form.querySelector('#eventDate').value,
        title: form.querySelector('#eventTitle').value,
        type: form.querySelector('#eventType').value || 'other',
        start: form.querySelector('#eventStart').value,
        end: form.querySelector('#eventEnd').value,
        sub: form.querySelector('#eventSub')?.value || ''
    };

    try {
        const eventIndex = modal.dataset.eventIndex;

        if (eventIndex !== undefined) {
            // Update existing event
            await updateDirectEvent(parseInt(eventIndex), eventData);
            toast.success('Event updated');
        } else {
            // Create new event
            await addDirectEvent(eventData);
            toast.success('Event added');
        }

        // Close modal
        closeModal(modal);

        // Reload calendar config and re-render
        calendarConfig = await fetchCalendar();
        await loadAndRenderCurrentView();

    } catch (err) {
        console.error('Failed to save event:', err);
        toast.error('Failed to save event: ' + err.message);
    }
}

/**
 * Handle direct event deletion
 */
export async function handleDirectEventDelete() {
    const modal = document.getElementById('calendarEventModal');
    const eventIndex = modal.dataset.eventIndex;

    if (eventIndex === undefined) return;

    // Show confirmation modal
    const deleteModal = document.getElementById('directEventDeleteModal');
    if (deleteModal) {
        deleteModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Set up direct event delete confirmation modal handlers
 */
export function initDirectEventDeleteModal() {
    const deleteModal = document.getElementById('directEventDeleteModal');
    const cancelBtn = document.getElementById('cancelDirectEventDelete');
    const confirmBtn = document.getElementById('confirmDirectEventDelete');

    if (!deleteModal) return;

    const closeDeleteModal = () => {
        deleteModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    cancelBtn?.addEventListener('click', closeDeleteModal);
    deleteModal?.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });

    confirmBtn?.addEventListener('click', async () => {
        const eventModal = document.getElementById('calendarEventModal');
        const eventIndex = eventModal?.dataset.eventIndex;

        if (eventIndex === undefined) return;

        try {
            await deleteDirectEvent(parseInt(eventIndex));
            toast.success('Event deleted');

            // Close both modals
            closeDeleteModal();
            closeModal(eventModal);

            // Reload and re-render
            calendarConfig = await fetchCalendar();
            await loadAndRenderCurrentView();

        } catch (err) {
            console.error('Failed to delete event:', err);
            toast.error('Failed to delete event: ' + err.message);
        }
    });
}

/**
 * Open calendar config modal
 */
function openConfigModal() {
    const modal = document.getElementById('calendarConfigModal');
    if (!modal) return;

    // Populate entries list
    renderConfigEntries();

    modal.classList.add('active');
}

/**
 * Render calendar configuration entries
 */
export function renderConfigEntries() {
    const list = document.getElementById('calendarEntryList');
    if (!list || !calendarConfig) return;

    list.innerHTML = '';

    if (!calendarConfig.entries || calendarConfig.entries.length === 0) {
        list.innerHTML = '<div class="text-sm text-gray-400 p-4 text-center">No schedule mappings. Add one below.</div>';
        return;
    }

    calendarConfig.entries.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'calendar-entry-item';
        item.innerHTML = `
            <div class="calendar-entry-info">
                <div class="calendar-entry-dates">${entry.start_date} to ${entry.end_date}</div>
                <div class="calendar-entry-schedule">${entry.schedule_filename}</div>
            </div>
            <div class="calendar-entry-actions">
                <button class="edit" data-index="${index}" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="delete" data-index="${index}" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        `;

        // Event listeners
        item.querySelector('.edit').addEventListener('click', () => editConfigEntry(index));
        item.querySelector('.delete').addEventListener('click', () => deleteConfigEntry(index));

        list.appendChild(item);
    });
}

/**
 * Edit a config entry
 */
function editConfigEntry(index) {
    const entry = calendarConfig.entries[index];
    if (!entry) return;

    const form = document.getElementById('calendarEntryForm');
    if (!form) return;

    form.querySelector('#entryStartDate').value = entry.start_date;
    form.querySelector('#entryEndDate').value = entry.end_date;
    form.querySelector('#entrySchedule').value = entry.schedule_filename;
    form.dataset.editIndex = index;

    form.querySelector('button[type="submit"]').textContent = 'Update Mapping';
}

/**
 * Delete a config entry
 */
async function deleteConfigEntry(index) {
    try {
        await deleteCalendarEntry(index);
        toast.success('Schedule mapping deleted');

        calendarConfig = await fetchCalendar();
        renderConfigEntries();
        await loadAndRenderCurrentView();

    } catch (err) {
        console.error('Failed to delete entry:', err);
        toast.error('Failed to delete: ' + err.message);
    }
}

/**
 * Handle config entry form submission
 */
export async function handleConfigEntrySubmit(e) {
    e.preventDefault();

    const form = e.target;
    const entryData = {
        start_date: form.querySelector('#entryStartDate').value,
        end_date: form.querySelector('#entryEndDate').value,
        schedule_filename: form.querySelector('#entrySchedule').value
    };

    try {
        const editIndex = form.dataset.editIndex;

        if (editIndex !== undefined) {
            await updateCalendarEntry(parseInt(editIndex), entryData);
            toast.success('Mapping updated');
            delete form.dataset.editIndex;
            form.querySelector('button[type="submit"]').textContent = 'Add Mapping';
        } else {
            await addCalendarEntry(entryData);
            toast.success('Mapping added');
        }

        // Reset form
        form.reset();

        // Reload and re-render
        calendarConfig = await fetchCalendar();
        renderConfigEntries();
        await loadAndRenderCurrentView();

    } catch (err) {
        console.error('Failed to save mapping:', err);
        toast.error('Failed to save: ' + err.message);
    }
}

/**
 * Close a modal
 */
function closeModal(modal) {
    modal.classList.remove('active');
}

/**
 * Get current calendar state
 */
export function getCalendarState() {
    return {
        date: currentDate,
        view: currentView,
        config: calendarConfig,
        colors
    };
}

/**
 * Refresh calendar data
 */
export async function refreshCalendar() {
    calendarConfig = await fetchCalendar();
    await loadAndRenderCurrentView();
}
