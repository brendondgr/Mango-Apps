<script>
  // Slide 9: Goals for Next Month
  // Layout: checklist
  import { icons } from '../../lib/slideData.js';

  const sections = [
    {
      title: 'Preliminaries Study',
      icon: 'book',
      items: ['Linear Algebra', 'ODE & PDE']
    },
    {
      title: 'MIMIC-IV Research',
      icon: 'cpu',
      items: ['Read existing literature', 'Re-create agents to understand mechanisms']
    }
  ];

  function getIcon(name) {
    return icons[name] || icons.check;
  }
</script>

<div class="layout-checklist">
  <h1 class="content-item">Goals for Next Month</h1>
  <p class="description content-item">Upcoming focus areas</p>
  <div class="checklist-sections">
    {#each sections as section}
      <div class="checklist-section content-item">
        <div class="section-header">
          <div class="icon-container-round">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              {@html getIcon(section.icon)}
            </svg>
          </div>
          <h3>{section.title}</h3>
        </div>
        <ul>
          {#each section.items as item}
            <li>
              <div class="checkbox-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
              </div>
              {item}
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</div>

<style>
  .layout-checklist {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 1000px;
  }

  .checklist-sections {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    width: 100%;
    margin-top: 2rem;
  }

  .checklist-section {
    background: white;
    padding: 2rem;
    border-radius: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.1);
  }

  .checklist-section ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .checklist-section li {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.125rem;
    color: #475569;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f1f5f9;
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

  .checkbox-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3b82f6;
    flex-shrink: 0;
  }
</style>
