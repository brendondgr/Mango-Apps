from django.urls import path
from . import views

urlpatterns = [
    # Landing page
    path('', views.index, name='index'),
    path('login', views.login_view, name='login'),
    path('logout', views.logout_view, name='logout'),


    # Main Dashboard (PR)
    path('pr/', views.pr_view, name='pr_view'),
    
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
