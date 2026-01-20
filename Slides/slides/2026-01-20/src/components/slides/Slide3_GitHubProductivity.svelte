<script>
  // Slide 3: GitHub Productivity
  // Layout: metric
  
  const metric = { value: '~200', label: 'commits' };
  const items = [
    '180 commits this month alone',
    'Chronological push across automation and apps'
  ];
  const image = '/images/github.png';
</script>

<div class="layout-metric">
  <div class="metric-left">
    <div class="content-item">
      <h1>GitHub Productivity</h1>
      <p class="description">A high-velocity development phase</p>
    </div>
    <div class="big-metric content-item">
      <span class="metric-value">{metric.value}</span>
      <span class="metric-label">{metric.label}</span>
    </div>
    <div class="metric-items">
      {#each items as item}
        <p class="content-item">{item}</p>
      {/each}
    </div>
  </div>
  <div class="metric-right content-item">
    <img src={image} alt="GitHub Productivity" />
  </div>
</div>

<style>
  .layout-metric {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
    width: 100%;
    max-width: 1200px;
  }

  .big-metric {
    display: flex;
    flex-direction: column;
    margin: 2rem 0;
    padding: 2rem;
    background: white;
    border-radius: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.1);
    display: inline-flex;
  }

  .metric-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 5rem;
    font-weight: 700;
    line-height: 1;
    background: linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .metric-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.25rem;
    color: #64748b;
    margin-top: 0.5rem;
  }

  .metric-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    font-size: 1.25rem;
    color: #334155;
  }

  .metric-right img {
    width: 100%;
    max-width: 500px;
    border-radius: 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    transform: rotate(2deg);
    transition: transform 0.5s ease;
  }

  .metric-right img:hover {
    transform: rotate(0deg) scale(1.02);
  }
</style>
