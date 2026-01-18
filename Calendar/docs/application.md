# Application Overview

## File Structure

```text
Schedules/
├── app.py                  # Main Flask application entry point (Port 9999)
├── data/                   # Data storage
│   ├── schedules/          # Directory for storing schedule JSON files
│   ├── calendar.json       # Stores direct events and date-to-schedule mappings
│   └── instructions.md     # LLM prompt instructions
├── docs/                   # Documentation folder
│   └── application.md      # This file
├── utils/                  # Backend utility modules
│   ├── calendar_io.py      # I/O for direct events and mappings
│   ├── color_palette.py    # Predefined color definitions and helpers
│   ├── color_generator.py  # Generates consistent colors for categories
│   ├── date_utils.py       # Shared date/time parsing and ranges
│   ├── event_merger.py     # Combines schedule events with direct events
│   ├── schedule_io.py      # Handles expansion, loading/saving of schedules
│   ├── schedule_stats.py   # calculates duration stats and breakdowns
│   └── validators.py       # Validates JSON schema and sanitizes filenames
└── web/                    # Frontend assets
    ├── templates/
    │   ├── index.html      # Main entry page with tabbed interface
    │   └── parts/          # Modular HTML components
    │       ├── calendar_config_modal.html
    │       ├── calendar_controls.html
    │       ├── calendar_event_modal.html
    │       ├── calendar_view.html
    │       ├── empty_state.html
    │       ├── event_card.html
    │       ├── header.html
    │       ├── info_modal.html
    │       ├── legend_item.html
    │       ├── loading_skeleton.html
    │       ├── summary_row.html
    │       ├── summary_table.html
    │       ├── timeline_controls.html
    │       ├── toast_container.html
    │       └── view_toggle.html
    └── static/
        ├── css/            # Stylesheets
        │   ├── calendar.css
        │   ├── general.css
        │   └── ...
        └── js/             # Frontend logic
            ├── api.js              # API communication
            ├── color_palette.js    # Frontend color definitions and hex values
            ├── calendar_navigation.js# Date math and labels for calendar
            ├── calendar_renderer.js# Renders Year/Month grid views
            ├── calendar_view.js    # Directs Calendar tab logic
            ├── color_manager.js    # Client-side color assignments
            ├── main.js             # Tab management & Schedule Editor logic
            ├── router.js           # Client-side routing and history
            ├── schedule_renderer.js# Renders the time-grid (Week view)
            ├── ui_controls.js      # Modal/form interactions
            └── ...
```

## URL Routing & Navigation

The application uses a hybrid routing system where Flask handles the initial page load for direct links, and a client-side `router.js` manages history and state updates without page reloads.

### URL Patterns
- **`/`**: Automatically redirects to the Calendar view.
- **`/calendar/`**: Loads the main Calendar tab.
  - Supports query parameters: `?date=YYYY-MM-DD` and `?view=year|month|week`.
  - Example: `/calendar/?date=2024-01-15&view=week`
- **`/editor/<filename>`**: Directly opens the Schedule Editor with the specified schedule loaded.
  - Example: `/editor/Spring_2026.json`

### Browser History
All navigation (switching tabs, changing calendar dates, or loading schedules) updates the browser's address bar and history. This allows for deep-linking to specific views and using the browser's **Back** and **Forward** buttons to navigate through application states.

## Core Systems

### 1. Schedule Editor
The original system for creating and editing structured schedule JSON files.
- **Dynamic Grid**: Interactive time-grid that supports zooming and time-range cropping.
- **Event Priorities**: Supports `overwriteable` flags to allow background/foreground event layering.
- **Custom Event Colors**: Visual color picker to assign specific colors to event types, persisted in the schedule JSON.
- **Statistics**: Calculates real-time breakdowns of time spent per category.

### 2. Calendar System
A higher-level view that integrates multiple schedules over time.
- **Multi-View**: Supports **Year**, **Month**, and **Week** views.
- **Schedule Mapping**: Assign different schedules to specific date ranges (e.g., "Winter Break", "Spring 2026").
- **Direct Events**: Add one-off events directly to the calendar without modifying schedule files.
- **Event Merging**: Backend logic prioritizes direct events and overlays them onto the mapped schedule for that date.

## File Reference

### Python Files (`.py`)
| Location | File | Description |
| :--- | :--- | :--- |
| `/` | `app.py` | Main Flask app. Routes for raw schedules AND the calendar API (mappings, direct events, week data). |
| `/utils/` | `calendar_io.py` | Handles reading/writing `data/calendar.json` for persistent direct events and mappings. |
| `/utils/` | `color_palette.py` | Centralized list of 16 predefined colors (Tailwind classes). |
| `/utils/` | `date_utils.py` | Centralized Python logic for date ranges, formatting, and day-of-week indexing. |
| `/utils/` | `event_merger.py` | Logic to combine static schedule events with direct calendar events for a specific date. |
| `/utils/` | `schedule_io.py` | Core logic for schedule expansion (handling repeating `timestamps`). |
| `/utils/` | `schedule_stats.py` | Duration calculations used for the stats summary table. |
| `/utils/` | `validators.py` | JSON schema validation and file sanitization. |

### JavaScript Files (`.js`)
| Location | File | Description |
| :--- | :--- | :--- |
| `/web/static/js/` | `main.js` | Manages tab switching between Editor and Calendar. Holds Schedule Editor specific logic. |
| `/web/static/js/` | `calendar_view.js`| Main controller for the Calendar tab. Handles state and switches between Year/Month/Week. |
| `/web/static/js/` | `calendar_renderer.js`| Specialized rendering for Year (mini-months) and Month (grid) views. |
| `/web/static/js/` | `calendar_navigation.js`| Shared logic for navigating dates (Today, Next, Prev) and generating date strings. |
| `/web/static/js/` | `schedule_renderer.js`| Core engine for the time-grid. Shared by both Editor and Calendar-Week views. |
| `/web/static/js/` | `router.js` | Handles client-side URL synchronization and browser history (`popstate`). |
| `/web/static/js/` | `api.js` | Fetch wrappers for all backend endpoints. |

## How to Run

1. **Start the Server**:
   ```powershell
   python app.py
   ```
   *The server runs on `http://127.0.0.1:9999`.*

2. **Navigation**:
   - Use the **tabs** at the top to switch between "Schedule Editor" and "Calendar".
   - In **Schedule Editor**, load specific files to edit their structure.
   - In **Calendar**, use the Cog icon to map your schedules to date ranges.

3. **Data Storage**:
   - **Schedules**: Stored as individual `.json` files in `data/schedules/`.
   - **Calendar State**: Mappings and direct events are stored in `data/calendar.json`.
