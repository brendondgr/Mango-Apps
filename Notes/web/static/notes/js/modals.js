/**
 * Modal System for Vibrant Visualizers
 * Handles opening, closing, and animations for modals.
 */

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Add active class to modal backdrop for visibility
    modal.classList.add('active');
    
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
    }, 300); // Matches CSS transition duration
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    
    // Close on backdrop click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            closeModal(e.target.id);
        }
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
});
