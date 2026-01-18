# Custom migration to add CourseTopic through model
# This preserves existing Course-Topic relationships

from django.db import migrations, models
import django.db.models.deletion


def migrate_existing_relationships(apps, schema_editor):
    """Migrate existing M2M relationships to the new through model."""
    Topic = apps.get_model('notes', 'Topic')
    CourseTopic = apps.get_model('notes', 'CourseTopic')
    
    # Get all existing relationships from the auto-generated M2M table
    for topic in Topic.objects.all():
        for i, course in enumerate(topic.courses.all()):
            CourseTopic.objects.create(
                course=course,
                topic=topic,
                order=i,
                is_visible=True
            )


def reverse_migration(apps, schema_editor):
    """Reverse data migration - relationships will remain in the through model."""
    pass  # No action needed - the table will be dropped anyway


class Migration(migrations.Migration):

    dependencies = [
        ('notes', '0003_alter_topic_options_alter_topic_unique_together_and_more'),
    ]

    operations = [
        # Step 1: Create the CourseTopic model
        migrations.CreateModel(
            name='CourseTopic',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_visible', models.BooleanField(default=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='notes.course')),
                ('topic', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='notes.topic')),
            ],
            options={
                'verbose_name': 'Course Topic',
                'verbose_name_plural': 'Course Topics',
                'ordering': ['order', 'topic__title'],
                'unique_together': {('course', 'topic')},
            },
        ),
        # Step 2: Migrate existing data
        migrations.RunPython(migrate_existing_relationships, reverse_migration),
        # Step 3: Remove the old M2M field
        migrations.RemoveField(
            model_name='topic',
            name='courses',
        ),
        # Step 4: Add new M2M field with through model
        migrations.AddField(
            model_name='topic',
            name='courses',
            field=models.ManyToManyField(
                related_name='topics',
                through='notes.CourseTopic',
                to='notes.course'
            ),
        ),
    ]
