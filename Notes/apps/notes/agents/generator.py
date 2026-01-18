"""
Stage 3: The Generator (Writer & Coder)

Generates educational markdown content and HTML visualizations.
"""

from typing import Optional
from .clients import generate_with_fallback, CodeBlockParser
from .schemas import VisualizationMeta, GenerationError

CONTENT_SYSTEM_PROMPT = """You are an educational content writer specializing in clear, engaging explanations with LaTeX support for mathematics.

Your task is to synthesize research into well-structured educational Markdown content.

Rules:
1. Use proper Markdown formatting with headers, lists, and emphasis
2. Use LaTeX for all mathematical expressions:
   - Inline math: $expression$
   - Display math: $$expression$$
3. Include clear explanations progressing from simple to complex
4. Add callouts for important information using:
   > [!IMPORTANT]
   > Critical information here
   
   > [!NOTE]
   > Additional context here

Wrap your entire markdown response in a ```md or ```markdown code block."""


VISUALIZATION_SYSTEM_PROMPT = """You are a frontend developer creating interactive educational visualizations.

Create a single, self-contained HTML file for an interactive visualization.

Requirements:
1. Mobile-responsive design (use viewport meta tag)
2. Touch-friendly interactions
3. Use the Vibrant UI design system:
   - Background: #FEFBF6
   - Primary: #4C3BCF
   - Accent: #FF6B6B
   - Font families: 'Space Grotesk' for headers, 'DM Sans' for body
   - Border radius: 12px for containers
   - Subtle box shadows

4. Use canvas or SVG for graphics
5. Include inline CSS and JavaScript (no external dependencies except CDN fonts)
6. Add clear labels and instructions
7.
- **No Emojis**: Do not use emojis in visualization titles, labels, or UI elements unless they are critical for functional clarity. Default to clean, professional typography.
- **Robust Initialization**: Do NOT use `window.onload`. Call your initialization function directly at the end of the script. Place script at the end of the body and call `init()` immediately. Avoid `window.onload` as it is unreliable in iframes.
   - Hardcoded Color Fallbacks: Do not rely solely on `getComputedStyle` to fetch colors in JavaScript. Define the Vibrant UI hex codes directly in your script for robustness.

Color palette for data visualization:
- Blue: #3b82f6
- Purple: #a855f7  
- Teal: #14b8a6
- Orange: #f97316
- Green: #10b981

Also provide the filename as JSON.

Response format - include BOTH blocks:
```json
{"file_name": "visualization_name.html"}
```

```html
<!DOCTYPE html>
<html>
...complete HTML content...
</html>
```"""


def generate_content(
    topic_name: str,
    research: str,
    visualizations: list[str],
    viz_filenames: list[str] = None,
    citations: list[str] = None,
) -> tuple[Optional[str], Optional[GenerationError]]:
    """
    Stage 3a: Generate educational markdown content.
    
    Args:
        topic_name: Name of the topic
        research: Research content from Stage 2
        visualizations: List of visualization descriptions (for context)
        viz_filenames: List of actual generated filenames (for iframes)
        
    Returns:
        Tuple of (markdown_content, error) - one will be None
    """
    # Build iframe placeholders for visualizations
    viz_section = ""
    if visualizations and viz_filenames:
        viz_section = "\n\nEmbed the following visualizations at appropriate points in your content using iframe tags:\n"
        # Ensure we don't index out of bounds if lists differ in length
        count = min(len(visualizations), len(viz_filenames))
        
        for i in range(count):
            desc = visualizations[i]
            filename = viz_filenames[i]
            viz_section += f"- Visualization {i+1}: {desc}\n  Embed Code: <iframe src=\"{filename}\" width=\"100%\" height=\"450\" frameborder=\"0\"></iframe>\n"
    
    prompt = f"""Create comprehensive educational content for the topic: "{topic_name}"

Use the following research as your source material:

---
{research}
---
{viz_section}

Write clear, engaging content with proper LaTeX formatting for any mathematical expressions.

IMPORTANT: You must cite your sources using footnotes like [^1], [^2] corresponding to the numbered sources in the research. Ensure citations are placed at the end of the relevant sentence or section."""

    response, error = generate_with_fallback(
        prompt=prompt,
        system_prompt=CONTENT_SYSTEM_PROMPT,
        required_blocks=["md"],
    )
    
    if error:
        error.stage = f"Content Generation: {error.stage}"
        return None, error
    
    # Extract markdown
    content = CodeBlockParser.extract_block(response, "md")
    if not content:
        content = CodeBlockParser.extract_block(response, "markdown")
    
    if not content:
        return None, GenerationError(
            stage="Content Generation: parsing",
            message="Failed to extract markdown content from response",
            retries_attempted=3,
        )
    
    # Append references section
    if citations:
        content += "\n\n## References\n"
        for i, citation in enumerate(citations, 1):
            content += f"[^{i}]: {citation}\n"
    
    return content, None


def generate_visualization(
    description: str,
    topic_context: str,
    index: int = 1,
) -> tuple[Optional[VisualizationMeta], Optional[GenerationError]]:
    """
    Stage 3b: Generate HTML visualization.
    
    Args:
        description: Description of what the visualization should show
        topic_context: Brief context about the topic
        index: Visualization index (for default filename)
        
    Returns:
        Tuple of (VisualizationMeta, error) - one will be None
    """
    prompt = f"""Create an interactive visualization for the following:

Topic: {topic_context}
Visualization: {description}

Make it engaging, educational, and mobile-friendly."""

    response, error = generate_with_fallback(
        prompt=prompt,
        system_prompt=VISUALIZATION_SYSTEM_PROMPT,
        required_blocks=["json", "html"],
    )
    
    if error:
        error.stage = f"Visualization Generation: {error.stage}"
        return None, error
    
    # Extract JSON metadata
    meta = CodeBlockParser.extract_json(response)
    filename = meta.get("file_name") if meta else f"visualization_{index}.html"
    
    # Ensure .html extension
    if not filename.endswith(".html"):
        filename += ".html"
    
    # Extract HTML content
    html_content = CodeBlockParser.extract_block(response, "html")
    
    if not html_content:
        return None, GenerationError(
            stage="Visualization Generation: parsing",
            message="Failed to extract HTML content from response",
            retries_attempted=3,
        )
    
    return VisualizationMeta(
        file_name=filename,
        html_content=html_content,
    ), None
