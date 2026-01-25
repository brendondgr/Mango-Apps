import os
import sys
import csv
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

def test_csv_parsing():
    csv_path = BASE_DIR / 'data' / 'csv' / 'Projects.csv'
    print(f"Testing CSV parsing at: {csv_path}")
    
    if not csv_path.exists():
        print("FAIL: Projects.csv not found")
        return False
        
    try:
        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            projects = list(reader)
            
        if not projects:
            print("FAIL: No projects found in CSV")
            return False
            
        print(f"SUCCESS: Found {len(projects)} projects")
        
        # Check first project (fsusc)
        fsusc = next((p for p in projects if p['route'] == 'fsusc'), None)
        if not fsusc:
            print("FAIL: 'fsusc' project not found in CSV")
            return False
            
        if fsusc['html'] != 'fsusc.html':
            print(f"FAIL: fsusc html is '{fsusc['html']}', expected 'fsusc.html'")
            return False
            
        print("SUCCESS: CSV parsing logic verified")
        return True
    except Exception as e:
        print(f"FAIL: Error during CSV parsing: {e}")
        return False

def test_directory_structure():
    projects_dir = BASE_DIR / 'web' / 'projects'
    print(f"Testing directory structure at: {projects_dir}")
    
    if not projects_dir.exists():
        print("FAIL: web/projects/ directory not found")
        return False
        
    # Check fsusc directory
    fsusc_dir = projects_dir / 'fsusc'
    if not fsusc_dir.exists() or not fsusc_dir.is_dir():
        print("FAIL: web/projects/fsusc/ directory not found")
        return False
        
    fsusc_index = fsusc_dir / 'index.html'
    if not fsusc_index.exists():
        print("FAIL: web/projects/fsusc/index.html not found")
        return False
        
    print("SUCCESS: Directory structure verified")
    return True

if __name__ == "__main__":
    p_ok = test_csv_parsing()
    d_ok = test_directory_structure()
    
    if p_ok and d_ok:
        print("\nALL TESTS PASSED")
        sys.exit(0)
    else:
        print("\nSOME TESTS FAILED")
        sys.exit(1)
