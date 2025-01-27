#!/bin/bash

# Create and activate virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python -m venv venv
fi

# Windows
if [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
else
    # Linux/Mac
    source venv/bin/activate
fi

# Upgrade pip
python -m pip install --upgrade pip

# Install Flask-Limiter and dependencies first
pip install --no-cache-dir Flask-Limiter==1.4
pip install --no-cache-dir limits==1.5

# Remove existing bcrypt if any
pip uninstall bcrypt -y

# Install bcrypt dependencies (for Linux)
if [ "$(uname)" == "Linux" ]; then
    sudo apt-get update
    sudo apt-get install -y python3-dev build-essential libffi-dev
fi

# Install bcrypt
pip install python-bcrypt

# Install requirements
pip install -r requirements.txt

# Initialize database
python init_db.py

# Start the Flask application
export FLASK_APP=app.py
export FLASK_ENV=development
flask run