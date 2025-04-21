import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import sys

print("Initializing database...")

# Create a minimal app for database initialization
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///iris.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Import the models from app.py
try:
    # Import the model classes from app
    from app import User, Content
    print("Successfully imported models from app.py")
except ImportError:
    print("Error importing models from app.py. Creating minimal models.")
    
    # Define minimal models for database creation
    import enum
    from datetime import datetime
    
    class UploadType(enum.Enum):
        image = 'image'
        video = 'video'
        audio = 'audio'

    class ModelApplied(enum.Enum):
        dima = 'dima'
        melody = 'melody'
        mosko = 'mosko'
        asl = 'asl'
    
    class User(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        username = db.Column(db.String(50), unique=True, nullable=False)
        email = db.Column(db.String(100), unique=True, nullable=False)
        password_hash = db.Column(db.String(255), nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        is_disabled = db.Column(db.Boolean, default=False)
        last_login_attempt = db.Column(db.DateTime, nullable=True)
        failed_attempts = db.Column(db.Integer, default=0)
        lockout_until = db.Column(db.DateTime, nullable=True)
        otp_secret = db.Column(db.String(32), nullable=True)
        otp_expiry = db.Column(db.DateTime, nullable=True)

    class Content(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        file_path = db.Column(db.String(255), nullable=False)
        file_name = db.Column(db.String(255), nullable=False)
        file_size = db.Column(db.Integer, nullable=False)
        is_deepfake = db.Column(db.Boolean, nullable=False)
        analysis = db.Column(db.JSON, nullable=True)
        upload_date = db.Column(db.DateTime, default=datetime.utcnow)
        upload_type = db.Column(db.Enum(UploadType), nullable=False)
        upload_category = db.Column(db.String(50), nullable=False)
        model_applied = db.Column(db.Enum(ModelApplied), nullable=False)

# Create the database tables
try:
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")
except Exception as e:
    print(f"Error creating database tables: {str(e)}")
    sys.exit(1)

print("Database initialization complete.") 