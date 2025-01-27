import subprocess
import sys
import os
import venv
from pathlib import Path
import time

def run_command(command, cwd=None):
    print(f"Running: {command}")
    try:
        subprocess.run(command, shell=True, check=True, cwd=cwd)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(f"Error: {e}")
        return False

def create_env_file():
    env_content = """SECRET_KEY=dev_secret_key_123
DATABASE_URL=sqlite:///iris.db
FLASK_APP=app.py
FLASK_DEBUG=1"""
    
    with open('.env', 'w') as f:
        f.write(env_content)

def install_dependencies(pip):
    print("Installing dependencies...")
    python = "venv\\Scripts\\python.exe" if os.name == 'nt' else "venv/bin/python"
    commands = [
        f"{python} -m pip install --upgrade pip",
        f"{pip} install python-dotenv==0.19.0",
        f"{pip} install flask==2.0.1",
        f"{pip} install Flask-CORS==3.0.10",
        f"{pip} install flask-sqlalchemy==2.5.1",
        f"{pip} install flask-limiter==1.4",
        f"{pip} install bcrypt==4.0.1",
        f"{pip} install torch==2.0.1 --extra-index-url https://download.pytorch.org/whl/cpu",
        f"{pip} install transformers==4.35.2",
        f"{pip} install -r requirements.txt"
    ]

    for command in commands:
        print(f"\nExecuting: {command}")
        if not run_command(command):
            print(f"Failed to run command: {command}")
            if "pip install --upgrade pip" in command:
                print("Continuing despite pip upgrade failure...")
                continue
            return False
    
    return True

def main():
    try:
        print("\nStarting installation process...")
        # Create .env file if it doesn't exist
        if not os.path.exists('.env'):
            print("Creating .env file...")
            create_env_file()

        # Remove existing venv
        venv_path = Path("venv")
        if venv_path.exists():
            print("Removing existing virtual environment...")
            if os.name == 'nt':  # Windows
                run_command("rmdir /s /q venv")
            else:  # Linux/Mac
                run_command("rm -rf venv")

        print("Creating virtual environment...")
        venv.create("venv", with_pip=True)

        # Get the correct pip and python paths
        if os.name == 'nt':  # Windows
            pip = "venv\\Scripts\\pip"
            python = "venv\\Scripts\\python"
        else:  # Linux/Mac
            pip = "venv/bin/pip"
            python = "venv/bin/python"

        print("\nWaiting for virtual environment to be ready...")
        time.sleep(2)  # Give venv time to settle

        if not install_dependencies(pip):
            print("Installation failed!")
            return

        print("\nInitializing database...")
        if run_command(f"{python} init_db.py"):
            print("\nInstallation completed successfully!")
            print("\nTo start the server, run:")
            if os.name == 'nt':
                print("start.bat")
            else:
                print("./start.sh")
        else:
            print("\nDatabase initialization failed!")

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 