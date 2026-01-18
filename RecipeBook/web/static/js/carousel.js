/**
 * carousel.js
 * Handles image carousel functionality for recipe cards and detail pages.
 */

class RecipeCarousel {
    constructor(container) {
        this.container = container;
        this.images = container.querySelectorAll('.carousel-image');
        this.prevBtn = container.querySelector('.carousel-prev');
        this.nextBtn = container.querySelector('.carousel-next');

        this.currentIndex = 0;
        this.totalImages = this.images.length;

        if (this.totalImages <= 1) {
            this.hideControls();
            return;
        }

        this.setupEventListeners();
        // Ensure initial state
        this.updateView();
    }

    hideControls() {
        if (this.prevBtn) this.prevBtn.style.display = 'none';
        if (this.nextBtn) this.nextBtn.style.display = 'none';
        // Hide indicators if we implement them
        const indicators = this.container.querySelector('.carousel-indicators');
        if (indicators) indicators.style.display = 'none';
    }

    setupEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.prev();
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.next();
            });
        }

        // Touch swipe support
        let touchStartX = 0;
        this.container.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.container.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;

            // Threshold of 50px for swipe
            if (Math.abs(diff) > 50) {
                if (diff > 0) this.next();
                else this.prev();
            }
        }, { passive: true });
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.totalImages;
        this.updateView();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.totalImages) % this.totalImages;
        this.updateView();
    }

    updateView() {
        this.images.forEach((img, index) => {
            if (index === this.currentIndex) {
                img.classList.add('active');
            } else {
                img.classList.remove('active');
            }
        });
    }
}

// Initialize all carousels on page load
document.addEventListener('DOMContentLoaded', () => {
    initCarousels();
});

// Export helper for dynamic content (like waiter.js adding cards)
window.initCarousels = function (rootElement = document) {
    const carousels = rootElement.querySelectorAll('.recipe-carousel');
    carousels.forEach(el => {
        // Prevent double init
        if (!el.dataset.carouselInitialized) {
            new RecipeCarousel(el);
            el.dataset.carouselInitialized = 'true';
        }
    });
};
