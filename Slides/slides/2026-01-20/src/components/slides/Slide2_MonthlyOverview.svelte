<script>
  import { icons } from '../../lib/slideData.js';

  const items = [
    { icon: 'chart', text: '~200 GitHub commits', highlight: true },
    { icon: 'robot', text: 'Expanded Manny Discord Bot' },
    { icon: 'globe', text: 'Pulse Lab Blog & App Suite' },
    { icon: 'database', text: 'Mapped 6 TB MIMIC-IV database' }
  ];

  function getIcon(name) {
    return icons[name] || icons.check;
  }
</script>

<div class="layout-standard">
  <div class="header-section content-item">
    <h1>Monthly Overview</h1>
    <p class="description">Key accomplishments this period</p>
  </div>
  <div class="grid-container">
    {#each items as item}
      <div class="grid-card content-item" class:highlight={item.highlight}>
        <div class="icon-container" class:highlight={item.highlight}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            {@html getIcon(item.icon)}
          </svg>
        </div>
        <span class="card-text">{item.text}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .layout-standard {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 3rem;
    width: 100%;
    max-width: 1200px;
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    width: 100%;
  }

  .grid-card {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    padding: 2rem;
    border-radius: 24px;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    text-align: left;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
  }

  .grid-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(59, 130, 246, 0.15);
    background: rgba(255, 255, 255, 0.8);
    border-color: rgba(59, 130, 246, 0.3);
  }

  .grid-card.highlight {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border: none;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
  }

  .grid-card.highlight:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 15px 30px rgba(37, 99, 235, 0.4);
  }

  .card-text {
    font-size: 1.25rem;
    font-weight: 500;
  }

  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 14px;
    color: #3b82f6;
    flex-shrink: 0;
  }
  
  .icon-container.highlight {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
</style>
