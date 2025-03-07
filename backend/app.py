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
import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification  # Move back for DIMA
from pydub import AudioSegment  # For MP3 to WAV conversion
import subprocess
import requests

# Defer ML imports to prevent startup issues
def load_ml_models():
    from transformers import AutoImageProcessor, AutoModelForImageClassification
    
    processor = AutoImageProcessor.from_pretrained("dima806/deepfake_vs_real_image_detection")
    model = AutoModelForImageClassification.from_pretrained("dima806/deepfake_vs_real_image_detection")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    return processor, model, device

def load_audio_model():
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
        raise

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
            "origins": ["http://localhost:3000"],  # Frontend URL is allowed
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
    processor_dima, model, device = load_ml_models()

# Initialize models
processor_melody, model_audio, device_audio = None, None, None
if not app.debug:
    processor_melody, model_audio, device_audio = load_audio_model()

# Enums
class UploadType(enum.Enum):
    image = 'image'
    video = 'video'
    audio = 'audio'

class ModelApplied(enum.Enum):
    dima = 'dima'

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
                password_hash=hashed_password,
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
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    file_type = request.form.get('type', 'image')
    model_type = request.form.get('model', 'dima')

    if not file.filename:
        return jsonify({"error": "No file selected"}), 400

    try:
        if file_type == 'audio':
            return analyze_audio(file)
        else:
            return analyze_image(file)

    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({"error": "Server error occurred"}), 500

def analyze_image(file):
    try:
        # Load models if not already loaded
        global processor_dima, model, device
        if processor_dima is None or model is None:
            try:
                print("Loading CNN model...")
                from notebooks.train_dima_cnn import DimaCNN
                import torchvision.transforms as transforms
                
                # Define image preprocessing
                processor_dima = transforms.Compose([
                    transforms.Resize((224, 224)),
                    transforms.ToTensor(),
                    transforms.Normalize(
                        mean=[0.485, 0.456, 0.406],
                        std=[0.229, 0.224, 0.225]
                    )
                ])
                
                # Load the model
                device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
                model = DimaCNN()
                model.load_state_dict(torch.load('best_model.pth', map_location=device))
                model = model.to(device)
                model.eval()
                print("CNN model loaded successfully")
                
            except Exception as model_error:
                print(f"Model loading error: {str(model_error)}")
                return jsonify({"error": "Failed to initialize model. Please try again."}), 500

        # Process the image
        try:
            image = Image.open(file).convert('RGB')
            
            # Preprocess image
            image_tensor = processor_dima(image).unsqueeze(0).to(device)
            
            # Get prediction
            with torch.no_grad():
                outputs = model(image_tensor)
                predictions = torch.nn.functional.softmax(outputs, dim=1)
                real_confidence, fake_confidence = predictions[0].tolist()
                predicted_class = predictions.argmax().item()
                label = "real" if predicted_class == 0 else "fake"

            result = {
                "result": label,
                "real_confidence": real_confidence,
                "fake_confidence": fake_confidence,
                "filename": file.filename,
                "reason": "CNN detected manipulation patterns" if label == "fake" else None
            }

            return jsonify(result), 200

        except Exception as img_error:
            print(f"Image processing error: {str(img_error)}")
            return jsonify({"error": "Failed to process image. Please ensure it's a valid image file."}), 400

    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({"error": "Server error occurred"}), 500

def analyze_audio(file):
    try:
        try:
            import librosa
            import numpy as np
            from pydub import AudioSegment
            from transformers import AutoModelForAudioClassification, AutoFeatureExtractor
        except ImportError as e:
            print(f"Import error: {str(e)}")
            return jsonify({"error": "Audio analysis not available. Please contact support."}), 503

        # Load models if not already loaded
        global processor_melody, model_audio, device_audio
        if processor_melody is None or model_audio is None:
            try:
                print("Loading audio model...")
                processor_melody, model_audio, device_audio = load_audio_model()
                print("Audio model loaded successfully")
            except Exception as model_error:
                print(f"Model loading error: {str(model_error)}")
                return jsonify({"error": "Failed to initialize audio model. Please try again."}), 500

        # Save temporary file
        temp_path = f"temp_{file.filename}"
        file.save(temp_path)
        
        try:
            print(f"Processing audio file: {file.filename}")
            
            try:
                print("Loading audio file...")
                # Load audio with librosa
                waveform, sample_rate = librosa.load(temp_path, sr=16000, mono=True)
                print(f"Audio loaded. Sample rate: {sample_rate}, Shape: {waveform.shape}")
                
                # Convert to torch tensor
                waveform = torch.from_numpy(waveform).float()
                
                # Reshape for model input (removing extra dimensions)
                if len(waveform.shape) == 1:
                    # Add batch dimension only
                    waveform = waveform.unsqueeze(0)
                
                print(f"Initial waveform shape: {waveform.shape}")
                
                # Ensure the length is what the model expects
                target_length = 480000  # 30 seconds at 16kHz
                if waveform.shape[1] > target_length:
                    waveform = waveform[:, :target_length]
                elif waveform.shape[1] < target_length:
                    padding = torch.zeros((1, target_length - waveform.shape[1]))
                    waveform = torch.cat([waveform, padding], dim=1)
                
                print(f"Waveform shape after padding: {waveform.shape}")
                
                # Process with model
                print("Processing with model...")
                try:
                    inputs = processor_melody(
                        waveform.squeeze(),  # Remove batch dimension for processor
                        sampling_rate=16000,
                        return_tensors="pt"
                    )
                    print(f"Input shapes: {[k + ': ' + str(v.shape) for k, v in inputs.items()]}")
                    
                    # Move to device
                    inputs = {k: v.to(device_audio) for k, v in inputs.items()}
                    
                    with torch.no_grad():
                        outputs = model_audio(**inputs)
                    
                    predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
                    real_confidence, fake_confidence = predictions[0].tolist()
                    predicted_class = predictions.argmax().item()
                    label = "real" if predicted_class == 0 else "fake"

                    print(f"Analysis complete. Result: {label}")

                    result = {
                        "result": label,
                        "real_confidence": real_confidence,
                        "fake_confidence": fake_confidence,
                        "filename": file.filename,
                        "reason": "Voice pattern manipulation detected" if label == "fake" else None
                    }

                    return jsonify(result), 200
                
                except Exception as model_error:
                    print(f"Model processing error: {str(model_error)}")
                    print(f"Waveform shape: {waveform.shape}")
                    print(f"Waveform min: {waveform.min()}, max: {waveform.max()}")
                    raise

            except Exception as e:
                print(f"Audio processing error: {str(e)}")
                return jsonify({"error": f"Failed to process audio file: {str(e)}. Please try a different file."}), 400

        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as audio_error:
        print(f"Audio processing error: {str(audio_error)}")
        return jsonify({
            "error": f"Failed to process audio: {str(audio_error)}. Please try a different audio file."
        }), 400

# Debug route - remove in production
@app.route('/api/debug/users', methods=['GET'])
def debug_users():
    if app.debug:
        users = User.query.all()
        return jsonify([{
            'username': user.username,
            'email': user.email,
            'created_at': user.created_at.isoformat()
        } for user in users]), 200
    return jsonify({"message": "Not available in production"}), 403

# Helper functions
def check_password_strength(password):
    if len(password) < 12:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
    return True

def hash_password(password):
    return bcrypt_lib.hashpw(password.encode('utf-8'), bcrypt_lib.gensalt())

def check_password(stored_hash, password):
    return bcrypt_lib.checkpw(password.encode('utf-8'), stored_hash)

# Add this new endpoint for AI analysis with improved logging
@app.route('/api/analyze-ai', methods=['POST'])
def analyze_ai():
    try:
        print("\n----- AI ANALYSIS REQUEST -----")
        data = request.json
        print(f"Received data: {data}")
        
        content_type = data.get('type', 'image')
        result = data.get('result', '')

        if(result == 'real'):
            confidence = data.get('fake_confidence', 0)
        else:
            confidence = data.get('real_confidence', 0)

        # confidence = data.get('confidence', 0)
        print(f"Confidence: {confidence}")
        filename = data.get('filename', '')
        
        print(f"Processing {content_type} analysis for {filename}, classified as {result} with {confidence:.1f}% confidence")
        
        # Create dynamic prompt based on content type
        if content_type == 'image':
            prompt = f"Given that an AI system classified an image named '{filename}' as {result.upper()} with {confidence:.1f}% confidence, provide a hypothetical explanation of what might have led to this classification. Consider common visual artifacts, lighting inconsistencies, and other factors that typically indicate {'manipulation in fake images' if result == 'fake' else 'authenticity in real images'}. Provide a detailed but concise explanation in 3-4 sentences."
        else:  # audio
            prompt = f"Given that an AI system classified an audio file named '{filename}' as {result.upper()} with {confidence:.1f}% confidence, provide a hypothetical explanation of what might have led to this classification. Consider common voice patterns, background noise, and other factors that typically indicate {'manipulation in fake audio' if result == 'fake' else 'authenticity in real audio'}. Provide a detailed but concise explanation in 3-4 sentences."
        
        print(f"Generated prompt: {prompt}")
        
        # Call Ollama API (assuming it's running locally)
        print("Calling Ollama API...")
        ollama_response = requests.post('http://localhost:11434/api/generate', json={
            'model': 'llama3',  # or another model you have installed
            'prompt': prompt,
            'stream': False
        })
        
        print(f"Ollama API response status: {ollama_response.status_code}")
        
        if ollama_response.status_code == 200:
            response_data = ollama_response.json()
            analysis = response_data.get('response', '')
            print(f"Analysis generated: {analysis[:100]}...")  # Print first 100 chars
            return jsonify({"analysis": analysis}), 200
        else:
            print(f"Ollama API error: {ollama_response.text}")
            return jsonify({"error": "Failed to generate AI analysis"}), 500
            
    except Exception as e:
        print(f"AI analysis error: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": f"Error generating analysis: {str(e)}"}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 