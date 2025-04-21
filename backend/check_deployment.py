import os
import sys
import shutil
from pathlib import Path

def check_requirements_file():
    """Check if requirements-deploy.txt exists and create it if needed."""
    print("Checking for requirements-deploy.txt...")
    
    # Check current directory first
    if os.path.exists("requirements-deploy.txt"):
        print("✅ Found requirements-deploy.txt in current directory")
        return True
        
    # Check backend directory
    if os.path.exists("backend/requirements-deploy.txt"):
        print("Found requirements-deploy.txt in backend/ directory")
        # Copy to current directory
        shutil.copy("backend/requirements-deploy.txt", "requirements-deploy.txt")
        print("✅ Copied requirements-deploy.txt to current directory")
        return True
    
    # If we're in the backend directory, check parent
    current_dir = Path.cwd()
    if current_dir.name == "backend" and os.path.exists("../requirements-deploy.txt"):
        print("Found requirements-deploy.txt in parent directory")
        shutil.copy("../requirements-deploy.txt", "requirements-deploy.txt")
        print("✅ Copied requirements-deploy.txt to current directory")
        return True
        
    # Not found, create it
    print("⚠️ requirements-deploy.txt not found, creating it...")
    
    requirements = """Flask==2.2.3
Werkzeug==2.2.3
gunicorn==20.1.0
Flask-Cors==3.0.10
numpy==1.23.5
scikit-learn==1.2.2
opencv-python-headless==4.7.0.72
Pillow==9.5.0
pyotp==2.8.0
flask-limiter==3.3.1
python-dotenv==1.0.0
pytest==7.3.1
flask-sqlalchemy==3.0.3
bcrypt==4.0.1
pydantic==1.10.7"""
    
    with open("requirements-deploy.txt", "w") as f:
        f.write(requirements)
    
    print("✅ Created requirements-deploy.txt")
    return True

def check_app_file():
    """Check if app.py exists."""
    print("Checking for app.py...")
    
    # Check current directory
    if os.path.exists("app.py"):
        print("✅ Found app.py in current directory")
        return True
        
    # Check backend directory
    if os.path.exists("backend/app.py"):
        print("Found app.py in backend/ directory")
        # Copy to current directory
        shutil.copy("backend/app.py", "app.py")
        print("✅ Copied app.py to current directory")
        return True
    
    # If we're in the backend directory, check if app_simple_test.py exists
    if os.path.exists("app_simple_test.py"):
        print("Found app_simple_test.py, renaming to app.py...")
        shutil.copy("app_simple_test.py", "app.py")
        print("✅ Copied app_simple_test.py to app.py")
        return True
    
    print("❌ app.py not found. Please make sure you have the main Flask application file.")
    return False

def check_init_db():
    """Check if init_db.py exists."""
    print("Checking for init_db.py...")
    
    # Check current directory
    if os.path.exists("init_db.py"):
        print("✅ Found init_db.py in current directory")
        return True
        
    # Check backend directory
    if os.path.exists("backend/init_db.py"):
        print("Found init_db.py in backend/ directory")
        # Copy to current directory
        shutil.copy("backend/init_db.py", "init_db.py")
        print("✅ Copied init_db.py to current directory")
        return True
        
    # Not found, create a minimal version
    print("⚠️ init_db.py not found, creating a minimal version...")
    
    minimal_init_db = """import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import sys

print("Initializing database...")

# Create a minimal app for database initialization
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///iris.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Create the database tables
try:
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")
except Exception as e:
    print(f"Error creating database tables: {str(e)}")
    sys.exit(1)

print("Database initialization complete.")
"""
    
    with open("init_db.py", "w") as f:
        f.write(minimal_init_db)
    
    print("✅ Created minimal init_db.py")
    return True

def main():
    print("\n=== Deployment Files Check ===\n")
    
    # Get current directory
    cwd = os.getcwd()
    print(f"Current directory: {cwd}")
    
    requirements_ok = check_requirements_file()
    app_ok = check_app_file()
    init_db_ok = check_init_db()
    
    print("\n=== Summary ===")
    if requirements_ok and app_ok and init_db_ok:
        print("✅ All required files found or created.")
        print("✅ You can now deploy to Render with these files.")
    else:
        print("❌ Some files are missing. Please fix the issues above.")
    
    print("\nTo deploy on Render, use these settings:")
    print("- Build command: pip install Flask==2.2.3 Werkzeug==2.2.3 gunicorn==20.1.0 Flask-Cors==3.0.10 numpy==1.23.5 scikit-learn==1.2.2 opencv-python-headless==4.7.0.72 Pillow==9.5.0 pyotp==2.8.0 flask-limiter==3.3.1 python-dotenv==1.0.0 pytest==7.3.1 flask-sqlalchemy==3.0.3 bcrypt==4.0.1 pydantic==1.10.7 && python init_db.py")
    print("- Start command: gunicorn app:app")
    print("- Health check path: /api/health")

if __name__ == "__main__":
    main() 