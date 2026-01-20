<script>
  // Slide 4: Manny Discord Bot
  // Layout: showcase
  import { icons } from '../../lib/slideData.js';

  const items = [
    { icon: 'monitor', text: 'Deployed to Personal, Pulse Lab, and AI Seminar servers' },
    { icon: 'shield', text: 'Integrated moderation and role management' },
    { icon: 'trendingUp', text: 'Tracked message and voice call statistics' },
    { icon: 'clock', text: 'Automated announcements and reminders' }
  ];
  const image = '/images/discord.png';

  function getIcon(name) {
    return icons[name] || icons.check;
  }
</script>

<div class="layout-showcase">
  <div class="showcase-image content-item">
    <img src={image} alt="Manny Discord Bot" />
  </div>
  <div class="showcase-content">
    <h1 class="content-item">Manny Discord Bot</h1>
    <p class="description content-item">Multi-server deployment with moderation & automation</p>
    <div class="showcase-items">
      {#each items as item}
        <div class="showcase-item content-item">
          <div class="icon-container-pill">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              {@html getIcon(item.icon)}
            </svg>
          </div>
          <span>{item.text}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .layout-showcase {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
    width: 100%;
    max-width: 1200px;
  }

  .showcase-image img {
    width: 100%;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    border: 4px solid white;
  }

  .showcase-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .showcase-items {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .showcase-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.125rem;
    background: white;
    padding: 1rem;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
    transition: transform 0.2s ease;
  }

  .showcase-item:hover {
    transform: translateX(10px);
    background: #f8fafc;
  }

  .icon-container-pill {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 12px;
    color: #3b82f6;
    flex-shrink: 0;
  }
</style>
