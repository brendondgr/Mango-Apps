/**
 * Modal System for Vibrant Visualizers
 * Handles opening, closing, animations, and form submissions for modals.
 */

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Add active class to modal backdrop for visibility
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Animate content entrance
    const content = modal.querySelector('.modal-content');
    if (content) {
        // Reset transform to initial state before animating in
        content.style.transform = 'translateY(20px) scale(0.95)';
        content.style.opacity = '0';

        // Use timeout to ensure transition triggers
        setTimeout(() => {
            content.style.transform = 'translateY(0) scale(1)';
            content.style.opacity = '1';
        }, 10);
    }

    // Focus first input for accessibility
    setTimeout(() => {
        const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea');
        if (firstInput) firstInput.focus();
    }, 300);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Animate content exit
    const content = modal.querySelector('.modal-content');
    if (content) {
        content.style.transform = 'translateY(20px) scale(0.95)';
        content.style.opacity = '0';
    }

    // Remove active class after animation completes
    setTimeout(() => {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling

        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            // Clear any error messages
            const errors = modal.querySelectorAll('.modal-error, .form-error');
            errors.forEach(e => e.remove());
        }
    }, 300); // Matches CSS transition duration
}

/**
 * Handle modal form submission via AJAX
 * @param {HTMLFormElement} form - The form element
 * @param {Object} options - Configuration options
 */
function submitModalForm(form, options = {}) {
    const panel = form.closest('.modal-form-panel');
    const modalId = form.closest('.modal-backdrop')?.id;

    // Show loading state
    if (panel) panel.classList.add('loading');

    // Create FormData
    const formData = new FormData(form);

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (panel) panel.classList.remove('loading');

            if (data.success) {
                // Close modal
                if (modalId) closeModal(modalId);

                // Redirect or refresh
                if (data.redirect_url) {
                    window.location.href = data.redirect_url;
                } else if (options.onSuccess) {
                    options.onSuccess(data);
                } else {
                    window.location.reload();
                }
            } else {
                // Show errors
                displayFormErrors(form, data.errors || { '__all__': [data.message || 'An error occurred'] });
            }
        })
        .catch(error => {
            if (panel) panel.classList.remove('loading');
            console.error('Form submission error:', error);
            displayFormErrors(form, { '__all__': ['Network error. Please try again.'] });
        });
}

/**
 * Display form errors in the modal
 */
function displayFormErrors(form, errors) {
    // Clear existing errors
    form.querySelectorAll('.modal-error, .form-error').forEach(e => e.remove());

    // Display general errors at the top
    if (errors['__all__']) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'modal-error';
        errorDiv.textContent = errors['__all__'].join(', ');
        form.insertBefore(errorDiv, form.firstChild);
    }

    // Display field-specific errors
    Object.keys(errors).forEach(fieldName => {
        if (fieldName === '__all__') return;

        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.innerHTML = errors[fieldName].map(e => `<span>⚠️ ${e}</span>`).join('');
            field.parentNode.insertBefore(errorDiv, field.nextSibling);
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {

    // Close on backdrop click (but not on content click)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            closeModal(e.target.id);
        }
    });

    // Prevent modal content clicks from closing
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-backdrop.active');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });

    // Handle modal form submissions
    document.querySelectorAll('.modal-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            submitModalForm(form);
        });
    });

    // Handle modal trigger buttons
    document.querySelectorAll('[data-modal-target]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.dataset.modalTarget;
            openModal(modalId);
        });
    });

    // Handle close buttons
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = btn.closest('.modal-backdrop');
            if (modal) closeModal(modal.id);
        });
    });
});
