/**
 * Calendar Navigation Module
 * Handles date navigation (prev/next, today) for calendar views
 */

// Day names for display
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NAMES_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Parse a date string (YYYY-MM-DD) to Date object
 * @param {string} dateStr - Date string
 * @returns {Date}
 */
export function parseDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Format Date object to YYYY-MM-DD string
 * @param {Date} date - Date object
 * @returns {string}
 */
export function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get today's date as YYYY-MM-DD
 * @returns {string}
 */
export function getToday() {
    return formatDate(new Date());
}

/**
 * Get Monday of the week containing the given date
 * @param {string} dateStr - Date string
 * @returns {string} Monday's date
 */
export function getWeekStart(dateStr) {
    const date = parseDate(dateStr);
    const day = date.getDay();
    // Convert Sunday (0) to 7 for easier Monday calculation
    const dayOfWeek = day === 0 ? 7 : day;
    const mondayOffset = dayOfWeek - 1;
    date.setDate(date.getDate() - mondayOffset);
    return formatDate(date);
}

/**
 * Get Sunday of the week containing the given date
 * @param {string} dateStr - Date string
 * @returns {string} Sunday's date
 */
export function getWeekEnd(dateStr) {
    const monday = parseDate(getWeekStart(dateStr));
    monday.setDate(monday.getDate() + 6);
    return formatDate(monday);
}

/**
 * Get week range as [monday, sunday] for the given date
 * @param {string} dateStr - Date string
 * @returns {[string, string]}
 */
export function getWeekRange(dateStr) {
    return [getWeekStart(dateStr), getWeekEnd(dateStr)];
}

/**
 * Get first day of the month
 * @param {string} dateStr - Date string
 * @returns {string}
 */
export function getMonthStart(dateStr) {
    const date = parseDate(dateStr);
    return formatDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

/**
 * Get last day of the month
 * @param {string} dateStr - Date string
 * @returns {string}
 */
export function getMonthEnd(dateStr) {
    const date = parseDate(dateStr);
    return formatDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

/**
 * Get month range as [first, last] for the given date
 * @param {string} dateStr - Date string
 * @returns {[string, string]}
 */
export function getMonthRange(dateStr) {
    return [getMonthStart(dateStr), getMonthEnd(dateStr)];
}

/**
 * Get first day of year
 * @param {string} dateStr - Date string
 * @returns {string}
 */
export function getYearStart(dateStr) {
    const date = parseDate(dateStr);
    return `${date.getFullYear()}-01-01`;
}

/**
 * Get last day of year
 * @param {string} dateStr - Date string
 * @returns {string}
 */
export function getYearEnd(dateStr) {
    const date = parseDate(dateStr);
    return `${date.getFullYear()}-12-31`;
}

/**
 * Navigate to previous period based on view type
 * @param {string} currentDate - Current focused date
 * @param {string} viewType - 'year', 'month', or 'week'
 * @returns {string} New date
 */
export function navigatePrevious(currentDate, viewType) {
    const date = parseDate(currentDate);

    switch (viewType) {
        case 'year':
            date.setFullYear(date.getFullYear() - 1);
            break;
        case 'month':
            date.setMonth(date.getMonth() - 1);
            break;
        case 'week':
            date.setDate(date.getDate() - 7);
            break;
    }

    return formatDate(date);
}

/**
 * Navigate to next period based on view type
 * @param {string} currentDate - Current focused date
 * @param {string} viewType - 'year', 'month', or 'week'
 * @returns {string} New date
 */
export function navigateNext(currentDate, viewType) {
    const date = parseDate(currentDate);

    switch (viewType) {
        case 'year':
            date.setFullYear(date.getFullYear() + 1);
            break;
        case 'month':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'week':
            date.setDate(date.getDate() + 7);
            break;
    }

    return formatDate(date);
}

/**
 * Format period label for display
 * @param {string} dateStr - Date string
 * @param {string} viewType - 'year', 'month', or 'week'
 * @returns {string} Formatted label
 */
export function formatPeriodLabel(dateStr, viewType) {
    const date = parseDate(dateStr);

    switch (viewType) {
        case 'year':
            return String(date.getFullYear());
        case 'month':
            return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
        case 'week': {
            const [weekStart, weekEnd] = getWeekRange(dateStr);
            const start = parseDate(weekStart);
            const end = parseDate(weekEnd);

            // Same month
            if (start.getMonth() === end.getMonth()) {
                return `${MONTH_NAMES_SHORT[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
            }
            // Same year, different months
            if (start.getFullYear() === end.getFullYear()) {
                return `${MONTH_NAMES_SHORT[start.getMonth()]} ${start.getDate()} - ${MONTH_NAMES_SHORT[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
            }
            // Different years
            return `${MONTH_NAMES_SHORT[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} - ${MONTH_NAMES_SHORT[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
        }
    }

    return dateStr;
}

/**
 * Get all dates in a range (inclusive)
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {string[]} Array of date strings
 */
export function getDatesInRange(startDate, endDate) {
    const dates = [];
    let current = parseDate(startDate);
    const end = parseDate(endDate);

    while (current <= end) {
        dates.push(formatDate(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

/**
 * Get day of week index (0=Monday, 6=Sunday)
 * @param {string} dateStr - Date string
 * @returns {number}
 */
export function getDayOfWeek(dateStr) {
    const date = parseDate(dateStr);
    const day = date.getDay();
    // Convert Sunday (0) to 6, and shift others down by 1
    return day === 0 ? 6 : day - 1;
}

/**
 * Get day name
 * @param {string} dateStr - Date string
 * @param {boolean} short - Use short name
 * @returns {string}
 */
export function getDayName(dateStr, short = true) {
    const dayIndex = getDayOfWeek(dateStr);
    return short ? DAY_NAMES[dayIndex] : DAY_NAMES_FULL[dayIndex];
}

/**
 * Get month name
 * @param {number} monthIndex - Month index (0-11)
 * @param {boolean} short - Use short name
 * @returns {string}
 */
export function getMonthName(monthIndex, short = false) {
    return short ? MONTH_NAMES_SHORT[monthIndex] : MONTH_NAMES[monthIndex];
}

/**
 * Check if date is today
 * @param {string} dateStr - Date string
 * @returns {boolean}
 */
export function isToday(dateStr) {
    return dateStr === getToday();
}

/**
 * Get the day number from a date
 * @param {string} dateStr - Date string
 * @returns {number}
 */
export function getDayNumber(dateStr) {
    return parseDate(dateStr).getDate();
}

/**
 * Get month and year from date
 * @param {string} dateStr - Date string
 * @returns {{month: number, year: number}}
 */
export function getMonthYear(dateStr) {
    const date = parseDate(dateStr);
    return { month: date.getMonth(), year: date.getFullYear() };
}

export { DAY_NAMES, DAY_NAMES_FULL, MONTH_NAMES, MONTH_NAMES_SHORT };
