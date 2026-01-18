"""
Calendar configuration file management.
Handles loading/saving calendar.json and schedule-to-date mappings.
"""
import os
import json
from typing import Optional, List, Dict, Any, Tuple
from . import date_utils

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../data/Calendar'))
CALENDAR_FILE = os.path.join(DATA_DIR, 'calendar.json')
SCHEDULES_DIR = os.path.join(DATA_DIR, 'schedules')


def _get_default_calendar() -> Dict[str, Any]:
    """Return default empty calendar configuration."""
    return {
        "entries": [],
        "direct_events": []
    }


def load_calendar() -> Dict[str, Any]:
    """
    Load calendar.json from data/ directory.
    Creates default if missing.
    
    Returns:
        Calendar configuration dictionary
    """
    if not os.path.exists(CALENDAR_FILE):
        # Create default calendar
        default = _get_default_calendar()
        save_calendar(default)
        return default
    
    with open(CALENDAR_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_calendar(config: Dict[str, Any]) -> None:
    """
    Save calendar configuration to calendar.json.
    
    Args:
        config: Calendar configuration dictionary
    """
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    with open(CALENDAR_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)


def get_schedule_for_date(date: str) -> Optional[str]:
    """
    Find which schedule applies to a given date.
    
    Args:
        date: Date string (YYYY-MM-DD)
        
    Returns:
        Schedule filename or None if no schedule applies
    """
    config = load_calendar()
    
    for entry in config.get('entries', []):
        start = entry.get('start_date')
        end = entry.get('end_date')
        if start and end and date_utils.date_in_range(date, start, end):
            return entry.get('schedule_filename')
    
    return None


def get_schedules_for_range(start_date: str, end_date: str) -> Dict[str, str]:
    """
    Get schedule mappings for a date range.
    
    Args:
        start_date: Range start (YYYY-MM-DD)
        end_date: Range end (YYYY-MM-DD)
        
    Returns:
        Dict mapping date strings to schedule filenames
    """
    result = {}
    dates = date_utils.get_dates_in_range(start_date, end_date)
    
    for date in dates:
        schedule = get_schedule_for_date(date)
        if schedule:
            result[date] = schedule
    
    return result


def get_direct_events_for_date(date: str) -> List[Dict[str, Any]]:
    """
    Get direct calendar events for a specific date.
    
    Args:
        date: Date string (YYYY-MM-DD)
        
    Returns:
        List of direct events for that date
    """
    config = load_calendar()
    events = []
    
    for i, event in enumerate(config.get('direct_events', [])):
        if event.get('date') == date:
            # Add index for reference
            event_copy = event.copy()
            event_copy['_direct_index'] = i
            events.append(event_copy)
    
    return events


def get_direct_events_for_range(start_date: str, end_date: str) -> Dict[str, List[Dict[str, Any]]]:
    """
    Get direct events in date range.
    
    Args:
        start_date: Range start (YYYY-MM-DD)
        end_date: Range end (YYYY-MM-DD)
        
    Returns:
        Dict mapping date strings to lists of direct events
    """
    config = load_calendar()
    result = {}
    
    for i, event in enumerate(config.get('direct_events', [])):
        event_date = event.get('date')
        if event_date and date_utils.date_in_range(event_date, start_date, end_date):
            event_copy = event.copy()
            event_copy['_direct_index'] = i
            
            if event_date not in result:
                result[event_date] = []
            result[event_date].append(event_copy)
    
    return result


# Calendar entry management

def validate_calendar_entry(start_date: str, end_date: str, 
                            schedule_filename: str,
                            exclude_index: Optional[int] = None) -> Tuple[bool, str]:
    """
    Validate a calendar entry.
    
    Args:
        start_date: Entry start date
        end_date: Entry end date
        schedule_filename: Schedule file to map
        exclude_index: Index to exclude from overlap check (for updates)
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Validate dates
    try:
        start = date_utils.parse_date(start_date)
        end = date_utils.parse_date(end_date)
    except ValueError:
        return False, "Invalid date format. Use YYYY-MM-DD."
    
    if start > end:
        return False, "Start date must be before or equal to end date."
    
    # Validate schedule file exists
    schedule_path = os.path.join(SCHEDULES_DIR, schedule_filename)
    if not os.path.exists(schedule_path):
        return False, f"Schedule file '{schedule_filename}' not found."
    
    # Check for overlapping entries
    config = load_calendar()
    for i, entry in enumerate(config.get('entries', [])):
        if exclude_index is not None and i == exclude_index:
            continue
        
        entry_start = entry.get('start_date')
        entry_end = entry.get('end_date')
        
        # Check overlap: ranges overlap if one starts before the other ends
        e_start = date_utils.parse_date(entry_start)
        e_end = date_utils.parse_date(entry_end)
        
        if start <= e_end and e_start <= end:
            return False, f"Date range overlaps with existing entry ({entry_start} to {entry_end})."
    
    return True, ""


def add_calendar_entry(start_date: str, end_date: str, 
                       schedule_filename: str) -> int:
    """
    Add new schedule mapping entry.
    
    Args:
        start_date: Entry start date (YYYY-MM-DD)
        end_date: Entry end date (YYYY-MM-DD)
        schedule_filename: Schedule file to map
        
    Returns:
        Index of new entry
        
    Raises:
        ValueError: If validation fails
    """
    valid, msg = validate_calendar_entry(start_date, end_date, schedule_filename)
    if not valid:
        raise ValueError(msg)
    
    config = load_calendar()
    entry = {
        "start_date": start_date,
        "end_date": end_date,
        "schedule_filename": schedule_filename
    }
    config['entries'].append(entry)
    save_calendar(config)
    
    return len(config['entries']) - 1


def update_calendar_entry(index: int, start_date: str, end_date: str,
                          schedule_filename: str) -> None:
    """
    Update schedule mapping entry.
    
    Args:
        index: Entry index to update
        start_date: New start date
        end_date: New end date
        schedule_filename: New schedule file
        
    Raises:
        IndexError: If index out of range
        ValueError: If validation fails
    """
    config = load_calendar()
    
    if index < 0 or index >= len(config.get('entries', [])):
        raise IndexError(f"Entry index {index} out of range.")
    
    valid, msg = validate_calendar_entry(start_date, end_date, schedule_filename,
                                         exclude_index=index)
    if not valid:
        raise ValueError(msg)
    
    config['entries'][index] = {
        "start_date": start_date,
        "end_date": end_date,
        "schedule_filename": schedule_filename
    }
    save_calendar(config)


def delete_calendar_entry(index: int) -> None:
    """
    Remove schedule mapping entry.
    
    Args:
        index: Entry index to delete
        
    Raises:
        IndexError: If index out of range
    """
    config = load_calendar()
    
    if index < 0 or index >= len(config.get('entries', [])):
        raise IndexError(f"Entry index {index} out of range.")
    
    config['entries'].pop(index)
    save_calendar(config)


def remove_mappings_for_schedule(schedule_filename: str) -> int:
    """
    Remove all calendar entries that reference the given schedule filename.
    
    Args:
        schedule_filename: The schedule file to remove mappings for
        
    Returns:
        The number of entries removed
    """
    config = load_calendar()
    original_count = len(config.get('entries', []))
    
    config['entries'] = [
        entry for entry in config.get('entries', [])
        if entry.get('schedule_filename') != schedule_filename
    ]
    
    removed_count = original_count - len(config['entries'])
    if removed_count > 0:
        save_calendar(config)
    
    return removed_count


# Direct event management

def validate_direct_event(event_data: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validate a direct event.
    
    Args:
        event_data: Event dictionary
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    required_fields = ['date', 'title', 'start', 'end']
    for field in required_fields:
        if field not in event_data:
            return False, f"Missing required field: {field}"
    
    # Validate date
    try:
        date_utils.parse_date(event_data['date'])
    except ValueError:
        return False, "Invalid date format. Use YYYY-MM-DD."
    
    # Validate times
    try:
        start_mins = date_utils.parse_time(event_data['start'])
        end_mins = date_utils.parse_time(event_data['end'])
    except (ValueError, IndexError):
        return False, "Invalid time format. Use HH:MM."
    
    if start_mins >= end_mins:
        return False, "Start time must be before end time."
    
    return True, ""


def add_direct_event(event_data: Dict[str, Any]) -> int:
    """
    Add direct event to calendar.
    
    Args:
        event_data: Event dictionary with date, title, type, start, end, sub (optional)
        
    Returns:
        Index of new event
        
    Raises:
        ValueError: If validation fails
    """
    valid, msg = validate_direct_event(event_data)
    if not valid:
        raise ValueError(msg)
    
    config = load_calendar()
    
    # Ensure only allowed fields are stored
    event = {
        "date": event_data['date'],
        "title": event_data['title'],
        "type": event_data.get('type', 'other'),
        "start": event_data['start'],
        "end": event_data['end']
    }
    if 'sub' in event_data:
        event['sub'] = event_data['sub']
    
    config['direct_events'].append(event)
    save_calendar(config)
    
    return len(config['direct_events']) - 1


def update_direct_event(index: int, event_data: Dict[str, Any]) -> None:
    """
    Update direct event.
    
    Args:
        index: Event index to update
        event_data: New event data
        
    Raises:
        IndexError: If index out of range
        ValueError: If validation fails
    """
    config = load_calendar()
    
    if index < 0 or index >= len(config.get('direct_events', [])):
        raise IndexError(f"Event index {index} out of range.")
    
    valid, msg = validate_direct_event(event_data)
    if not valid:
        raise ValueError(msg)
    
    event = {
        "date": event_data['date'],
        "title": event_data['title'],
        "type": event_data.get('type', 'other'),
        "start": event_data['start'],
        "end": event_data['end']
    }
    if 'sub' in event_data:
        event['sub'] = event_data['sub']
    
    config['direct_events'][index] = event
    save_calendar(config)


def delete_direct_event(index: int) -> None:
    """
    Remove direct event.
    
    Args:
        index: Event index to delete
        
    Raises:
        IndexError: If index out of range
    """
    config = load_calendar()
    
    if index < 0 or index >= len(config.get('direct_events', [])):
        raise IndexError(f"Event index {index} out of range.")
    
    config['direct_events'].pop(index)
    save_calendar(config)
