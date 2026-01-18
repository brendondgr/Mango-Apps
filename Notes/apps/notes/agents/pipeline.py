"""
Agent Pipeline

Orchestrates all 4 stages into a single topic generation workflow.
"""

import sys
from typing import Optional
from .schemas import (
    PlanningOutput,
    TopicContent,
    VisualizationMeta,
    GenerationResult,
    GenerationError,
)
from .planner import plan_topic
from .researcher import research_topic
from .generator import generate_content, generate_visualization
from .publisher import publish_topic


def log(message: str, level: str = "info") -> None:
    """Print progress message with flush for real-time output."""
    icons = {"info": "ℹ️", "success": "✅", "error": "❌", "progress": "⏳"}
    icon = icons.get(level, "•")
    print(f"{icon} {message}", flush=True)


def generate_topic_stream(
    inquiry: str,
    subject_slug: str,
):
    """
    Generator that yields status updates from the pipeline.
    Yields dicts with keys: type, message, level, data
    """
    import time
    
    start_time = time.time()
    yield {"type": "log", "message": "Starting topic generation pipeline...", "level": "progress"}
    
    # Stage 1: Planning
    stage_start = time.time()
    yield {"type": "log", "message": "Stage 1/4: Planning topic structure...", "level": "progress"}
    yield {"type": "step_start", "step": "planning"}
    
    plan, error = plan_topic(inquiry)
    
    if error:
        yield {"type": "log", "message": f"Planning failed: {error.message}", "level": "error"}
        yield {"type": "result", "data": GenerationResult(success=False, error=error)}
        return
    
    yield {
        "type": "log", 
        "message": f"Plan created: '{plan.name}' with {len(plan.visualizations)} visualizations", 
        "level": "success"
    }
    yield {
        "type": "step_complete", 
        "step": "planning", 
        "duration": time.time() - stage_start,
        "details": {"name": plan.name, "visualizations": len(plan.visualizations)}
    }
    
    # Stage 2: Research
    stage_start = time.time()
    yield {"type": "log", "message": "Stage 2/4: Researching topic...", "level": "progress"}
    yield {"type": "step_start", "step": "research"}
    
    research, citations, error = research_topic(plan.question)
    
    if error:
        yield {"type": "log", "message": f"Research failed: {error.message}", "level": "error"}
        yield {"type": "result", "data": GenerationResult(success=False, error=error)}
        return
    
    yield {"type": "log", "message": f"Research complete: {len(research)} characters retrieved", "level": "success"}
    yield {
        "type": "step_complete", 
        "step": "research", 
        "duration": time.time() - stage_start, 
        "size": len(research)
    }
    
    # Stage 3a: Visualization Generation
    visualizations: list[VisualizationMeta] = []
    viz_filenames: list[str] = []
    
    yield {"type": "step_start", "step": "visualization"}
    
    for i, viz_desc in enumerate(plan.visualizations, 1):
        viz_start = time.time()
        yield {"type": "log", "message": f"Stage 3a/4: Generating visualization {i}/{len(plan.visualizations)}...", "level": "progress"}
        yield {"type": "substep_start", "parent": "visualization", "index": i, "total": len(plan.visualizations)}
        
        viz, error = generate_visualization(
            description=viz_desc,
            topic_context=f"{plan.name}: {plan.description}",
            index=i,
        )
        
        if error:
            yield {"type": "log", "message": f"Visualization {i} failed (skipping): {error.message}", "level": "error"}
            continue
        
        visualizations.append(viz)
        viz_filenames.append(viz.file_name)
        
        yield {"type": "log", "message": f"Visualization created: {viz.file_name}", "level": "success"}
        yield {
            "type": "substep_complete",
            "parent": "visualization", 
            "index": i, 
            "duration": time.time() - viz_start,
            "size": len(viz.html_content),
            "filename": viz.file_name
        }

    yield {"type": "step_complete", "step": "visualization", "count": len(visualizations)}

    # Stage 3b: Content Generation
    stage_start = time.time()
    yield {"type": "log", "message": "Stage 3b/4: Generating markdown content...", "level": "progress"}
    yield {"type": "step_start", "step": "content"}
    
    markdown, error = generate_content(
        topic_name=plan.name,
        research=research,
        visualizations=plan.visualizations,
        viz_filenames=viz_filenames,
        citations=citations,
    )
    
    if error:
        yield {"type": "log", "message": f"Content generation failed: {error.message}", "level": "error"}
        yield {"type": "result", "data": GenerationResult(success=False, error=error)}
        return
    
    yield {"type": "log", "message": f"Content generated: {len(markdown)} characters", "level": "success"}
    yield {
        "type": "step_complete", 
        "step": "content", 
        "duration": time.time() - stage_start, 
        "size": len(markdown)
    }
    
    # Build complete topic content
    content = TopicContent(
        name=plan.name,
        description=plan.description,
        folder=plan.folder,
        markdown_content=markdown,
        visualizations=visualizations,
    )
    
    # Stage 4: Publishing
    stage_start = time.time()
    yield {"type": "log", "message": "Stage 4/4: Publishing topic files...", "level": "progress"}
    yield {"type": "step_start", "step": "publishing"}
    
    topic_path, error = publish_topic(subject_slug, content)
    
    if error:
        yield {"type": "log", "message": f"Publishing failed: {error.message}", "level": "error"}
        yield {
            "type": "result", 
            "data": GenerationResult(
                success=False,
                topic_content=content,
                error=error,
            )
        }
        return
    
    yield {"type": "log", "message": f"Topic published to: apps/{topic_path}/", "level": "success"}
    yield {"type": "log", "message": "Pipeline complete!", "level": "success"}
    
    yield {
        "type": "step_complete", 
        "step": "publishing", 
        "duration": time.time() - stage_start
    }
    
    # Final Result
    yield {
        "type": "result",
        "data": GenerationResult(
            success=True,
            topic_path=topic_path,
            topic_content=content,
        ),
        "total_duration": time.time() - start_time
    }


def generate_topic(
    inquiry: str,
    subject_slug: str,
    verbose: bool = True,
) -> GenerationResult:
    """
    Full pipeline: Plan → Research → Generate → Publish.
    Synchronous wrapper around generate_topic_stream.
    
    Args:
        inquiry: User's learning request
        subject_slug: Parent subject directory name
        verbose: Print progress messages
        
    Returns:
        GenerationResult with success status and details
    """
    result = None
    for event in generate_topic_stream(inquiry, subject_slug):
        if event["type"] == "log" and verbose:
            log(event["message"], event.get("level", "info"))
        elif event["type"] == "result":
            result = event["data"]
            
    return result if result else GenerationResult(success=False, error=GenerationError("pipeline", "No result returned"))


def preview_topic(inquiry: str) -> tuple[Optional[PlanningOutput], Optional[GenerationError]]:
    """
    Run only Stage 1 to preview what would be generated.
    
    Useful for user confirmation before full generation.
    
    Args:
        inquiry: User's learning request
        
    Returns:
        Tuple of (PlanningOutput, error) - one will be None
    """
    return plan_topic(inquiry)

