from django.core.management.base import BaseCommand
from apps.Notes.apps.notes.models import Subject, Course, Topic, CourseTopic
from apps.Notes.apps.notes import services
import os
from pathlib import Path
from django.conf import settings
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Populates the database from the existing file structure in apps/'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting database population...')
        
        apps_dir = services.get_apps_dir()
        
        # Define ignore list for top-level directories
        ignore_dirs = {
            'notes', 'core', 'admin', 'migrations', '__pycache__', 
            '.agent', 'templates', 'static', 'media', 'management',
            'tests', 'fixtures', 'example', 'example.md', 'style.css'
        }

        # Iterate through top-level directories (Subject level)
        for subject_dir in apps_dir.iterdir():
            if not subject_dir.is_dir():
                continue
            
            if subject_dir.name in ignore_dirs or subject_dir.name.startswith('.'):
                continue
            
            # Treat directory name as Subject Name
            subject_name = subject_dir.name
            
            # Create or get Subject
            subject, created = Subject.objects.get_or_create(
                slug=slugify(subject_name),
                defaults={
                    'name': subject_name,
                    'color_tone': 'blue' # Default color
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created Subject: {subject.name}'))
            else:
                self.stdout.write(f'Existing Subject: {subject.name}')

            # Create a default Course for this Subject (1:1 mapping for now)
            course_name = subject_name # Or "General " + subject_name
            course, created = Course.objects.get_or_create(
                slug=slugify(course_name),
                subject=subject,
                defaults={
                    'name': course_name
                }
            )
            if created:
                 self.stdout.write(self.style.SUCCESS(f'  Created Course: {course.name}'))

            # Iterate through subdirectories (Topic level)
            topic_count = 0
            for topic_dir in subject_dir.iterdir():
                if not topic_dir.is_dir():
                    continue

                if topic_dir.name.startswith('.'):
                    continue

                # Check for info.json to confirm it is a Topic
                if (topic_dir / 'info.json').exists():
                    try:
                        relative_path = topic_dir.relative_to(apps_dir)
                        
                        # Validate and parse metadata using services
                        metadata, errors = services.parse_topic_metadata(topic_dir)
                        
                        if errors:
                            self.stdout.write(self.style.WARNING(f'    Skipping {topic_dir.name}: {errors}'))
                            continue
                        
                        if not metadata:
                            continue

                        # Create or update Topic
                        topic, created = Topic.objects.update_or_create(
                            directory_path=relative_path.as_posix(),
                            defaults={
                                'title': metadata.title,
                                'description': metadata.description,
                                'slug': slugify(metadata.title) # Warning: uniqueness might fail if duplicates exist
                            }
                        )
                        
                        # Handle Icon
                        if metadata.icon:
                            # We don't necessarily copy it again if it exists, but services.copy_icon_to_media helps
                            # But we don't want to duplicate wildly. run.py copies if I use the service logic?
                            # services.copy_icon_to_media copies to media root.
                            # We can update the field.
                            icon_rel_path = services.copy_icon_to_media(topic_dir, metadata.icon)
                            if icon_rel_path:
                                if icon_rel_path.endswith('.svg'):
                                    topic.icon_svg.name = icon_rel_path
                                else:
                                    topic.icon_image.name = icon_rel_path
                                topic.save()

                        # Link Topic to Course
                        # Check if link exists
                        if not CourseTopic.objects.filter(course=course, topic=topic).exists():
                            # Add with next order
                            from django.db.models import Max
                            max_order = CourseTopic.objects.filter(course=course).aggregate(Max('order'))['order__max'] or 0
                            CourseTopic.objects.create(
                                course=course,
                                topic=topic,
                                order=max_order + 1,
                                is_visible=True
                            )
                            self.stdout.write(self.style.SUCCESS(f'    Linked Topic: {topic.title}'))
                        else:
                             self.stdout.write(f'    Existing Topic: {topic.title}')
                        
                        topic_count += 1
                        
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'    Error processing {topic_dir.name}: {e}'))

            if topic_count == 0:
                 self.stdout.write(self.style.WARNING(f'  No topics found in {subject.name}'))

        self.stdout.write(self.style.SUCCESS('Database population complete.'))
