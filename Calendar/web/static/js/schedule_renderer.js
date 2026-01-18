import { getColorClasses, isCategoryHidden } from './color_manager.js';

const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

let currentStartHour = 5;
let currentEndHour = 23;
let currentZoomLevel = 1.0;

function parseTimeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
}

function calculateTimeRange(events) {
    if (!events || events.length === 0) {
        return { startHour: 5, endHour: 23 };
    }

    let minMinutes = Infinity;
    let maxMinutes = -Infinity;

    events.forEach(evt => {
        const startMins = parseTimeToMinutes(evt.start);
        const endMins = parseTimeToMinutes(evt.end);

        minMinutes = Math.min(minMinutes, startMins);
        maxMinutes = Math.max(maxMinutes, endMins);
    });

    // Round down to the hour for start, round up to the hour for end
    const startHour = Math.floor(minMinutes / 60);
    const endHour = Math.ceil(maxMinutes / 60);

    return { startHour, endHour };
}

/**
 * Convert time string to row index (hour-based rows, 1 row per hour)
 * Returns a fractional row for precise positioning within the hour
 */
function timeToRow(timeStr, startHour) {
    const [h, m] = timeStr.split(':').map(Number);
    const hourOffset = h - startHour;
    const minuteFraction = m / 60;
    return hourOffset + minuteFraction + 2; // +2 for header row offset
}

/**
 * Format hour for display in time column
 */
function formatHour(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${period}`;
}

/**
 * Format time from minutes to HH:MM
 */
function minutesToTimeStr(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Check if two time ranges overlap
 */
function timeRangesOverlap(start1, end1, start2, end2) {
    return start1 < end2 && end1 > start2;
}

/**
 * Process events to split overwriteable events around non-overwriteable ones.
 * Returns a new array of events/segments ready for rendering.
 * 
 * @param {Array} events - Array of events for a single day
 * @returns {Array} Processed events with segments
 */
function processOverlapSegments(events) {
    // Separate overwriteable and non-overwriteable events
    const nonOverwriteable = events.filter(e => !e.overwriteable);
    const overwriteable = events.filter(e => e.overwriteable);

    const result = [];

    // Non-overwriteable events render as-is with higher z-index
    nonOverwriteable.forEach(evt => {
        result.push({
            ...evt,
            _isSegment: false,
            _zIndex: 10
        });
    });

    // Process each overwriteable event
    overwriteable.forEach(evt => {
        const evtStart = parseTimeToMinutes(evt.start);
        const evtEnd = parseTimeToMinutes(evt.end);

        // Find all non-overwriteable events that overlap with this one
        const overlaps = nonOverwriteable
            .map(ne => ({
                start: parseTimeToMinutes(ne.start),
                end: parseTimeToMinutes(ne.end)
            }))
            .filter(ne => timeRangesOverlap(evtStart, evtEnd, ne.start, ne.end))
            .sort((a, b) => a.start - b.start);

        if (overlaps.length === 0) {
            // No overlaps, render normally with lower z-index
            result.push({
                ...evt,
                _isSegment: false,
                _zIndex: 5
            });
            return;
        }

        // Calculate visible segments
        const segments = [];
        let currentPos = evtStart;

        for (const overlap of overlaps) {
            // Add segment before this overlap (if there's space)
            if (currentPos < overlap.start) {
                segments.push({
                    start: currentPos,
                    end: Math.min(overlap.start, evtEnd)
                });
            }
            // Move position past this overlap
            currentPos = Math.max(currentPos, overlap.end);
        }

        // Add remaining segment after last overlap
        if (currentPos < evtEnd) {
            segments.push({
                start: currentPos,
                end: evtEnd
            });
        }

        // Create segment events
        // Preserve original event data before overwriting with segment times
        const originalStart = evt.start;
        const originalEnd = evt.end;
        const originalDay = evt.day;

        segments.forEach((seg, idx) => {
            result.push({
                ...evt,
                start: minutesToTimeStr(seg.start),
                end: minutesToTimeStr(seg.end),
                _isSegment: true,
                _segmentIndex: idx,
                _totalSegments: segments.length,
                _zIndex: 5,
                _parentTitle: evt.title, // Keep reference to original title
                _originalStart: originalStart,
                _originalEnd: originalEnd,
                _originalDay: originalDay
            });
        });
    });

    return result;
}

/**
 * Render the schedule grid
 * @param {HTMLElement} container - Container element
 * @param {Array} events - Array of event objects
 * @param {Object} viewState - Optional view state with zoom, time range, and days range
 */
export function renderScheduleGrid(container, events, viewState = {}) {
    container.innerHTML = ''; // Clear existing

    // Extract view state with defaults
    const zoomLevel = viewState.zoomLevel || 1.0;
    const customTimeRange = viewState.timeRange || { startHour: null, endHour: null };
    const customDaysRange = viewState.daysRange || null; // null = all days

    currentZoomLevel = zoomLevel;

    // Calculate or use custom time range
    let startHour, endHour;
    if (customTimeRange.startHour !== null && customTimeRange.endHour !== null) {
        startHour = customTimeRange.startHour;
        endHour = customTimeRange.endHour;
    } else {
        const autoRange = calculateTimeRange(events);
        startHour = customTimeRange.startHour !== null ? customTimeRange.startHour : autoRange.startHour;
        endHour = customTimeRange.endHour !== null ? customTimeRange.endHour : autoRange.endHour;
    }

    currentStartHour = startHour;
    currentEndHour = endHour;

    // Filter days if custom range specified
    const days = customDaysRange !== null
        ? customDaysRange.map(i => allDays[i])
        : allDays;
    const dayIndices = customDaysRange !== null
        ? customDaysRange
        : [0, 1, 2, 3, 4, 5, 6];

    // Calculate row height based on zoom (60px per hour at 1x zoom)
    const hourHeight = 60 * zoomLevel;

    // Calculate column widths - at 1.00x zoom, fit all days without scrolling
    // Only enable scrolling when columns would be too narrow (<80px)
    const wrapper = container.parentElement;
    const availableWidth = wrapper ? wrapper.clientWidth - 20 : window.innerWidth - 40;
    const timeColWidth = 70;
    const contentWidth = availableWidth - timeColWidth;
    const columnWidth = contentWidth / days.length;
    const minColumnWidth = 80; // Minimum usable column width

    // Use flexible columns at 1.00x zoom; fixed min-width when zooming causes bunching
    const needsScroll = columnWidth < minColumnWidth;
    const columnDef = needsScroll
        ? `${minColumnWidth}px`
        : `minmax(${minColumnWidth}px, 1fr)`;

    // Update grid CSS for zoom and filtered days
    container.style.gridTemplateColumns = `${timeColWidth}px repeat(${days.length}, ${columnDef})`;
    container.style.gridAutoRows = `${hourHeight}px`;

    // Toggle scroll mode on wrapper
    if (wrapper) {
        wrapper.classList.toggle('scroll-mode', needsScroll);
    }

    // 1. Render Top-Left Corner
    const corner = document.createElement('div');
    corner.className = 'corner-cell';
    corner.innerHTML = '<i class="far fa-clock"></i>';
    container.appendChild(corner);

    // 2. Render Day Headers (filtered)
    days.forEach(day => {
        const el = document.createElement('div');
        el.className = 'header-cell';
        el.textContent = day;
        container.appendChild(el);
    });

    // 3. Render Grid Background & Time Labels (one row per hour)
    const totalHours = endHour - startHour;
    for (let h = 0; h < totalHours; h++) {
        const currentHour = startHour + h;
        const isEvenHour = h % 2 === 0;

        // Time Label for this hour
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-col time-label';
        timeLabel.style.gridRow = h + 2;
        timeLabel.style.gridColumn = 1;
        timeLabel.innerHTML = `<span class="time-font">${formatHour(currentHour)}</span>`;
        container.appendChild(timeLabel);

        // Hour cells for each day column
        for (let c = 0; c < days.length; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell hour-block';
            if (isEvenHour) cell.classList.add('hour-block-alt');
            cell.style.gridRow = h + 2;
            cell.style.gridColumn = c + 2;

            // Add click handler for creating new events
            if (viewState.onCellClick) {
                cell.classList.add('clickable-cell');
                cell.dataset.day = dayIndices[c];
                cell.dataset.hour = currentHour;
                cell.addEventListener('click', () => {
                    const startTime = `${String(currentHour).padStart(2, '0')}:00`;
                    viewState.onCellClick(dayIndices[c], startTime);
                });
            }

            container.appendChild(cell);
        }
    }

    // Calculate grid layout metrics for absolute event positioning
    const headerHeight = 40; // Fixed header row height

    // 4. Render Events (filtered by visible days and time range)
    // Group events by day for overlap processing
    const eventsByDay = {};
    dayIndices.forEach(d => eventsByDay[d] = []);

    events.forEach(evt => {
        const eventDay = evt.day !== undefined ? evt.day : 0;
        if (dayIndices.includes(eventDay)) {
            eventsByDay[eventDay].push(evt);
        }
    });

    // Process each day's events for overlaps and render
    dayIndices.forEach(dayIndex => {
        const dayEvents = eventsByDay[dayIndex];

        // Process overlaps to create segments
        const processedEvents = processOverlapSegments(dayEvents);

        processedEvents.forEach(evt => {
            const eventDay = evt.day !== undefined ? evt.day : 0;

            // Check if event is within visible time range
            const eventStartMins = parseTimeToMinutes(evt.start);
            const eventEndMins = parseTimeToMinutes(evt.end);
            const rangeStartMins = startHour * 60;
            const rangeEndMins = endHour * 60;

            // Skip events completely outside the visible range
            if (eventEndMins <= rangeStartMins || eventStartMins >= rangeEndMins) {
                return;
            }

            // Calculate position within filtered days
            const dayColumnIndex = dayIndices.indexOf(eventDay);

            // Calculate fractional row positions for precise placement
            const startRowFrac = timeToRow(evt.start, startHour);
            const endRowFrac = timeToRow(evt.end, startHour);
            const durationHours = endRowFrac - startRowFrac;

            // Calculate pixel height for layout decision
            const eventPixelHeight = durationHours * hourHeight;

            const template = document.getElementById('event-card-template');
            if (!template) return;

            const clone = template.content.cloneNode(true);
            const el = clone.querySelector('.event-card');
            const style = getColorClasses(evt.type);

            // Add data attributes for category filtering and editing
            el.setAttribute('data-category', evt.type);
            el.setAttribute('data-event-index', evt._originalIndex !== undefined ? evt._originalIndex : '');

            // Add segment indicator for split events
            if (evt._isSegment) {
                el.setAttribute('data-segment', 'true');
            }

            // Add dynamic classes
            el.className += ` ${style.bg} ${style.border} ${style.text} ${style.hover}`;

            // Apply hidden state if category is hidden
            if (isCategoryHidden(evt.type)) {
                el.classList.add('category-hidden');
            }

            // Add click handler for editing events
            if (viewState.onEventClick) {
                el.classList.add('clickable-event');
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    viewState.onEventClick(evt, evt._originalIndex);
                });
            }

            // Use absolute positioning for precise sub-hour placement
            el.style.position = 'absolute';
            el.style.top = `${headerHeight + (startRowFrac - 2) * hourHeight}px`;
            el.style.height = `${eventPixelHeight - 2}px`; // -2 for small gap
            el.style.left = `calc(${timeColWidth}px + ${dayColumnIndex} * ((100% - ${timeColWidth}px) / ${days.length}))`;
            el.style.width = `calc((100% - ${timeColWidth}px) / ${days.length} - 2px)`;

            // Apply z-index based on overwriteable status
            el.style.zIndex = evt._zIndex || 5;

            // Choose layout based on height thresholds
            // Tiny: <25px - title only
            // Compact: 25-55px - title + time stacked
            // Normal: >55px - full layout with optional sub
            const useTinyLayout = eventPixelHeight < 25;
            const useCompactLayout = eventPixelHeight >= 25 && eventPixelHeight < 55;
            const displayTitle = evt._isSegment ? (evt._parentTitle || evt.title) : evt.title;

            if (useTinyLayout) {
                // Very short events - show title only
                const tinyLayout = el.querySelector('.tiny-layout');
                tinyLayout.classList.remove('hidden');
                tinyLayout.querySelector('.tiny-title').textContent = displayTitle;
            } else if (useCompactLayout) {
                // Short events - title prioritized, time below if space
                const smallLayout = el.querySelector('.small-layout');
                smallLayout.classList.remove('hidden');
                smallLayout.querySelector('.small-title').textContent = displayTitle;

                // Only show time if there's room (30px+ means we can fit title + time)
                if (eventPixelHeight >= 35) {
                    smallLayout.querySelector('.small-time').textContent = `${evt.start}-${evt.end}`;
                } else {
                    smallLayout.querySelector('.small-time').style.display = 'none';
                }
            } else {
                // Normal layout for taller events
                const normalLayout = el.querySelector('.normal-layout');
                normalLayout.classList.remove('hidden');
                normalLayout.querySelector('.event-title').textContent = displayTitle;

                if (evt.sub && eventPixelHeight > 70) {
                    const subEl = normalLayout.querySelector('.event-sub');
                    subEl.textContent = evt.sub;
                    subEl.classList.remove('hidden');
                }

                normalLayout.querySelector('.event-time-block').textContent = `${evt.start} - ${evt.end}`;
            }

            container.appendChild(el);
        });
    });

    // Scroll to a reasonable starting position (first hour or slightly before)
    setTimeout(() => {
        // Try to scroll to show the first event with some context
        const firstEventHour = Math.floor(parseTimeToMinutes(events[0]?.start || `${startHour}:00`) / 60);
        const scrollTargetHour = Math.max(startHour, firstEventHour - 1);
        const hourOffset = scrollTargetHour - startHour;
        // Scroll the wrapper element, not the container
        const wrapper = container.parentElement;
        if (wrapper && wrapper.classList.contains('schedule-wrapper')) {
            wrapper.scrollTop = Math.max(0, (hourOffset * hourHeight) - 40);
        } else {
            container.scrollTop = Math.max(0, (hourOffset * hourHeight) - 40);
        }
    }, 100);
}

