from flask import Flask, jsonify, request, render_template, send_from_directory, Response
from flask_cors import CORS
import os
import json
from .utils import schedule_io, schedule_stats, color_generator, calendar_io, event_merger, date_utils, pdf_generator
from .utils.color_palette import PREDEFINED_COLORS

import os

# Define base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, 
            static_folder=os.path.join(BASE_DIR, 'web', 'static'),
            template_folder=os.path.join(BASE_DIR, 'web', 'templates'))

# Configure Jinja to look in local templates and global templates
import jinja2
root_dir = os.path.dirname(os.path.dirname(BASE_DIR))
global_templates_new = os.path.join(root_dir, 'apps', 'web', 'templates')
global_templates_old = os.path.join(root_dir, 'templates')
app.jinja_loader = jinja2.ChoiceLoader([
    app.jinja_loader,
    jinja2.FileSystemLoader(global_templates_new),
    jinja2.FileSystemLoader(global_templates_old)
])

CORS(app)

# --- Schedule Metadata Helpers ---

# Cache for schedule names to avoid repeated file reads
_schedule_name_cache = {}

# Schedule color palette - distinct colors for different schedules
SCHEDULE_COLORS = [
    {'bg': '#818cf8', 'text': '#1e1b4b', 'border': '#6366f1'},  # Indigo
    {'bg': '#34d399', 'text': '#064e3b', 'border': '#10b981'},  # Emerald
    {'bg': '#fb923c', 'text': '#431407', 'border': '#f97316'},  # Orange
    {'bg': '#f472b6', 'text': '#500724', 'border': '#ec4899'},  # Pink
    {'bg': '#60a5fa', 'text': '#1e3a5f', 'border': '#3b82f6'},  # Blue
    {'bg': '#a78bfa', 'text': '#2e1065', 'border': '#8b5cf6'},  # Violet
    {'bg': '#fbbf24', 'text': '#451a03', 'border': '#f59e0b'},  # Amber
    {'bg': '#2dd4bf', 'text': '#134e4a', 'border': '#14b8a6'},  # Teal
]

def get_schedule_color(schedule_filename):
    """Generate a consistent color for a schedule based on its filename."""
    if not schedule_filename:
        return None
    # Use hash of filename to get consistent color index
    color_index = hash(schedule_filename) % len(SCHEDULE_COLORS)
    return SCHEDULE_COLORS[color_index]

def get_schedule_name(schedule_filename):
    """Get the display name from a schedule file, with caching."""
    if not schedule_filename:
        return None
    
    # Check cache first
    if schedule_filename in _schedule_name_cache:
        return _schedule_name_cache[schedule_filename]
    
    try:
        schedule_data = schedule_io.load_schedule(schedule_filename)
        name = schedule_data.get('name', schedule_filename.replace('.json', ''))
        _schedule_name_cache[schedule_filename] = name
        return name
    except Exception:
        # Fallback to filename without extension
        name = schedule_filename.replace('.json', '')
        _schedule_name_cache[schedule_filename] = name
        return name

# --- Routes ---

@app.route('/')
def index_redirect():
    """Redirect root to calendar view."""
    return render_template('index.html', initial_context={'view': 'calendar'})

@app.route('/calendar/')
def calendar_view():
    """Serve calendar view."""
    return render_template('index.html', initial_context={'view': 'calendar'})

@app.route('/editor/<path:schedule_name>')
def editor_view(schedule_name):
    """Serve editor view with specific schedule."""
    # Basic validation or existence check could go here
    # For now, we pass it to frontend to handle loading/errors
    
    # Ensure extension is handled if missing in URL but present on disk?
    # The frontend router expects the exact filename usually
    if not schedule_name.endswith('.json'):
        schedule_name += '.json'
        
    return render_template('index.html', initial_context={
        'view': 'schedule-editor', 
        'schedule': schedule_name
    })

@app.route('/api/schedules', methods=['GET'])
def list_available_schedules():
    """List all available JSON schedule files."""
    try:
        files = schedule_io.list_schedules()
        return jsonify(files)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/schedules/<filename>', methods=['GET'])
def get_schedule(filename):
    """Load a specific schedule and calculate metadata."""
    try:
        data = schedule_io.load_schedule(filename)
        
        # Calculate derived data
        events = data.get('events', [])
        unique_types = list(set(e.get('type', 'other') for e in events))
        
        # Generate colors using stored color_mappings if available
        color_mappings = data.get('color_mappings', {})
        colors = color_generator.generate_color_palette(unique_types, color_mappings)
        
        # Calculate stats
        stats = schedule_stats.calculate_stats(events)
        
        # Add breakdowns for each category
        breakdowns = {}
        for t in unique_types:
            breakdowns[t] = schedule_stats.get_category_breakdown(events, t)
            
        response = {
            "schedule": data,
            "colors": colors,
            "stats": stats,
            "breakdowns": breakdowns
        }
        return jsonify(response)
        
    except FileNotFoundError:
        return jsonify({"error": "Schedule not found"}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/colors', methods=['GET'])
def get_predefined_colors():
    """Return list of predefined colors for the color picker UI."""
    return jsonify(PREDEFINED_COLORS)


@app.route('/api/schedules/<filename>/color_mappings', methods=['PUT'])
def update_color_mappings(filename):
    """Update color mappings for a schedule."""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        new_mappings = request.json
        
        # Load the raw schedule (not expanded)
        data, filepath = schedule_io._load_raw_schedule(filename)
        
        # Update color_mappings
        data['color_mappings'] = new_mappings
        
        # Save back
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        
        return jsonify({"message": "Color mappings updated"})
        
    except FileNotFoundError:
        return jsonify({"error": "Schedule not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/schedules', methods=['POST'])
def save_schedule():
    """Save or upload a new schedule."""
    try:
        if 'file' in request.files:
            file = request.files['file']
            filename = file.filename
            data = json.load(file)
        elif request.is_json:
            data = request.json
            filename = data.get('filename', 'new_schedule.json')
            # If payload is wrapped in 'data' key or direct
            if 'data' in data:
                # If structure is { "filename": "...", "data": { ... } }
                actual_schedule = data['data']
            else:
                # If structure is flattened, careful: json might contain metadata
                # Assuming standard structure if 'events' is present
                actual_schedule = data
        else:
            return jsonify({"error": "Invalid content type"}), 400

        saved_name = schedule_io.save_schedule(filename, actual_schedule)
        return jsonify({"message": "Schedule saved", "filename": saved_name}), 201
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/instructions', methods=['GET'])
def get_instructions():
    """Get the LLM prompt instructions."""
    try:
        content = schedule_io.load_instructions()
        return jsonify({"content": content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/schedules/<filename>', methods=['DELETE'])
def delete_schedule_route(filename):
    """Delete a schedule and clean up calendar mappings."""
    try:
        # Delete the schedule file
        schedule_io.delete_schedule(filename)
        
        # Clear the name cache for this schedule
        if filename in _schedule_name_cache:
            del _schedule_name_cache[filename]
        
        # Remove any calendar mappings referencing this schedule
        removed_mappings = calendar_io.remove_mappings_for_schedule(filename)
        
        return jsonify({
            'success': True,
            'message': 'Schedule deleted',
            'removed_mappings': removed_mappings
        })
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/schedules/<filename>/events', methods=['POST'])
def add_event(filename):
    """Add a new event to a schedule."""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        event_data = request.json
        new_index = schedule_io.add_event(filename, event_data)
        return jsonify({"message": "Event added", "index": new_index}), 201
        
    except FileNotFoundError:
        return jsonify({"error": "Schedule not found"}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/schedules/<filename>/events/<int:index>', methods=['PUT'])
def update_event(filename, index):
    """Update an event by index."""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        event_data = request.json
        schedule_io.update_event(filename, index, event_data)
        return jsonify({"message": "Event updated"})
        
    except FileNotFoundError:
        return jsonify({"error": "Schedule not found"}), 404
    except IndexError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/schedules/<filename>/events/<int:index>', methods=['DELETE'])
def delete_event(filename, index):
    """Delete an event by index."""
    try:
        schedule_io.delete_event(filename, index)
        return jsonify({"message": "Event deleted"})
        
    except FileNotFoundError:
        return jsonify({"error": "Schedule not found"}), 404
    except IndexError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/schedules/<filename>/print', methods=['POST'])
def print_schedule(filename):
    """Generate PDF of schedule with current view filters."""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        data = request.json
        
        # Parse view state
        time_range = data.get('timeRange', {})
        start_hour = time_range.get('startHour')
        end_hour = time_range.get('endHour')
        days_range = data.get('daysRange')  # List of day indices (0-6) or None
        hidden_categories = data.get('hiddenCategories', [])
        
        # Load schedule data
        schedule_data = schedule_io.load_schedule(filename)
        events = schedule_data.get('events', [])
        
        # Generate colors using stored color_mappings
        unique_types = list(set(e.get('type', 'other') for e in events))
        color_mappings = schedule_data.get('color_mappings', {})
        colors = color_generator.generate_color_palette(unique_types, color_mappings)
        
        # Build view state
        view_state = {
            'startHour': start_hour if start_hour is not None else 0,
            'endHour': end_hour if end_hour is not None else 24,
            'daysRange': days_range
        }
        
        # Generate PDF
        pdf_buffer = pdf_generator.generate_schedule_pdf(
            schedule_data=schedule_data,
            events=events,
            color_scheme=colors,
            view_state=view_state,
            hidden_categories=hidden_categories
        )
        
        # Get schedule name for filename
        schedule_name = schedule_data.get('name', filename.replace('.json', ''))
        safe_name = "".join(c for c in schedule_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        
        return Response(
            pdf_buffer.getvalue(),
            mimetype='application/pdf',
            headers={
                'Content-Disposition': f'attachment; filename="{safe_name}.pdf"',
                'Content-Type': 'application/pdf'
            }
        )
        
    except FileNotFoundError:
        return jsonify({"error": "Schedule not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Calendar API Routes ---

@app.route('/api/calendar', methods=['GET'])
def get_calendar():
    """Get full calendar configuration."""
    try:
        config = calendar_io.load_calendar()
        return jsonify(config)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/calendar/date/<date>', methods=['GET'])
def get_calendar_date(date):
    """Get merged schedule and direct events for specific date (YYYY-MM-DD)."""
    try:
        # Get schedule for this date
        schedule_filename = calendar_io.get_schedule_for_date(date)
        schedule_events = []
        colors = {}
        
        if schedule_filename:
            schedule_data = schedule_io.load_schedule(schedule_filename)
            all_events = schedule_data.get('events', [])
            
            # Filter events for this day of week
            day_index = date_utils.get_day_of_week(date)
            schedule_events = event_merger.get_events_for_day(all_events, day_index)
            
            # Generate colors for the types using color_mappings
            unique_types = list(set(e.get('type', 'other') for e in all_events))
            color_mappings = schedule_data.get('color_mappings', {})
            colors = color_generator.generate_color_palette(unique_types, color_mappings)
        
        # Get direct events for this date
        direct_events = calendar_io.get_direct_events_for_date(date)
        
        # Merge events
        merged_events = event_merger.merge_events(schedule_events, direct_events, date)
        
        # Add colors for direct event types
        for event in direct_events:
            event_type = event.get('type', 'other')
            if event_type not in colors:
                colors.update(color_generator.generate_color_palette([event_type]))
        
        return jsonify({
            "date": date,
            "schedule_filename": schedule_filename,
            "events": merged_events,
            "colors": colors
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/calendar/week', methods=['GET'])
def get_calendar_week():
    """Get merged events for a week (defaults to current week)."""
    try:
        date = request.args.get('date', date_utils.get_today())
        week_start, week_end = date_utils.get_week_range(date)
        
        # Get all dates in the week
        dates = date_utils.get_dates_in_range(week_start, week_end)
        
        # Get schedule mappings and direct events for the week
        week_data = {}
        all_colors = {}
        
        for day_date in dates:
            schedule_filename = calendar_io.get_schedule_for_date(day_date)
            schedule_events = []
            
            if schedule_filename:
                schedule_data = schedule_io.load_schedule(schedule_filename)
                all_events = schedule_data.get('events', [])
                
                # Filter events for this day of week
                day_index = date_utils.get_day_of_week(day_date)
                schedule_events = event_merger.get_events_for_day(all_events, day_index)
                
                # Collect colors using color_mappings
                unique_types = list(set(e.get('type', 'other') for e in all_events))
                color_mappings = schedule_data.get('color_mappings', {})
                all_colors.update(color_generator.generate_color_palette(unique_types, color_mappings))
            
            # Get direct events
            direct_events = calendar_io.get_direct_events_for_date(day_date)
            
            # Merge events
            merged_events = event_merger.merge_events(schedule_events, direct_events, day_date)
            
            # Add colors for direct event types
            for event in direct_events:
                event_type = event.get('type', 'other')
                if event_type not in all_colors:
                    all_colors.update(color_generator.generate_color_palette([event_type]))
            
            week_data[day_date] = {
                "schedule_filename": schedule_filename,
                "schedule_name": get_schedule_name(schedule_filename),
                "schedule_color": get_schedule_color(schedule_filename),
                "events": merged_events
            }
        
        return jsonify({
            "week_start": week_start,
            "week_end": week_end,
            "days": week_data,
            "colors": all_colors
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/calendar/range', methods=['GET'])
def get_calendar_range():
    """Get merged events in date range."""
    try:
        start_date = request.args.get('start')
        end_date = request.args.get('end')
        
        if not start_date or not end_date:
            return jsonify({"error": "start and end parameters required"}), 400
        
        dates = date_utils.get_dates_in_range(start_date, end_date)
        range_data = {}
        all_colors = {}
        
        for day_date in dates:
            schedule_filename = calendar_io.get_schedule_for_date(day_date)
            schedule_events = []
            
            if schedule_filename:
                schedule_data = schedule_io.load_schedule(schedule_filename)
                all_events = schedule_data.get('events', [])
                
                day_index = date_utils.get_day_of_week(day_date)
                schedule_events = event_merger.get_events_for_day(all_events, day_index)
                
                unique_types = list(set(e.get('type', 'other') for e in all_events))
                color_mappings = schedule_data.get('color_mappings', {})
                all_colors.update(color_generator.generate_color_palette(unique_types, color_mappings))
            
            direct_events = calendar_io.get_direct_events_for_date(day_date)
            merged_events = event_merger.merge_events(schedule_events, direct_events, day_date)
            
            for event in direct_events:
                event_type = event.get('type', 'other')
                if event_type not in all_colors:
                    all_colors.update(color_generator.generate_color_palette([event_type]))
            
            range_data[day_date] = {
                "schedule_filename": schedule_filename,
                "schedule_name": get_schedule_name(schedule_filename),
                "schedule_color": get_schedule_color(schedule_filename),
                "events": merged_events
            }
        
        return jsonify({
            "start_date": start_date,
            "end_date": end_date,
            "days": range_data,
            "colors": all_colors
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Calendar Entry Routes ---

@app.route('/api/calendar/entries', methods=['POST'])
def add_calendar_entry():
    """Add new schedule mapping entry."""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        data = request.json
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        schedule_filename = data.get('schedule_filename')
        
        if not all([start_date, end_date, schedule_filename]):
            return jsonify({"error": "start_date, end_date, and schedule_filename required"}), 400
        
        index = calendar_io.add_calendar_entry(start_date, end_date, schedule_filename)
        return jsonify({"message": "Calendar entry added", "index": index}), 201
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/calendar/entries/<int:index>', methods=['PUT'])
def update_calendar_entry(index):
    """Update schedule mapping entry."""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        data = request.json
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        schedule_filename = data.get('schedule_filename')
        
        if not all([start_date, end_date, schedule_filename]):
            return jsonify({"error": "start_date, end_date, and schedule_filename required"}), 400
        
        calendar_io.update_calendar_entry(index, start_date, end_date, schedule_filename)
        return jsonify({"message": "Calendar entry updated"})
        
    except IndexError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/calendar/entries/<int:index>', methods=['DELETE'])
def delete_calendar_entry(index):
    """Delete schedule mapping entry."""
    try:
        calendar_io.delete_calendar_entry(index)
        return jsonify({"message": "Calendar entry deleted"})
        
    except IndexError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Direct Event Routes ---

@app.route('/api/calendar/events', methods=['POST'])
def add_direct_event():
    """Add direct event to calendar."""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        event_data = request.json
        index = calendar_io.add_direct_event(event_data)
        return jsonify({"message": "Direct event added", "index": index}), 201
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/calendar/events/<int:index>', methods=['PUT'])
def update_direct_event(index):
    """Update direct event."""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        event_data = request.json
        calendar_io.update_direct_event(index, event_data)
        return jsonify({"message": "Direct event updated"})
        
    except IndexError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/calendar/events/<int:index>', methods=['DELETE'])
def delete_direct_event(index):
    """Delete direct event."""
    try:
        calendar_io.delete_direct_event(index)
        return jsonify({"message": "Direct event deleted"})
        
    except IndexError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=9999, host='0.0.0.0')
