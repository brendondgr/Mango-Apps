"""
Agent Schemas

Pydantic models for structured agent inputs and outputs.
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class PlanningOutput:
    """Output from Stage 1: The Planning Agent."""
    name: str
    description: str
    folder: str
    question: str
    visualizations: list[str] = field(default_factory=list)


@dataclass
class VisualizationMeta:
    """Metadata for a generated visualization."""
    file_name: str
    html_content: str = ""


@dataclass
class TopicContent:
    """Complete generated topic content."""
    name: str
    description: str
    folder: str
    markdown_content: str
    visualizations: list[VisualizationMeta] = field(default_factory=list)


@dataclass
class GenerationError:
    """Error information for failed generation."""
    stage: str
    message: str
    retries_attempted: int = 0
    
    def to_dict(self) -> dict:
        return {
            "stage": self.stage,
            "message": self.message,
            "retries_attempted": self.retries_attempted,
        }


@dataclass
class GenerationResult:
    """Result of topic generation pipeline."""
    success: bool
    topic_path: Optional[str] = None
    topic_content: Optional[TopicContent] = None
    error: Optional[GenerationError] = None
