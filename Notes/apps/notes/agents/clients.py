"""
API Clients

Wrappers for Gemini and Perplexity APIs with fallback logic, retry, and code block parsing.
"""

import re
import json
import httpx
from typing import Optional, Literal
from google import genai

from .config import (
    GEMINI_API_KEY,
    PERPLEXITY_API_KEY,
    GEMINI_MODEL,
    PERPLEXITY_MODEL,
    PERPLEXITY_API_URL,
    MAX_RETRIES,
    REQUEST_TIMEOUT,
    get_api_keys,
)
from .schemas import GenerationError


class CodeBlockParser:
    """Parse code blocks from LLM responses."""
    
    # Pattern to match fenced code blocks: ```lang\ncontent\n```
    BLOCK_PATTERN = re.compile(
        r"```(\w+)?\s*\n(.*?)```",
        re.DOTALL
    )
    
    @classmethod
    def extract_block(cls, text: str, language: str) -> Optional[str]:
        """
        Extract content from a specific language code block.
        
        Args:
            text: Full response text
            language: Target language (json, html, md, markdown)
            
        Returns:
            Extracted content or None if not found
        """
        matches = cls.BLOCK_PATTERN.findall(text)
        
        # Normalize language aliases
        target_langs = [language.lower()]
        if language.lower() == "md":
            target_langs.append("markdown")
        elif language.lower() == "markdown":
            target_langs.append("md")
        
        for lang, content in matches:
            if lang and lang.lower() in target_langs:
                return content.strip()
        
        return None
    
    @classmethod
    def extract_all_blocks(cls, text: str) -> dict[str, str]:
        """
        Extract all code blocks from response.
        
        Returns:
            Dict mapping language -> content
        """
        matches = cls.BLOCK_PATTERN.findall(text)
        result = {}
        
        for lang, content in matches:
            if lang:
                # Handle duplicates by appending index
                key = lang.lower()
                if key in result:
                    i = 2
                    while f"{key}_{i}" in result:
                        i += 1
                    key = f"{key}_{i}"
                result[key] = content.strip()
        
        return result
    
    @classmethod
    def extract_json(cls, text: str) -> Optional[dict]:
        """Extract and parse JSON from response."""
        json_str = cls.extract_block(text, "json")
        if json_str:
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                return None
        return None


class GeminiClient:
    """Wrapper for Google Gemini API (Singleton)."""
    
    _instance = None
    _permanently_disabled = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GeminiClient, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        keys = get_api_keys()
        self.api_key = keys["gemini"]
        self.client = None
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        
        self._initialized = True
    
    def is_available(self) -> bool:
        """Check if client is configured with valid API key."""
        return bool(self.api_key and self.client)
    
    def generate(self, prompt: str, system_prompt: str = "") -> Optional[str]:
        """
        Generate response from Gemini.
        
        Args:
            prompt: User prompt
            system_prompt: Optional system instructions
            
        Returns:
            Generated text or None on failure
        """
        if self._permanently_disabled:
            return None

        if not self.is_available():
            return None
        
        try:
            contents = prompt
            config = None
            
            if system_prompt:
                config = genai.types.GenerateContentConfig(
                    system_instruction=system_prompt
                )
            
            response = self.client.models.generate_content(
                model=GEMINI_MODEL,
                contents=contents,
                config=config,
            )
            
            return response.text
            
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                self._permanently_disabled = True
                print("Received 429 message from Gemini, attempting to use Perplexity instead.", flush=True)
                return None
            
            print(f"Gemini API error: {e}")
            return None


class PerplexityClient:
    """Wrapper for Perplexity API (Singleton)."""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PerplexityClient, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        keys = get_api_keys()
        self.api_key = keys["perplexity"]
        self._initialized = True
    
    def is_available(self) -> bool:
        """Check if client is configured with valid API key."""
        return bool(self.api_key)
    
    def search(self, query: str) -> Optional[dict]:
        """
        Perform search via Perplexity API.
        
        Args:
            query: Search query
            
        Returns:
            Search results dict or None on failure
        """
        if not self.is_available():
            return None
        
        try:
            with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
                response = client.post(
                    PERPLEXITY_API_URL,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": PERPLEXITY_MODEL,
                        "messages": [
                            {"role": "user", "content": query}
                        ],
                    },
                )
                response.raise_for_status()
                return response.json()
                
        except Exception as e:
            print(f"Perplexity API error: {e}")
            return None
    
    def generate(self, prompt: str, system_prompt: str = "") -> Optional[str]:
        """
        Generate response via Perplexity sonar model.
        
        Args:
            prompt: User prompt
            system_prompt: Optional system instructions
            
        Returns:
            Generated text or None on failure
        """
        if not self.is_available():
            return None
        
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
                response = client.post(
                    PERPLEXITY_API_URL,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": PERPLEXITY_MODEL,
                        "messages": messages,
                    },
                )
                response.raise_for_status()
                data = response.json()
                
                # Extract text from response
                if "choices" in data and data["choices"]:
                    return data["choices"][0]["message"]["content"]
                return None
                
        except Exception as e:
            print(f"Perplexity API error: {e}")
            return None


def generate_with_fallback(
    prompt: str,
    system_prompt: str = "",
    required_blocks: Optional[list[str]] = None,
) -> tuple[Optional[str], Optional[GenerationError]]:
    """
    Generate content with Gemini→Perplexity fallback and retry logic.
    
    Args:
        prompt: User prompt
        system_prompt: Optional system instructions
        required_blocks: List of required code block languages (e.g., ["json", "html"])
        
    Returns:
        Tuple of (response_text, error) - one will be None
    """
    gemini = GeminiClient()
    perplexity = PerplexityClient()
    
    clients = []
    if gemini.is_available():
        clients.append(("Gemini", gemini))
    if perplexity.is_available():
        clients.append(("Perplexity", perplexity))
    
    if not clients:
        return None, GenerationError(
            stage="initialization",
            message="No API keys configured. Please add your API keys in Settings.",
            retries_attempted=0,
        )
    
    last_error = None
    
    for client_name, client in clients:
        for attempt in range(MAX_RETRIES):
            response = client.generate(prompt, system_prompt)
            
            if response is None:
                last_error = GenerationError(
                    stage=f"{client_name} generation",
                    message=f"{client_name} API call failed",
                    retries_attempted=attempt + 1,
                )
                continue
            
            # Validate required blocks if specified
            if required_blocks:
                blocks = CodeBlockParser.extract_all_blocks(response)
                missing = []
                
                for req in required_blocks:
                    # Check for language or its alias
                    found = False
                    check_langs = [req.lower()]
                    if req.lower() == "md":
                        check_langs.append("markdown")
                    elif req.lower() == "markdown":
                        check_langs.append("md")
                    
                    for lang in check_langs:
                        if lang in blocks:
                            found = True
                            break
                    
                    if not found:
                        missing.append(req)
                
                if missing:
                    # Retry with format correction prompt
                    if attempt < MAX_RETRIES - 1:
                        prompt = f"""Your previous response was missing required code blocks: {missing}

Please provide your response again, ensuring ALL content is wrapped in proper fenced code blocks:
- JSON data in ```json ... ```
- HTML content in ```html ... ```
- Markdown content in ```md ... ``` or ```markdown ... ```

Original request:
{prompt}"""
                        last_error = GenerationError(
                            stage=f"{client_name} parsing",
                            message=f"Missing required blocks: {missing}",
                            retries_attempted=attempt + 1,
                        )
                        continue
                    else:
                        last_error = GenerationError(
                            stage=f"{client_name} parsing",
                            message=f"Failed to get properly formatted response after {MAX_RETRIES} attempts. Missing: {missing}",
                            retries_attempted=MAX_RETRIES,
                        )
                        break  # Move to next client
            
            # Success!
            return response, None
    
    return None, last_error
