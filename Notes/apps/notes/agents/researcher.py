"""
Stage 2: The Researcher

Performs web research via Perplexity API to gather information.
"""

from typing import Optional
from .clients import PerplexityClient
from .schemas import GenerationError


def research_topic(question: str) -> tuple[Optional[str], list[str], Optional[GenerationError]]:
    """
    Stage 2: Research topic using Perplexity API.
    
    Args:
        question: Detailed search query from planning stage
        
    Returns:
        Tuple of (research_content, citations, error) - one will be None
    """
    client = PerplexityClient()
    
    if not client.is_available():
        return None, [], GenerationError(
            stage="Research",
            message="Perplexity API key not configured. Please add your API key in Settings.",
            retries_attempted=0,
        )
    
    # Perform search
    result = client.search(question)
    
    if result is None:
        return None, [], GenerationError(
            stage="Research",
            message="Perplexity API search failed",
            retries_attempted=1,
        )
    
    # Extract content from response
    try:
        if "choices" in result and result["choices"]:
            content = result["choices"][0]["message"]["content"]
            
            # Include citations if available
            citations = result.get("citations", [])
            if citations:
                content += "\n\n## Sources\n"
                for i, citation in enumerate(citations, 1):
                    content += f"{i}. {citation}\n"
            
            return content, citations, None
        else:
            return None, [], GenerationError(
                stage="Research",
                message="Unexpected response format from Perplexity API",
                retries_attempted=1,
            )
    except (KeyError, IndexError, TypeError) as e:
        return None, [], GenerationError(
            stage="Research",
            message=f"Failed to parse research results: {e}",
            retries_attempted=1,
        )
