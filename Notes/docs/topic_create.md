# Topic Creation Guide

This comprehensive guide explains how to create custom Topics for the Visualizers platform. Topics are the core content units that contain educational material with optional interactive visualizations.

---

## Table of Contents

1. [File Structure Overview](#file-structure-overview)
2. [Directory Location](#directory-location)
3. [The info.json Schema](#the-infojson-schema)
4. [Markdown and LaTeX Formatting](#markdown-and-latex-formatting)
5. [Creating Visualization Apps](#creating-visualization-apps)
6. [Using Python for Content Generation](#using-python-for-content-generation)
7. [Import Methods](#import-methods)
8. [Complete Example](#complete-example)

---

## File Structure Overview

A Topic is a self-contained directory. We encourage naming files based on the concept being taught.

```text
Vectors/
├── info.json          # REQUIRED - Metadata (title, description, entry_point)
├── vectors.md         # REQUIRED - Main lesson content (renamable, set in info.json)
├── icon.svg           # OPTIONAL - Topic icon
├── vector_add.html    # OPTIONAL - Visualization for specific concept
└── static/            # OPTIONAL - Assets
    └── images/
        └── plot.png
```

### Key Principles

1.  **Concept-Based Naming**: Name your `.md` and `.html` files after the concept (e.g., `eigenvalues.md`, `matrix_transform.html`).
2.  **Entry Point**: Specify your main markdown file in `info.json` using the `entry_point` field.
3.  **Visualization Placement**: Embed visualizations immediately **below** the section they illustrate, with a clear label.

---

## Directory Location

Topics are stored within the `apps/` directory at the project root:

```text
Visualizers/
├── apps/
│   ├── LA/                       # Subject (Linear Algebra)
│   │   └── vectors/              # Topic directory
│   │       ├── info.json
│   │       ├── vectors.md
│   │       └── vector_add.html
```

---

## The info.json Schema

The `info.json` file defines topic metadata and configuration.

```json
{
  "title": "Vectors",
  "description": "Introduction to geometric vectors.",
  "icon": "icon.svg",
  "entry_point": "vectors.md"
}
```

| Field         | Type   | Required | Description                                                        |
| ------------- | ------ | -------- | ------------------------------------------------------------------ |
| `title`       | string | Yes      | Display title.                                                     |
| `description` | string | Yes      | Brief description.                                                 |
| `entry_point` | string | No       | **New**: specific markdown file to load. Defaults to `example.md`. |
| `icon`        | string | No       | Icon filename (`.svg`, `.png`).                                    |

---

## Markdown and LaTeX Formatting

Use standard Markdown with LaTeX support.

### Embedding Visualizations

Embed HTML visualizations using `<iframe>`. **Always Place the visualization immediately after the concept explanation** and provide a descriptive label.

```markdown
## Vector Addition

The sum of two vectors $\mathbf{u}$ and $\mathbf{v}$ corresponds to placing them tip-to-tail.

### Visualization: Vector Addition

Interact with the vectors below to see how the resultant sum changes:

<iframe src="vector_add.html" width="100%" height="500" frameborder="0"></iframe>
```

---

## Creating Visualization Apps

Visualizations are standard HTML5 apps.

### Mobile-Friendly Design

All visualizations **must** be mobile-responsive.

- Use `meta name="viewport"`
- Use CSS Flexbox/Grid
- Support touch events for interaction (e.g., dragging on canvas)

### Stylization Rules (Vibrant UI)

- **Colors**: Primary `#4C3BCF`, Accent `#FF6B6B`, Background `#FEFBF6`.
- **Typography**: Space Grotesk (Headers), DM Sans (Body).
- **Container**: Use `border-radius: 12px`, `box-shadow`: subtle.

#### Categorization Tones (Recommended for Graphs)

When creating multi-colored visualizations or graphs, use these predefined color sets for consistency and premium look.

| Theme             | Background | Border/Accent | Text      |
| :---------------- | :--------- | :------------ | :-------- |
| **Yellow Orange** | `#fef3c7`  | `#f59e0b`     | `#78350f` |
| **Yellow**        | `#fef9c3`  | `#eab308`     | `#713f12` |
| **Orange**        | `#ffedd5`  | `#f97316`     | `#7c2d12` |
| **Red**           | `#fee2e2`  | `#ef4444`     | `#7f1d1d` |
| **Blue**          | `#dbeafe`  | `#3b82f6`     | `#1e3a8a` |
| **Purple**        | `#f3e8ff`  | `#a855f7`     | `#581c87` |
| **Teal**          | `#ccfbf1`  | `#14b8a6`     | `#134e4a` |
| **Light Purple**  | `#ede9fe`  | `#8b5cf6`     | `#4c1d95` |
| **Light Blue**    | `#e0f2fe`  | `#0ea5e9`     | `#0c4a6e` |
| **Green**         | `#d1fae5`  | `#10b981`     | `#064e3b` |
| **Black**         | `#1f2937`  | `#111827`     | `#ffffff` |
| **Muted Gray**    | `#e2e8f0`  | `#64748b`     | `#0f172a` |
| **Brown**         | `#fde68a`  | `#b45309`     | `#78350f` |
| **Light Pink**    | `#fce7f3`  | `#f472b6`     | `#831843` |
| **Kiwi**          | `#ecfccb`  | `#84cc16`     | `#365314` |
| **Rose**          | `#ffe4e6`  | `#f43f5e`     | `#881337` |

#### Markdown Alerts (Callouts)

Use blockquotes with specific markers to highlight important information. These will be automatically styled as **centered, compact callouts** with bold colored labels.

> [!IMPORTANT]
> Use this for critical information or must-know points. (Bold Purple)

> [!NOTE]
> Use this for additional context or helpful tips. (Bold Green)

> [!WARNING]
> Use this for cautionary or high-risk notes. (Bold Red)

To use them in Markdown:

```markdown
> [!IMPORTANT]
> Your important message here.

> [!NOTE]
> Your helpful note here.

> [!WARNING]
> Your cautionary message here.
```

---

## Using Python for Content Generation

You can use Python scripts to generate algorithmic images or data visualizations (using generic libraries like `matplotlib` or `numpy`) and save them for use in your topic.

### Workflow

1.  **Create Script**: Place a python script (e.g., `generate_plot.py`) in your topic folder.
2.  **Generate Assets**: Have the script save output images to the `static/images/` directory (or `/media/` if configured globally).
3.  **Embed**: Reference the generated image in your markdown.

**Example Script (`generate_plot.py`):**

```python
import matplotlib.pyplot as plt
import numpy as np
import os

# Ensure output directory exists
output_dir = 'static/images'
os.makedirs(output_dir, exist_ok=True)

x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.figure(figsize=(6, 4))
plt.plot(x, y, color='#4C3BCF')
plt.title('Generated Sine Wave')
plt.savefig(f'{output_dir}/sine.png')
```

**Markdown Usage:**

```markdown
![Sine Wave](static/images/sine.png)
```

---

## Complete Example

**Topic**: `apps/LA/vectors`

### `info.json`

```json
{
  "title": "Vectors",
  "description": "Understanding magnitude and direction.",
  "entry_point": "vectors.md",
  "icon": "icon.svg"
}
```

### `vectors.md`

```markdown
# Vectors

A vector has magnitude and direction.

## Visualization

<iframe src="vector_arrow.html" width="100%" height="400"></iframe>
```

### `vector_arrow.html` (Condensed)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: "DM Sans", sans-serif;
        background: #fefbf6;
        padding: 1rem;
      }
      .card {
        background: white;
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      canvas {
        width: 100%;
        touch-action: none;
      } /* Mobile touch support */
    </style>
  </head>
  <body>
    <div class="card">
      <h3>Interactive Vector</h3>
      <canvas id="c"></canvas>
    </div>
    <script>
      // interactive logic here
    </script>
  </body>
</html>
```

---

## Best Practices & Common Pitfalls

To ensure visualizations remain stable and visually consistent when rendered in iframes, follow these guidelines:

### 1. Robust Initialization

**Avoid `window.onload`**. In iframe environments, `window.onload` can be unreliable or delayed by secondary assets like fonts.

- **No Emojis in UI**: Avoid using emojis in visualization titles, labels, or buttons unless they serve a critical functional purpose. Default to clean, professional typography.
- **Immediate Initialization**: Place script tags at the end of `<body>` and call your `init()` function directly. Do not use `window.onload` or `DOMContentLoaded` as they can be unreliable if the parent page has already loaded the iframe.
- **Example**:
  ```javascript
  // At the bottom of your script
  init(); // Call immediately
  ```

### 2. Reliable Color Handling

**Do not rely solely on `getComputedStyle`** for dynamic colors in JavaScript if they are critical for rendering.

- **Issue**: `getComputedStyle` might return incorrect or empty values if the script runs before the iframe's CSS is fully parsed.
- **Better**: Hardcode the Vibrant UI hex codes or provide them as fallbacks in your JavaScript.
- **Example**:
  ```javascript
  const COLORS = {
    primary: "#4C3BCF",
    blue: "#3b82f6",
    // ... other fallbacks
  };
  ```

### 3. Canvas Resizing

Always handle the `resize` event to ensure the canvas fills its container properly when the window or iframe dimensions change.

---

## Troubleshooting

- **"File not found"**: Check `entry_point` in `info.json`.
- **"Visualization broken"**: ensure `<iframe>` src matches HTML filename exactly.
