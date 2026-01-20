from django.urls import path, re_path, include
from . import views

urlpatterns = [
    # Landing page (Astro static build)
    path('', views.index, name='index'),
    # Astro static assets (JS/CSS bundles)
    re_path(r'^(?P<path>_astro/.*)$', views.index),
    re_path(r'^(?P<path>images/.*)$', views.index),
    re_path(r'^favicon\.svg$', views.index, {'path': 'favicon.svg'}),
    
    path('login', views.login_view, name='login'),
    path('logout', views.logout_view, name='logout'),
    
    # Public Static Apps
    re_path(r'^mimiciv/?(?P<path>.*)$', views.mimic_view, name='mimic_app'),


    # Main Dashboard (PR)
    path('pr/', views.pr_view, name='pr_view'),
    
    # ProjectManager Flask App (mounted at /pr/projects/)
    re_path(r'^pr/projects/(?P<path>.*)$', views.flask_proxy, name='flask_projectmanager'),
    
    # Calendar Flask App (mounted at /pr/calendar/)
    re_path(r'^pr/calendar/(?P<path>.*)$', views.flask_proxy_calendar, name='flask_calendar'),
    
    # RecipeBook Flask App (mounted at /pr/recipes/)
    re_path(r'^pr/recipes/(?P<path>.*)$', views.flask_proxy_recipebook, name='flask_recipebook'),

    # Jobs Flask App (mounted at /pr/jobs/)
    re_path(r'^pr/jobs/(?P<path>.*)$', views.flask_proxy_jobs, name='flask_jobs'),
    
    # Notes Django App (mounted at /pr/notes/)
    path('pr/notes/', include('apps.Notes.apps.notes.urls')),
    
    # Slides Static App (mounted at /pr/slides/)
    re_path(r'^pr/slides/?(?P<path>.*)$', views.slides_view, name='slides_app'),
    
    # Configuration API
    path('api/config', views.api_config, name='api_config'),
    path('api/config/directories', views.api_update_directories, name='api_update_directories'),
    
    # Models API
    path('api/models', views.api_get_models, name='api_get_models'),
    path('api/models/refresh', views.api_refresh_models, name='api_refresh_models'),
    path('api/models/manage', views.api_manage_models, name='api_manage_models'),
    
    # Server Control API
    path('api/server/status', views.api_server_status, name='api_server_status'),
    path('api/server/start', views.api_server_start, name='api_server_start'),
    path('api/server/stop', views.api_server_stop, name='api_server_stop'),
]
