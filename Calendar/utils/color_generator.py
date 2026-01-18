from .color_palette import PREDEFINED_COLORS, get_color_classes


def generate_color_palette(event_types, color_mappings=None):
    """
    Generates a color palette for the given list of event types.
    
    Args:
        event_types: List of event type strings
        color_mappings: Optional dict mapping type -> color_name (e.g., {"class": "blue"})
    
    Returns:
        Dictionary mapping type -> color config (bg, border, text, hover)
    """
    color_mappings = color_mappings or {}
    palette = {}
    
    # Sort event types alphabetically for consistent assignment
    sorted_types = sorted(event_types)
    
    # Track which colors from the predefined list we've used for unmapped types
    color_index = 0
    
    for etype in sorted_types:
        # Check if this type has a custom color mapping
        if etype in color_mappings:
            color_name = color_mappings[etype]
            color = get_color_classes(color_name)
            if color:
                palette[etype] = color
                continue
        
        # No mapping or invalid mapping - assign from predefined palette in order
        palette[etype] = {
            'bg': PREDEFINED_COLORS[color_index % len(PREDEFINED_COLORS)]['bg'],
            'border': PREDEFINED_COLORS[color_index % len(PREDEFINED_COLORS)]['border'],
            'text': PREDEFINED_COLORS[color_index % len(PREDEFINED_COLORS)]['text'],
            'hover': PREDEFINED_COLORS[color_index % len(PREDEFINED_COLORS)]['hover'],
        }
        color_index += 1
            
    return palette
