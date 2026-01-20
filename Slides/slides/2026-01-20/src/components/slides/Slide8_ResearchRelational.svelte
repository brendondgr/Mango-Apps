<script>
  // Slide 8: Research: Relational Complexity
  // Layout: highlight
  import { icons } from '../../lib/slideData.js';

  const items = [
    { value: '1 Billion+', text: 'rows across interconnected files' },
    { text: 'Relational complexity made navigation difficult' },
    { text: 'brendondgr.com/mimiciv/', linkUrl: 'https://brendondgr.com/mimiciv/', isLink: true }
  ];

  function getIcon(name) {
    return icons[name] || icons.check;
  }
</script>

<div class="layout-highlight">
  <h1 class="content-item">Research: Relational Complexity</h1>
  <p class="description content-item">Understanding interconnected medical data</p>
  <div class="highlight-items">
    {#each items as item}
      {#if item.isLink}
        <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" class="highlight-link-button content-item">
          <div class="icon-container-circle-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              {@html getIcon('link')}
            </svg>
          </div>
          <span>{item.text}</span>
        </a>
      {:else}
        <div class="highlight-item content-item" class:has-value={item.value}>
          {#if item.value}
            <span class="highlight-value">{item.value}</span>
          {/if}
          <span class="highlight-text">{item.text}</span>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .layout-highlight {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    max-width: 900px;
    width: 100%;
  }

  .highlight-items {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-top: 2rem;
    width: 100%;
    align-items: center;
  }

  .highlight-item {
    font-size: 1.5rem;
    color: #1e3a8a;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .highlight-item.has-value .highlight-text {
    font-size: 1.25rem;
    color: #475569;
  }

  .highlight-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 4rem;
    font-weight: 700;
    line-height: 1;
    background: linear-gradient(135deg, #00D9C0 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .highlight-link-button {
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
    margin-top: 1rem;
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .highlight-link-button:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
  }

  .icon-container-circle-sm {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    color: white;
    flex-shrink: 0;
  }
</style>
