import { fetchSchedule, uploadSchedule, fetchInstructions, deleteSchedule } from './api.js';
import { toast } from './toast.js';
import { setButtonLoading, resetButton } from './loading.js';

export function initScheduleSelector(schedules, onSelect) {
    const selector = document.getElementById('scheduleSelector');
    selector.innerHTML = '';

    schedules.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name.replace('.json', '');
        selector.appendChild(option);
    });

    selector.addEventListener('change', (e) => {
        onSelect(e.target.value);
    });
}

// --- Upload Modal ---
export function initUploadModal(onUploadSuccess) {
    const btn = document.getElementById('uploadBtn');
    const modal = document.getElementById('uploadModal');
    const closeBtn = document.getElementById('closeUpload');
    const cancelBtn = document.getElementById('cancelUpload');
    const submit = document.getElementById('submitUpload');
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const selectedFile = document.getElementById('selectedFile');
    const selectedFileName = document.getElementById('selectedFileName');
    const clearFile = document.getElementById('clearFile');

    // Open modal
    btn.onclick = () => openModal(modal);

    // Close modal
    const closeModal = () => closeModalElement(modal);
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;

    // Click outside to close
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    // Drop zone click opens file picker
    if (dropZone) {
        dropZone.onclick = () => fileInput.click();

        // Drag and drop handlers
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].name.endsWith('.json')) {
                fileInput.files = files;
                showSelectedFile(files[0].name);
            } else {
                toast.error("Please select a .json file");
            }
        });
    }

    // File input change
    fileInput.onchange = () => {
        if (fileInput.files.length > 0) {
            showSelectedFile(fileInput.files[0].name);
        }
    };

    // Clear file
    if (clearFile) {
        clearFile.onclick = (e) => {
            e.stopPropagation();
            fileInput.value = '';
            hideSelectedFile();
        };
    }

    function showSelectedFile(name) {
        if (selectedFile && selectedFileName) {
            selectedFileName.textContent = name;
            selectedFile.classList.remove('hidden');
            if (dropZone) dropZone.classList.add('hidden');
        }
    }

    function hideSelectedFile() {
        if (selectedFile) selectedFile.classList.add('hidden');
        if (dropZone) dropZone.classList.remove('hidden');
    }

    // Submit upload
    submit.onclick = async () => {
        const file = fileInput.files[0];
        if (!file) {
            toast.error("Please select a file first.");
            return;
        }

        setButtonLoading(submit, 'Uploading...');

        try {
            await uploadSchedule(file);
            closeModal();
            hideSelectedFile();
            fileInput.value = '';
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            toast.error("Error uploading: " + err.message);
        } finally {
            resetButton(submit);
        }
    };
}

// --- Info Modal ---
export function initInfoModal() {
    const btn = document.getElementById('infoBtn');
    const modal = document.getElementById('infoModal');
    const closeBtn = document.getElementById('closeInfo');
    const content = document.getElementById('infoContent');
    const copyBtn = document.getElementById('copyInstructions');

    btn.onclick = async () => {
        try {
            const text = await fetchInstructions();
            content.textContent = text;
            openModal(modal);
        } catch (err) {
            toast.error("Error loading instructions.");
        }
    };

    if (closeBtn) {
        closeBtn.onclick = () => closeModalElement(modal);
    }

    // Click outside to close
    modal.onclick = (e) => {
        if (e.target === modal) closeModalElement(modal);
    };

    // Copy to clipboard
    if (copyBtn) {
        copyBtn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(content.textContent);
                toast.success("Copied to clipboard!");
            } catch (err) {
                toast.error("Failed to copy to clipboard");
            }
        };
    }
}

// --- View Toggle (Segmented Control) ---
export function initViewToggle() {
    // Select all instances of the toggle (mobile and desktop)
    const toggleInstances = document.querySelectorAll('.view-mode-toggle');

    toggleInstances.forEach(control => {
        const timelineBtn = control.querySelector('[data-view="timeline"]');
        const summaryBtn = control.querySelector('[data-view="summary"]');
        const indicator = control.querySelector('.toggle-indicator');

        if (!timelineBtn || !summaryBtn || !indicator) return;

        // Initialize indicator position
        // We need to wait for layout or do it immediately if visible
        // Since one might be hidden, we can try to update both but requestAnimationFrame helps
        requestAnimationFrame(() => updateIndicator(timelineBtn, indicator));

        // Shared click handler to sync all instances
        const handleClick = (e) => {
            const btn = e.currentTarget;
            const view = btn.dataset.view;
            const isSummary = view === 'summary';

            // Sync ALL instances
            syncAllToggles(view);

            // Trigger app state change
            handleViewToggle(isSummary);
        };

        timelineBtn.addEventListener('click', handleClick);
        summaryBtn.addEventListener('click', handleClick);
    });

    // Helper to sync visual state across all instances
    function syncAllToggles(activeView) {
        const allInstances = document.querySelectorAll('.view-mode-toggle');
        allInstances.forEach(control => {
            const btns = control.querySelectorAll('.toggle-btn');
            const indicator = control.querySelector('.toggle-indicator');

            btns.forEach(btn => {
                const isActive = btn.dataset.view === activeView;
                btn.classList.toggle('active', isActive);
                if (isActive) {
                    updateIndicator(btn, indicator);
                }
            });
        });
    }
}

function updateIndicator(activeBtn, indicator) {
    // If the element is not visible (e.g. mobile toggle on desktop), getBoundingClientRect might be all 0.
    // However, we only strictly need it for the visible one. 
    // If it's hidden, width will be 0, which is fine as it's hidden.

    const control = activeBtn.parentElement;
    const controlRect = control.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    // Safety check for hidden elements
    if (controlRect.width === 0 || btnRect.width === 0) return;

    // Relative position
    const left = btnRect.left - controlRect.left;

    indicator.style.width = `${btnRect.width}px`;
    indicator.style.transform = `translateX(${left}px)`;
}

export function handleViewToggle(isSummary) {
    const scheduleWrapper = document.querySelector('.schedule-wrapper');
    const statsContainer = document.getElementById('statsContainer');
    const tagsRow = document.querySelector('.tags-row');

    if (isSummary) {
        if (scheduleWrapper) scheduleWrapper.classList.add('hidden');
        if (statsContainer) statsContainer.classList.remove('hidden');
        if (tagsRow) tagsRow.classList.add('hidden');
    } else {
        if (statsContainer) statsContainer.classList.add('hidden');
        if (scheduleWrapper) scheduleWrapper.classList.remove('hidden');
        if (tagsRow) tagsRow.classList.remove('hidden');
    }
}

// --- Modal Helpers ---
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModalElement(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// --- New Schedule Modal ---
export function initNewScheduleModal(onCreateSuccess) {
    const btn = document.getElementById('newScheduleBtn');
    const modal = document.getElementById('newScheduleModal');
    const closeBtn = document.getElementById('closeNewSchedule');
    const cancelBtn = document.getElementById('cancelNewSchedule');
    const form = document.getElementById('newScheduleForm');
    const submitBtn = document.getElementById('createScheduleBtn');
    const nameInput = document.getElementById('newScheduleName');
    const descInput = document.getElementById('newScheduleDesc');

    if (!btn || !modal) return;

    btn.onclick = () => {
        form?.reset();
        openModal(modal);
        nameInput?.focus();
    };

    const closeModal = () => closeModalElement(modal);
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        if (!name) {
            toast.error('Please enter a schedule name');
            return;
        }

        // Generate filename from name
        const filename = name.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '.json';

        // Create empty schedule
        const newSchedule = {
            name: name,
            description: descInput?.value.trim() || '',
            events: []
        };

        setButtonLoading(submitBtn, 'Creating...');

        try {
            await uploadSchedule({ data: newSchedule }, filename);
            closeModal();
            toast.success(`Schedule "${name}" created!`);
            if (onCreateSuccess) onCreateSuccess(filename);
        } catch (err) {
            toast.error(err.message || 'Failed to create schedule');
        } finally {
            resetButton(submitBtn);
        }
    });
}

// --- New Event Button ---
export function initNewEventButton(onNewEvent) {
    const btns = [
        document.getElementById('newEventBtn'),
        document.getElementById('newEventBtnDesktop'),
        document.getElementById('newEventBtnMobile')
    ];

    btns.forEach(btn => {
        if (btn) {
            btn.onclick = () => onNewEvent();
        }
    });
}

// --- Delete Schedule Modal ---
export function initDeleteScheduleModal(getCurrentFilename, onDeleteSuccess) {
    const deleteBtn = document.getElementById('deleteScheduleBtn');
    const modal = document.getElementById('deleteScheduleModal');
    const scheduleNameEl = document.getElementById('deleteScheduleName');
    const cancelBtn = document.getElementById('cancelScheduleDelete');
    const confirmBtn = document.getElementById('confirmScheduleDelete');

    if (!deleteBtn || !modal) return;

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    deleteBtn.onclick = () => {
        const filename = getCurrentFilename();
        if (!filename) {
            toast.error('No schedule selected');
            return;
        }
        scheduleNameEl.textContent = filename.replace('.json', '');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    cancelBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    confirmBtn?.addEventListener('click', async () => {
        const filename = getCurrentFilename();
        if (!filename) return;

        setButtonLoading(confirmBtn, 'Deleting...');

        try {
            await deleteSchedule(filename);
            toast.success('Schedule deleted');
            closeModal();
            onDeleteSuccess?.();
        } catch (err) {
            toast.error(err.message || 'Failed to delete schedule');
        } finally {
            resetButton(confirmBtn);
        }
    });
}

