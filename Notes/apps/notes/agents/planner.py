"""
Stage 1: The Planner (Architect)

Analyzes user inquiry and produces structured topic plan.
"""

from typing import Optional
from .clients import generate_with_fallback, CodeBlockParser
from .schemas import PlanningOutput, GenerationError

PLANNER_SYSTEM_PROMPT = """You are an educational content architect. Your task is to analyze a user's learning inquiry and produce a structured plan for creating educational content.

You must respond with a JSON code block containing:
- name: A clear, concise title for the topic
- description: A brief 1-2 sentence summary
- folder: A lowercase slug for the directory name (use underscores for spaces)
- question: A detailed, comprehensive search query to research this topic
- visualizations: A list of descriptions for interactive HTML visualizations that would help explain the concept. Prefer creating a single, comprehensive interactive visualization that covers multiple aspects of the topic, rather than multiple isolated visualizations.

Example response format:
```json
{
    "name": "Vector Addition",
    "description": "Understanding how to add vectors geometrically and algebraically.",
    "folder": "vector_addition",
    "question": "Explain vector addition in 2D and 3D space, including the parallelogram law, component-wise addition, and geometric interpretations with examples",
    "visualizations": [
        "Interactive 2D canvas showing two draggable vectors and their sum using the tip-to-tail method",
        "3D visualization of vector addition in three-dimensional space with adjustable components"
    ]
}
```

Always wrap your JSON in a ```json code block."""


def plan_topic(inquiry: str) -> tuple[Optional[PlanningOutput], Optional[GenerationError]]:
    """
    Stage 1: Generate topic plan from user inquiry.
    
    Args:
        inquiry: User's learning request/question
        
    Returns:
        Tuple of (PlanningOutput, error) - one will be None
    """
    prompt = f"""Create a structured educational topic plan for the following inquiry:

"{inquiry}"

Consider what visualizations would best help explain this concept interactively."""

    response, error = generate_with_fallback(
        prompt=prompt,
        system_prompt=PLANNER_SYSTEM_PROMPT,
        required_blocks=["json"],
    )
    
    if error:
        error.stage = f"Planning: {error.stage}"
        return None, error
    
    # Parse JSON from response
    data = CodeBlockParser.extract_json(response)
    
    if not data:
        return None, GenerationError(
            stage="Planning: JSON parsing",
            message="Failed to parse planning output as JSON",
            retries_attempted=3,
        )
    
    # Validate required fields
    required_fields = ["name", "description", "folder", "question"]
    missing = [f for f in required_fields if f not in data]
    
    if missing:
        return None, GenerationError(
            stage="Planning: validation",
            message=f"Missing required fields: {missing}",
            retries_attempted=3,
        )
    
    return PlanningOutput(
        name=data["name"],
        description=data["description"],
        folder=data["folder"],
        question=data["question"],
        visualizations=data.get("visualizations", []),
    ), None
