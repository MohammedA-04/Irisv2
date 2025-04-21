import os
import re
import enum
from flask import Flask, request, jsonify
from datetime import datetime, timedelta
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy 
import bcrypt as bcrypt_lib
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import pyotp
from PIL import Image
import random
import string

# Wrap torch imports with try/except to avoid crashing on startup
torch = None
try:
    import torch
    print("PyTorch successfully imported!")
except ImportError:
    print("WARNING: PyTorch import failed. AI features will be disabled.")

# Similarly, wrap transformers imports
try:
    from transformers import AutoImageProcessor, AutoModelForImageClassification, AutoTokenizer, AutoModelForSequenceClassification  # Move back for DIMA
    from transformers.models.vit.modeling_vit import ViTForImageClassification, ViTModel
    print("Transformers library successfully imported!")
except ImportError:
    print("WARNING: Transformers import failed. AI features will be disabled.")

# Attempt to import pydub
try:
    from pydub import AudioSegment  # For MP3 to WAV conversion
    print("Pydub successfully imported!")
except ImportError:
    print("WARNING: Pydub import failed. Audio processing will be disabled.")

import subprocess
import requests

try:
    from torch.serialization import safe_globals, add_safe_globals
except ImportError:
    print("WARNING: torch.serialization import failed.")

import numpy as np

# Defer ML imports to prevent startup issues
def load_ml_models():
    if torch is None:
        print("ERROR: Cannot load ML models because PyTorch is not available")
        return None, None, None
        
    try:
        from transformers import AutoImageProcessor, AutoModelForImageClassification
        
        processor = AutoImageProcessor.from_pretrained("dima806/deepfake_vs_real_image_detection")
        model = AutoModelForImageClassification.from_pretrained("dima806/deepfake_vs_real_image_detection")
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        return processor, model, device
    except Exception as e:
        print(f"Error loading ML models: {str(e)}")
        return None, None, None

def load_audio_model():
    if torch is None:
        print("ERROR: Cannot load audio model because PyTorch is not available")
        return None, None, None
        
    try:
        print("Initializing audio model...")
        from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
        
        processor = AutoFeatureExtractor.from_pretrained(
            "MelodyMachine/Deepfake-audio-detection-V2",
            trust_remote_code=True
        )
        model = AutoModelForAudioClassification.from_pretrained(
            "MelodyMachine/Deepfake-audio-detection-V2",
            trust_remote_code=True
        )
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {device}")
        model.to(device)
        print("Audio model loaded successfully")
        return processor, model, device
    except Exception as e:
        print(f"Error loading audio model: {str(e)}")
        return None, None, None

def load_text_model():
    if torch is None:
        print("ERROR: Cannot load text model because PyTorch is not available")
        return None, None, None
        
    try:
        print("Initializing text analysis model...")
        model_id = "mmosko/Bert_Fake_News_Classification"
        
        # Load tokenizer and model with proper error handling
        try:
            tokenizer = AutoTokenizer.from_pretrained("bert-base-cased")
            model = AutoModelForSequenceClassification.from_pretrained(model_id)
            
            # Update label mapping
            model.config.id2label = {
                0: "Fake News",
                1: "Real News",
                2: "Undecided"
            }
            model.config.label2id = {v: k for k, v in model.config.id2label.items()}
            
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            model.to(device)
            print("Text analysis model loaded successfully")
            return tokenizer, model, device
        except Exception as e:
            print(f"Failed to load model or tokenizer: {str(e)}")
            raise
            
    except Exception as e:
        print(f"Error in load_text_model: {str(e)}")
        return None, None, None

# Initialize Flask app
app = Flask(__name__)
# Load environment variables
# app.config['ENV'] = os.environ.get('FLASK_ENV', 'development')
# app.config['DEBUG'] = os.environ.get('FLASK_DEBUG', '1') == '1'
app.config['DEBUG'] = os.environ.get('FLASK_DEBUG', 'False').lower() in ('1', 'true', 'yes')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///iris.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app, 
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "https://iris-frontend.netlify.app",
                "https://your-netlify-app.netlify.app"
            ],  # Frontend URLs allowed
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    }
)

# Initialize rate limiter
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Load ML models after app initialization
processor_dima, model, device = None, None, None
if not app.debug:
    try:
        processor_dima, model, device = load_ml_models()
    except Exception as e:
        print(f"Warning: Failed to load image models: {str(e)}")

# Initialize models
processor_melody, model_audio, device_audio = None, None, None
if not app.debug:
    try:
        processor_melody, model_audio, device_audio = load_audio_model()
    except Exception as e:
        print(f"Warning: Failed to load audio models: {str(e)}")

# Add these as global variables with your other model initializations
tokenizer_text, model_text, device_text = None, None, None
if not app.debug:
    try:
        tokenizer_text, model_text, device_text = load_text_model()
    except Exception as e:
        print(f"Warning: Failed to load text model: {str(e)}")

# Enums
class UploadType(enum.Enum):
    image = 'image'
    video = 'video'
    audio = 'audio'
    text = 'text'

class ModelApplied(enum.Enum):
    dima = 'dima'
    melody = 'melody'
    mosko = 'mosko'
    asl = 'asl'

# Database Models
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
    otp_secret = db.Column(db.String(32), nullable=True)  # Store TOTP secret
    otp_expiry = db.Column(db.DateTime, nullable=True)

    def reset_fail_attempts(self):
        self.failed_attempts = 0
        self.last_login_attempt = None
        self.lockout_until = None

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
    user = db.relationship('User', backref=db.backref('contents', lazy=True))

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "API is running", "version": "1.0.0"}), 200

@app.route('/api/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    try:
        print("Received registration request:", request.json)  # Debug logging
        data = request.json
        if not data:
            return jsonify({"message": "No data provided"}), 400

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        print(f"Processing registration for {username} ({email})")  # Debug logging

        # Validate required fields
        if not all([username, email, password]):
            return jsonify({"message": "All fields are required"}), 400

        # Validate email format
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return jsonify({"message": "Invalid email format"}), 400

        # Check email first
        if User.query.filter_by(email=email).first():
            return jsonify({"message": "Email already registered"}), 400

        # Check username
        if User.query.filter_by(username=username).first():
            return jsonify({"message": "Username already taken"}), 400

        try:
            # Generate proper OTP secret
            otp_secret = pyotp.random_base32()  # This generates a valid base32 secret
            
            # Create new user
            new_user = User(
                username=username,
                email=email,
                password_hash=hash_password(password),
                otp_secret=otp_secret
            )
            
            db.session.add(new_user)
            db.session.commit()

            print(f"Successfully created user {username}")  # Debug logging
            return jsonify({
                "message": "Registration successful",
                "otpSecret": otp_secret
            }), 201

        except Exception as e:
            db.session.rollback()
            print(f"Database error during user creation: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(traceback.format_exc())
            return jsonify({"message": "Error creating account"}), 500

    except Exception as e:
        print(f"Server error in registration: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"message": "Server error occurred"}), 500

@app.route('/api/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    print("\nLogin Attempt:")
    print(f"Username: {request.json.get('username')}")
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "Invalid username or password"}), 401

    if user.lockout_until and user.lockout_until > datetime.utcnow():
        return jsonify({"message": "Account temporarily locked"}), 429

    if not check_password(user.password_hash, password):
        user.failed_attempts += 1
        if user.failed_attempts >= 5:
            user.lockout_until = datetime.utcnow() + timedelta(minutes=15)
        db.session.commit()
        return jsonify({"message": "Invalid username or password"}), 401

    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    print(f"\nUser authenticated:")
    print(f"Username: {username}")
    print(f"OTP Secret: {user.otp_secret}")
    print(f"OTP Expiry: {user.otp_expiry}")
    
    db.session.commit()
    return jsonify({
        "message": "Please enter your authenticator code",
        "requireOTP": True,
        "otpSecret": user.otp_secret
    }), 200

# Time offset in seconds to handle server/client time differences
TIME_OFFSET = 30  # Adjust this value based on your time difference

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    username = data.get('username')
    otp_code = data.get('otp')
    
    current_time = datetime.utcnow()
    
    print("\n=== OTP Verification Debug ===")
    print(f"Time of verification: {current_time}")
    print(f"Username: {username}")
    print(f"Provided OTP: {otp_code}")

    user = User.query.filter_by(username=username).first()
    if not user:
        print("Error: User not found")
        return jsonify({"message": "User not found"}), 404

    print(f"User's stored OTP secret: {user.otp_secret}")
    
    # Create TOTP object
    totp = pyotp.TOTP(user.otp_secret)
    
    # Get current and adjacent time windows
    current_otp = totp.now()
    prev_otp = totp.at(current_time - timedelta(seconds=30))
    next_otp = totp.at(current_time + timedelta(seconds=30))
    
    print("\nTime Windows:")
    print(f"Previous OTP ({current_time - timedelta(seconds=30)}): {prev_otp}")
    print(f"Current OTP  ({current_time}): {current_otp}")
    print(f"Next OTP    ({current_time + timedelta(seconds=30)}): {next_otp}")
    
    # Check if provided OTP matches any time window
    is_valid = (
        otp_code == current_otp or
        otp_code == prev_otp or
        otp_code == next_otp or
        totp.verify(otp_code)  # This includes a ±1 time step window
    )
    
    print(f"\nVerification result: {'Valid' if is_valid else 'Invalid'}")
    print("================================\n")

    if is_valid:
        return jsonify({
            "message": "OTP verified successfully",
            "debug_info": {
                "time": str(current_time),
                "valid_codes": [prev_otp, current_otp, next_otp]
            }
        }), 200
    
    return jsonify({
        "message": "Invalid OTP",
        "debug_info": {
            "time": str(current_time),
            "valid_codes": [prev_otp, current_otp, next_otp],
            "provided_code": otp_code
        }
    }), 400

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({"error": "No file selected"}), 400

    try:
        # Load models if not already loaded
        global processor_dima, model, device
        if processor_dima is None or model is None:
            processor_dima, model, device = load_ml_models()

        # Process the image with proper error handling
        try:
            image = Image.open(file).convert('RGB')  # Convert to RGB format
            image = image.resize((224, 224))  # Resize to expected dimensions
            
            inputs = processor_dima(images=image, return_tensors="pt").to(device)

            with torch.no_grad():
                outputs = model(**inputs)
            
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            real_confidence, fake_confidence = predictions[0].tolist()
            predicted_class = predictions.argmax().item()
            label = model.config.id2label[predicted_class]

            result = {
                "result": "real" if label == "LABEL_0" else "fake",
                "real_confidence": real_confidence,
                "fake_confidence": fake_confidence,
                "filename": file.filename,
                "reason": "PRNU camera tampered" if label == "LABEL_1" else None
            }

            return jsonify(result), 200

        except Exception as img_error:
            print(f"Image processing error: {str(img_error)}")
            return jsonify({"error": "Failed to process image. Please ensure it's a valid image file."}), 400

    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({"error": "Server error occurred"}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_file():
    if not request.files or 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    upload_type = request.form.get('type', 'image')
    model_type = request.form.get('model', 'dima')
    
    # Check if torch and models are available
    if torch is None:
        return jsonify({
            'error': 'AI models are unavailable',
            'message': 'The server is missing the required AI libraries. Please contact support.'
        }), 503
    
    if upload_type == 'image' and (processor_dima is None or model is None):
        return jsonify({
            'error': 'Image analysis model unavailable',
            'message': 'The image analysis model failed to load. Please try again later.'
        }), 503
    
    if upload_type == 'audio' and (processor_melody is None or model_audio is None):
        return jsonify({
            'error': 'Audio analysis model unavailable',
            'message': 'The audio analysis model failed to load. Please try again later.'
        }), 503
    
    if upload_type == 'text' and (tokenizer_text is None or model_text is None):
        return jsonify({
            'error': 'Text analysis model unavailable',
            'message': 'The text analysis model failed to load. Please try again later.'
        }), 503
    
    try:
        # Load models if not already loaded
        global processor_dima, model, device
        if processor_dima is None or model is None:
            processor_dima, model, device = load_ml_models()

        # Process the file with the selected model
        if upload_type == 'image':
            # Process image
            image = Image.open(file).convert('RGB')  # Convert to RGB format
            image = image.resize((224, 224))  # Resize to expected dimensions
            
            inputs = processor_dima(images=image, return_tensors="pt").to(device)

            with torch.no_grad():
                outputs = model(**inputs)
            
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            real_confidence, fake_confidence = predictions[0].tolist()
            predicted_class = predictions.argmax().item()
            label = model.config.id2label[predicted_class]

            result = {
                "result": "real" if label == "LABEL_0" else "fake",
                "real_confidence": real_confidence,
                "fake_confidence": fake_confidence,
                "filename": file.filename,
                "reason": "PRNU camera tampered" if label == "LABEL_1" else None
            }

            return jsonify(result), 200

        elif upload_type == 'audio':
            # Process audio
            # Mock audio analysis
            return jsonify({
                "result": "fake",
                "real_confidence": 0.18,
                "fake_confidence": 0.82,
                "filename": file.filename,
                "reason": "Voice pattern manipulation detected"
            }), 200
            
        elif upload_type == 'video':
            # Process video
            # Mock video analysis
            return jsonify({
                "result": "Real",
                "real_confidence": 0.75,
                "fake_confidence": 0.25,
                "filename": file.filename,
                "processingTime": "500ms"
            }), 200
            
        else:  # text
            # Process text
            title = request.form.get('title', 'Sample Title')
            text = request.form.get('text', 'Sample text content')
            
            # Return mock text analysis
            return jsonify({
                "result": "fake",
                "real_confidence": 0.15,
                "fake_confidence": 0.85,
                "label": "Fake News",
                "title": title,
                "text": text[:50] + "...",
                "reason": "News analysis model detected patterns consistent with fake news"
            }), 200
            
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        return jsonify({"error": "Server error occurred"}), 500

@app.route('/api/analyze-ai', methods=['POST'])
def analyze_ai():
    try:
        data = request.json
        
        content_type = data.get('type', 'image')
        filename = data.get('filename', 'sample.jpg')
        result = data.get('result', 'fake')
        
        # Mock AI analysis response
        if content_type == 'image':
            analysis = f"This image named '{filename}' appears to be {result}. "
            
            if result.lower() == 'fake':
                analysis += "The analysis detected inconsistencies in facial features that are typical indicators of deepfake technology. There are subtle artifacts around the facial areas and unnatural smoothing effects."
            else:
                analysis += "The analysis found consistent lighting, natural facial features, and no signs of manipulation. The image displays expected characteristics of an authentic photograph."
        else:  # audio
            analysis = f"This audio file named '{filename}' appears to be {result}. "
            
            if result.lower() == 'fake':
                analysis += "The analysis detected unnatural speech patterns, inconsistent background noise, and audio artifacts typical of voice synthesis technology. The voice modulation shows signs of algorithmic generation rather than natural human speech."
            else:
                analysis += "The analysis found natural voice modulation, consistent background noise, and no signs of synthesis. The audio displays expected characteristics of authentic human speech."
                
        return jsonify({
            "analysis": analysis
        }), 200
            
    except Exception as e:
        print(f"AI analysis error: {str(e)}")
        return jsonify({"error": f"Error generating analysis: {str(e)}"}), 500

# Helper functions
def hash_password(password):
    return bcrypt_lib.hashpw(password.encode('utf-8'), bcrypt_lib.gensalt())

def check_password(stored_hash, password):
    return bcrypt_lib.checkpw(password.encode('utf-8'), stored_hash)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 