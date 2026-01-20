---
trigger: model_decision
description: If user want to create a slideshow, use these rules to create them.
---

# Slideshow Creation Guide

Create custom slideshow presentations using Astro + Svelte + GSAP.

## Quick Reference

| Task | Command |
|------|---------|
| Create new presentation | Copy existing folder (e.g., `2026-01-20/`) |
| Develop | `cd slides/[folder] && npm run dev` |
| Build for production | `cd slides/[folder] && npm run build` |
| Serve all presentations | `cd slides && python -m http.server 8080` |

## Creating a New Presentation

1. **Copy the template folder**:
   ```bash
   cd slides
   cp -r 2026-01-20 YYYY-MM-DD  # Use the new date
   cd YYYY-MM-DD
   npm install
   ```

2. **Modify the slides** in `src/components/slides/`:
   - Each slide is a Svelte component (`Slide1_*.svelte`, `Slide2_*.svelte`, etc.)
   - Use the existing components as templates
   - Apply the design system from `docs/ui.md`

3. **Update `src/lib/slideData.js`** with new content and theme

4. **Update `src/components/Presentation.svelte`**:
   - Import new slide components
   - Update the `customSlideComponents` array

5. **Build**: `npm run build`

6. **Register in launcher**: Add entry to `slides/index.html` PRESENTATIONS array

## File Structure

```
slides/YYYY-MM-DD/
├── src/
│   ├── components/
│   │   ├── Presentation.svelte      # Main orchestrator
│   │   └── slides/                  # Individual slide components
│   │       ├── Slide1_*.svelte
│   │       ├── Slide2_*.svelte
│   │       └── ...
│   ├── lib/
│   │   ├── slideData.js             # Theme, icons, content data
│   │   └── transitions.js           # GSAP transitions
│   ├── styles/
│   │   └── global.css               # Design tokens
│   └── pages/
│       └── index.astro              # Entry point
└── dist/                            # Built output
```

## Design Rules (from docs/slideshow_rules.md)

- Fullscreen viewport (100vw × 100vh)
- Horizontal slide transitions (GSAP)
- Auto-hiding navigation
- Unified color theme (do NOT rotate colors per slide)
- Typography: Space Grotesk (headings), DM Sans (body), JetBrains Mono (code)

## Documentation References

1. **[docs/slides.md](file:///f:/Projects/Weekly%20Updates/docs/slides.md)** — Architecture overview
2. **[docs/slideshow_rules.md](file:///f:/Projects/Weekly%20Updates/docs/slideshow_rules.md)** — Visual rules and animations
3. **[docs/ui.md](file:///f:/Projects/Weekly%20Updates/docs/ui.md)** — Design system (colors, typography)