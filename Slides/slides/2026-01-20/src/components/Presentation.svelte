<script>
  import { onMount, tick } from 'svelte';
  import { slides, theme } from '../lib/slideData.js';
  import { animateContentIn } from '../lib/transitions.js';
  import { cubicOut } from 'svelte/easing';
  
  // Import Slide Components
  import Slide1 from './slides/Slide1_TeamMeeting.svelte';
  import Slide2 from './slides/Slide2_MonthlyOverview.svelte';
  import Slide3 from './slides/Slide3_GitHubProductivity.svelte';
  import Slide4 from './slides/Slide4_MannyDiscordBot.svelte';
  import Slide5 from './slides/Slide5_LabWebsiteApps.svelte';
  import Slide6 from './slides/Slide6_ProjectShowcase.svelte';
  import Slide7 from './slides/Slide7_ResearchData.svelte';
  import Slide8 from './slides/Slide8_ResearchRelational.svelte';
  import Slide9 from './slides/Slide9_Goals.svelte';

  const slideComponents = [
    Slide1,
    Slide2,
    Slide3,
    Slide4,
    Slide5,
    Slide6,
    Slide7,
    Slide8,
    Slide9
  ];

  let currentSlide = 0;
  let direction = 1; // 1 = next, -1 = prev
  let isNavigating = false;
  let navVisible = false;
  let navTimeout;
  let isFullscreen = false;
  
  // Use reactive statement to get current component
  $: CurrentSlideComponent = slideComponents[currentSlide];
  
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    document.addEventListener('fullscreenchange', () => {
      isFullscreen = !!document.fullscreenElement;
    });
    
    // Initial content animation for first slide
    setTimeout(() => {
      const activeSlide = document.querySelector('.slide');
      if (activeSlide) triggerContentAnimation(activeSlide);
    }, 100);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });
  
  function handleKeydown(e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    }
  }
  
  function handleMouseMove() {
    navVisible = true;
    clearTimeout(navTimeout);
    navTimeout = setTimeout(() => {
      navVisible = false;
    }, 2500);
  }
  
  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }
  
  function nextSlide() {
    if (currentSlide >= slideComponents.length - 1) return;
    direction = 1;
    currentSlide++;
  }
  
  function prevSlide() {
    if (currentSlide <= 0) return;
    direction = -1;
    currentSlide--;
  }
  
  function goToSlide(index) {
    if (index === currentSlide) return;
    direction = index > currentSlide ? 1 : -1;
    currentSlide = index;
  }
  
  function slideIn(node, params) {
    const isNext = direction === 1;
    
    return {
      duration: 600,
      easing: cubicOut,
      css: (t) => { // t: 0->1
        const scale = 0.95 + (0.05 * t);
        return `
          transform: translateX(${ (1-t) * (isNext ? 100 : -100) }%) scale(${scale});
          opacity: 1;
          z-index: 2;
        `;
      }
    };
  }

  function slideOut(node, params) {
    const isNext = direction === 1;
    
    return {
      duration: 600,
      easing: cubicOut,
      css: (t) => { // t: 1->0 (runs reversed)
        const scale = 0.95 + (0.05 * t);
        return `
          transform: translateX(${ (1-t) * (isNext ? -100 : 100) }%) scale(${scale});
          opacity: ${0.5 + 0.5*t};
          z-index: 1;
        `;
      }
    };
  }

  async function triggerContentAnimation(e) {
    // Wait for DOM update so new component is rendered
    await tick();
    const node = e.target || e;
    if (!node) return;
    
    // Find all content items within this slide
    // We search within the node (which is the .slide wrapper)
    const items = node.querySelectorAll('.content-item');
    if (items.length > 0) {
      animateContentIn(Array.from(items));
    }
  }
</script>

<div class="presentation" role="region" aria-label="Slideshow Presentation" on:mousemove={handleMouseMove}>

  <!-- Fullscreen Button -->
  <button class="fullscreen-btn" on:click={toggleFullscreen} title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen (F)'}>
    {#if isFullscreen}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
      </svg>
    {:else}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
      </svg>
    {/if}
  </button>
  
  <!-- Slide Wrapper -->
  <div class="slide-wrapper">
    {#key currentSlide}
      <div 
        class="slide" 
        style="background: linear-gradient(135deg, {theme.bg} 0%, white 100%);"
        in:slideIn 
        out:slideOut
        on:introend={triggerContentAnimation}
      >
        <svelte:component this={CurrentSlideComponent} />
      </div>
    {/key}
  </div>
  
  <!-- Slide Number -->
  <div class="slide-number">
    {String(currentSlide + 1).padStart(2, '0')} / {String(slideComponents.length).padStart(2, '0')}
  </div>
  
  <!-- Navigation -->
  <nav class="navigation" class:visible={navVisible}>
    <button 
      class="nav-button"
      on:click={prevSlide}
      disabled={currentSlide === 0}
      aria-label="Previous slide"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    
    <div class="progress">
      {#each slideComponents as _, i}
        <button 
          class="progress-dot {i === currentSlide ? 'active' : ''}"
          on:click={() => goToSlide(i)}
          aria-label="Go to slide {i + 1}"
        ></button>
      {/each}
    </div>
    
    <button 
      class="nav-button"
      on:click={nextSlide}
      disabled={currentSlide === slideComponents.length - 1}
      aria-label="Next slide"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </nav>
</div>

<style>
  /* Base Presentation Styles */
  .presentation {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%);
  }
  
  .slide-wrapper {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    perspective: 1000px;
  }
  
  .slide {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    box-shadow: 0 0 40px rgba(0,0,0,0.1); 
  }

  /* Global content item style for animations */
  :global(.content-item) {
    opacity: 0;
  }

  /* Fullscreen Button */
  .fullscreen-btn {
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
    z-index: 200;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(59, 130, 246, 0.2);
    color: #3b82f6;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .fullscreen-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.25);
  }
  
  /* Slide Number */
  .slide-number {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 100;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    font-weight: 500;
    color: #3b82f6;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    padding: 0.625rem 1.25rem;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  /* Navigation */
  .navigation {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0.875rem 1.75rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border-radius: 50px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    z-index: 100;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  
  .navigation.visible {
    opacity: 1;
    pointer-events: auto;
  }
  
  .nav-button {
    background: #4C3BCF;
    color: white;
    border: none;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 4px 12px rgba(76, 59, 207, 0.3);
  }
  
  .nav-button:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(76, 59, 207, 0.4);
  }
  
  .nav-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .progress {
    display: flex;
    gap: 0.5rem;
  }
  
  .progress-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(76, 59, 207, 0.2);
    border: none;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .progress-dot:hover {
    background: rgba(76, 59, 207, 0.4);
    transform: scale(1.2);
  }
  
  .progress-dot.active {
    background: #4C3BCF;
    transform: scale(1.3);
  }
  
  /* Typography basics for fallback */
  /* Typography basics for fallback - Moved to global.css or components */

</style>

