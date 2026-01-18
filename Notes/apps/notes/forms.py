from django import forms
from .models import Subject, Course, Topic


class TopicCreateForm(forms.Form):
    """
    Form for creating a topic via folder path or ZIP upload.
    Metadata is extracted from info.json in the topic directory.
    """
    IMPORT_MODE_CHOICES = [
        ('folder', 'Import from Folder Path'),
        ('zip', 'Upload ZIP File'),
    ]
    
    courses = forms.ModelMultipleChoiceField(
        queryset=Course.objects.all(),
        widget=forms.CheckboxSelectMultiple(attrs={'class': 'form-checkbox-group'}),
        required=True,
        help_text="Select one or more courses for this topic."
    )
    
    import_mode = forms.ChoiceField(
        choices=IMPORT_MODE_CHOICES,
        widget=forms.RadioSelect(attrs={'class': 'import-mode-radio'}),
        initial='folder',
        help_text="Choose how to import the topic."
    )
    
    directory_path = forms.CharField(
        max_length=500,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-input',
            'placeholder': 'e.g., Mathematics/Calculus/Riemann'
        }),
        help_text="Path relative to apps/ directory containing the topic files."
    )
    
    zip_file = forms.FileField(
        required=False,
        widget=forms.FileInput(attrs={
            'class': 'form-input',
            'accept': '.zip'
        }),
        help_text="Upload a ZIP file containing the topic folder structure."
    )
    
    def clean(self):
        cleaned_data = super().clean()
        import_mode = cleaned_data.get('import_mode')
        directory_path = cleaned_data.get('directory_path')
        zip_file = cleaned_data.get('zip_file')
        
        if import_mode == 'folder':
            if not directory_path:
                self.add_error('directory_path', 'Directory path is required when importing from folder.')
        elif import_mode == 'zip':
            if not zip_file:
                self.add_error('zip_file', 'ZIP file is required when uploading.')
        
        return cleaned_data

class SubjectForm(forms.ModelForm):
    class Meta:
        model = Subject
        fields = ['name', 'color_tone', 'icon_svg', 'icon_image']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-input', 
                'placeholder': 'Enter subject name e.g., Mathematics'
            }),
            'color_tone': forms.RadioSelect(attrs={
                'class': 'color-picker-grid'
            }),
            'icon_image': forms.FileInput(attrs={'class': 'form-input'}),
            'icon_svg': forms.FileInput(attrs={'class': 'form-input'}),
        }

class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ['subject', 'name', 'icon_svg', 'icon_image']
        widgets = {
            'subject': forms.Select(attrs={'class': 'form-select'}),
            'name': forms.TextInput(attrs={
                'class': 'form-input', 
                'placeholder': 'Enter course name e.g., Calculus AB'
            }),
            'icon_image': forms.FileInput(attrs={'class': 'form-input'}),
            'icon_svg': forms.FileInput(attrs={'class': 'form-input'}),
        }

class TopicForm(forms.ModelForm):
    class Meta:
        model = Topic
        fields = ['courses', 'title', 'description', 'icon_svg', 'icon_image', 'directory_path']
        widgets = {
            'courses': forms.CheckboxSelectMultiple(attrs={'class': 'form-checkbox-group'}),
            'title': forms.TextInput(attrs={
                'class': 'form-input', 
                'placeholder': 'Enter topic title e.g., Riemann Sums'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-textarea', 
                'rows': 4,
                'placeholder': 'Brief description of the topic...'
            }),
            'directory_path': forms.TextInput(attrs={
                'class': 'form-input', 
                'placeholder': 'e.g., Mathematics/Calculus/Riemann'
            }),
            'icon_image': forms.FileInput(attrs={'class': 'form-input'}),
            'icon_svg': forms.FileInput(attrs={'class': 'form-input'}),
        }
