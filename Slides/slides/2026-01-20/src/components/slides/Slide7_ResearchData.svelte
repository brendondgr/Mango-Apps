<script>
  import { icons } from '../../lib/slideData.js';

  // Slide 7: Research: Data Challenges
  // Layout: data
  const metrics = [
    { value: '6 TB', label: 'Total Database', icon: 'database' },
    { value: '5 TB', label: 'DICOM Images', icon: 'fileText' },
    { value: '512px', label: 'Resized Dataset', icon: 'target' }
  ];
  const image = '/images/research.png';

  function getIcon(name) {
    return icons[name] || icons.check;
  }
</script>

<div class="layout-data">
  <div class="data-header">
    <h1 class="content-item">Research: Data Challenges</h1>
    <p class="description content-item">Navigating the massive MIMIC-IV database</p>
  </div>
  <div class="data-content">
    <div class="data-metrics">
      {#each metrics as metric}
        <div class="data-metric-card content-item">
          <div class="icon-container-round">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              {@html getIcon(metric.icon)}
            </svg>
          </div>
          <div class="metric-info">
            <span class="data-value">{metric.value}</span>
            <span class="data-label">{metric.label}</span>
          </div>
        </div>
      {/each}
    </div>
    <div class="data-image content-item">
      <img src={image} alt="Research Data" />
    </div>
  </div>
</div>

<style>
  .layout-data {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1200px;
    gap: 3rem;
  }

  .data-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
  }

  .data-metrics {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .data-metric-card {
    background: white;
    padding: 1.5rem;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(59, 130, 246, 0.1);
  }

  .metric-info {
    display: flex;
    flex-direction: column;
  }

  .data-value {
    font-size: 2rem;
    font-weight: 700;
    color: #1e3a8a;
    line-height: 1.1;
  }

  .data-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .data-image img {
    width: 100%;
    border-radius: 24px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  }
  
  .icon-container-round {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 50%;
    color: #3b82f6;
    flex-shrink: 0;
  }
</style>
