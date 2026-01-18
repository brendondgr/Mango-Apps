/**
 * Calendar Renderer Module
 * Renders Year, Month, and Week views for the calendar
 */

import {
    parseDate, formatDate, getToday, getWeekRange, getMonthRange,
    getDatesInRange, getDayOfWeek, getDayName, getMonthName, isToday,
    getDayNumber, getMonthYear, DAY_NAMES
} from './calendar_navigation.js';
import { getColorClasses } from './color_manager.js';

/**
 * Render Year View - 12 mini-month grids
 * @param {HTMLElement} container - Container element
 * @param {number} year - Year to render
 * @param {Object} calendarConfig - Calendar configuration with entries and direct_events
 * @param {Object} callbacks - Click handlers
 */
export function renderYearView(container, year, calendarConfig, callbacks = {}) {
    container.innerHTML = '';
    container.className = 'calendar-year-view';

    for (let month = 0; month < 12; month++) {
        const miniMonth = renderMiniMonth(year, month, calendarConfig, callbacks);
        container.appendChild(miniMonth);
    }
}

/**
 * Render a mini-month for year view
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @param {Object} calendarConfig - Calendar config
 * @param {Object} callbacks - Click handlers
 * @returns {HTMLElement}
 */
function renderMiniMonth(year, month, calendarConfig, callbacks) {
    const monthDiv = document.createElement('div');
    monthDiv.className = 'calendar-mini-month';
    monthDiv.addEventListener('click', () => {
        if (callbacks.onMonthClick) {
            callbacks.onMonthClick(year, month);
        }
    });

    // Header
    const header = document.createElement('div');
    header.className = 'calendar-mini-month-header';
    header.textContent = getMonthName(month);
    monthDiv.appendChild(header);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'calendar-mini-month-grid';

    // Day headers
    for (const dayName of DAY_NAMES) {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = dayName.charAt(0);
        grid.appendChild(dayHeader);
    }

    // Get first day of month and days in month
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Day of week for first day (0=Monday in our system)
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    // Previous month days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = 0; i < startDayOfWeek; i++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell other-month';
        dayCell.textContent = prevMonthDays - startDayOfWeek + 1 + i;
        grid.appendChild(dayCell);
    }

    // Current month days
    const today = getToday();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell';
        dayCell.textContent = day;

        // Check if today
        if (dateStr === today) {
            dayCell.classList.add('today');
        }

        // Check if has schedule
        if (hasScheduleOnDate(dateStr, calendarConfig)) {
            dayCell.classList.add('has-schedule');
        }

        // Check if has direct event
        if (hasDirectEventOnDate(dateStr, calendarConfig)) {
            dayCell.classList.add('has-direct-event');
        }

        grid.appendChild(dayCell);
    }

    // Next month days to fill remaining cells
    const totalCells = grid.children.length;
    const remainingCells = 7 - ((totalCells - 7) % 7);
    if (remainingCells < 7) {
        for (let i = 1; i <= remainingCells; i++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell other-month';
            dayCell.textContent = i;
            grid.appendChild(dayCell);
        }
    }

    monthDiv.appendChild(grid);
    return monthDiv;
}

/**
 * Render Month View - full month calendar grid
 * @param {HTMLElement} container - Container element
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @param {Object} weekData - Data from API with events per day
 * @param {Object} colors - Color mappings
 * @param {Object} callbacks - Click handlers
 */
export function renderMonthView(container, year, month, weekData, colors, callbacks = {}) {
    container.innerHTML = '';
    container.className = 'calendar-month-view';

    // Header with day names
    const header = document.createElement('div');
    header.className = 'calendar-month-header';
    for (const dayName of DAY_NAMES) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day-name';
        dayDiv.textContent = dayName;
        header.appendChild(dayDiv);
    }
    container.appendChild(header);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'calendar-month-grid';

    // Get first day of month
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Start day of week (0=Monday)
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    // Previous month days
    const prevMonthDays = new Date(year, month, 0).getDate();
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;

    for (let i = 0; i < startDayOfWeek; i++) {
        const day = prevMonthDays - startDayOfWeek + 1 + i;
        const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        grid.appendChild(renderMonthDay(dateStr, day, true, weekData, colors, callbacks));
    }

    // Current month days
    const today = getToday();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isCurrentDay = dateStr === today;
        grid.appendChild(renderMonthDay(dateStr, day, false, weekData, colors, callbacks, isCurrentDay));
    }

    // Next month days
    const totalCells = grid.children.length;
    const rowsNeeded = Math.ceil(totalCells / 7);
    const targetCells = rowsNeeded * 7;
    const remainingCells = targetCells - totalCells;

    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let i = 1; i <= remainingCells; i++) {
        const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        grid.appendChild(renderMonthDay(dateStr, i, true, weekData, colors, callbacks));
    }

    container.appendChild(grid);
}

/**
 * Render a single day cell for month view
 * @param {string} dateStr - Date string
 * @param {number} dayNumber - Day number to display
 * @param {boolean} isOtherMonth - Whether from adjacent month
 * @param {Object} weekData - Events data
 * @param {Object} colors - Color mappings
 * @param {Object} callbacks - Click handlers
 * @param {boolean} isToday - Whether this is today
 * @returns {HTMLElement}
 */
function renderMonthDay(dateStr, dayNumber, isOtherMonth, weekData, colors, callbacks, isCurrentDay = false) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-month-day';
    dayDiv.dataset.date = dateStr;

    if (isOtherMonth) dayDiv.classList.add('other-month');
    if (isCurrentDay) dayDiv.classList.add('today');

    // Day number
    const dayNum = document.createElement('div');
    dayNum.className = 'day-number';
    dayNum.textContent = dayNumber;
    dayDiv.appendChild(dayNum);

    // Get day data
    const dayData = weekData?.[dateStr];

    // Schedule bar - render if there's a schedule for this day
    if (dayData?.schedule_filename && dayData?.schedule_name) {
        const scheduleBar = document.createElement('div');
        scheduleBar.className = 'schedule-bar';

        // Apply schedule-specific colors
        if (dayData.schedule_color) {
            scheduleBar.style.backgroundColor = dayData.schedule_color.bg;
            scheduleBar.style.color = dayData.schedule_color.text;
        }

        const scheduleText = document.createElement('span');
        scheduleText.className = 'schedule-bar-text';
        scheduleText.textContent = dayData.schedule_name;
        scheduleText.title = dayData.schedule_name; // Full name on hover
        scheduleBar.appendChild(scheduleText);

        // Optional: click handler for schedule bar
        scheduleBar.addEventListener('click', (e) => {
            e.stopPropagation();
            if (callbacks.onScheduleClick) {
                callbacks.onScheduleClick(dayData.schedule_filename, dateStr);
            }
        });

        dayDiv.appendChild(scheduleBar);
    }

    // Events container - only show DIRECT events
    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'day-events';

    if (dayData && dayData.events) {
        // Filter to only show direct events
        const directEvents = dayData.events.filter(event => event._source === 'direct');
        const maxVisible = 3;
        const visibleEvents = directEvents.slice(0, maxVisible);

        for (const event of visibleEvents) {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'calendar-month-event direct-event';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'event-name';
            nameSpan.textContent = event.title || event.name || 'Event';
            eventDiv.appendChild(nameSpan);

            if (event.start) {
                const timeStr = event.end ? `${event.start} - ${event.end}` : event.start;
                const timeSpan = document.createElement('span');
                timeSpan.className = 'event-time';
                timeSpan.textContent = timeStr;
                eventDiv.appendChild(timeSpan);
            }

            // Apply color
            const eventType = event.type || 'other';
            if (colors && colors[eventType]) {
                const colorInfo = colors[eventType];
                eventDiv.style.setProperty('--event-bg', colorInfo.bg);
                eventDiv.style.setProperty('--event-color', colorInfo.text);
            }

            eventDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                if (callbacks.onEventClick) {
                    callbacks.onEventClick(event, dateStr);
                }
            });

            eventsContainer.appendChild(eventDiv);
        }

        // Show "more" indicator for direct events only
        if (directEvents.length > maxVisible) {
            const more = document.createElement('div');
            more.className = 'calendar-month-more';
            more.textContent = `+${directEvents.length - maxVisible} more`;
            eventsContainer.appendChild(more);
        }
    }

    dayDiv.appendChild(eventsContainer);

    // Click handler
    dayDiv.addEventListener('click', () => {
        if (callbacks.onDayClick) {
            callbacks.onDayClick(dateStr);
        }
    });

    return dayDiv;
}

/**
 * Render Week View - timeline style with days as columns
 * This prepares the data for the schedule_renderer to use
 * @param {HTMLElement} container - Container element
 * @param {string} startDate - Monday of the week
 * @param {Object} weekData - Weekly data from API
 * @param {Object} colors - Color mappings
 * @param {Object} viewState - View state for timeline
 * @param {Object} callbacks - Click handlers
 */
export function renderWeekView(container, startDate, weekData, colors, viewState, callbacks = {}) {
    // Convert week data to the format expected by schedule_renderer
    const dates = getDatesInRange(startDate, getWeekRange(startDate)[1]);
    const today = getToday();

    // Build events array where day is mapped from actual date
    const events = [];

    for (let i = 0; i < dates.length; i++) {
        const dateStr = dates[i];
        const dayData = weekData?.[dateStr];

        if (dayData && dayData.events) {
            for (const event of dayData.events) {
                // Map the event to the day index (0=Monday, 6=Sunday)
                events.push({
                    ...event,
                    day: i, // 0=Monday, 6=Sunday
                    _date: dateStr,
                    _isToday: dateStr === today
                });
            }
        }
    }

    // Return the data for schedule_renderer to use
    return {
        events,
        colors,
        dates,
        weekStart: startDate,
        weekEnd: getWeekRange(startDate)[1]
    };
}

/**
 * Check if a date has a schedule assigned
 * @param {string} dateStr - Date string
 * @param {Object} calendarConfig - Calendar config
 * @returns {boolean}
 */
function hasScheduleOnDate(dateStr, calendarConfig) {
    if (!calendarConfig?.entries) return false;

    const date = parseDate(dateStr);
    for (const entry of calendarConfig.entries) {
        const start = parseDate(entry.start_date);
        const end = parseDate(entry.end_date);
        if (date >= start && date <= end) {
            return true;
        }
    }
    return false;
}

/**
 * Check if a date has direct events
 * @param {string} dateStr - Date string
 * @param {Object} calendarConfig - Calendar config
 * @returns {boolean}
 */
function hasDirectEventOnDate(dateStr, calendarConfig) {
    if (!calendarConfig?.direct_events) return false;

    return calendarConfig.direct_events.some(event => event.date === dateStr);
}
