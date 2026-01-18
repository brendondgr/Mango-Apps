import re
import markdown
from pymdownx import arithmatex
from pymdownx import superfences

def render_markdown(content: str) -> str:
    """
    Render markdown content to HTML with specific extensions for LaTeX and code blocks.

    Args:
        content (str): The markdown content to render.

    Returns:
        str: The rendered HTML string.
    """
    
    # Pre-process content to support implicit footnotes [n] -> [^n] for consistency
    # Convert [n] to [^n] where n is a number
    content = re.sub(r'\[(\d+)\]', r'[^\1]', content)
    # Convert [n]: to [^n]: for reference definitions (start of line)
    content = re.sub(r'^\[(\d+)\]:', r'[^\1]:', content, flags=re.MULTILINE)
    
    # Pre-process LaTeX delimiters to ensure they survive markdown parsing
    # Handles both $$...$$ and \[...\] / \(...\) syntaxes
    
    # Helper to ignore code blocks during replacements
    def replace_outside_code_blocks(content, pattern, replacement_func):
        """Apply replacement_func only outside of code blocks."""
        code_block_pattern = r'((?:^|\n)```[\s\S]*?\n```|`[^`\n]*`)'
        
        def smart_replace(match):
            # If this is a code block, keep it as-is
            if match.group(0).startswith('`'):
                return match.group(0)
            return replacement_func(match)
        
        # Combined pattern: code blocks OR the target pattern
        combined = f'({code_block_pattern})|({pattern})'
        
        def combined_replacer(m):
            if m.group(1):  # code block
                return m.group(1)
            return replacement_func(m)
        
        return re.sub(combined, combined_replacer, content, flags=re.MULTILINE)
    
    # Step 1: Convert \[...\] block math to \\[...\\] (double escaped for markdown)
    def convert_block_backslash(match):
        math_content = match.group(3) if match.group(3) else ""
        return f"\\\\[{math_content}\\\\]"
    
    # Match \[...\] where \[ is the delimiter (not inside a word)
    # Using a simpler approach: Find \[...\] and replace
    block_latex_pattern = r'(?<!\\)\\(\[)([\s\S]*?)(?<!\\)\\(\])'
    content = re.sub(
        r'((?:^|\n)```[\s\S]*?\n```|`[^`\n]*`)|(?<!\\)\\(\[)([\s\S]*?)(?<!\\)\\(\])',
        lambda m: m.group(0) if m.group(1) else f"\\\\[{m.group(3)}\\\\]",
        content,
        flags=re.MULTILINE
    )
    
    # Step 2: Convert \(...\) inline math to \\(...\\) (double escaped for markdown)
    content = re.sub(
        r'((?:^|\n)```[\s\S]*?\n```|`[^`\n]*`)|(?<!\\)\\(\()([\s\S]*?)(?<!\\)\\(\))',
        lambda m: m.group(0) if m.group(1) else f"\\\\({m.group(3)}\\\\)",
        content,
        flags=re.MULTILINE
    )
    
    # Step 3: Convert $$...$$ to \\[...\\] (block) or \\(...\\) (inline)
    # but ignore $$ inside code blocks (```...``` or `...`)
    pattern = r'((?:^|\n)```[\s\S]*?\n```|`[^`\n]*`)|(?<!\\)\$\$([\s\S]*?)(?<!\\)\$\$'
    
    def replace_latex(match):
        code_block = match.group(1)
        math_content = match.group(2)
        
        if code_block:
            return code_block
        else:
            # Check if it's a block (on its own line)
            # We look at the original string around the match
            start, end = match.span()
            full_text = match.string
            
            # Check characters before
            is_start_of_line = (start == 0) or (full_text[start-1] == '\n')
            # Check characters after
            is_end_of_line = (end == len(full_text)) or (full_text[end] == '\n')
            
            if is_start_of_line and is_end_of_line:
                 # Double escape to ensure \[ survives markdown parsing if arithmatex misses it
                 return f"\\\\[{math_content}\\\\]"
            else:
                 return f"\\\\({math_content}\\\\)"
            
    content = re.sub(pattern, replace_latex, content)
    
    # Extract reference definitions: [^n]: url or [^n]: [text](url)
    # We remove them from the markdown so they don't get rendered as text
    # Map id -> url
    references = {}
    reference_counts = {}
    
    def extract_ref(match):
        ref_id = match.group(1)
        content = match.group(2).strip()
        
        # Check if it's a markdown link format: [text](url)
        link_match = re.search(r'\[.*?\]\((.*?)\)', content)
        if link_match:
            url = link_match.group(1)
        else:
            # Plain URL
            url = content
        
        references[ref_id] = url
        reference_counts[ref_id] = 0
        return "" # Remove from content
        
    content = re.sub(r'^\[\^(\d+)\]:\s*(.+)$', extract_ref, content, flags=re.MULTILINE)
    
    # Remove any explicit "References" headers since we auto-generate them
    # Match: ## References, ### References, ## References\n, etc.
    content = re.sub(r'^#{1,3}\s*References\s*$', '', content, flags=re.MULTILINE | re.IGNORECASE)
    
    # Configure extensions
    extensions = [
        'pymdownx.arithmatex',
        'pymdownx.superfences',
        'markdown.extensions.tables',
        'markdown.extensions.admonition',
        'pymdownx.blocks.admonition',
        # 'markdown.extensions.footnotes', # Disabled for custom badge implementation
    ]

    # Configure extension options
    extension_configs = {
        'pymdownx.arithmatex': {
            'generic': True,  # Preserve LaTeX delimiters for MathJax
        },
        'pymdownx.superfences': {
            # Advanced code block handling with nesting support
            # No specific extra config needed for basic usage, but can be extended
        }
    }

    # Render markdown to HTML
    # Note: safe_mode is deprecated in Python-Markdown. 
    # If HTML sanitization is required, consider using a library like bleach on the output.
    # Render markdown to HTML
    html_content = markdown.markdown(
        content,
        extensions=extensions,
        extension_configs=extension_configs
    )

    # Post-process: Replace text citations [^n] with badges
    def replace_citation(match):
        ref_id = match.group(1)
        if ref_id in references:
            reference_counts[ref_id] += 1
            url = references[ref_id]
            return f'<a href="{url}" class="citation-badge" target="_blank" title="Source: {url}">{ref_id}</a>'
        return match.group(0) # Keep as is if no definition found
    
    # Match [^n] in the rendered HTML (text nodes)
    # Note: Regex on HTML is fragile but for this controlled input it works. 
    # The markdown renderer leaves [^n] as text since footnotes ext is disabled.
    html_content = re.sub(r'\[\^(\d+)\]', replace_citation, html_content)
    
    # Append References Section if there are used references
    used_refs = [ref_id for ref_id, count in reference_counts.items() if count > 0]
    
    if used_refs:
        html_content += '\n<div class="references-section">'
        html_content += '<h2>References</h2>'
        html_content += '<ul class="reference-list">'
        for ref_id in sorted(used_refs, key=lambda x: int(x)):
            count = reference_counts[ref_id]
            url = references[ref_id]
            count_label = f"({count})"
            html_content += f'<li><span class="ref-number">#{ref_id}</span> <a href="{url}" target="_blank">{url}</a> <span class="ref-count">{count_label}</span></li>'
        html_content += '</ul>'
        html_content += '</div>'

    return html_content
