"""
Agent Package for Automated Topic Creation

Multi-agent system using Perplexity (research) and Gemini (planning/generation) APIs.
"""

from .pipeline import generate_topic
from .schemas import PlanningOutput, VisualizationMeta, GenerationError

__all__ = [
    "generate_topic",
    "PlanningOutput",
    "VisualizationMeta", 
    "GenerationError",
]
