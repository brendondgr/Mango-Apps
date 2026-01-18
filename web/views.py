import json
import os
import sys
from pathlib import Path
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django_ratelimit.decorators import ratelimit

# Add libs to path
LIBS_PATH = Path(__file__).resolve().parent.parent.parent / 'libs'
sys.path.insert(0, str(LIBS_PATH))
import llm_service

# Flask app for ProjectManager
from apps.ProjectManager.web import create_app as create_projectmanager_app
_projectmanager_app = None

def get_projectmanager_app():
    """Lazy initialization of Flask app"""
    global _projectmanager_app
    if _projectmanager_app is None:
        _projectmanager_app = create_projectmanager_app()
    return _projectmanager_app


@csrf_exempt
def flask_proxy(request, path=''):
    """Proxy requests to the Flask ProjectManager app"""
    from werkzeug.serving import WSGIRequestHandler
    from werkzeug.wrappers import Request as WerkzeugRequest, Response as WerkzeugResponse
    from io import BytesIO
    
    flask_app = get_projectmanager_app()
    
    # Build environ dict for Flask
    environ = {
        'REQUEST_METHOD': request.method,
        'SCRIPT_NAME': '/pr/projects',
        'PATH_INFO': '/' + path if path else '/',
        'QUERY_STRING': request.META.get('QUERY_STRING', ''),
        'CONTENT_TYPE': request.META.get('CONTENT_TYPE', ''),
        'CONTENT_LENGTH': request.META.get('CONTENT_LENGTH', ''),
        'SERVER_NAME': request.META.get('SERVER_NAME', 'localhost'),
        'SERVER_PORT': request.META.get('SERVER_PORT', '80'),
        'SERVER_PROTOCOL': 'HTTP/1.1',
        'wsgi.version': (1, 0),
        'wsgi.url_scheme': request.scheme,
        'wsgi.input': BytesIO(request.body),
        'wsgi.errors': sys.stderr,
        'wsgi.multithread': True,
        'wsgi.multiprocess': True,
        'wsgi.run_once': False,
    }
    
    # Copy HTTP headers
    for key, value in request.META.items():
        if key.startswith('HTTP_'):
            environ[key] = value
    
    # Capture Flask response
    response_started = []
    response_headers = []
    
    def start_response(status, headers, exc_info=None):
        response_started.append(status)
        response_headers.extend(headers)
        return lambda s: None
    
    # Call Flask app
    response_body = b''.join(flask_app.wsgi_app(environ, start_response))
    
    # Parse status code
    status_code = int(response_started[0].split(' ')[0]) if response_started else 200
    
    # Create Django response
    django_response = HttpResponse(response_body, status=status_code)
    for header_name, header_value in response_headers:
        if header_name.lower() not in ('content-length',):
            django_response[header_name] = header_value
    
    return django_response


def index(request):
    """Serve the landing page"""
    return render(request, 'index.html')


def pr_view(request):
    """Serve the main dashboard page (Private Resources)"""
    apps_list = [
        {
            'name': 'LLM Server',
            'description': 'Configure and manage local language models.',
            'icon': 'brain-circuit',
            'url': '/pr/',  # Current app
            'active': True
        },
        {
            'name': 'Project Management',
            'description': 'Track and manage projects with goals and timelines.',
            'icon': 'folder-kanban',
            'url': '/pr/projects/',
            'active': False
        },
        # Integrated apps will be added here
    ]
    return render(request, 'body.html', {
        'title': 'Private Resources',
        'apps': apps_list
    })


@ratelimit(key='ip', rate='5/m', method='POST', block=True)
def login_view(request):
    """Handle user login"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        next_path = request.GET.get('next', '/')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            auth_login(request, user)
            # Prevent Open Redirect vulnerability by ensuring next_path is safe
            # For simplicity in this internal tool, we'll just check if it starts with /
            if not next_path.startswith('/'):
                next_path = '/'
            return redirect(next_path)
        else:
            return render(request, 'login.html', {
                'title': 'Login',
                'error': 'Invalid username or password',
                'next': next_path
            })
            
    return render(request, 'login.html', {
        'title': 'Login',
        'next': request.GET.get('next', '/')
    })


def logout_view(request):
    """Handle user logout"""
    auth_logout(request)
    return redirect('login')






# ============================================================================
# Configuration API
# ============================================================================

def api_config(request):
    """GET/POST /api/config - Load or save configuration"""
    if request.method == 'GET':
        config = llm_service.load_config()
        if config:
            return JsonResponse(config)
        else:
            return JsonResponse({'error': 'Failed to load configuration'}, status=500)
    
    elif request.method == 'POST':
        try:
            config = llm_service.load_config()
            if not config:
                return JsonResponse({'error': 'Failed to load configuration'}, status=500)
            
            new_defaults = json.loads(request.body)
            config['frontend_defaults'] = new_defaults
            
            if llm_service.save_config(config):
                return JsonResponse({'success': True, 'message': 'Configuration saved successfully'})
            else:
                return JsonResponse({'error': 'Failed to save configuration'}, status=500)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)



# ============================================================================
# Models API
# ============================================================================

def api_get_models(request):
    """GET /api/models - Return list of available language models"""
    config = llm_service.load_config()
    if config and 'language_models' in config:
        models = []
        for model in config['language_models']:
            models.append({
                'file_name': model.get('file_name', ''),
                'nickname': model.get('nickname', model.get('file_name', '')),
                'parameters_billions': model.get('parameters_billions', 0)
            })
        return JsonResponse(models, safe=False)
    else:
        return JsonResponse({'error': 'Failed to load models'}, status=500)


def api_refresh_models(request):
    """GET /api/models/refresh - Check if model files exist in configured directories"""
    try:
        config = llm_service.load_config()
        if not config:
            return JsonResponse({'error': 'Failed to load configuration'}, status=500)
            
        model_dirs = config.get('model_directories', {})
        lang_dir = model_dirs.get('language', '')
        voice_dir = model_dirs.get('voice', '')
        
        results = {
            'language': [],
            'voice': []
        }
        
        # Check language models
        for model in config.get('language_models', []):
            path = os.path.join(lang_dir, model['file_name']) if lang_dir else ''
            exists = os.path.exists(path) if path else False
            results['language'].append({
                **model,
                'exists': exists,
                'path': path
            })
            
        # Check voice models
        for model in config.get('voice_models', []):
            path = os.path.join(voice_dir, model['file_name']) if voice_dir else ''
            exists = os.path.exists(path) if path else False
            results['voice'].append({
                **model,
                'exists': exists,
                'path': path
            })
            
        return JsonResponse(results)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["POST"])
def api_manage_models(request):
    """POST /api/models/manage - Add or remove models"""
    try:
        config = llm_service.load_config()
        if not config:
            return JsonResponse({'error': 'Failed to load configuration'}, status=500)
            
        data = json.loads(request.body)
        action = data.get('action')
        model_type = data.get('type')  # 'language' or 'voice'
        model_data = data.get('data')
        
        if model_type not in ['language', 'voice']:
            return JsonResponse({'error': 'Invalid model type'}, status=400)
            
        key = f"{model_type}_models"
        
        # Ensure key exists
        if key not in config:
            config[key] = []
        
        if action == 'add':
            # Check if model already exists
            for m in config[key]:
                if m['file_name'] == model_data['file_name']:
                    return JsonResponse({'error': 'Model already exists'}, status=400)
            config[key].append(model_data)
            
        elif action == 'remove':
            file_name = model_data.get('file_name')
            config[key] = [m for m in config[key] if m['file_name'] != file_name]
            
        else:
            return JsonResponse({'error': 'Invalid action'}, status=400)
            
        if llm_service.save_config(config):
            return JsonResponse({'success': True, 'message': 'Models updated successfully', 'models': config[key]})
        else:
            return JsonResponse({'error': 'Failed to save configuration'}, status=500)
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["POST"])
def api_update_directories(request):
    """POST /api/config/directories - Update model directories"""
    try:
        config = llm_service.load_config()
        if not config:
            return JsonResponse({'error': 'Failed to load configuration'}, status=500)
        
        directories = json.loads(request.body)
        if 'language' in directories and 'voice' in directories:
            config['model_directories'] = directories
            if llm_service.save_config(config):
                return JsonResponse({'success': True, 'message': 'Directories updated successfully'})
        
        return JsonResponse({'error': 'Invalid directory data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ============================================================================
# Server Control API
# ============================================================================

def api_server_status(request):
    """GET /api/server/status - Get current server status"""
    status = llm_service.get_server_status()
    return JsonResponse({'status': status})


@require_http_methods(["POST"])
def api_server_start(request):
    """POST /api/server/start - Start the LLM server"""
    try:
        config_data = json.loads(request.body) if request.body else None
        
        if not config_data:
            full_config = llm_service.load_config()
            if full_config and 'frontend_defaults' in full_config:
                config_data = full_config['frontend_defaults']
            else:
                return JsonResponse({'error': 'No configuration provided'}, status=400)
        
        success, message = llm_service.start_server(config_data)
        
        if success:
            return JsonResponse({'success': True, 'message': message})
        else:
            return JsonResponse({'error': message}, status=400)
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["POST"])
def api_server_stop(request):
    """POST /api/server/stop - Stop the LLM server"""
    try:
        success, message = llm_service.stop_server()
        
        if success:
            return JsonResponse({'success': True, 'message': message})
        else:
            return JsonResponse({'error': message}, status=400)
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
