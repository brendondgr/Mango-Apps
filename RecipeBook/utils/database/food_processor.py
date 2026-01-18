import requests
import json
import os

def parse_recipe_text(text: str, api_key: str) -> dict:
    """
    Parses recipe text into structured data using the Perplexity API.

    Args:
        text (str): The raw recipe text to parse.
        api_key (str): The Perplexity API key.

    Returns:
        dict: A dictionary containing the parsed recipe structure with keys:
              title, description, servings, cuisine, meal_type, ingredients, steps.
    
    Raises:
        Exception: If the API call fails or returns invalid JSON.
    """
    url = "https://api.perplexity.ai/chat/completions"
    
    system_prompt = (
        "You are a culinary data extraction expert. Your task is to parse raw recipe text into a strict JSON format. "
        "Return ONLY the JSON object, no markdown formatting or other text. "
        "The JSON structure must be: "
        "{"
        "  \"title\": \"string\", "
        "  \"description\": \"string\", "
        "  \"servings\": \"integer or string\", "
        "  \"cuisine\": \"string (e.g., Italian, Mexican)\", "
        "  \"meal_type\": \"string (e.g., Dinner, Snack)\", "
        "  \"ingredients\": ["
        "    {\"name\": \"string\", \"quantity\": \"float or string\", \"unit\": \"string\", \"is_optional\": boolean}"
        "  ], "
        "  \"steps\": [\"string\", \"string\", ...]"
        "}"
        "For ingredients, every word in the 'name' must be capitalized (Title Case). "
        "Try to normalize quantities to numbers where possible. "
        "For is_optional, set to true if the ingredient is listed as optional."
    )

    payload = {
        "model": "sonar",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Parse this recipe:\n\n{text}"}
        ],
        "temperature": 0.2
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        # Clean up potential markdown code blocks if the model ignores the strict instruction
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "")
        elif content.startswith("```"):
             content = content.replace("```", "")
             
        parsed_recipe = json.loads(content.strip())
        return parsed_recipe
        
    except requests.exceptions.RequestException as e:
        raise Exception(f"Perplexity API request failed: {str(e)}")
    except json.JSONDecodeError:
        raise Exception("Failed to decode JSON response from AI")
    except KeyError as e:
         raise Exception(f"Unexpected response structure: missing key {str(e)}")
