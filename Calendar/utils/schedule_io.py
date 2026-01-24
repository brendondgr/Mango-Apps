import os
import json
from .validators import validate_schedule_structure, sanitize_filename

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../data/Calendar/schedules'))
INSTRUCTIONS_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../data/Calendar/instructions.md'))

def list_schedules():
    """Returns a list of available schedule filenames."""
    if not os.path.exists(DATA_DIR):
        return []
    return [f for f in os.listdir(DATA_DIR) if f.endswith('.json')]

def expand_events(events):
    """
    Expands events into individual event instances.
    Supports two structures:
    1. Legacy: 'day' (int/list), 'start', 'end' at root
    2. New: 'timestamps' list containing {'day', 'start', 'end'} dictionaries
    
    Returns:
        List of event dictionaries where each has a single 'day' value.
        Each event will have an '_original_idx' field pointing to its index in the input list.
    """
    expanded = []
    for original_idx, event in enumerate(events):
        # Check for new 'timestamps' structure
        if 'timestamps' in event:
            base_event = event.copy()
            del base_event['timestamps']
            
            for ts in event['timestamps']:
                days = ts.get('day')
                start = ts.get('start')
                end = ts.get('end')
                
                # Handle list of days or single day
                day_list = days if isinstance(days, list) else [days]
                
                for day in day_list:
                    new_event = base_event.copy()
                    new_event['day'] = day
                    new_event['start'] = start
                    new_event['end'] = end
                    new_event['_original_idx'] = original_idx
                    expanded.append(new_event)
                    
        # Handle legacy structure (day/start/end at root)
        elif 'day' in event:
            day_value = event.get('day')
            
            # If day is a list, create one event per day
            if isinstance(day_value, list):
                for day in day_value:
                    event_copy = event.copy()
                    event_copy['day'] = day
                    event_copy['_original_idx'] = original_idx
                    expanded.append(event_copy)
            else:
                # Even if single day, ensure we copy and add index
                event_copy = event.copy()
                event_copy['_original_idx'] = original_idx
                expanded.append(event_copy)
                
    return expanded

def load_schedule(filename):
    """
    Loads a specific schedule JSON file.
    Performs auto-migration of color_mappings if not present.
    """
    safe_name = sanitize_filename(filename)
    filepath = os.path.join(DATA_DIR, safe_name)
    
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Schedule '{safe_name}' not found")
        
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Auto-migrate: add color_mappings if missing
    migrated = False
    if 'color_mappings' not in data and 'events' in data:
        data['color_mappings'] = _generate_default_color_mappings(data['events'])
        migrated = True
        
    valid, msg = validate_schedule_structure(data)
    if not valid:
        raise ValueError(f"Invalid schedule data: {msg}")
    
    # Save migration if we added color_mappings
    if migrated:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    
    # Expand any events with multiple days
    if 'events' in data:
        data['events'] = expand_events(data['events'])
        
    return data


def _generate_default_color_mappings(events):
    """
    Generate default color mappings for a list of events.
    Extracts unique types and assigns colors from predefined palette in order.
    """
    from .color_palette import PREDEFINED_COLORS
    
    # Extract unique types from events (before expansion)
    unique_types = set()
    for event in events:
        event_type = event.get('type', 'other')
        unique_types.add(event_type)
    
    # Sort alphabetically for consistent assignment
    sorted_types = sorted(unique_types)
    
    # Assign colors in order
    color_mappings = {}
    for idx, event_type in enumerate(sorted_types):
        color_index = idx % len(PREDEFINED_COLORS)
        color_mappings[event_type] = PREDEFINED_COLORS[color_index]['name']
    
    return color_mappings

def save_schedule(filename, data):
    """Saves schedule data to a JSON file."""
    # Validate before saving
    valid, msg = validate_schedule_structure(data)
    if not valid:
        raise ValueError(f"Invalid schedule data: {msg}")

    safe_name = sanitize_filename(filename)
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        
    filepath = os.path.join(DATA_DIR, safe_name)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
        
    return safe_name

def _load_raw_schedule(filename):
    """Load schedule without expansion (for modifications)."""
    safe_name = sanitize_filename(filename)
    filepath = os.path.join(DATA_DIR, safe_name)
    
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Schedule '{safe_name}' not found")
        
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f), filepath

def add_event(filename, event_data):
    """
    Add a new event to a schedule.
    Returns the index of the newly added event.
    """
    from .validators import validate_event
    
    valid, msg = validate_event(event_data)
    if not valid:
        raise ValueError(f"Invalid event: {msg}")
    
    data, filepath = _load_raw_schedule(filename)
    data['events'].append(event_data)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    return len(data['events']) - 1

def update_event(filename, index, event_data):
    """
    Update an event at the specified index.
    Returns True on success.
    """
    from .validators import validate_event
    
    valid, msg = validate_event(event_data)
    if not valid:
        raise ValueError(f"Invalid event: {msg}")
    
    data, filepath = _load_raw_schedule(filename)
    
    if index < 0 or index >= len(data['events']):
        raise IndexError(f"Event index {index} out of range")
    
    data['events'][index] = event_data
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    return True

def delete_event(filename, index):
    """
    Delete an event at the specified index.
    Returns True on success.
    """
    data, filepath = _load_raw_schedule(filename)
    
    if index < 0 or index >= len(data['events']):
        raise IndexError(f"Event index {index} out of range")
    
    data['events'].pop(index)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    return True

def delete_schedule(filename):
    """
    Delete a schedule file.
    Returns True on success.
    """
    safe_name = sanitize_filename(filename)
    filepath = os.path.join(DATA_DIR, safe_name)
    
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Schedule '{safe_name}' not found")
    
    os.remove(filepath)
    return True

def load_instructions():
    """Reads the instructions.md file."""
    if not os.path.exists(INSTRUCTIONS_FILE):
        return "Instructions file not found."
    with open(INSTRUCTIONS_FILE, 'r', encoding='utf-8') as f:
        return f.read()
