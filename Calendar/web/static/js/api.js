const API_BASE = '/pr/calendar';

export async function fetchScheduleList() {
    const response = await fetch(`${API_BASE}/api/schedules`);
    if (!response.ok) throw new Error('Failed to fetch schedule list');
    return await response.json();
}

export async function fetchSchedule(filename) {
    const response = await fetch(`${API_BASE}/api/schedules/${filename}`);
    if (!response.ok) throw new Error('Failed to fetch schedule');
    return await response.json();
}

export async function fetchInstructions() {
    const response = await fetch(`${API_BASE}/api/instructions`);
    if (!response.ok) throw new Error('Failed to fetch instructions');
    const data = await response.json();
    return data.content;
}

export async function uploadSchedule(fileOrJson, filename = null) {
    let options = {};

    if (fileOrJson instanceof File) {
        const formData = new FormData();
        formData.append('file', fileOrJson);
        options = {
            method: 'POST',
            body: formData
        };
    } else {
        options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: filename || 'uploaded_schedule.json',
                ...fileOrJson
            })
        };
    }

    const response = await fetch(`${API_BASE}/api/schedules`, options);
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Upload failed');
    }
    return await response.json();
}

export async function createEvent(filename, eventData) {
    const response = await fetch(`${API_BASE}/api/schedules/${filename}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create event');
    }
    return await response.json();
}

export async function updateEvent(filename, index, eventData) {
    const response = await fetch(`${API_BASE}/api/schedules/${filename}/events/${index}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update event');
    }
    return await response.json();
}

export async function deleteEvent(filename, index) {
    const response = await fetch(`${API_BASE}/api/schedules/${filename}/events/${index}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete event');
    }
    return await response.json();
}

export async function deleteSchedule(filename) {
    const response = await fetch(`${API_BASE}/api/schedules/${filename}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete schedule');
    }
    return await response.json();
}

export async function updateColorMappings(filename, colorMappings) {
    const response = await fetch(`${API_BASE}/api/schedules/${filename}/color_mappings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colorMappings)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update color mappings');
    }
    return await response.json();
}

// --- Calendar API Functions ---

export async function fetchCalendar() {
    const response = await fetch(`${API_BASE}/api/calendar`);
    if (!response.ok) throw new Error('Failed to fetch calendar');
    return await response.json();
}

export async function fetchCalendarDate(date) {
    const response = await fetch(`${API_BASE}/api/calendar/date/${date}`);
    if (!response.ok) throw new Error('Failed to fetch calendar date');
    return await response.json();
}

export async function fetchCalendarWeek(date = null) {
    const url = date ? `${API_BASE}/api/calendar/week?date=${date}` : `${API_BASE}/api/calendar/week`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch calendar week');
    return await response.json();
}

export async function fetchCalendarRange(startDate, endDate) {
    const response = await fetch(`${API_BASE}/api/calendar/range?start=${startDate}&end=${endDate}`);
    if (!response.ok) throw new Error('Failed to fetch calendar range');
    return await response.json();
}

// Calendar Entry CRUD

export async function addCalendarEntry(entry) {
    const response = await fetch(`${API_BASE}/api/calendar/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to add calendar entry');
    }
    return await response.json();
}

export async function updateCalendarEntry(index, entry) {
    const response = await fetch(`${API_BASE}/api/calendar/entries/${index}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update calendar entry');
    }
    return await response.json();
}

export async function deleteCalendarEntry(index) {
    const response = await fetch(`${API_BASE}/api/calendar/entries/${index}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete calendar entry');
    }
    return await response.json();
}

// Direct Event CRUD

export async function addDirectEvent(eventData) {
    const response = await fetch(`${API_BASE}/api/calendar/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to add direct event');
    }
    return await response.json();
}

export async function updateDirectEvent(index, eventData) {
    const response = await fetch(`${API_BASE}/api/calendar/events/${index}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update direct event');
    }
    return await response.json();
}

export async function deleteDirectEvent(index) {
    const response = await fetch(`${API_BASE}/api/calendar/events/${index}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete direct event');
    }
    return await response.json();
}

