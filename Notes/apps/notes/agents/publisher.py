"""
Stage 4: The Publisher

Compiles generated content into the topic directory structure.
"""

import json
from pathlib import Path
from typing import Optional
from django.conf import settings

from .schemas import TopicContent, GenerationError


def get_apps_dir() -> Path:
    """Get the apps directory path."""
    return Path(settings.BASE_DIR) / "apps"


def publish_topic(
    subject_slug: str,
    content: TopicContent,
) -> tuple[Optional[str], Optional[GenerationError]]:
    """
    Stage 4: Create topic directory and write all files.
    
    Args:
        subject_slug: Parent subject directory name
        content: Complete generated topic content
        
    Returns:
        Tuple of (relative_path, error) - one will be None
    """
    apps_dir = get_apps_dir()
    
    # Create topic directory path: apps/<Subject>/<Topic>/
    topic_dir = apps_dir / subject_slug / content.folder
    
    try:
        # Create directories
        topic_dir.mkdir(parents=True, exist_ok=True)
        
        # Write info.json
        info_data = {
            "title": content.name,
            "description": content.description,
            "entry_point": f"{content.folder}.md",
        }
        
        info_path = topic_dir / "info.json"
        with open(info_path, "w", encoding="utf-8") as f:
            json.dump(info_data, f, indent=4, ensure_ascii=False)
        
        # Process markdown to embed visualizations correctly
        markdown = content.markdown_content
        
        # Update visualization filenames in markdown if needed
        for i, viz in enumerate(content.visualizations, 1):
            placeholder = f"visualization_{i}.html"
            if placeholder in markdown and viz.file_name != placeholder:
                markdown = markdown.replace(placeholder, viz.file_name)
        
        # Write markdown file
        md_path = topic_dir / f"{content.folder}.md"
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(markdown)
        
        # Write visualization HTML files
        for viz in content.visualizations:
            viz_path = topic_dir / viz.file_name
            with open(viz_path, "w", encoding="utf-8") as f:
                f.write(viz.html_content)
        
        # Return relative path from apps/
        relative_path = f"{subject_slug}/{content.folder}"
        return relative_path, None
        
    except OSError as e:
        return None, GenerationError(
            stage="Publishing",
            message=f"Failed to write topic files: {e}",
            retries_attempted=0,
        )
    except Exception as e:
        return None, GenerationError(
            stage="Publishing",
            message=f"Unexpected error during publishing: {e}",
            retries_attempted=0,
        )
