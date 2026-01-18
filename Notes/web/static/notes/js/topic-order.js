/**
 * Topic Order Modal - Drag and Drop Functionality
 * Handles reordering topics and toggling visibility for Course pages.
 */

let draggedRow = null;

function initTopicOrderModal() {
    const container = document.getElementById('topic-order-list');
    if (!container) return;

    const rows = container.querySelectorAll('.topic-order-row');
    
    rows.forEach(row => {
        row.setAttribute('draggable', 'true');
        
        row.addEventListener('dragstart', handleDragStart);
        row.addEventListener('dragend', handleDragEnd);
        row.addEventListener('dragover', handleDragOver);
        row.addEventListener('dragenter', handleDragEnter);
        row.addEventListener('dragleave', handleDragLeave);
        row.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    draggedRow = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.topicId);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.topic-order-row').forEach(row => {
        row.classList.remove('drag-over');
    });
    draggedRow = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    if (this !== draggedRow) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (draggedRow && this !== draggedRow) {
        const container = document.getElementById('topic-order-list');
        const rows = Array.from(container.querySelectorAll('.topic-order-row'));
        const draggedIndex = rows.indexOf(draggedRow);
        const dropIndex = rows.indexOf(this);
        
        if (draggedIndex < dropIndex) {
            this.parentNode.insertBefore(draggedRow, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedRow, this);
        }
    }
}

function saveTopicOrder() {
    const container = document.getElementById('topic-order-list');
    const rows = container.querySelectorAll('.topic-order-row');
    const courseSlug = container.dataset.courseSlug;
    
    const topicIds = [];
    const visibility = {};
    
    rows.forEach(row => {
        const topicId = row.dataset.topicId;
        const checkbox = row.querySelector('.visibility-checkbox');
        topicIds.push(parseInt(topicId));
        visibility[topicId] = checkbox.checked;
    });
    
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    fetch(`/course/${courseSlug}/update-topic-order/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
            topic_ids: topicIds,
            visibility: visibility,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal('topic-order-modal');
            // Reload page to show updated order
            window.location.reload();
        } else {
            alert('Error saving topic order: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving topic order');
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initTopicOrderModal);
