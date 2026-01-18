from django.core.management.base import BaseCommand
from apps.notes.models import Subject, Course, Topic
import shutil
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Creates sample data for verification'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data...')
        
        # Create Subject
        subject, created = Subject.objects.get_or_create(name='Mathematics')
        if created:
            self.stdout.write(f'Created subject: {subject.name}')
        else:
            self.stdout.write(f'Subject {subject.name} already exists')
            
        # Create Course
        course, created = Course.objects.get_or_create(
            subject=subject, 
            name='Calculus I',
            defaults={'slug': 'calculus-1'}
        )
        if created:
            self.stdout.write(f'Created course: {course.name}')
        else:
             self.stdout.write(f'Course {course.name} already exists')

        # Create Topic
        topic, created = Topic.objects.get_or_create(
            course=course,
            title='Limits and Continuity',
            defaults={
                'description': 'Introduction to limits and continuity in calculus.',
                'directory_path': 'Math/Calculus/Limits'
            }
        )
        if created:
            self.stdout.write(f'Created topic: {topic.title}')
        else:
            self.stdout.write(f'Topic {topic.title} already exists')

        # Ensure directory exists for the topic so topic detail page doesn't error on md_file check
        topic_full_path = settings.BASE_DIR / 'apps' / topic.directory_path
        os.makedirs(topic_full_path, exist_ok=True)
        
        # Create example.md
        md_file = topic_full_path / 'example.md'
        if not md_file.exists():
            with open(md_file, 'w') as f:
                f.write('# Limits and Continuity\n\nThis is a sample topic with **markdown** content.\n\n$$ \\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1 $$')
            self.stdout.write('Created sample markdown file')

        # Create example.html for visualization
        viz_file = topic_full_path / 'example.html'
        if not viz_file.exists():
            with open(viz_file, 'w') as f:
                f.write('<html><body style="background:white; display:flex; justify-content:center; align-items:center; height:100vh;"><h1>Interactive Viz</h1></body></html>')
            self.stdout.write('Created sample visualization file')
            
        self.stdout.write(self.style.SUCCESS('Sample data creation complete'))
