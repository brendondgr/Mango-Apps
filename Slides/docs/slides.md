# Slideshow Engine Architecture

A **launcher** system for managing and serving multiple custom slideshow presentations.

## Architecture

```
slides/
├── index.html              # Launcher page (lists presentations)
├── 2026-01-20/             # Presentation project
│   ├── package.json
│   ├── src/components/     # Custom Svelte slide components
│   └── dist/               # Built output (after npm run build)
├── 2025-11-24/             # Another presentation (future)
│   └── dist/
└── ...
```

## Workflow

1. **Create presentation**: AI creates new folder from template with custom Svelte components
2. **Build presentation**: `cd slides/2026-01-20 && npm run build` → generates `dist/`
3. **Serve launcher**: Serve `slides/` folder with any HTTP server
4. **User selects**: Click presentation card → loads built presentation

## Running

```bash
# Serve the launcher
cd slides
python -m http.server 8080   # or any static server
# Visit http://localhost:8080/
```

## Adding New Presentations

1. Copy an existing presentation folder as a template
2. Modify the Svelte slide components in `src/components/slides/`
3. Update `src/lib/slideData.js` with new content
4. Run `npm run build` in the presentation folder
5. Update `slides/index.html` PRESENTATIONS array with the new entry

## Build Notes

The `npm run build` command includes a postbuild step that fixes asset paths to work when served from subdirectories. This allows presentations to be accessed via `localhost:8080/2026-01-20/dist/`.
