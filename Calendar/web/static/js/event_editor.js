/**
 * Event Editor Module
 * Handles create, edit, and delete operations for schedule events
 */

import { createEvent, updateEvent, deleteEvent, updateColorMappings } from './api.js';
import { toast } from './toast.js';
import { setButtonLoading, resetButton } from './loading.js';
import { PREDEFINED_COLORS } from './color_palette.js';

// State
let currentEditIndex = null;
let currentFilename = null;
let onSaveCallback = null;
let availableTypes = [];
let colorMappings = {};  // Maps type -> color_name
let timestampEntries = []; // Array of { id, day: [], start: '', end: '' }

// DOM Elements
let modal, form, titleInput, typeSelect, subInput;
let timestampEntriesContainer, addTimestampBtn;
let overwriteableToggle;
let saveBtn, deleteBtn, deleteConfirmModal, colorSelect;

/**
 * Initialize the event editor module
 * @param {Function} onSave - Callback after successful save/delete
 */
export function initEventEditor(onSave) {
    onSaveCallback = onSave;

    // Cache DOM elements
    modal = document.getElementById('eventEditorModal');
    form = document.getElementById('eventEditorForm');
    titleInput = document.getElementById('eventTitle');
    typeSelect = document.getElementById('eventType');
    subInput = document.getElementById('eventSub');
    timestampEntriesContainer = document.getElementById('timestampEntries');
    addTimestampBtn = document.getElementById('addTimestampBtn');
    overwriteableToggle = document.getElementById('eventOverwriteable');
    saveBtn = document.getElementById('saveEventBtn');
    deleteBtn = document.getElementById('deleteEventBtn');
    deleteConfirmModal = document.getElementById('deleteConfirmModal');
    colorSelect = document.getElementById('colorSelect');

    // Initialize color dropdown
    initColorDropdown();

    // Event listeners
    document.getElementById('closeEventEditor')?.addEventListener('click', closeModal);
    document.getElementById('cancelEventEditor')?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    form?.addEventListener('submit', handleSubmit);
    deleteBtn?.addEventListener('click', showDeleteConfirm);
    addTimestampBtn?.addEventListener('click', () => addTimestampEntry());

    // Delete confirmation listeners
    document.getElementById('cancelDelete')?.addEventListener('click', hideDeleteConfirm);
    document.getElementById('confirmDelete')?.addEventListener('click', handleDelete);
    deleteConfirmModal?.addEventListener('click', (e) => {
        if (e.target === deleteConfirmModal) hideDeleteConfirm();
    });
}

/**
 * Set the current schedule filename for API calls
 * @param {string} filename 
 */
export function setCurrentFilename(filename) {
    currentFilename = filename;
}

/**
 * Set the color mappings for the current schedule
 * @param {Object} mappings - Maps type name to color name
 */
export function setColorMappings(mappings) {
    colorMappings = mappings || {};
}

/**
 * Get current color mappings (for saving)
 * @returns {Object} Current color mappings
 */
export function getColorMappings() {
    return { ...colorMappings };
}

/**
 * Update the available event types for the dropdown
 * @param {string[]} types 
 */
export function updateEventTypes(types) {
    availableTypes = types;
    if (!typeSelect) return;

    // Keep current selection if valid
    const currentValue = typeSelect.value;

    // Clear and rebuild options
    typeSelect.innerHTML = '<option value="">Select type...</option>';
    types.forEach(type => {
        const opt = document.createElement('option');
        opt.value = type;
        opt.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        typeSelect.appendChild(opt);
    });

    // Add "Custom..." option
    const customOpt = document.createElement('option');
    customOpt.value = '__custom__';
    customOpt.textContent = '+ Add custom type...';
    typeSelect.appendChild(customOpt);

    // Restore selection
    if (currentValue && types.includes(currentValue)) {
        typeSelect.value = currentValue;
    }

    // Handle type selection changes (for color sync)
    typeSelect.onchange = handleTypeChange;
}

/**
 * Initialize the color dropdown with predefined colors
 */
function initColorDropdown() {
    const dropdown = document.getElementById('colorDropdown');
    const dropdownBtn = document.getElementById('colorDropdownBtn');
    const dropdownMenu = document.getElementById('colorDropdownMenu');

    if (!dropdown || !dropdownBtn || !dropdownMenu) return;

    // Build dropdown options with visual swatches
    dropdownMenu.innerHTML = '';

    PREDEFINED_COLORS.forEach(color => {
        const option = document.createElement('div');
        option.className = 'color-dropdown-option';
        option.dataset.colorName = color.name;

        // Create the visual swatch with sample text
        const swatch = document.createElement('div');
        swatch.className = 'option-swatch';
        swatch.style.backgroundColor = color.bgHex;
        swatch.style.borderColor = color.borderHex;
        swatch.style.color = color.name === 'black' ? '#fff' : color.borderHex;
        swatch.textContent = 'Aa';

        // Create the color name text
        const nameSpan = document.createElement('span');
        nameSpan.className = 'option-name';
        const displayName = color.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        nameSpan.textContent = displayName;

        option.appendChild(swatch);
        option.appendChild(nameSpan);

        option.addEventListener('click', () => {
            selectColorOption(color);
            closeColorDropdown();
        });

        dropdownMenu.appendChild(option);
    });

    // Toggle dropdown on button click
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            closeColorDropdown();
        }
    });
}

/**
 * Close the color dropdown
 */
function closeColorDropdown() {
    const dropdown = document.getElementById('colorDropdown');
    dropdown?.classList.remove('open');
}

/**
 * Select a color option and update the display
 */
function selectColorOption(color) {
    const preview = document.querySelector('.color-swatch-preview');
    const textSpan = document.querySelector('.color-dropdown-text');

    if (preview) {
        preview.style.backgroundColor = color.bgHex;
        preview.style.borderColor = color.borderHex;
    }

    if (textSpan) {
        const displayName = color.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        textSpan.textContent = displayName;
    }

    // Update hidden input
    if (colorSelect) {
        colorSelect.value = color.name;
    }

    // Update the mapping for current type
    const currentType = typeSelect?.value;
    if (currentType && currentType !== '__custom__') {
        colorMappings[currentType] = color.name;
    }

    // Update selected state in dropdown
    document.querySelectorAll('.color-dropdown-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.colorName === color.name);
    });
}

/**
 * Handle type dropdown changes - sync color dropdown
 */
function handleTypeChange(e) {
    const selectedType = e.target.value;

    // Handle custom type creation
    if (selectedType === '__custom__') {
        const customType = prompt('Enter custom event type:');
        if (customType && customType.trim()) {
            const normalized = customType.trim().toLowerCase();
            if (!availableTypes.includes(normalized)) {
                availableTypes.push(normalized);
            }
            updateEventTypes(availableTypes);
            typeSelect.value = normalized;
            // Set default color for new type
            updateColorDropdownSelection(colorMappings[normalized] || PREDEFINED_COLORS[0].name);
        } else {
            typeSelect.value = '';
        }
        return;
    }

    // Update color dropdown to show this type's current color
    if (selectedType) {
        updateColorDropdownSelection(colorMappings[selectedType] || PREDEFINED_COLORS[0].name);
    }
}

/**
 * Update color dropdown to show selected color
 */
function updateColorDropdownSelection(colorName) {
    const color = PREDEFINED_COLORS.find(c => c.name === colorName) || PREDEFINED_COLORS[0];
    selectColorOption(color);
}

// ------------------------------------------------------------------
// Timestamp Entry Management
// ------------------------------------------------------------------

function renderTimestampEntries() {
    timestampEntriesContainer.innerHTML = '';
    timestampEntries.forEach(entry => {
        const el = createTimestampEntryElement(entry);
        timestampEntriesContainer.appendChild(el);
    });
}

function createTimestampEntryElement(entry) {
    const div = document.createElement('div');
    div.className = 'timestamp-entry';
    div.dataset.id = entry.id;

    // Day Selector Chips (Compact)
    const daySelector = document.createElement('div');
    daySelector.className = 'entry-day-selector';
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((label, idx) => {
        const chip = document.createElement('label');
        chip.className = 'mini-day-chip';
        chip.innerHTML = `${label}<input type="checkbox" value="${idx}" ${entry.day.includes(idx) ? 'checked' : ''}>`;

        chip.querySelector('input').addEventListener('change', (e) => {
            if (e.target.checked) {
                if (!entry.day.includes(idx)) entry.day.push(idx);
            } else {
                entry.day = entry.day.filter(d => d !== idx);
            }
        });

        daySelector.appendChild(chip);
    });

    // Time Inputs Row
    const timeRow = document.createElement('div');
    timeRow.className = 'timestamp-row';

    // Start Time
    const timeGroup = document.createElement('div');
    timeGroup.className = 'entry-time-group';

    const startInput = document.createElement('input');
    startInput.type = 'time';
    startInput.className = 'entry-time-input';
    startInput.value = entry.start;
    startInput.required = true;
    startInput.addEventListener('change', (e) => entry.start = e.target.value);

    const separator = document.createElement('span');
    separator.className = 'time-separator';
    separator.textContent = 'to';

    // End Time
    const endInput = document.createElement('input');
    endInput.type = 'time';
    endInput.className = 'entry-time-input';
    endInput.value = entry.end;
    endInput.required = true;
    endInput.addEventListener('change', (e) => entry.end = e.target.value);

    timeGroup.appendChild(startInput);
    timeGroup.appendChild(separator);
    timeGroup.appendChild(endInput);

    // Remove Button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-entry-btn';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.title = 'Remove time slot';
    removeBtn.addEventListener('click', () => removeTimestampEntry(entry.id));

    // Show remove button only if there's more than one entry
    if (timestampEntries.length <= 1) {
        removeBtn.style.display = 'none';
    }

    timeRow.appendChild(daySelector);
    timeRow.appendChild(timeGroup);
    timeRow.appendChild(removeBtn);

    div.appendChild(timeRow);

    return div;
}

function addTimestampEntry(initialData = null) {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const entry = initialData || {
        id,
        day: [],
        start: '',
        end: ''
    };

    // Assign ID if missing from initialData
    if (!entry.id) entry.id = id;

    timestampEntries.push(entry);
    renderTimestampEntries();
}

function removeTimestampEntry(id) {
    if (timestampEntries.length <= 1) {
        return; // Prevent removing last entry
    }
    timestampEntries = timestampEntries.filter(e => e.id !== id);
    renderTimestampEntries();
}

/**
 * Open modal for creating a new event
 * @param {number} day - Day index (0-6)
 * @param {string} startTime - Pre-filled start time (HH:MM)
 */
export function openCreateModal(day = null, startTime = null) {
    currentEditIndex = null;
    resetForm();

    // Set modal title
    document.getElementById('eventEditorTitle').innerHTML =
        '<i class="fas fa-calendar-plus"></i><span>New Event</span>';

    // Hide delete button for new events
    deleteBtn?.classList.add('hidden');

    // Reset color dropdown to first color
    updateColorDropdownSelection(PREDEFINED_COLORS[0].name);

    // Initial timestamp entry
    const initialEntry = {
        id: 'new-1',
        day: day !== null ? [day] : [],
        start: startTime || '',
        end: ''
    };

    if (startTime) {
        // Auto-fill end time 1 hour later
        const [h, m] = startTime.split(':').map(Number);
        const endH = Math.min(h + 1, 23);
        initialEntry.end = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    timestampEntries = [initialEntry];
    renderTimestampEntries();

    openModal();
}

/**
 * Open modal for editing an existing event
 * @param {Object|Array} eventDataOrSiblings - The event data, OR array of sibling events
 * @param {number} eventIndex - Index of the event in the schedule (used for saving)
 */
export function openEditModal(eventDataOrSiblings, eventIndex) {
    currentEditIndex = eventIndex;
    resetForm();

    // Set modal title
    document.getElementById('eventEditorTitle').innerHTML =
        '<i class="fas fa-edit"></i><span>Edit Event</span>';

    // Show delete button for existing events
    deleteBtn?.classList.remove('hidden');

    let mainEvent;

    if (Array.isArray(eventDataOrSiblings)) {
        // We received a list of sibling events - reconstruct structure
        mainEvent = eventDataOrSiblings[0];
        reconstructTimestampEntries(eventDataOrSiblings);
    } else {
        // Single event (legacy or edge case)
        mainEvent = eventDataOrSiblings;
        reconstructTimestampEntries([mainEvent]);
    }

    // Fill common fields from the first/main event
    titleInput.value = mainEvent.title || '';

    // Handle type
    if (mainEvent.type && !availableTypes.includes(mainEvent.type)) {
        availableTypes.push(mainEvent.type);
        updateEventTypes(availableTypes);
    }
    typeSelect.value = mainEvent.type || '';

    subInput.value = mainEvent.sub || '';
    overwriteableToggle.checked = mainEvent.overwriteable || false;

    // Show color for this type
    if (mainEvent.type) {
        updateColorDropdownSelection(colorMappings[mainEvent.type] || PREDEFINED_COLORS[0].name);
    } else {
        updateColorDropdownSelection(PREDEFINED_COLORS[0].name);
    }

    renderTimestampEntries();
    openModal();
}

function reconstructTimestampEntries(events) {
    timestampEntries = [];

    // Group events by start+end time to merge days
    const grouped = {};

    events.forEach(evt => {
        const key = `${evt.start}-${evt.end}`;
        if (!grouped[key]) {
            grouped[key] = {
                start: evt.start,
                end: evt.end,
                days: []
            };
        }

        // Add days (handle both single day int and array of ints)
        if (Array.isArray(evt.day)) {
            evt.day.forEach(d => {
                if (!grouped[key].days.includes(d)) grouped[key].days.push(d);
            });
        } else if (evt.day !== undefined) {
            if (!grouped[key].days.includes(evt.day)) grouped[key].days.push(evt.day);
        }
    });

    // Convert groups to timestamp entries
    Object.values(grouped).forEach((group, idx) => {
        timestampEntries.push({
            id: `loaded-${idx}`,
            day: group.days.sort((a, b) => a - b),
            start: group.start,
            end: group.end
        });
    });

    // Fallback if empty
    if (timestampEntries.length === 0) {
        timestampEntries.push({
            id: 'fallback',
            day: [],
            start: '',
            end: ''
        });
    }
}

function openModal() {
    modal?.classList.add('active');
    document.body.style.overflow = 'hidden';
    titleInput?.focus();
}

function closeModal() {
    modal?.classList.remove('active');
    document.body.style.overflow = '';
    currentEditIndex = null;
}

function resetForm() {
    form?.reset();
    timestampEntries = [];
}

async function handleSubmit(e) {
    e.preventDefault();

    // Validate entries
    if (timestampEntries.length === 0) {
        toast.error('At least one time slot is required');
        return;
    }

    for (const entry of timestampEntries) {
        if (entry.day.length === 0) {
            toast.error('All time slots must have at least one day selected');
            return;
        }
        if (!entry.start || !entry.end) {
            toast.error('All time slots must have a start and end time');
            return;
        }
        if (entry.start >= entry.end) {
            toast.error('End time must be after start time');
            return;
        }
    }

    if (!currentFilename) {
        toast.error('No schedule selected');
        return;
    }

    // Build event object
    const eventData = {
        title: titleInput.value.trim(),
        type: typeSelect.value,
        // We'll use the 'timestamps' field primarily now
        timestamps: timestampEntries.map(entry => ({
            day: entry.day, // array of ints
            start: entry.start,
            end: entry.end
        }))
    };

    // If only one entry, we can also use the legacy format for backward compat/cleanliness
    // But the backend expand_events supports timestamps array even for single entries.
    // Let's stick to using 'timestamps' field for cleaner separation, OR fallback to flat structure.
    // The user requirement implies support for multiple, but single is a subset.
    // To match legacy behavior exactly for single items:
    if (timestampEntries.length === 1) {
        const entry = timestampEntries[0];
        eventData.day = entry.day;
        eventData.start = entry.start;
        eventData.end = entry.end;
        // Optimization: Remove timestamps key if we want purely legacy format
        // BUT, validator requires either timestamps OR legacy fields. 
        // Let's keep data cleaner by removing timestamps if single.
        delete eventData.timestamps;
    }

    // Add optional fields
    if (subInput.value.trim()) {
        eventData.sub = subInput.value.trim();
    }

    if (overwriteableToggle.checked) {
        eventData.overwriteable = true;
    }

    // Save
    setButtonLoading(saveBtn, 'Saving...');

    try {
        // Save color mapping if changed
        const currentType = typeSelect.value;
        const selectedColor = colorSelect?.value;
        if (currentType && selectedColor) {
            colorMappings[currentType] = selectedColor;
            await updateColorMappings(currentFilename, colorMappings);
        }

        if (currentEditIndex !== null) {
            await updateEvent(currentFilename, currentEditIndex, eventData);
            toast.success('Event updated');
        } else {
            await createEvent(currentFilename, eventData);
            toast.success('Event created');
        }

        closeModal();
        onSaveCallback?.();

    } catch (err) {
        toast.error(err.message || 'Failed to save event');
    } finally {
        resetButton(saveBtn);
    }
}

function showDeleteConfirm() {
    deleteConfirmModal?.classList.add('active');
}

function hideDeleteConfirm() {
    deleteConfirmModal?.classList.remove('active');
}

async function handleDelete() {
    if (currentEditIndex === null || !currentFilename) return;

    const confirmBtn = document.getElementById('confirmDelete');
    setButtonLoading(confirmBtn, 'Deleting...');

    try {
        await deleteEvent(currentFilename, currentEditIndex);
        toast.success('Event deleted');

        hideDeleteConfirm();
        closeModal();
        onSaveCallback?.();

    } catch (err) {
        toast.error(err.message || 'Failed to delete event');
    } finally {
        resetButton(confirmBtn);
    }
}
