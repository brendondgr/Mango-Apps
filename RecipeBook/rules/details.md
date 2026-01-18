# ShortSpork File Reference

This document provides a reference guide for all files, classes, and functions in the ShortSpork project.

---

## Core Application

### `app.py`
Flask application entry point.

| Name | Type | Description |
|------|------|-------------|
| `app` | Flask | Main Flask application instance |
| `index()` | Function | Homepage route, renders `index.html` |
| `health()` | Function | Health check endpoint, returns JSON status |

---

## CSS Files

### `web/static/css/spices.css`
Design system CSS variables (Vibrant UI tokens).

| Variable Category | Description |
|-------------------|-------------|
| Brand Colors | Primary, Secondary, Tertiary colors |
| Neutral Base | Background, Surface, Elevated colors |
| Categorization Tones | 16 color sets with bg/border/text variants |
| Typography | Font families and size scale |
| Shadow System | xs to xl shadow definitions |
| Border Radius | xs to full radius values |
| Spacing | Space scale (1-12) |
| Transitions | Timing functions including spring animation |
| Glassmorphism | Blur and glass background effects |

### `web/static/css/plating.css`
Base styles and CSS reset.

| Section | Description |
|---------|-------------|
| CSS Reset | Box-sizing, margin/padding reset |
| Base Typography | Heading styles (h1-h6), body text |
| Focus States | Accessibility-focused outline styles |
| Scrollbar | Custom scrollbar styling |
| Utility Classes | `.sr-only`, `.container` |

### `web/static/css/components.css`
UI component library.

| Class | Description |
|-------|-------------|
| `.btn`, `.btn-primary/secondary/tertiary` | Button variants with glow hover |
| `.btn-ghost`, `.btn-outline-*` | Ghost and outline button styles |
| `.btn-sm`, `.btn-lg`, `.btn-icon` | Button size modifiers |
| `.card`, `.card-elevated`, `.card-recipe` | Card components with hover lift |
| `.badge`, `.badge-{color}` | Status badges (16 categorization tones) |
| `.input`, `.textarea`, `.select` | Form input controls |
| `.checkbox`, `.radio`, `.toggle` | Custom checkbox/radio/toggle switches |
| `.segmented-control` | Segmented button group |
| `.glass`, `.glass-strong` | Glassmorphism utilities |

### `web/static/css/navigation.css`
Navigation and layout components.

| Class | Description |
|-------|-------------|
| `.main-nav`, `.nav-brand`, `.nav-links` | Glass header navigation |
| `.nav-link`, `.nav-link.active` | Navigation link styling |
| `.main-content` | Main content area spacing |
| `.main-footer` | Footer styling |
| `.page-header`, `.page-title` | Page header components |
| `.breadcrumbs` | Breadcrumb navigation |

### `web/static/css/garnishes.css`
Animations and micro-interactions.

| Class | Description |
|-------|-------------|
| `.transition-fast/normal/slow/spring` | Transition utilities |
| `.hover-lift`, `.hover-scale`, `.hover-glow-*` | Hover effects |
| `.spinner`, `.spinner-sm/lg` | Loading spinner |
| `.skeleton`, `.skeleton-text/title/card` | Skeleton loading states |
| `.animate-spin/pulse/fade-in/slide-up` | Animation utilities |
| `.focus-ring` | Enhanced focus indicators |

---

## Templates

### `web/templates/kitchen.html`
Base Jinja2 template for all pages.

| Block Name | Description |
|------------|-------------|
| `title` | Page title |
| `description` | Meta description |
| `styles` | Additional page-specific styles |
| `nav_links` | Additional navigation links |
| `content` | Main page content |
| `footer` | Footer content |
| `scripts` | Additional JavaScript files |

### `web/templates/index.html`
Homepage template extending `kitchen.html`.

---

## Configuration Files

### `requirements.txt`
Python package dependencies.

| Package | Purpose |
|---------|---------|
| `flask` | Web framework |
| `requests` | HTTP library |
| `python-dotenv` | Environment variable loading |

### `.env.example`
Environment variable template.

| Variable | Purpose |
|----------|---------|
| `PERPLEXITY_API_KEY` | API key for AI-powered recipe parsing |
