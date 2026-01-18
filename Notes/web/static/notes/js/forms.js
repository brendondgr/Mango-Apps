/**
 * Forms Enhancement - Drag & Drop File Uploads
 * Automatically upgrades file inputs to drag-and-drop zones
 */

document.addEventListener('DOMContentLoaded', () => {
    // Find all file inputs and upgrade them
    const fileInputs = document.querySelectorAll('input[type="file"].form-input');
    fileInputs.forEach(upgradeFileInput);
});

/**
 * Upgrade a file input to a drag-and-drop zone
 */
function upgradeFileInput(input) {
    // Create wrapper
    const zone = document.createElement('div');
    zone.className = 'file-upload-zone';
    
    // Get field name for display
    const fieldName = input.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const isImage = fieldName.toLowerCase().includes('image');
    const isSvg = fieldName.toLowerCase().includes('svg');
    
    // Create zone content
    zone.innerHTML = `
        <div class="file-upload-zone__icon">${isImage ? '🖼️' : isSvg ? '📊' : '📁'}</div>
        <div class="file-upload-zone__text">Drag & drop your file here</div>
        <div class="file-upload-zone__hint">or click to browse • ${isImage ? 'PNG, JPG, WebP' : isSvg ? 'SVG files only' : 'Any file'}</div>
        <div class="file-upload-zone__browse">
            <span>📂</span> Browse Files
        </div>
    `;
    
    // Insert zone before input, then move input inside
    input.parentNode.insertBefore(zone, input);
    zone.appendChild(input);
    
    // Drag and drop handlers
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('is-dragover');
    });
    
    zone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        zone.classList.remove('is-dragover');
    });
    
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('is-dragover');
        
        if (e.dataTransfer.files.length > 0) {
            input.files = e.dataTransfer.files;
            handleFileSelect(zone, input, e.dataTransfer.files[0]);
        }
    });
    
    // File selection via click
    input.addEventListener('change', () => {
        if (input.files.length > 0) {
            handleFileSelect(zone, input, input.files[0]);
        }
    });
}

/**
 * Handle file selection - show preview
 */
function handleFileSelect(zone, input, file) {
    zone.classList.add('has-file');
    
    // Remove existing preview
    const existingPreview = zone.querySelector('.file-upload-zone__preview');
    if (existingPreview) {
        existingPreview.remove();
    }
    
    // Create preview
    const preview = document.createElement('div');
    preview.className = 'file-upload-zone__preview';
    
    // Determine preview icon
    const isImage = file.type.startsWith('image/');
    let previewIcon;
    
    if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = preview.querySelector('.file-upload-zone__preview-icon');
            if (img) {
                img.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
        previewIcon = `<img class="file-upload-zone__preview-icon" src="" alt="">`;
    } else {
        const ext = file.name.split('.').pop().toLowerCase();
        const emoji = ext === 'svg' ? '📊' : '📄';
        previewIcon = `<div class="file-upload-zone__preview-icon" style="display: flex; align-items: center; justify-content: center; background: var(--color-surface-200); font-size: 1.5rem;">${emoji}</div>`;
    }
    
    preview.innerHTML = `
        ${previewIcon}
        <span class="file-upload-zone__preview-name">${file.name}</span>
        <button type="button" class="file-upload-zone__preview-remove" title="Remove file">×</button>
    `;
    
    zone.appendChild(preview);
    
    // Hide the default content
    zone.querySelector('.file-upload-zone__icon').style.display = 'none';
    zone.querySelector('.file-upload-zone__text').style.display = 'none';
    zone.querySelector('.file-upload-zone__hint').style.display = 'none';
    zone.querySelector('.file-upload-zone__browse').style.display = 'none';
    
    // Remove button handler
    preview.querySelector('.file-upload-zone__preview-remove').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        clearFileUpload(zone, input);
    });
}

/**
 * Clear file upload and reset zone
 */
function clearFileUpload(zone, input) {
    // Clear input
    input.value = '';
    
    // Remove preview
    const preview = zone.querySelector('.file-upload-zone__preview');
    if (preview) {
        preview.remove();
    }
    
    // Reset zone state
    zone.classList.remove('has-file');
    zone.querySelector('.file-upload-zone__icon').style.display = '';
    zone.querySelector('.file-upload-zone__text').style.display = '';
    zone.querySelector('.file-upload-zone__hint').style.display = '';
    zone.querySelector('.file-upload-zone__browse').style.display = '';
}
