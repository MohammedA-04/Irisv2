#!/bin/bash
set -e

echo "Running build_render.sh..."

# Install system dependencies
apt-get update && apt-get install -y ffmpeg

# Install Python packages
pip install --upgrade pip
pip install -r requirements-deploy.txt
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install transformers pydub

echo "All dependencies installed successfully!"

# Initialize the database
python init_db.py

echo "Build script completed successfully!" 