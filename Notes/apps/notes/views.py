import os
import mimetypes
import pathlib
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from .forms import SubjectForm, CourseForm, TopicForm, TopicCreateForm
from django.http import HttpResponse, Http404, HttpResponseForbidden, StreamingHttpResponse
import json
from django.urls import reverse
from django.views.decorators.clickjacking import xframe_options_sameorigin
from django.conf import settings
from .models import Topic, Subject, Course, CourseTopic
from .utils import render_markdown
from . import services
from django.db.models import Max


def add_topic_to_course(topic, course):
    """
    Add a topic to a course, handling ordered topics properly.
    If the course has existing ordered topics, append with max_order + 1.
    Otherwise, create a CourseTopic with order=0.
    """
    # Check if this relationship already exists
    existing = CourseTopic.objects.filter(course=course, topic=topic).first()
    if existing:
        return existing
    
    # Check if course has ordered topics
    has_ordered = CourseTopic.objects.filter(course=course).exists()
    
    if has_ordered:
        # Get max order and append
        max_order = CourseTopic.objects.filter(course=course).aggregate(Max('order'))['order__max'] or 0
        new_order = max_order + 1
    else:
        # First topic for this course, order=0
        new_order = 0
    
    return CourseTopic.objects.create(
        course=course,
        topic=topic,
        order=new_order,
        is_visible=True
    )


def set_topic_courses(topic, courses):
    """
    Set the courses for a topic, properly handling the through model.
    Removes relationships not in courses, adds new ones with proper ordering.
    """
    current_course_ids = set(CourseTopic.objects.filter(topic=topic).values_list('course_id', flat=True))
    new_course_ids = set(c.id for c in courses)
    
    # Remove courses no longer associated
    to_remove = current_course_ids - new_course_ids
    if to_remove:
        CourseTopic.objects.filter(topic=topic, course_id__in=to_remove).delete()
    
    # Add new courses
    to_add = new_course_ids - current_course_ids
    for course in courses:
        if course.id in to_add:
            add_topic_to_course(topic, course)

def index(request):
    """
    Homepage view.
    """
    subjects = Subject.objects.all()
    courses = Course.objects.all()
    return render(request, 'notes/index.html', {
        'subjects': subjects, 
        'courses': courses,
        'subject_form': SubjectForm(),
        'course_form': CourseForm(),
    })

def subject_detail(request, slug):
    subject = get_object_or_404(Subject, slug=slug)
    courses = subject.courses.all()
    topics = Topic.objects.filter(courses__subject=subject).distinct()
    context = {
        'subject': subject,
        'courses': courses,
        'topics': topics
    }
    return render(request, 'notes/subject_detail.html', context)

def course_detail(request, slug):
    course = get_object_or_404(Course, slug=slug)
    
    # Check if course has any CourseTopic entries (ordered topics exist)
    course_topics = CourseTopic.objects.filter(course=course).select_related('topic')
    has_ordered_topics = course_topics.exists()
    
    if has_ordered_topics:
        # Query topics via CourseTopic with proper ordering, filter by is_visible
        visible_course_topics = course_topics.filter(is_visible=True)
        ordered_topics = [ct.topic for ct in visible_course_topics]
        all_course_topics = list(course_topics)  # For the modal (includes hidden)
    else:
        # Fallback to default ordering
        ordered_topics = list(course.topics.all())
        all_course_topics = []
    
    context = {
        'course': course,
        'topics': ordered_topics,
        'has_ordered_topics': has_ordered_topics,
        'all_course_topics': all_course_topics,
    }
    return render(request, 'notes/course_detail.html', context)

def topic_detail(request, topic_id):
    topic = get_object_or_404(Topic, id=topic_id)
    
    # Construct path to the topic's markdown file
    # Assuming topic.directory_path is relative to 'apps' or configured root
    # Adjusting based on user request: BASE_DIR / 'apps' / topic.directory_path
    
    topic_path = settings.BASE_DIR / 'apps' / 'Notes' / 'apps' / topic.directory_path.replace('\\', '/')
    
    metadata, _ = services.parse_topic_metadata(topic_path)
    entry_point = metadata.entry_point if metadata else 'example.md'
            
    md_file_path = topic_path / entry_point
    
    # Check if visualization exists
    example_html_path = topic_path / 'example.html'
    has_visualization = example_html_path.exists()

    if not md_file_path.exists():
        raise Http404("Topic content not found")

    try:
        with open(md_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except IOError:
        raise Http404("Error reading topic content")

    html_content = render_markdown(content)
    
    # Get the first course for breadcrumb navigation (topic can belong to multiple courses)
    first_course = topic.courses.first()
    context = {
        'topic': topic,
        'rendered_content': html_content,
        'raw_content': content,
        'course': first_course,
        'subject': first_course.subject if first_course else None,
        'has_visualization': has_visualization,
        'all_courses': topic.courses.all(),
    }
    return render(request, 'notes/topic_detail.html', context)


@xframe_options_sameorigin
def serve_visualization(request, topic_id, filename):
    topic = get_object_or_404(Topic, id=topic_id)
    
    topic_path = settings.BASE_DIR / 'apps' / 'Notes' / 'apps' / topic.directory_path.replace('\\', '/')
    file_path = (topic_path / filename).resolve()
    
    # Security check: Ensure the resolved path is within the topic directory
    # strict=True in resolve() raises FileNotFoundError if not exists, but we check commonpath
    
    try:
        # Resolve resolves symlinks and absolute paths
        # We need to ensure we don't escape topic_path
        root_path = topic_path.resolve()
        
        if not str(file_path).startswith(str(root_path)):
             return HttpResponseForbidden("Access denied: Path traversal detected")

        if not file_path.exists():
            raise Http404("File not found")
            
        if not file_path.is_file():
             raise Http404("File not found")

    except (ValueError, RuntimeError):
         return HttpResponseForbidden("Invalid path")

    # Guess MIME type
    content_type, encoding = mimetypes.guess_type(file_path)
    if not content_type:
        content_type = 'application/octet-stream'

    try:
        # For text based files, we might want to read as text, but binary is safer for general serving
        with open(file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type=content_type)
            if encoding:
                response['Content-Encoding'] = encoding
            return response
    except IOError:
        raise Http404("Error reading file")

# Subject CRUD
def subject_create(request):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    if request.method == 'POST':
        form = SubjectForm(request.POST, request.FILES)
        if form.is_valid():
            subject = form.save()
            if is_ajax:
                return JsonResponse({
                    'success': True,
                    'redirect_url': reverse('notes:index'),
                    'message': f'Subject "{subject.name}" created successfully!'
                })
            return redirect('notes:subject_detail', slug=subject.slug)
        else:
            if is_ajax:
                return JsonResponse({
                    'success': False,
                    'errors': {field: [str(e) for e in errors] for field, errors in form.errors.items()}
                })
    else:
        form = SubjectForm()
    return render(request, 'notes/subject_form.html', {'form': form, 'title': 'Create Subject'})

def subject_edit(request, slug):
    subject = get_object_or_404(Subject, slug=slug)
    if request.method == 'POST':
        form = SubjectForm(request.POST, request.FILES, instance=subject)
        if form.is_valid():
            subject = form.save()
            return redirect('notes:subject_detail', slug=subject.slug)
    else:
        form = SubjectForm(instance=subject)
    return render(request, 'notes/subject_form.html', {'form': form, 'title': 'Edit Subject', 'subject': subject})

def subject_delete(request, slug):
    subject = get_object_or_404(Subject, slug=slug)
    if request.method == 'POST':
        subject.delete()
        return redirect('notes:index')
    return render(request, 'notes/delete_confirm.html', {'object': subject, 'type': 'Subject', 'cancel_url': 'notes:subject_detail', 'slug': slug})

# Course CRUD
def course_create(request):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    if request.method == 'POST':
        form = CourseForm(request.POST, request.FILES)
        if form.is_valid():
            course = form.save()
            if is_ajax:
                return JsonResponse({
                    'success': True,
                    'redirect_url': reverse('notes:index'),
                    'message': f'Course "{course.name}" created successfully!'
                })
            return redirect('notes:course_detail', slug=course.slug)
        else:
            if is_ajax:
                return JsonResponse({
                    'success': False,
                    'errors': {field: [str(e) for e in errors] for field, errors in form.errors.items()}
                })
    else:
        form = CourseForm()
    return render(request, 'notes/course_form.html', {'form': form, 'title': 'Create Course'})

def course_edit(request, slug):
    course = get_object_or_404(Course, slug=slug)
    if request.method == 'POST':
        form = CourseForm(request.POST, request.FILES, instance=course)
        if form.is_valid():
            course = form.save()
            return redirect('notes:course_detail', slug=course.slug)
    else:
        form = CourseForm(instance=course)
    return render(request, 'notes/course_form.html', {'form': form, 'title': 'Edit Course', 'course': course})

def course_delete(request, slug):
    course = get_object_or_404(Course, slug=slug)
    subject_slug = course.subject.slug
    if request.method == 'POST':
        course.delete()
        return redirect('notes:subject_detail', slug=subject_slug)
    return render(request, 'notes/delete_confirm.html', {'object': course, 'type': 'Course', 'cancel_url': 'notes:course_detail', 'slug': slug})


from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import JsonResponse


@require_POST
def course_update_topic_order(request, slug):
    """
    API endpoint to update topic ordering and visibility for a course.
    Accepts JSON: {topic_ids: [1,2,3], visibility: {1: true, 2: false}}
    """
    course = get_object_or_404(Course, slug=slug)
    
    try:
        data = json.loads(request.body)
        topic_ids = data.get('topic_ids', [])
        visibility = data.get('visibility', {})
        
        # Update order and visibility for each topic
        for order, topic_id in enumerate(topic_ids):
            topic_id_str = str(topic_id)
            is_visible = visibility.get(topic_id_str, True)
            
            CourseTopic.objects.update_or_create(
                course=course,
                topic_id=topic_id,
                defaults={
                    'order': order,
                    'is_visible': is_visible,
                }
            )
        
        return JsonResponse({'success': True})
    
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# Topic CRUD
def topic_create(request):
    """
    Create a topic by importing from a folder path or ZIP upload.
    Metadata (title, description, icon) is extracted from info.json.
    """
    if request.method == 'POST':
        form = TopicCreateForm(request.POST, request.FILES)
        if form.is_valid():
            import_mode = form.cleaned_data['import_mode']
            courses = form.cleaned_data['courses']
            
            # Get the topic path based on import mode
            if import_mode == 'folder':
                topic_path, path_errors = services.handle_local_path(
                    form.cleaned_data['directory_path']
                )
            else:  # zip
                topic_path, path_errors = services.handle_zip_upload(
                    form.cleaned_data['zip_file']
                )
            
            # Check for path handling errors
            if path_errors:
                for error in path_errors:
                    form.add_error(None, error)
                return render(request, 'notes/topic_create.html', {
                    'form': form, 
                    'title': 'Import Topic'
                })
            
            # Validate topic structure
            validation = services.validate_topic_structure(topic_path)
            if not validation.is_valid:
                for error in validation.errors:
                    form.add_error(None, error)
                return render(request, 'notes/topic_create.html', {
                    'form': form, 
                    'title': 'Import Topic'
                })
            
            # Calculate relative directory path from apps/
            apps_dir = services.get_apps_dir()
            relative_path = topic_path.relative_to(apps_dir)
            
            # Handle icon if specified
            icon_svg_path = None
            icon_image_path = None
            
            if validation.metadata.icon:
                icon_ext = pathlib.Path(validation.metadata.icon).suffix.lower()
                media_path = services.copy_icon_to_media(topic_path, validation.metadata.icon)
                
                if media_path:
                    if icon_ext == '.svg':
                        icon_svg_path = media_path
                    else:
                        icon_image_path = media_path
            
            # Check if topic with this title already exists
            existing_topic = Topic.objects.filter(title=validation.metadata.title).first()
            
            if existing_topic:
                # Update existing topic
                topic = existing_topic
                topic.description = validation.metadata.description
                topic.directory_path = relative_path.as_posix()
                # Keep existing slug
                messages.info(request, f'Updated existing topic "{topic.title}".')
            else:
                # Create new topic
                topic = Topic.objects.create(
                    title=validation.metadata.title,
                    description=validation.metadata.description,
                    directory_path=relative_path.as_posix(),
                )
                messages.success(request, f'Topic "{topic.title}" imported successfully!')
            
            # Handle icon files - update for both new and existing
            if icon_svg_path:
                topic.icon_svg.name = icon_svg_path
            if icon_image_path:
                topic.icon_image.name = icon_image_path
            
            # Update courses using helper for proper ordering
            set_topic_courses(topic, courses)
            topic.save()
            
            return redirect('notes:topic_detail', topic_id=topic.id)
    else:
        form = TopicCreateForm()
    
    return render(request, 'notes/topic_create.html', {
        'form': form, 
        'title': 'Import Topic'
    })

def topic_edit(request, topic_id):
    topic = get_object_or_404(Topic, id=topic_id)
    if request.method == 'POST':
        form = TopicForm(request.POST, request.FILES, instance=topic)
        if form.is_valid():
            # Save the topic without committing M2M (handled by through model)
            topic = form.save(commit=False)
            topic.save()
            # Handle courses using helper for proper ordering
            courses = form.cleaned_data.get('courses', [])
            set_topic_courses(topic, courses)
            return redirect('notes:topic_detail', topic_id=topic.id)
    else:
        form = TopicForm(instance=topic)
    return render(request, 'notes/topic_form.html', {'form': form, 'title': 'Edit Topic', 'topic': topic})

def topic_delete(request, topic_id):
    topic = get_object_or_404(Topic, id=topic_id)
    # Get first course for potential redirect (topic can belong to multiple courses)
    first_course = topic.courses.first()
    if request.method == 'POST':
        topic.delete()
        # Redirect to course if available, otherwise to index
        if first_course:
            return redirect('notes:course_detail', slug=first_course.slug)
        return redirect('notes:index')
    return render(request, 'notes/delete_confirm.html', {'object': topic, 'type': 'Topic', 'cancel_url': 'notes:topic_detail', 'topic_id': topic_id})


# AI Topic Generation
def settings_view(request):
    """Settings page for API key management."""
    from .agents.config import get_api_keys, save_api_keys, has_valid_keys
    
    if request.method == 'POST':
        gemini_key = request.POST.get('gemini_key', '').strip()
        perplexity_key = request.POST.get('perplexity_key', '').strip()
        
        save_api_keys(gemini_key=gemini_key, perplexity_key=perplexity_key)
        messages.success(request, 'API keys saved successfully!')
        return redirect('notes:settings')
    
    keys = get_api_keys()
    valid = has_valid_keys()
    
    # Mask keys for display
    def mask_key(key):
        if key and len(key) > 8:
            return key[:4] + '•' * (len(key) - 8) + key[-4:]
        return '••••••••' if key else ''
    
    context = {
        'gemini_key_masked': mask_key(keys['gemini']),
        'perplexity_key_masked': mask_key(keys['perplexity']),
        'gemini_valid': valid['gemini'],
        'perplexity_valid': valid['perplexity'],
    }
    return render(request, 'notes/settings.html', context)

def generate_topic_view(request):
    """AI-powered topic generation."""
    from .agents.pipeline import generate_topic, preview_topic
    from .agents.config import has_valid_keys
    
    # Check API keys
    valid_keys = has_valid_keys()
    if not valid_keys['gemini'] and not valid_keys['perplexity']:
        messages.error(request, 'No API keys configured. Please add your API keys in Settings.')
        return redirect('notes:settings')
    
    courses = Course.objects.select_related('subject').all()
    
    if request.method == 'POST':
        inquiry = request.POST.get('inquiry', '').strip()
        course_id = request.POST.get('course_id', '')
        action = request.POST.get('action', 'generate')
        
        if not inquiry:
            messages.error(request, 'Please enter a topic inquiry.')
            return render(request, 'notes/generate_topic.html', {
                'courses': courses,
                'valid_keys': valid_keys,
            })
        
        if not course_id:
            messages.error(request, 'Please select a course.')
            return render(request, 'notes/generate_topic.html', {
                'courses': courses,
                'inquiry': inquiry,
                'valid_keys': valid_keys,
            })
        
        course = get_object_or_404(Course, id=course_id)
        
        if action == 'preview':
            # Just run planning stage
            plan, error = preview_topic(inquiry)
            
            if error:
                return render(request, 'notes/generate_topic.html', {
                    'courses': courses,
                    'inquiry': inquiry,
                    'course_id': course_id,
                    'error': error.to_dict(),
                    'valid_keys': valid_keys,
                })
            
            return render(request, 'notes/generate_topic.html', {
                'courses': courses,
                'inquiry': inquiry,
                'course_id': course_id,
                'preview': {
                    'name': plan.name,
                    'description': plan.description,
                    'folder': plan.folder,
                    'visualizations': plan.visualizations,
                },
                'valid_keys': valid_keys,
            })
        
        else:  # action == 'generate'
            # Run full pipeline - use subject slug for directory structure
            result = generate_topic(inquiry, course.subject.slug)
            
            if not result.success:
                return render(request, 'notes/generate_topic.html', {
                    'courses': courses,
                    'inquiry': inquiry,
                    'course_id': course_id,
                    'error': result.error.to_dict() if result.error else {'message': 'Unknown error'},
                    'valid_keys': valid_keys,
                })
            
            # Create Topic in database
            topic = Topic.objects.create(
                title=result.topic_content.name,
                description=result.topic_content.description,
                directory_path=result.topic_path,
            )
            
            # Associate with the selected course using helper for proper ordering
            add_topic_to_course(topic, course)
            
            messages.success(request, f'Topic "{topic.title}" generated successfully!')
            return redirect('notes:topic_detail', topic_id=topic.id)
    
    context = {
        'courses': courses,
        'valid_keys': valid_keys,
    }
    return render(request, 'notes/generate_topic.html', context)



def generate_topic_stream_view(request):
    """
    Streamed version of topic generation for interactive UI.
    Returns NDJSON events.
    """
    from .agents.pipeline import generate_topic_stream
    
    if request.method != 'POST':
        return HttpResponseForbidden("Method not allowed")
        
    inquiry = request.POST.get('inquiry', '').strip()
    course_id = request.POST.get('course_id', '')
    
    if not inquiry or not course_id:
         return HttpResponse("Missing arguments", status=400)
         
    course = get_object_or_404(Course, id=course_id)
    subject_slug = course.subject.slug  # Force fetch synchronously
    
    # We need to wrap the synchronous generator to avoid ASGI warnings
    # and potential blocking issues if not handled correctly.
    from asgiref.sync import sync_to_async
    import asyncio

    def run_pipeline():
         # This wrapper runs the generator and yields items
         # We can't directly await a yield from a sync generator in a thread
         # So we'll iterate it in the thread and queue items or similar, 
         # but simpler: just iterate in sync context?
         # The warning says: "StreamingHttpResponse must consume synchronous iterators"
         # WAIT, the warning said: "StreamingHttpResponse must consume synchronous iterators in order to serve them asynchronously. Use an asynchronous iterator instead."
         # This means it WANTS an async iterator.
         
         iterator = generate_topic_stream(inquiry, subject_slug)
         return iterator

    async def async_event_stream():
        # Run the blocking pipeline generation in a thread
        # Since it's a generator, we need to iterate it. 
        # But we can't easily jump back and forth between thread and async loop for each yield 
        # without a queue or similar mechanism if we want true non-blocking.
        # However, for this use case, we can use sync_to_async on the next() call.
        
        iterator = run_pipeline()
        
        while True:
            try:
                # Run next(iterator) in a thread
                event = await sync_to_async(next)(iterator)
            except StopIteration:
                break
            except Exception as e:
                yield json.dumps({"type": "error", "message": str(e)}) + "\n"
                break
            
            # Handle final result
            if event['type'] == 'result':
                result = event['data']
                if result.success:
                     try:
                         # Database operations must also be async or wrapped
                         # Topic.objects.create is a DB call.
                         
                         @sync_to_async
                         def save_topic():
                             topic = Topic.objects.create(
                                title=result.topic_content.name,
                                description=result.topic_content.description,
                                directory_path=result.topic_path,
                             )
                             add_topic_to_course(topic, course)
                             return topic
                         
                         topic = await save_topic()
                         
                         event['redirect_url'] = reverse('notes:topic_detail', kwargs={'topic_id': topic.id})
                         del event['data'] 
                     except Exception as e:
                         event['type'] = 'log'
                         event['level'] = 'error'
                         event['message'] = f"Database save error: {str(e)}"
                else:
                    if result.error:
                        event['error'] = result.error.to_dict()
                    del event['data']
            
            yield json.dumps(event) + "\n"
            
    return StreamingHttpResponse(async_event_stream(), content_type='application/x-ndjson')
