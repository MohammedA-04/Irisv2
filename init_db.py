#!/usr/bin/env python
import os
import sys
import subprocess

print("Running init_db.py wrapper...")

# Change to the backend directory
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
os.chdir(backend_dir)

# Execute the backend/init_db.py script
try:
    print(f"Changed directory to: {os.getcwd()}")
    print("Executing backend/init_db.py...")
    
    # Method 1: Run as a module
    sys.path.insert(0, backend_dir)
    from backend.init_db import app, db
    
    with app.app_context():
        db.create_all()
    
    print("Database initialization complete!")
except Exception as e:
    print(f"Error running init_db.py: {str(e)}")
    
    # Method 2: If the import method fails, try using subprocess
    try:
        print("Trying alternative method...")
        result = subprocess.run(["python", "init_db.py"], 
                              capture_output=True, 
                              text=True, 
                              check=True)
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Subprocess error: {e}")
        print(f"Output: {e.stdout}")
        print(f"Error: {e.stderr}")
        sys.exit(1) 