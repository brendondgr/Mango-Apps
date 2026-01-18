from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    
    # Subject URLs
    path('subject/create/', views.subject_create, name='subject_create'),
    path('subject/<slug:slug>/', views.subject_detail, name='subject_detail'),
    path('subject/<slug:slug>/edit/', views.subject_edit, name='subject_edit'),
    path('subject/<slug:slug>/delete/', views.subject_delete, name='subject_delete'),
    
    # Course URLs
    path('course/create/', views.course_create, name='course_create'),
    path('course/<slug:slug>/', views.course_detail, name='course_detail'),
    path('course/<slug:slug>/edit/', views.course_edit, name='course_edit'),
    path('course/<slug:slug>/delete/', views.course_delete, name='course_delete'),
    path('course/<slug:slug>/update-topic-order/', views.course_update_topic_order, name='course_update_topic_order'),
    
    # Topic URLs
    path('topic/create/', views.topic_create, name='topic_create'),
    path('topic/<int:topic_id>/', views.topic_detail, name='topic_detail'),
    path('topic/<int:topic_id>/edit/', views.topic_edit, name='topic_edit'),
    path('topic/<int:topic_id>/delete/', views.topic_delete, name='topic_delete'),
    
    # AI Topic Generation
    path('settings/', views.settings_view, name='settings'),
    path('generate/', views.generate_topic_view, name='generate_topic'),
    path('generate/stream/', views.generate_topic_stream_view, name='generate_topic_stream'),
    
    # Visualization and Assets
    # This must be after other topic/ paths to avoid conflicts
    # Supports src="example.html" or src="media/image.png" from topic/<id>/ page
    path('topic/<int:topic_id>/<path:filename>', views.serve_visualization, name='serve_viz'),
]
