<script>
  // Slide 6: Project Showcase
  // Layout: showcase-center
  import { icons } from '../../lib/slideData.js';

  const link = 'brendondgr.com';
  const linkUrl = 'https://brendondgr.com';
  const items = [
    'Personal portfolio and blog',
    'Integrated productivity tools',
    'Modern, responsive design'
  ];

  function getIcon(name) {
    return icons[name] || icons.check;
  }
</script>

<div class="layout-center">
  <h1 class="content-item">Project Showcase</h1>
  <p class="description content-item">Live demo of integrated website and productivity tools</p>
  <a href={linkUrl} target="_blank" rel="noopener noreferrer" class="link-showcase content-item">
    <div class="icon-container-circle">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        {@html getIcon('link')}
      </svg>
    </div>
    <span class="link-text">{link}</span>
  </a>
  <div class="center-items">
    {#each items as item}
      <div class="center-item content-item">
        <div class="icon-container-small">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            {@html getIcon('check')}
          </svg>
        </div>
        {item}
      </div>
    {/each}
  </div>
</div>

<style>
  .layout-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    max-width: 900px;
    width: 100%;
  }

  .link-showcase {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    background: #3b82f6;
    color: white;
    padding: 0.75rem 2rem 0.75rem 0.75rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.25rem;
    margin: 2rem 0;
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .link-showcase:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 35px rgba(59, 130, 246, 0.5);
  }

  .center-items {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 1rem;
  }

  .center-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: white;
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    font-weight: 500;
  }

  .icon-container-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    color: white;
    flex-shrink: 0;
  }

  .icon-container-small {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(0, 217, 192, 0.15);
    border-radius: 50%;
    color: #00D9C0;
    flex-shrink: 0;
  }
</style>
