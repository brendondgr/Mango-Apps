# Additional Technical Details

## Views (`apps/notes/views.py`)

### Navigation

- `index(request)`: Renders the homepage with subjects and courses.
- `subject_detail(request, slug)`: Renders subject detail page with its courses and topics.
- `course_detail(request, slug)`: Renders course detail page with its topics.
- `topic_detail(request, topic_id)`: Renders topic page with markdown content and optional visualization.
- `serve_visualization(request, topic_id, filename)`: Securely serves static files for topic visualizations.

### CRUD Operations

- `subject_create(request)`: Handles creation of new Subjects.
- `subject_edit(request, slug)`: Handles editing existing Subjects.
- `subject_delete(request, slug)`: Handles deletion of Subject and cascading content.
- `course_create(request)`: Handles creation of new Courses.
- `course_edit(request, slug)`: Handles editing existing Courses.
- `course_delete(request, slug)`: Handles deletion of Course.
- `topic_create(request)`: Handles creation of new Topics.
- `topic_edit(request, topic_id)`: Handles editing existing Topics.
- `topic_delete(request, topic_id)`: Handles deletion of Topic.

## Forms (`apps/notes/forms.py`)

- `SubjectForm`: ModelForm for Subject (fields: name, icon_svg, icon_image).
- `CourseForm`: ModelForm for Course (fields: subject, name, icon_svg, icon_image).
- `TopicForm`: ModelForm for Topic (fields: course, title, description, directory_path, icon_svg, icon_image).

## Javascript (`web/static/js/modals.js`)

- `openModal(modalId)`: Opens a modal by ID with animation.
- `closeModal(modalId)`: Closes a modal with animation.
- Includes event listeners for backdrop click and ESC key.
