#!/usr/bin/env bash
# exit on error
set -o errexit

# Install system dependencies required for packages
apt-get update && apt-get install -y ffmpeg

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
pip install -r requirements.txt

# Setup models directory if needed
mkdir -p model_files

# Initialize database
python init_db.py 