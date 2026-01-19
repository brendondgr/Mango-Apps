"""
Topic Import Services

Service layer for handling topic imports via folder path or ZIP upload.
All topic content is stored in apps/ directory with its own unique folder name.
"""

import json
import os
import re
import shutil
import tempfile
import uuid
import zipfile
from pathlib import Path
from typing import Tuple, Optional
from dataclasses import dataclass

from django.conf import settings


@dataclass
class TopicMetadata:
    """Data class for topic metadata extracted from info.json"""
    title: str
    description: str
    entry_point: str = 'example.md'
    icon: Optional[str] = None


@dataclass
class ValidationResult:
    """Result of topic structure validation"""
    is_valid: bool
    errors: list[str]
    metadata: Optional[TopicMetadata] = None


def get_apps_dir() -> Path:
    """Get the apps directory path where topic content is stored."""
    return settings.BASE_DIR / 'apps' / 'Notes' / 'apps'


def generate_unique_dir_name(base_name: str) -> str:
    """
    Generate a unique directory name based on base name.
    Appends UUID suffix if directory already exists.
    """
    apps_dir = get_apps_dir()
    safe_name = re.sub(r'[^\w\-]', '_', base_name)
    
    if not (apps_dir / safe_name).exists():
        return safe_name
    
    # Add UUID suffix for uniqueness
    unique_suffix = uuid.uuid4().hex[:8]
    return f"{safe_name}_{unique_suffix}"


def parse_topic_metadata(topic_path: Path) -> Tuple[Optional[TopicMetadata], list[str]]:
    """
    Parse info.json from a topic directory.
    
    Args:
        topic_path: Path to the topic directory
        
    Returns:
        Tuple of (TopicMetadata or None, list of error messages)
    """
    errors = []
    info_file = topic_path / 'info.json'
    
    if not info_file.exists():
        errors.append("Missing required file: info.json")
        return None, errors
    
    try:
        with open(info_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        errors.append(f"Invalid JSON in info.json: {e}")
        return None, errors
    except IOError as e:
        errors.append(f"Error reading info.json: {e}")
        return None, errors
    
    # Validate required fields
    if 'title' not in data:
        errors.append("info.json missing required field: 'title'")
    if 'description' not in data:
        errors.append("info.json missing required field: 'description'")
    
    if errors:
        return None, errors
    
    return TopicMetadata(
        title=data['title'],
        description=data['description'],
        entry_point=data.get('entry_point', 'example.md'),
        icon=data.get('icon')
    ), []


def validate_topic_structure(topic_path: Path) -> ValidationResult:
    """
    Validate that a topic directory has the required structure.
    
    Required:
        - info.json with 'title' and 'description'
        - example.md (main markdown content)
        
    Optional:
        - icon file (if specified in info.json)
        - HTML visualization files
        - static/ directory for assets
        
    Args:
        topic_path: Path to the topic directory
        
    Returns:
        ValidationResult with validation status and any errors
    """
    errors = []
    
    if not topic_path.exists():
        return ValidationResult(False, ["Topic directory does not exist"])
    
    if not topic_path.is_dir():
        return ValidationResult(False, ["Path is not a directory"])
    
    # Parse and validate metadata
    metadata, meta_errors = parse_topic_metadata(topic_path)
    errors.extend(meta_errors)
    
    # Check for markdown entry point
    entry_point = metadata.entry_point if metadata else 'example.md'
    md_file = topic_path / entry_point
    if not md_file.exists():
        errors.append(f"Missing required file: {entry_point}")
    
    # If icon is specified, verify it exists
    if metadata and metadata.icon:
        icon_path = topic_path / metadata.icon
        if not icon_path.exists():
            errors.append(f"Icon file specified in info.json not found: {metadata.icon}")
        else:
            # Validate icon file extension
            valid_extensions = {'.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp'}
            if icon_path.suffix.lower() not in valid_extensions:
                errors.append(f"Invalid icon file extension: {icon_path.suffix}. "
                            f"Supported: {', '.join(valid_extensions)}")
    
    return ValidationResult(
        is_valid=len(errors) == 0,
        errors=errors,
        metadata=metadata
    )


def handle_local_path(relative_path: str) -> Tuple[Optional[Path], list[str]]:
    """
    Validate and process an existing folder path.
    
    Args:
        relative_path: Path relative to apps/ directory
        
    Returns:
        Tuple of (absolute Path or None, list of error messages)
    """
    errors = []
    
    # Normalize path
    clean_path = relative_path.strip().strip('/')
    if not clean_path:
        return None, ["Directory path cannot be empty"]
    
    apps_dir = get_apps_dir()
    full_path = (apps_dir / clean_path).resolve()
    
    # Security: ensure path is within apps directory
    try:
        full_path.relative_to(apps_dir)
    except ValueError:
        return None, ["Invalid path: must be within apps directory"]
    
    if not full_path.exists():
        return None, [f"Directory does not exist: {relative_path}"]
    
    if not full_path.is_dir():
        return None, [f"Path is not a directory: {relative_path}"]
    
    return full_path, errors


def handle_zip_upload(zip_file) -> Tuple[Optional[Path], list[str]]:
    """
    Extract a ZIP file to the apps directory.
    
    The ZIP is extracted to a unique directory within apps/.
    The directory name is based on the ZIP filename or the root folder name
    within the ZIP.
    
    Args:
        zip_file: Uploaded file object (Django InMemoryUploadedFile or similar)
        
    Returns:
        Tuple of (extracted directory Path or None, list of error messages)
    """
    errors = []
    
    # Save to temporary file first
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.zip') as tmp:
            for chunk in zip_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name
    except IOError as e:
        return None, [f"Failed to save uploaded file: {e}"]
    
    try:
        # Validate it's a valid ZIP
        if not zipfile.is_zipfile(tmp_path):
            return None, ["Uploaded file is not a valid ZIP archive"]
        
        with zipfile.ZipFile(tmp_path, 'r') as zf:
            # Security check for path traversal
            for name in zf.namelist():
                if name.startswith('/') or '..' in name:
                    return None, ["ZIP contains invalid paths (absolute or parent traversal)"]
            
            # Determine root folder name from ZIP contents
            namelist = zf.namelist()
            if not namelist:
                return None, ["ZIP file is empty"]
            
            # Check if all files are in a single root folder
            first_component = namelist[0].split('/')[0]
            all_in_root = all(
                n.startswith(first_component + '/') or n == first_component
                for n in namelist
            )
            
            # Generate unique directory name
            if all_in_root and first_component:
                base_name = first_component
            else:
                # Use ZIP filename without extension
                base_name = Path(zip_file.name).stem
            
            unique_dir_name = generate_unique_dir_name(base_name)
            apps_dir = get_apps_dir()
            target_dir = apps_dir / unique_dir_name
            
            # Extract files
            if all_in_root:
                # Extract and rename root folder
                temp_extract = apps_dir / f"_temp_extract_{uuid.uuid4().hex[:8]}"
                zf.extractall(temp_extract)
                extracted_root = temp_extract / first_component
                shutil.move(str(extracted_root), str(target_dir))
                shutil.rmtree(temp_extract, ignore_errors=True)
            else:
                # Extract directly to target
                target_dir.mkdir(parents=True, exist_ok=True)
                zf.extractall(target_dir)
            
            return target_dir, []
            
    except zipfile.BadZipFile:
        return None, ["Failed to extract ZIP: file is corrupted"]
    except Exception as e:
        return None, [f"Failed to extract ZIP: {e}"]
    finally:
        # Clean up temp file
        try:
            os.unlink(tmp_path)
        except:
            pass


def copy_icon_to_media(topic_path: Path, icon_filename: str) -> Optional[str]:
    """
    Copy topic icon to Django media directory.
    
    Args:
        topic_path: Path to the topic directory
        icon_filename: Name of the icon file within the topic directory
        
    Returns:
        Relative path to the copied icon in media, or None if failed
    """
    source = topic_path / icon_filename
    if not source.exists():
        return None
    
    # Create unique filename for media storage
    unique_name = f"{uuid.uuid4().hex[:8]}_{icon_filename}"
    media_icons_dir = Path(settings.MEDIA_ROOT) / 'icons' / 'topics'
    media_icons_dir.mkdir(parents=True, exist_ok=True)
    
    dest = media_icons_dir / unique_name
    
    try:
        shutil.copy2(source, dest)
        return f"icons/topics/{unique_name}"
    except IOError:
        return None
