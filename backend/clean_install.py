import subprocess
import sys
import os
import venv
import shutil
from pathlib import Path
import time

# Section 1 - Run a command in the shell
def run_command(command, cwd=None):
    print(f"Running: {command}")
    try:
        subprocess.run(command, shell=True, check=True, cwd=cwd)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(f"Error: {e}")
        return False

# Section 2 - Create .env file
def create_env_file():
    env_content = """SECRET_KEY=dev_secret_key_123
DATABASE_URL=sqlite:///iris.db
FLASK_APP=app.py
FLASK_DEBUG=1"""
    
    with open('.env', 'w') as f:
        f.write(env_content)

# Section 3 - Install dependencies using pip
def install_dependencies(python, pip):
    print("Installing dependencies...")
    
    commands = [
        f"{pip} install --upgrade pip",
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

# Section 4 - Main installation process
def main():
    try:
        print("\nStarting installation process...")

        # Section 4.1 - Create .env file if it doesn't exist
        if not os.path.exists('.env'):
            print("Creating .env file...")
            create_env_file()

        # Section 4.2 - Remove existing virtual environment
        venv_path = Path("venv")
        if venv_path.exists():
            print("Removing existing virtual environment...")
            try:
                shutil.rmtree(venv_path, ignore_errors=True)
                time.sleep(2)  # Give time for removal
                if venv_path.exists():
                    print("Retrying removal...")
                    shutil.rmtree(venv_path, ignore_errors=True)
            except Exception as e:
                print(f"Error removing venv: {e}")

        # Section 4.3 - Create a new virtual environment
        print("Creating virtual environment...")
        try:
            venv.create("venv", with_pip=True)
        except Exception as e:
            print(f"Error creating virtual environment: {e}")
            sys.exit(1)

        # Section 4.4 - Get the correct Python and pip paths inside venv
        if os.name == 'nt':  # Windows replace with 'Scripts' on PC
            python = "venv\\Scripts\\python"
            pip = "venv\\Scripts\\pip"
        else:  # Linux/Mac
            python = "venv\\bin\\python"
            pip = "venv\\bin\\pip"

        print("\nWaiting for virtual environment to be ready...")
        time.sleep(2)  # Give venv time to settle

        # Section 4.5 - Install dependencies
        if not install_dependencies(python, pip):
            print("Installation failed!")
            return

        # Section 4.6 - Initialize database
        print("\nInitializing database...")
        if run_command(f"{python} init_db.py"):
            print("\nInstallation completed successfully!")
            print("\nTo start the server, run:")
            print("start.bat" if os.name == 'nt' else "./start.sh")
        else:
            print("\nDatabase initialization failed!")

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        sys.exit(1)

# Section 5 - Run the script
if __name__ == "__main__":
    main()
