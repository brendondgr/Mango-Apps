<script>
  // Slide 5: Lab Website & Apps
  // Layout: grid
  import { icons } from '../../lib/slideData.js';

  const apps = [
    { title: 'Calendar', icon: 'calendar', desc: 'Google Calendar Alternative' },
    { title: 'Project Manager', icon: 'trendingUp', desc: 'App to organize Projects' },
    { title: 'Recipe Book', icon: 'book', desc: 'App to organize Recipes' },
    { title: 'Job Finder', icon: 'target', desc: 'Updated Job Search Tool' },
    { title: 'Notes Manager', icon: 'fileText', desc: 'Create and Manage Notes' },
    { title: 'MIMIC Visualizer', icon: 'database', desc: ' Medical Data Visualizer' },
    { title: 'Project Mango', icon: 'robot', desc: 'Unified Suite with Agent' }
  ];

  function getIcon(name) {
    return icons[name] || icons.check;
  }
</script>

<div class="slide-content">
  <div class="header">
    <h1 class="content-item">Project Apps Suite</h1>
    <p class="subtitle content-item">A comprehensive ecosystem of personal productivity tools</p>
  </div>

  <div class="apps-grid">
    {#each apps as app}
      <div class="app-card content-item">
        <div class="icon-wrapper">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            {@html getIcon(app.icon)}
          </svg>
        </div>
        <div class="app-info">
          <h3>{app.title}</h3>
          <p>{app.desc}</p>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .slide-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 1100px;
    height: 100%;
    justify-content: center;
    gap: 3rem;
  }

  .header {
    text-align: center;
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    font-size: 1.25rem;
    color: #64748b;
  }

  .apps-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    width: 100%;
  }

  /* Make the last item span 2 columns to center it if 7 items, or adjust layout */
  /* With 7 items in 4 columns: 4 Top, 3 Bottom centered? */
  .apps-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  /* Center the last 3 items in the second row by making the grid cleaner */
  /* Alternatively, use flex-wrap for auto centering */
  .apps-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
  }

  .app-card {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    width: calc(25% - 1.5rem); /* roughly 4 in a row */
    min-width: 220px;
    border: 1px solid rgba(226, 232, 240, 0.8);
  }

  .app-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: #bfdbfe;
  }

  .icon-wrapper {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3b82f6;
  }

  .app-info h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }

  .app-info p {
    margin: 0;
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.4;
  }
</style>
