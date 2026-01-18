document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const parseBtn = document.getElementById('parse-btn');
    const recipeText = document.getElementById('recipe-text');
    const parseError = document.getElementById('parse-error');
    const recipeForm = document.getElementById('recipe-form');
    const spinner = document.querySelector('.spinner');

    const ingredientsList = document.getElementById('ingredients-list');
    const stepsList = document.getElementById('steps-list');

    // Image Upload Elements
    const imageUploadZone = document.getElementById('image-upload-zone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-files-btn');
    const imagePreviewGrid = document.getElementById('image-preview-grid');
    const urlInputContainer = document.getElementById('url-input-container');
    const urlInput = document.getElementById('url-input');
    const addUrlBtn = document.getElementById('add-url-btn');
    const toggleUrlBtn = document.getElementById('toggle-url-btn');

    // Tag Clouds
    setupTagCloud('cuisine-tags', 'cuisine_region');
    setupTagCloud('meal-tags', 'meal_type');

    // Dynamic Lists (Ingredients & Steps)
    document.getElementById('add-ingredient-btn').addEventListener('click', () => addIngredientRow());
    document.getElementById('add-step-btn').addEventListener('click', () => addStepRow());

    // Image Upload Logic
    setupImageUpload();
    setupImageReordering();

    // Initial rows or Edit Mode
    if (window.EXISTING_RECIPE) {
        populateForm(window.EXISTING_RECIPE);
        document.getElementById('save-btn').textContent = "Update Recipe";
    } else {
        addIngredientRow();
        addStepRow();
    }

    // Event Delegation for remove buttons (Ingredients, Steps, Images)
    document.body.addEventListener('click', (e) => {
        // Row removal (Ingredients & Steps)
        if (e.target.classList.contains('remove-row-btn')) {
            const row = e.target.closest('.ingredient-row, .step-row');
            if (row) {
                const isStep = row.classList.contains('step-row');
                row.remove();
                if (isStep) updateStepNumbers();
            }
        }

        // Image removal
        if (e.target.closest('.remove-image-btn')) {
            const card = e.target.closest('.image-preview-card');
            if (card) {
                card.remove();
            }
        }
    });

    // AI Parse Handler
    parseBtn.addEventListener('click', async () => {
        const text = recipeText.value.trim();
        if (!text) return;

        setLoading(true);
        parseError.classList.add('hidden');
        parseError.textContent = '';

        try {
            const response = await fetch('/api/parse-recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to parse recipe');
            }

            populateForm(data);

        } catch (error) {
            parseError.textContent = error.message;
            parseError.classList.remove('hidden');
        } finally {
            setLoading(false);
        }
    });

    // Form Submission
    recipeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitError = document.getElementById('submit-error');
        submitError.classList.add('hidden');

        // Harvest data (especially dynamic lists)
        const formData = new FormData(recipeForm);
        const data = Object.fromEntries(formData.entries());

        // Handle tags manually as they are in hidden inputs updated by click
        data.cuisine_region = document.getElementById('cuisine_region').value;
        data.meal_type = document.getElementById('meal_type').value;

        // Harvest Images from Preview Grid
        const image_urls = [];
        imagePreviewGrid.querySelectorAll('.image-preview-card img').forEach(img => {
            const src = img.getAttribute('src');
            if (src) image_urls.push(src);
        });

        // Harvest Ingredients
        const ingredients = [];
        const ingRows = ingredientsList.querySelectorAll('.ingredient-row');
        ingRows.forEach(row => {
            const name = row.querySelector('[name="ing_name"]').value.trim();
            if (name) {
                ingredients.push({
                    name: name,
                    quantity: row.querySelector('[name="ing_qty"]').value,
                    unit: row.querySelector('[name="ing_unit"]').value,
                    is_optional: row.querySelector('[name="ing_optional"]').checked,
                    category: row.querySelector('[name="ing_category"]').value
                });
            }
        });

        // Harvest Steps
        const steps = [];
        const stepRows = stepsList.querySelectorAll('.step-row');
        stepRows.forEach(row => {
            const text = row.querySelector('[name="step_text"]').value.trim();
            if (text) steps.push(text);
        });

        // Validation
        if (ingredients.length === 0) {
            showError("Please add at least one ingredient.");
            return;
        }
        if (steps.length === 0) {
            showError("Please add at least one instruction step.");
            return;
        }

        const payload = {
            ...data,
            ingredients,
            steps,
            image_urls
        };

        try {
            let url = '/save-recipe';
            let method = 'POST';

            if (window.EXISTING_RECIPE) {
                url = `/update-recipe/${window.EXISTING_RECIPE.id}`;
            }

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const resData = await response.json();

            if (response.ok) {
                window.location.href = `/recipe/${resData.recipe_id}`;
            } else {
                showError(resData.error || "Failed to save recipe");
            }
        } catch (error) {
            showError(error.message);
        }
    });

    // Helpers
    function setupTagCloud(containerId, inputId) {
        const container = document.getElementById(containerId);
        const input = document.getElementById(inputId);

        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-option')) {
                e.target.classList.toggle('selected');
                updateTagInput(container, input);
            }
        });
    }

    function updateTagInput(container, input) {
        const selected = Array.from(container.querySelectorAll('.tag-option.selected'))
            .map(el => el.dataset.value);
        input.value = selected.join(',');
    }

    function addIngredientRow(data = null) {
        const template = document.getElementById('ingredient-row-template');
        const clone = template.content.cloneNode(true);
        const row = clone.querySelector('.ingredient-row'); // Get the row element

        // Setup Autocomplete Wrapper
        const input = row.querySelector('[name="ing_name"]');
        const wrapper = document.createElement('div');
        wrapper.className = 'ingredient-input-wrapper';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        // Initialize Autocomplete
        setupIngredientAutocomplete(input, row.querySelector('[name="ing_category"]'));

        if (data) {
            clone.querySelector('[name="ing_name"]').value = data.name || '';
            clone.querySelector('[name="ing_qty"]').value = data.quantity || '';
            clone.querySelector('[name="ing_unit"]').value = data.unit || '';
            clone.querySelector('[name="ing_optional"]').checked = !!data.is_optional;
            if (data.category) {
                clone.querySelector('[name="ing_category"]').value = data.category;
            }
        }

        ingredientsList.appendChild(clone);
    }

    // --- Autocomplete Functions ---

    function setupIngredientAutocomplete(input, categorySelect) {
        let debounceTimer;
        let dropdown = null;

        input.addEventListener('input', (e) => {
            const query = e.target.value.trim();

            // Clear existing dropdown
            closeDropdown();
            clearTimeout(debounceTimer);

            if (query.length < 2) return;

            debounceTimer = setTimeout(async () => {
                const results = await searchIngredients(query);
                if (results.length > 0) {
                    showDropdown(results);
                }
            }, 300);
        });

        // Close on escape
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeDropdown();
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (dropdown && !input.contains(e.target) && !dropdown.contains(e.target)) {
                closeDropdown();
            }
        });

        async function searchIngredients(query) {
            try {
                const res = await fetch(`/api/search-ingredients?q=${encodeURIComponent(query)}`);
                if (res.ok) return await res.json();
            } catch (err) {
                console.error('Search failed', err);
            }
            return [];
        }

        function showDropdown(results) {
            closeDropdown(); // Ensure clean slate

            dropdown = document.createElement('div');
            dropdown.className = 'autocomplete-dropdown visible';

            results.forEach(item => {
                const div = document.createElement('div');
                div.className = 'autocomplete-suggestion';
                div.innerHTML = `
                    <span>${highlightMatch(item.name, input.value)}</span>
                    <span class="suggestion-category">${item.category}</span>
                `;

                div.addEventListener('click', () => {
                    input.value = item.name;
                    if (categorySelect && item.category) {
                        categorySelect.value = item.category;
                    }
                    closeDropdown();
                    // Focus next input (qty)
                    const qtyInput = input.closest('.ingredient-row').querySelector('[name="ing_qty"]');
                    if (qtyInput) qtyInput.focus();
                });

                dropdown.appendChild(div);
            });

            input.parentNode.appendChild(dropdown);
        }

        function closeDropdown() {
            if (dropdown) {
                dropdown.remove();
                dropdown = null;
            }
        }

        function highlightMatch(text, query) {
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<span class="suggestion-highlight">$1</span>');
        }
    }

    function addStepRow(text = '') {
        const template = document.getElementById('step-row-template');
        const clone = template.content.cloneNode(true);

        let stepContent = text;
        if (typeof text === 'object' && text !== null) {
            stepContent = text.instruction || '';
        }

        if (stepContent) {
            clone.querySelector('textarea').textContent = stepContent;
            clone.querySelector('textarea').value = stepContent;
        }
        stepsList.appendChild(clone);
        updateStepNumbers();
    }

    function updateStepNumbers() {
        const rows = stepsList.querySelectorAll('.step-row');
        rows.forEach((row, index) => {
            row.querySelector('.step-number').textContent = `${index + 1}.`;
        });
    }

    function setLoading(isLoading) {
        if (isLoading) {
            spinner.classList.remove('hidden');
            parseBtn.disabled = true;
        } else {
            spinner.classList.add('hidden');
            parseBtn.disabled = false;
        }
    }

    function showError(msg) {
        const el = document.getElementById('submit-error');
        el.textContent = msg;
        el.classList.remove('hidden');
    }

    function populateForm(data) {
        document.getElementById('title').value = data.title || '';
        document.getElementById('description').value = data.description || '';
        document.getElementById('servings').value = data.servings || 4;

        // Images
        imagePreviewGrid.innerHTML = ''; // Clear existing
        if (data.images && data.images.length > 0) {
            data.images.forEach(url => addImagePreview(url));
        } else if (data.image_url) {
            addImagePreview(data.image_url);
        }

        // Tags
        if (data.cuisine_region || data.cuisine) selectTags('cuisine-tags', data.cuisine_region || data.cuisine);
        if (data.meal_type) selectTags('meal-tags', data.meal_type);

        // Ingredients
        ingredientsList.innerHTML = '';
        if (Array.isArray(data.ingredients)) {
            data.ingredients.forEach(ing => addIngredientRow(ing));
        } else {
            addIngredientRow();
        }

        // Steps
        stepsList.innerHTML = '';
        if (Array.isArray(data.steps)) {
            data.steps.forEach(step => addStepRow(step));
        } else {
            addStepRow();
        }

        // Trigger hidden input updates
        updateTagInput(document.getElementById('cuisine-tags'), document.getElementById('cuisine_region'));
        updateTagInput(document.getElementById('meal-tags'), document.getElementById('meal_type'));
    }

    function selectTags(containerId, valueStr) {
        if (!valueStr) return;
        const container = document.getElementById(containerId);
        // Reset
        container.querySelectorAll('.tag-option').forEach(el => el.classList.remove('selected'));

        // Match approximate
        const values = valueStr.split(',').map(s => s.trim().toLowerCase());
        container.querySelectorAll('.tag-option').forEach(el => {
            if (values.includes(el.dataset.value.toLowerCase())) {
                el.classList.add('selected');
            }
        });
    }

    // --- Image Upload Functions ---

    function setupImageUpload() {
        // Drag over effects for upload zone
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            imageUploadZone.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            imageUploadZone.addEventListener(eventName, () => imageUploadZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            imageUploadZone.addEventListener(eventName, () => imageUploadZone.classList.remove('dragover'), false);
        });

        // Handle drop
        imageUploadZone.addEventListener('drop', handleDrop, false);

        // Browse button
        browseBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFilesSelected);

        // URL Input
        addUrlBtn.addEventListener('click', handleUrlAdd);
        toggleUrlBtn.addEventListener('click', () => {
            urlInputContainer.classList.toggle('hidden');
            if (!urlInputContainer.classList.contains('hidden')) {
                urlInput.focus();
            }
        });
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFilesSelected(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        ([...files]).forEach(uploadFile);
    }

    function uploadFile(file) {
        // Optimistic preview (optional, can add loader card first)
        const card = createLoadingCard();
        imagePreviewGrid.appendChild(card);

        const formData = new FormData();
        formData.append('image', file);

        fetch('/api/upload-image', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateCardWithImage(card, data.url);
                } else {
                    // Show error or remove card
                    card.remove();
                    alert(data.error || "Upload failed");
                }
            })
            .catch(() => {
                card.remove();
                alert("Upload failed. Please try again.");
            });
    }

    function handleUrlAdd() {
        const url = urlInput.value.trim();
        if (url) {
            addImagePreview(url);
            urlInput.value = '';
            urlInputContainer.classList.add('hidden');
        }
    }

    function createLoadingCard() {
        const template = document.getElementById('image-card-template');
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.image-preview-card');
        card.querySelector('.loading-overlay').classList.remove('hidden');
        return card;
    }

    function updateCardWithImage(card, url) {
        const img = card.querySelector('img');
        img.src = url;
        card.querySelector('.loading-overlay').classList.add('hidden');
    }

    function addImagePreview(url) {
        const template = document.getElementById('image-card-template');
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.image-preview-card');
        card.querySelector('img').src = url;

        // Add drag events to new card
        addImageDragHandlers(card);

        imagePreviewGrid.appendChild(card);
    }

    // --- Image Reordering Functions (Smooth Pointer Events) ---

    let draggedItem = null;
    let clone = null;
    let placeholder = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let initialRect = null;

    function setupImageReordering() {
        // We use pointerdown to handle both mouse and touch
        imagePreviewGrid.addEventListener('pointerdown', handleDragStart);
    }

    function addImageDragHandlers(card) {
        // No longer using native drag events
        card.removeAttribute('draggable');
        card.style.touchAction = 'none'; // Prevent scrolling while dragging
        card.style.cursor = 'grab';
    }

    function handleDragStart(e) {
        const card = e.target.closest('.image-preview-card');
        if (!card || e.target.closest('.remove-image-btn')) return; // Ignore if clicking remove button

        e.preventDefault(); // Prevent text selection etc.

        draggedItem = card;
        initialRect = card.getBoundingClientRect();
        dragStartX = e.clientX;
        dragStartY = e.clientY;

        // Create the floating clone
        clone = card.cloneNode(true);
        clone.classList.add('dragging-clone');
        clone.style.width = `${initialRect.width}px`;
        clone.style.height = `${initialRect.height}px`;
        clone.style.position = 'fixed';
        clone.style.left = `${initialRect.left}px`;
        clone.style.top = `${initialRect.top}px`;
        clone.style.zIndex = '1000';
        clone.style.pointerEvents = 'none'; // Let clicks pass through to detect underlying elements
        document.body.appendChild(clone);

        // Create a placeholder to hold space
        placeholder = document.createElement('div');
        placeholder.classList.add('image-preview-card', 'placeholder');
        // placeholder.style.width = width/height is handled by grid, just need class to match

        // Insert placeholder and hide original
        card.parentNode.insertBefore(placeholder, card);
        card.style.display = 'none';

        // improved cursor
        document.body.style.cursor = 'grabbing';

        // Add global move/up listeners
        document.addEventListener('pointermove', handleDragMove);
        document.addEventListener('pointerup', handleDragEnd);
    }

    function handleDragMove(e) {
        if (!clone) return;

        // Move clone
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        clone.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Find swap target
        const afterElement = getDragAfterElement(imagePreviewGrid, e.clientX, e.clientY);

        if (afterElement == null) {
            imagePreviewGrid.appendChild(placeholder);
        } else {
            imagePreviewGrid.insertBefore(placeholder, afterElement);
        }
    }

    function handleDragEnd(e) {
        if (!clone) return;

        // Clean up listeners
        document.removeEventListener('pointermove', handleDragMove);
        document.removeEventListener('pointerup', handleDragEnd);

        // Clean up DOM
        if (draggedItem) {
            draggedItem.style.display = ''; // Show original
            if (placeholder.parentNode) {
                imagePreviewGrid.insertBefore(draggedItem, placeholder);
            } else {
                imagePreviewGrid.appendChild(draggedItem);
            }
            placeholder.remove();
        }

        clone.remove();
        document.body.style.cursor = '';

        draggedItem = null;
        clone = null;
        placeholder = null;
    }

    function getDragAfterElement(container, x, y) {
        // Get all cards except the placeholder and the hidden original
        const draggableElements = [...container.querySelectorAll('.image-preview-card:not(.placeholder):not([style*="display: none"])')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            // Calculate distance from center of box
            const offsetX = x - (box.left + box.width / 2);
            const offsetY = y - (box.top + box.height / 2);

            // Let's use simple distance to center for best grid behavior
            const dist = Math.hypot(offsetX, offsetY);

            if (closest == null || dist < closest.dist) {
                return { offset: dist, element: child, dist: dist };
            } else {
                return closest;
            }
        }, null)?.element;
    }
});
