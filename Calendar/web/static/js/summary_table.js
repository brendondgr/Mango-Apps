import { getColorClasses } from './color_manager.js';

export function renderSummaryTable(stats, breakdowns, totalHours) {
    const summaryContent = document.getElementById('summaryContent');
    const cardTemplate = document.getElementById('category-card-template');
    const detailTemplate = document.getElementById('category-detail-template');

    // Safety check
    if (!summaryContent || !cardTemplate || !detailTemplate) {
        console.warn('Summary templates not found');
        return;
    }

    summaryContent.innerHTML = '';

    const categories = Object.keys(stats).sort((a, b) => stats[b] - stats[a]); // Descending order

    categories.forEach(type => {
        const hours = stats[type];
        if (hours === 0) return; // Skip empty categories

        const pct = ((hours / totalHours) * 100).toFixed(1);
        const style = getColorClasses(type);
        const uniqueId = `card-${type.replace(/\s+/g, '-')}`;

        // --- Create Category Card ---
        const cardClone = cardTemplate.content.cloneNode(true);
        const card = cardClone.querySelector('.category-card');
        card.id = uniqueId;

        // Click to expand
        card.onclick = () => toggleCardExpansion(card);

        // Badge with category color - use the same colors from the color manager
        const badge = card.querySelector('.category-card__badge');
        const borderColor = style.border.replace('border-', '').replace('-500', '-600');
        badge.innerHTML = `<span class="w-2 h-2 rounded-full ${style.bg.replace('-100', '-500')}"></span> ${type}`;
        badge.className = `category-card__badge ${style.bg} ${style.text}`;

        // Hours and percentage
        card.querySelector('.category-card__hours').textContent = hours.toFixed(1) + 'h';
        card.querySelector('.category-card__percent').textContent = pct + '%';

        // Progress bar - use the border color (which is darker) for the fill
        const progressFill = card.querySelector('.progress-bar__fill');
        progressFill.style.width = `${pct}%`;
        progressFill.className = `progress-bar__fill ${style.bg.replace('-100', '-500')}`;

        // Details
        const detailsBody = card.querySelector('.details-body');
        const activities = breakdowns[type] || [];

        activities.forEach(act => {
            const itemClone = detailTemplate.content.cloneNode(true);
            const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][act.day];

            itemClone.querySelector('.detail-title').textContent = act.title;
            if (act.sub) {
                itemClone.querySelector('.detail-sub').textContent = `(${act.sub})`;
            }
            itemClone.querySelector('.detail-day').textContent = dayName;
            itemClone.querySelector('.detail-duration').textContent = act.hours.toFixed(1) + 'h';

            detailsBody.appendChild(itemClone);
        });

        summaryContent.appendChild(card);
    });

    // Update total
    const totalElement = document.getElementById('totalHours');
    if (totalElement) {
        totalElement.textContent = totalHours.toFixed(1) + 'h';
    }
}

function toggleCardExpansion(card) {
    card.classList.toggle('expanded');
}
