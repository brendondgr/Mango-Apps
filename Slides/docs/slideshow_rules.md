# Slideshow Transformation Logic

This document defines the logical flow and rules for transforming a structured Markdown update (like those in `weekly/`) into a cinematic, interactive slideshow based on the **Vibrant UI** design system and the **Astro + SvelteKit + GSAP** architecture.

## 0. Input & File System Architecture

> **Note**: The Slideshow Engine now uses a single, permanent installation at `slides/`. Presentations are auto-generated from markdown files — no manual setup required.

- **Source Input**: Markdown files in `md/weekly/` or `docs/` containing `## Powerpoint Slides` or `## Slide X:` sections.
- **Engine Location**: All engine files reside in `slides/` (not in dated subdirectories).
- **Dynamic Routes**: Each markdown file automatically gets a route at `/{filename}`.
    - *Example*: `md/weekly/2026-01-20.md` → accessible at `/2026-01-20`
- **Running the Engine**: 
    ```bash
    cd slides
    npm run dev    # Starts at localhost:4321
    ```


## 1. Content Extraction & Parsing
When given a source `.md` file:
- **Identify the Slide Section**: Look for the `## Powerpoint Slides` (or similar) header.
- **Segment Slides**: Treat each `## Slide X: Title` as a discrete data object.
- **Parse Elements**: Extract bullet points as individual items. If a bullet contains a URL or specific metric (e.g., "200 commits"), flag it for "High-Contrast" or "Mono" styling.

## 2. Display & Fullscreen Behavior
The presentation must occupy the full browser viewport at all times:
- **Full-Screen Layout**: The presentation takes up 100% width and 100% height of the browser window.
- **Fullscreen Button**: A toggle button must always be visible to enter native browser fullscreen mode.
- **Keyboard Shortcuts**: Press `F` key to toggle fullscreen on/off. Press `Escape` to exit fullscreen.
- **No Scrolling**: Each slide is self-contained; the viewport should never scroll.

## 3. Visual Identity & Color Palette
To maintain the "Vibrant" feel, use a **unified color theme** across all slides:
- **Single Theme**: Choose ONE dominant tone from the 16 Categorization Tones (e.g., Blue, Purple, Teal).
- **Accent Colors**: Use 2-3 complementary colors from the palette for highlights, buttons, and emphasis.
- **DO NOT rotate colors per slide** — the entire presentation should feel cohesive.
- **Theme Application**: 
    - The **Background (HEX)** becomes the consistent slide background.
    - The **Border/Accent (HEX)** is used for headers, buttons, and interactive elements.
    - The **Text (HEX)** is used for primary content.

## 4. Containerized Layout
Each slide must use a structured, containerized format:
- **Header Section**: A prominent title for each slide using `Space Grotesk`.
- **Description Block**: A brief summary or context for what the slide covers.
- **Content Cards**: Individual items should be in cards or containers, not bare bullet lists.
- **Visual Hierarchy**: Clear separation between header, description, and content areas.
- **Consistent Alignment**: If the title is centered, ALL content on that slide should be centered.
- **Maximize Content Density**: Minimize whitespace. Content should fill the slide appropriately with larger fonts and reduced padding where possible.

## 4.1. Interactive Links
Clickable links must be styled consistently:
- **No Default Hyperlink Styling**: Do NOT use browser-default underlined blue text for links.
- **Pill/Button Style**: Links should be styled as interactive buttons or pill-shaped containers.
- **Full Container Clickable**: The entire button/pill should be clickable, not just the text.
- **Visual Consistency**: Links should match the overall design system (gradients, rounded corners, shadows).

## 5. Imagery & Visuals
Slides should include generated images to enhance visual appeal:
- **AI-Generated Images**: Use the `generate_image` tool to create contextual visuals for slides.
- **Placement**: Images should complement the content, placed alongside or integrated with text.
- **Style**: Images should match the professional, modern aesthetic of the presentation.

## 6. Slide Navigation & UI Elements
Navigation controls should be minimal and unobtrusive:
- **Auto-Hiding Navigation**: Navigation controls are hidden until the mouse moves over the slide area. They fade out after 2-3 seconds of inactivity.
- **Slide Numbers**: Always displayed at the **bottom-right** corner in `JetBrains Mono` font.
- **Progress Indicator**: Optional dot navigation for quick slide jumping.
- **Keyboard Support**: Arrow keys and Space for navigation.

## 7. Motion Orchestration (GSAP)
Slide transitions should use **horizontal sliding** animations:
- **Entry Sequence (Next Slide)**:
    1. Current slide slides out to the **left** with slight scale down.
    2. New slide slides in from the **right** with scale up to normal.
    3. **Content elements start INVISIBLE** (opacity: 0) when the slide arrives.
    4. After slide reaches final position, content elements **stagger in** with spring animation.
- **Entry Sequence (Previous Slide)**:
    1. Current slide slides out to the **right**.
    2. New slide slides in from the **left**.
    3. Content animations follow the same pattern as above.
- **DO NOT use fade in/out effects** — use sliding card animations exclusively.
- **CRITICAL**: Content elements must be **invisible during the slide transition** and only animate in AFTER the slide has reached its final position. Do NOT show content during the sliding motion.
- **Spring Curve**: Apply `cubic-bezier(0.34, 1.56, 0.64, 1)` for snappy, tactile transitions.

- **Icon Colors**: Use the theme accent color for icons, with background using low-opacity theme colors.

## 7.2. Technical Implementation & Performance
To prevent common UI issues and "gaps" during transitions:
- **Simultaneous Transitions**: Use Svelte's `{#key}` block to wrap the active slide. This ensures the old slide exits *while* the new slide enters, creating an overlapping effect with zero whitespace gap.
- **CSS Import Order**: In `global.css`, all `@import` statements (like Google Fonts) MUST precede everything else, including `@import "tailwindcss"`. Failure to do this will cause PostCSS build warnings/errors.
- **Immediate Animation**: Content items must begin animating immediately upon the new slide's arrival in the DOM (use `requestAnimationFrame` or `introend` event) to avoid a delayed or "stuttery" feel.
- **No Manual Sequencing**: Avoid manual `await` delays between slide-out and slide-in; let Svelte's transition engine handle the overlap automatically.

## 8. Unique Slide Layouts
Each slide should have a **distinct layout** appropriate to its content:
- **Title Slide**: Large centered text, minimal elements.
- **Overview Slide**: Grid or card layout for multiple items.
- **Metric Slide**: Large numbers with supporting context.
- **Showcase Slide**: Image-heavy with minimal text.
- **List Slide**: Stacked cards with icons or bullets.
- **Goals Slide**: Checklist or timeline format.
- **Mix it up!**: Don't use the same layout template for every slide.

## 9. Component Mapping (SvelteKit)
Map the parsed content to Svelte components:
- **Slide Container**: Full-viewport container with consistent background.
- **Headers**: Map the Slide Title to an `<h1>` using `Space Grotesk`.
- **Description**: Subheading or intro text in `DM Sans`.
- **Content Cards**: `InteractiveCards` with hover lift (`translateY(-2px)`) and spring scaling.
- **Metadata**: Slide numbers use `JetBrains Mono`.

## 10. Validation Checklist
Before finalizing a transformation, verify:
- [ ] Does the presentation take up full width and height of the browser?
- [ ] Is there a fullscreen toggle button visible at all times?
- [ ] Do keyboard shortcuts (F for fullscreen, Arrows for navigation) work?
- [ ] Are ALL slides using a unified color theme (not rotating)?
- [ ] Does each slide have a header and description section?
- [ ] Are images included where appropriate?
- [ ] Are slide numbers displayed at the bottom-right?
- [ ] Does navigation auto-hide until mouse movement?
- [ ] Do slide transitions use overlapping horizontal sliding (no gaps)?
- [ ] Are links styled as buttons/pills (not underlined text)?
- [ ] Do different slides have different, unique layouts?
- [ ] Are headings in `Space Grotesk` and body in `DM Sans`?
- [ ] Is the CSS properly ordered (imports at top)?
- [ ] Is whitespace minimized (content is large and fills the slide)?
