from django.db import models
from django.utils.text import slugify

# Create your models here.

class Subject(models.Model):
    COLOR_CHOICES = [
        ('yellow-orange', 'Yellow Orange'),
        ('yellow', 'Yellow'),
        ('orange', 'Orange'),
        ('red', 'Red'),
        ('blue', 'Blue'),
        ('purple', 'Purple'),
        ('teal', 'Teal'),
        ('light-purple', 'Light Purple'),
        ('light-blue', 'Light Blue'),
        ('green', 'Green'),
        ('black', 'Black'),
        ('muted-gray', 'Muted Gray'),
        ('brown', 'Brown'),
        ('light-pink', 'Light Pink'),
        ('kiwi', 'Kiwi'),
        ('rose', 'Rose'),
    ]

    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(unique=True)
    color_tone = models.CharField(
        max_length=20, 
        choices=COLOR_CHOICES, 
        default='blue',
        help_text="Color theme for the subject card and pages."
    )
    icon_svg = models.FileField(upload_to='icons/subjects/', blank=True, null=True)
    icon_image = models.ImageField(upload_to='icons/subjects/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['name']
        verbose_name = 'Subject'
        verbose_name_plural = 'Subjects'

    def __str__(self):
        return self.name

class Course(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='courses')
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    icon_svg = models.FileField(upload_to='icons/courses/', blank=True, null=True)
    icon_image = models.ImageField(upload_to='icons/courses/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['subject', 'name']
        unique_together = ['subject', 'name']
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'

    def __str__(self):
        return f"{self.subject.name} - {self.name}"


class CourseTopic(models.Model):
    """Through model for Course-Topic relationship with ordering and visibility."""
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    topic = models.ForeignKey('Topic', on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'topic__title']
        unique_together = ['course', 'topic']
        verbose_name = 'Course Topic'
        verbose_name_plural = 'Course Topics'

    def __str__(self):
        return f"{self.course.name} - {self.topic.title} (order: {self.order})"


class Topic(models.Model):
    courses = models.ManyToManyField(Course, through='CourseTopic', related_name='topics')
    title = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon_svg = models.FileField(upload_to='icons/topics/', blank=True, null=True)
    icon_image = models.ImageField(upload_to='icons/topics/', blank=True, null=True)
    directory_path = models.CharField(max_length=500, help_text="Relative path from apps/ to topic folder (e.g., 'LinearAlgebra/Vectors')")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            # Check for slug uniqueness, excluding the current instance if it exists
            while Topic.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        # Enforce POSIX paths
        if self.directory_path:
            self.directory_path = self.directory_path.replace('\\', '/')
            
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['title']
        verbose_name = 'Topic'
        verbose_name_plural = 'Topics'

    def __str__(self):
        return self.title
