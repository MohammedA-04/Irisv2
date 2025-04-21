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
from transformers import AutoImageProcessor, AutoModelForImageClassification, AutoTokenizer, AutoModelForSequenceClassification  # Move back for DIMA
from pydub import AudioSegment  # For MP3 to WAV conversion
import subprocess
import requests
from transformers.models.vit.modeling_vit import ViTForImageClassification, ViTModel
from torch.serialization import safe_globals, add_safe_globals
import numpy as np

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

def load_text_model():
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
    try:
        content_type = request.form.get('type', 'image')
        
        if content_type == 'text':
            return analyze_text(request.form)
        elif content_type == 'audio':
            if 'file' not in request.files:
                return jsonify({"error": "No audio file provided"}), 400
            return analyze_audio(request.files['file'])
        elif content_type == 'video':
            if 'file' not in request.files:
                return jsonify({"error": "No video file provided"}), 400
            return jsonify(analyze_video(request.files['file'])), 200
        else:  # image
            if 'file' not in request.files:
                return jsonify({"error": "No image file provided"}), 400
            return analyze_image(request.files['file'])
            
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        return jsonify({"error": "Server error occurred"}), 500

def analyze_image(file):
    try:
        # Get the model type from the request
        model_type = request.form.get('model', 'dima')
        print(f"Selected image model: {model_type}")
        
        # Handle ASL model
        if model_type == 'ASL Sign Model':
            if asl_model is None:
                print("ASL model is not loaded")
                return jsonify({"error": "ASL model not available"}), 503
                
            try:
                # Process image for ASL prediction
                image = Image.open(file).convert('RGB')
                image = image.resize((224, 224))  # Resize to expected dimensions
                image_array = np.array(image) / 255.0  # Normalize
                image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension
                
                print("Running ASL prediction...")
                # Get prediction
                prediction = asl_model.predict(image_array)
                predicted_class = np.argmax(prediction[0])
                confidence = float(prediction[0][predicted_class])
                
                # Get class labels (assuming 100 classes for MS-ASL 100)
                class_labels = [f"Sign_{i}" for i in range(100)]  # You can replace this with actual sign names
                
                # Get top 5 predictions
                top_predictions = []
                for i in range(len(prediction[0])):
                    top_predictions.append({
                        'sign': f"Sign_{i}",
                        'confidence': float(prediction[0][i])
                    })
                top_predictions.sort(key=lambda x: x['confidence'], reverse=True)
                top_predictions = top_predictions[:5]
                
                result = {
                    "result": class_labels[predicted_class],
                    "confidence": confidence,
                    "filename": file.filename,
                    "top_predictions": top_predictions
                }
                
                print(f"ASL prediction complete: {result}")
                return jsonify(result), 200
                
            except Exception as e:
                print(f"Error during ASL prediction: {str(e)}")
                import traceback
                print(traceback.format_exc())
                return jsonify({"error": f"Error during ASL prediction: {str(e)}"}), 500
            
        # Existing image analysis code...
        try:
            # Import required libraries
            from transformers import AutoProcessor, AutoModelForImageClassification
            import torch
            from transformers.models.vit.modeling_vit import ViTForImageClassification
            from torch.serialization import safe_globals, add_safe_globals
            
            # Add ViTForImageClassification to safe globals
            add_safe_globals([ViTForImageClassification])
            
            # Define device
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            print(f"Using device: {device}")
            
            # Load the base model and processor
            model_id = "dima806/ai_vs_real_image_detection"
            processor = AutoProcessor.from_pretrained(model_id)
            model = AutoModelForImageClassification.from_pretrained(model_id)
            
            # Get label mapping
            id2label = model.config.id2label
            label2id = {v.lower(): k for k, v in id2label.items()}
            
            print("Base model loaded successfully")
            
            # Load specific weights based on model selection
            if model_type == "dima++":
                weights_path = r"C:\Users\Moham\Irisv2\notebooks\model_full.pth"
                print(f"Loading dima++ weights from: {weights_path}")
                if os.path.exists(weights_path):
                    try:
                        # Add both ViTModel and ViTForImageClassification to safe globals
                        add_safe_globals([ViTModel, ViTForImageClassification])
                        
                        with safe_globals([ViTModel, ViTForImageClassification]):
                            try:
                                state_dict = torch.load(
                                    weights_path, 
                                    map_location=device,
                                    weights_only=False  # Explicitly set to False as suggested
                                )
                                
                                # If we loaded a full model, get its state dict
                                if hasattr(state_dict, 'state_dict'):
                                    state_dict = state_dict.state_dict()
                                    
                                model.load_state_dict(state_dict)
                                print("Successfully loaded dima++ weights")
                            except Exception as e:
                                print(f"Detailed loading error: {str(e)}")
                                raise
                    except Exception as weight_error:
                        print(f"Error loading dima++ weights: {str(weight_error)}")
                        print("Falling back to base model")
                else:
                    print("Warning: dima++ weights not found")
                
            elif model_type == "medical":
                weights_path = r"C:\Users\Moham\Irisv2\notebooks\medical_tune.pth"
                print(f"Loading medical weights from: {weights_path}")
                if os.path.exists(weights_path):
                    try:
                        with safe_globals([ViTForImageClassification]):
                            # Try loading with weights_only first
                            try:
                                state_dict = torch.load(
                                    weights_path, 
                                    map_location=device,
                                    weights_only=True
                                )
                            except Exception as e:
                                print(f"Weights-only loading failed, trying full load: {str(e)}")
                                # If that fails, try without weights_only
                                state_dict = torch.load(
                                    weights_path, 
                                    map_location=device
                                )
                            
                            # If we loaded a full model, get its state dict
                            if hasattr(state_dict, 'state_dict'):
                                state_dict = state_dict.state_dict()
                                
                            model.load_state_dict(state_dict)
                            print("Successfully loaded medical weights")
                    except Exception as weight_error:
                        print(f"Error loading medical weights: {str(weight_error)}")
                        print("Falling back to base model")
                else:
                    print("Warning: medical weights not found")
            
            # Move model to device and set to evaluation mode
            model = model.to(device)
            model.eval()
            print(f"Model {model_type} ready for inference")
            
            # Process the image
            image = Image.open(file).convert("RGB")
            inputs = processor(images=image, return_tensors="pt")
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            # Get prediction
            with torch.no_grad():
                outputs = model(**inputs)
                probabilities = torch.nn.functional.softmax(outputs.logits, dim=1)[0]
                
                # Get confidence scores
                try:
                    real_confidence = probabilities[label2id['real']].item()
                    fake_confidence = probabilities[label2id['fake']].item()
                    print(f"Prediction complete - Real: {real_confidence:.4f}, Fake: {fake_confidence:.4f}")
                except KeyError as e:
                    print(f"Label mapping error: {str(e)}")
                    # Fallback to index-based confidence
                    real_confidence = probabilities[0].item()
                    fake_confidence = probabilities[1].item()
                
                # Determine result
                label_id = torch.argmax(probabilities).item()
                label = id2label[label_id].lower()
                result_label = "real" if label == "real" else "fake"
                
                print(f"Final prediction: {result_label}")
                
                result = {
                    "result": result_label,
                    "real_confidence": real_confidence,
                    "fake_confidence": fake_confidence,
                    "filename": file.filename,
                    "reason": f"Model detected {result_label} image patterns" if result_label == "fake" else None
                }
                
                return jsonify(result), 200
                
        except Exception as model_error:
            print(f"Model processing error: {str(model_error)}")
            import traceback
            traceback.print_exc()
            return jsonify({"error": f"Failed to process image: {str(model_error)}"}), 400
            
    except Exception as e:
        print(f"Server error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error occurred: {str(e)}"}), 500

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
        filename = data.get('filename', '')
        
        # Use the confidence value that corresponds to the result
        # This should be the confidence of the predicted class
        confidence = data.get('confidence', 0)

        print(f"Confidence: {confidence}")
        
        # Calculate memory usage and check constraints
        MEMORY_LIMIT = 5.6 * 1024 * 1024 * 1024  # 5.6GB in bytes
        current_memory = 0
        
        # Check file size if file exists
        if 'file' in request.files:
            file = request.files['file']
            file_size = len(file.read())
            current_memory += file_size
            print(f"File size: {file_size / (1024*1024):.2f} MB")
            
            # Reset file pointer
            file.seek(0)
        
        # Calculate prompt size
        prompt_size = len(str(data).encode('utf-8'))
        current_memory += prompt_size
        print(f"Prompt size: {prompt_size / (1024*1024):.2f} MB")
        
        # Check if total memory usage exceeds limit
        if current_memory > MEMORY_LIMIT:
            print(f"Warning: Memory usage ({current_memory / (1024*1024*1024):.2f} GB) exceeds limit ({MEMORY_LIMIT / (1024*1024*1024):.2f} GB)")
            print("Proceeding with prompt-only analysis")
            # Remove file from data if present
            if 'file' in data:
                del data['file']
        
        print(f"Processing {content_type} analysis for {filename}, classified as {result} with {confidence:.1f}% confidence")
        
        # Get the opposite confidence value for the warning threshold check
        opposite_confidence = 0
        if 'fake_confidence' in data and 'real_confidence' in data:
            opposite_confidence = data.get('fake_confidence', 0) if result.lower() == 'real' else data.get('real_confidence', 0)
            print(f"Opposite confidence: {opposite_confidence}")
        
        # Create dynamic prompt based on content type
        if content_type == 'image':
            prompt = f"Given that an AI system classified an image named '{filename}' as {result.upper()} with {confidence:.1f}% confidence, provide a hypothetical explanation of what might have led to this classification. Consider common visual artifacts, lighting inconsistencies, and other factors that typically indicate {'manipulation in fake images' if result == 'fake' else 'authenticity in real images'}. Provide a detailed but concise explanation in 3-4 sentences."
            
            # Add warning about possible fake if the opposite confidence is high
            if result.lower() == 'real' and opposite_confidence > 20:
                prompt += f" Additionally, note that the system did detect some characteristics of a fake image ({opposite_confidence:.1f}% confidence), so there is a possibility this could be a sophisticated fake that escaped detection. Briefly mention what aspects might still be concerning."
            
        else:  # audio
            prompt = f"Given that an AI system classified an audio file named '{filename}' as {result.upper()} with {confidence:.1f}% confidence, provide a hypothetical explanation of what might have led to this classification. Consider common voice patterns, background noise, and other factors that typically indicate {'manipulation in fake audio' if result == 'fake' else 'authenticity in real audio'}. Provide a detailed but concise explanation in 3-4 sentences."
            
            # Add warning about possible fake if the opposite confidence is high
            if result.lower() == 'real' and opposite_confidence > 20:
                prompt += f" Additionally, note that the system did detect some characteristics of fake audio ({opposite_confidence:.1f}% confidence), so there is a possibility this could be a sophisticated fake that escaped detection. Briefly mention what aspects might still be concerning."
        
        print(f"Generated prompt: {prompt}")
        
        # Call Ollama API (assuming it's running locally)
        print("Calling Ollama API...")
        try:
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
                return jsonify({
                    "analysis": analysis,
                    "memory_usage": f"{current_memory / (1024*1024*1024):.2f} GB",
                    "memory_limit": f"{MEMORY_LIMIT / (1024*1024*1024):.2f} GB",
                    "prompt_only": current_memory > MEMORY_LIMIT
                }), 200
            else:
                print(f"Ollama API error: {ollama_response.text}")
                return jsonify({"error": "Failed to generate AI analysis"}), 500
                
        except requests.exceptions.RequestException as e:
            print(f"Error connecting to Ollama API: {str(e)}")
            return jsonify({"error": "Failed to connect to AI analysis service"}), 503
            
    except Exception as e:
        print(f"AI analysis error: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": f"Error generating analysis: {str(e)}"}), 500

def load_model(model_name):
    # Use os.path for file paths, not import statements
    import os
    
    if model_name == "dima":
        # Original Dima model
        model = AutoModelForImageClassification.from_pretrained("dima806/deepfake_vs_real_image_detection")
        processor = AutoImageProcessor.from_pretrained("dima806/deepfake_vs_real_image_detection")
        
    elif model_name == "dima++":
        # Use correct file path
        weights_path = os.path.join("C:\\Users\\Moham\\Irisv2\\notebooks", "model_full.pth")
        print(f"Loading weights from: {weights_path}")
        print(f"File exists: {os.path.exists(weights_path)}")
        
        model = AutoModelForImageClassification.from_pretrained("dima806/deepfake_vs_real_image_detection")
        processor = AutoImageProcessor.from_pretrained("dima806/deepfake_vs_real_image_detection")
        model.load_state_dict(torch.load(weights_path, map_location=device))
        
    # Same for medical model...
    
    return model, processor

# Add this new function to analyze text
def analyze_text(data):
    try:
        # Verify model and tokenizer are loaded
        global tokenizer_text, model_text, device_text
        if tokenizer_text is None or model_text is None:
            try:
                tokenizer_text, model_text, device_text = load_text_model()
            except Exception as e:
                return jsonify({"error": f"Text analysis model not available: {str(e)}"}), 503

        title = data.get('title', '')
        text = data.get('text', '')
        subject = data.get('subject', '')
        date = data.get('date', '')
        
        print(f"\nAnalyzing text: {title}")
        
        # Validate inputs
        if not all([title, text, subject, date]):
            return jsonify({"error": "All fields (Title, Text, Subject, Date) must be provided"}), 400
            
        try:
            datetime.strptime(date, "%B %d, %Y")
        except ValueError:
            return jsonify({"error": "Date must be in the format: 'Month DD, YYYY'"}), 400
            
        # Combine text for analysis
        combined_text = f"Title: {title}\nText: {text}\nSubject: {subject}\nDate: {date}"
        
        # Tokenize with proper error handling
        try:
            inputs = tokenizer_text(
                combined_text,
                return_tensors="pt",
                truncation=True,
                max_length=512
            )
            inputs = {k: v.to(device_text) for k, v in inputs.items()}
        except Exception as e:
            print(f"Tokenization error: {str(e)}")
            return jsonify({"error": "Failed to process text input"}), 400
        
        # Get prediction
        try:
            with torch.no_grad():
                outputs = model_text(**inputs)
                probabilities = torch.nn.functional.softmax(outputs.logits, dim=1)[0]
                
                label_id = torch.argmax(probabilities).item()
                label = model_text.config.id2label[label_id]
                
                # Calculate confidence scores
                fake_confidence = probabilities[model_text.config.label2id["Fake News"]].item() 
                real_confidence = probabilities[model_text.config.label2id["Real News"]].item() 
                
                print(f"Prediction complete: {label}")
                print(f"Confidences - Real: {real_confidence:.2f}%, Fake: {fake_confidence:.2f}%")
                
                result = {
                    "result": "fake" if "Fake" in label else "real",
                    "real_confidence": real_confidence,
                    "fake_confidence": fake_confidence,
                    "label": label,
                    "title": title,
                    "text": text,
                    "subject": subject,
                    "date": date,
                    "filename": f"{title}.txt",
                    "type": "text",
                    "model": "Mosko News Model",
                    "reason": f"News analysis model detected patterns consistent with {label.lower()}"
                }
                
                return jsonify(result), 200
                
        except Exception as e:
            print(f"Prediction error: {str(e)}")
            return jsonify({"error": "Failed to analyze text"}), 500
            
    except Exception as e:
        print(f"Text analysis error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to analyze text: {str(e)}"}), 500

def load_video_model():
    try:
        print("Initializing video model...")
        from tensorflow.keras.models import load_model as keras_load_model
        import numpy as np
        
        # Load the model with the correct path
        model_path = r"C:\Users\Moham\Irisv2\backend\model_files\best_model_ASL.h5"
        print(f"Loading model from: {model_path}")
        
        # Check if file exists
        if not os.path.exists(model_path):
            print(f"WARNING: Model file does not exist at {model_path}")
            print("Checking alternative paths...")
            
            # Try alternative paths
            alternatives = [
                os.path.join(os.path.dirname(__file__), 'model_files', 'best_model_ASL.h5'),
                os.path.join(os.path.dirname(__file__), 'models', 'best_model_ASL.h5'),
                os.path.join(os.path.dirname(__file__), 'best_model_ASL.h5'),
                os.path.join('model_files', 'best_model_ASL.h5'),
                'best_model_ASL.h5'
            ]
            
            for alt_path in alternatives:
                if os.path.exists(alt_path):
                    print(f"Found model at alternative path: {alt_path}")
                    model_path = alt_path
                    break
            else:
                print("ERROR: Could not find model file in any location.")
                print("Please make sure the model file is available.")
                print(f"Current directory: {os.getcwd()}")
                print(f"Files in current directory: {os.listdir('.')}")
                
                # Create a dummy model for testing
                print("Creating a dummy model for testing purposes")
                from tensorflow.keras.models import Sequential
                from tensorflow.keras.layers import Dense
                
                dummy_model = Sequential()
                dummy_model.add(Dense(2, activation='softmax', input_shape=(224, 224, 3)))
                dummy_model.compile(loss='categorical_crossentropy', optimizer='adam')
                
                return dummy_model
            
        try:
            video_model = keras_load_model(model_path)
            
            # Print model summary
            print("\nModel Summary:")
            video_model.summary()
            
            # Check if model has output shape that makes sense
            output_shape = video_model.output_shape
            print(f"Model output shape: {output_shape}")
            
            # Infer number of classes
            num_classes = output_shape[-1] if isinstance(output_shape, tuple) else None
            print(f"Number of classes: {num_classes}")
            
            if num_classes == 2:
                print("Class mapping: 0=Fake, 1=Real (assumed based on model output)")
            else:
                print(f"WARNING: Unexpected number of classes: {num_classes}")
            
            print("Video model loaded successfully")
            
            return video_model
        except Exception as model_error:
            print(f"Error loading model from {model_path}: {str(model_error)}")
            import traceback
            print(traceback.format_exc())
            print("Creating a simple dummy model for fallback")
            
            # Create a dummy model for testing
            from tensorflow.keras.models import Sequential
            from tensorflow.keras.layers import Dense, Flatten
            
            dummy_model = Sequential()
            dummy_model.add(Flatten(input_shape=(224, 224, 3)))
            dummy_model.add(Dense(2, activation='softmax'))
            dummy_model.compile(loss='categorical_crossentropy', optimizer='adam')
            
            return dummy_model
            
    except Exception as e:
        print(f"Critical error in load_video_model: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return None

# Initialize video model
video_model = None
if not app.debug:
    try:
        video_model = load_video_model()
    except Exception as e:
        print(f"Warning: Failed to load video model: {str(e)}")

def extract_frames(video_path, frame_skip=15):
    import cv2
    
    print(f"Opening video: {video_path}")
    cap = cv2.VideoCapture(video_path)
    
    # Check if video opened successfully
    if not cap.isOpened():
        print("ERROR: Could not open video file")
        return []
    
    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"Video properties: {width}x{height}, {fps} fps, {frame_count} frames")
    
    frames = []
    count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if count % frame_skip == 0:
            frames.append(frame)
        count += 1
        
    cap.release()
    
    print(f"Extracted {len(frames)} frames from {count} total frames")
    
    # If we got too few frames, try again with a smaller skip
    if len(frames) < 5 and count > 10:
        print(f"Got too few frames, trying again with smaller frame_skip")
        return extract_frames(video_path, frame_skip=5)
        
    return frames

def preprocess_all(frames, target_size=(224, 224)):
    import numpy as np
    import cv2
    
    if not frames:
        print("ERROR: No frames to preprocess")
        return np.array([])
        
    print(f"Preprocessing {len(frames)} frames to size {target_size}")
    
    # Check frames for consistency
    frame_shapes = set(frame.shape for frame in frames)
    print(f"Input frame shapes: {frame_shapes}")
    
    processed_frames = []
    
    for i, frame in enumerate(frames):
        try:
            # Convert BGR to RGB if needed (OpenCV uses BGR by default)
            if frame.shape[2] == 3:  # Has 3 color channels
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            else:
                rgb_frame = frame
                
            # Resize frame
            resized = cv2.resize(rgb_frame, target_size)
            
            # Normalize pixel values to [0, 1]
            normalized = resized / 255.0
            
            processed_frames.append(normalized)
        except Exception as e:
            print(f"ERROR preprocessing frame {i}: {str(e)}")
    
    result = np.array(processed_frames)
    print(f"Preprocessed shape: {result.shape}, min: {np.min(result)}, max: {np.max(result)}")
    
    return result

def analyze_video(file):
    import os
    import uuid
    import numpy as np
    
    print("\n==== VIDEO ANALYSIS DEBUG ====")
    print(f"Processing video file: {file.filename}")
    
    # Save uploaded file temporarily with Windows compatible path
    temp_filename = f"temp_{uuid.uuid4()}.mp4"
    file_path = os.path.join(os.environ.get('TEMP', r'C:\Windows\Temp'), temp_filename)
    file.save(file_path)
    print(f"Saved temp file to: {file_path}")
    
    try:
        # Extract frames
        print("Extracting frames...")
        frames = extract_frames(file_path)
        print(f"Extracted {len(frames)} frames")
        
        if not frames:
            print("ERROR: No frames could be extracted")
            return {
                "error": "No frames could be extracted from the video",
                "filename": file.filename
            }
        
        # Preprocess frames
        print("Preprocessing frames...")
        preprocessed = preprocess_all(frames)
        print(f"Preprocessed frame shape: {preprocessed.shape}")
        print(f"Preprocessed data range: min={np.min(preprocessed)}, max={np.max(preprocessed)}")
        
        # Check if model is available
        global video_model
        if video_model is None:
            print("WARNING: Video model is not loaded, attempting to load it now...")
            video_model = load_video_model()
            
        # If model is still None, create a dummy model for testing
        if video_model is None:
            print("WARNING: Failed to load the model, using dummy predictions for testing")
            # Create random predictions (fake class with 60% confidence)
            dummy_predictions = np.zeros((len(frames), 2))
            dummy_predictions[:, 0] = 0.6  # 60% confidence for class 0 (Fake)
            dummy_predictions[:, 1] = 0.4  # 40% confidence for class 1 (Real)
            predictions = dummy_predictions
        else:
            # Predict
            print("Running prediction on frames...")
            predictions = video_model.predict(preprocessed)
            
        print(f"Prediction shape: {predictions.shape}")
        
        # Generate results
        results = []
        real_confidence_sum = 0
        fake_confidence_sum = 0
        
        print("\nPredictions per frame:")
        print("-----------------------")
        
        for i, pred in enumerate(predictions):
            # Print raw prediction values
            print(f"Frame {i+1}: Raw prediction = {pred}")
            
            # Get predicted class and confidence
            pred_class = np.argmax(pred)
            confidence = float(pred[pred_class])
            label = "Real" if pred_class == 1 else "Fake"
            
            print(f"Frame {i+1}: Class={pred_class}, Label={label}, Confidence={confidence:.4f}")
            
            if label == "Real":
                real_confidence_sum += confidence
            else:
                fake_confidence_sum += confidence
                
            results.append({
                "frame": i + 1, 
                "label": label
            })
        
        # Calculate overall confidence
        total_frames = len(predictions)
        real_frames = sum(1 for res in results if res["label"] == "Real")
        fake_frames = total_frames - real_frames
        
        print("\nSummary:")
        print(f"Total frames: {total_frames}")
        print(f"Real frames: {real_frames} ({real_frames/total_frames*100:.1f}%)")
        print(f"Fake frames: {fake_frames} ({fake_frames/total_frames*100:.1f}%)")
        
        # Overall result based on majority voting
        overall_result = "Real" if real_frames > fake_frames else "Fake"
        
        # Calculate confidence
        real_confidence = real_confidence_sum / total_frames if total_frames > 0 else 0
        fake_confidence = fake_confidence_sum / total_frames if total_frames > 0 else 0
        
        # Normalize to ensure they sum to 1
        total_confidence = real_confidence + fake_confidence
        if total_confidence > 0:
            real_confidence = real_confidence / total_confidence
            fake_confidence = fake_confidence / total_confidence
        
        print(f"Overall result: {overall_result}")
        print(f"Real confidence: {real_confidence:.4f}")
        print(f"Fake confidence: {fake_confidence:.4f}")
        print("==== END DEBUG ====\n")
        
        return {
            "result": overall_result,
            "real_confidence": real_confidence,
            "fake_confidence": fake_confidence,
            "predictions": results,
            "filename": file.filename,
            "processingTime": f"{len(frames) * 50}ms"  # Simulated processing time
        }
        
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        print(traceback.format_exc())
        return {
            "error": str(e),
            "filename": file.filename
        }
    finally:
        # Clean up temp file
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Cleaned up temp file: {file_path}")

@app.route('/api/test-video', methods=['GET'])
def test_video():
    """Test route to analyze a specific video file directly"""
    try:
        # Default test file path
        test_file = r"C:\Users\Moham\Irisv2\test_videos\ASL_How_You.mp4"
        
        # Allow overriding the file path via query parameter
        if 'file' in request.args:
            test_file = request.args.get('file')
        
        if not os.path.exists(test_file):
            return jsonify({"error": f"Test file not found: {test_file}"}), 404
            
        print(f"\n===== TESTING VIDEO FILE: {test_file} =====")
        
        # Extract frames
        frames = extract_frames(test_file)
        if not frames:
            return jsonify({"error": "No frames could be extracted"}), 400
            
        # Preprocess frames
        preprocessed = preprocess_all(frames)
        
        # Load model if not already loaded
        global video_model
        if video_model is None:
            print("Loading video model for test...")
            video_model = load_video_model()
            
        # Create dummy predictions if model still not loaded
        if video_model is None:
            print("WARNING: Using dummy predictions as model couldn't be loaded")
            # Create random predictions
            predictions = np.zeros((len(preprocessed), 2))
            predictions[:, 0] = 0.6  # 60% confidence for class 0 (Fake)
            predictions[:, 1] = 0.4  # 40% confidence for class 1 (Real)
        else:
            # Run prediction
            predictions = video_model.predict(preprocessed)
        
        # Process results (similar to analyze_video but simplified)
        results = []
        for i, pred in enumerate(predictions):
            pred_class = np.argmax(pred)
            confidence = float(pred[pred_class])
            label = "Real" if pred_class == 1 else "Fake"
            
            results.append({
                "frame": i + 1,
                "label": label,
                "confidence": float(confidence),
                "raw_prediction": pred.tolist()  # Include raw prediction values
            })
        
        # Calculate summary
        real_frames = sum(1 for res in results if res["label"] == "Real")
        fake_frames = len(results) - real_frames
        
        return jsonify({
            "file": test_file,
            "total_frames": len(results),
            "real_frames": real_frames,
            "fake_frames": fake_frames,
            "frame_details": results
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Test error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/setup-model-dirs', methods=['GET'])
def setup_model_dirs():
    """Route to check and create necessary model directories"""
    try:
        # Define directories to create
        dirs_to_create = [
            os.path.join(os.path.dirname(__file__), 'models'),
            os.path.join(os.path.dirname(__file__), 'model_files')
        ]
        
        results = {}
        
        # Create directories if they don't exist
        for directory in dirs_to_create:
            if not os.path.exists(directory):
                try:
                    os.makedirs(directory)
                    results[directory] = "Created"
                except Exception as e:
                    results[directory] = f"Error creating: {str(e)}"
            else:
                results[directory] = "Already exists"
        
        # Check for the model file
        model_paths = [
            r"C:\Users\Moham\Irisv2\backend\model_files\best_model_ASL.h5",
            os.path.join(os.path.dirname(__file__), 'model_files', 'best_model_ASL.h5'),
            os.path.join(os.path.dirname(__file__), 'models', 'best_model_ASL.h5')
        ]
        
        for path in model_paths:
            results[path] = "Exists" if os.path.exists(path) else "Missing"
            
        # Return the current directory and its contents
        current_dir = os.getcwd()
        results["current_directory"] = current_dir
        results["files_in_current_dir"] = os.listdir(current_dir)
        
        return jsonify({
            "message": "Model directory setup check complete",
            "results": results
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def load_asl_model():
    try:
        print("Initializing ASL model...")
        import tensorflow as tf
        print(f"TensorFlow version: {tf.__version__}")
        from tensorflow.keras.models import load_model
        import numpy as np
        
        # Load the ASL model with absolute path
        model_path = os.path.join(os.path.dirname(__file__), 'model_files', 'best_model_ASL.h5')
        print(f"Loading ASL model from: {model_path}")
        print(f"File exists: {os.path.exists(model_path)}")
        print(f"File size: {os.path.getsize(model_path)} bytes")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"ASL model not found at {model_path}")
            
        # Load the model with custom objects if needed
        model = load_model(model_path, compile=False)
        print("Model loaded, configuring compilation...")
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        
        # Print model summary
        print("Model architecture:")
        model.summary()
        
        print("ASL model loaded successfully")
        return model
    except Exception as e:
        print(f"Error loading ASL model: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise

# Initialize ASL model
asl_model = None
if not app.debug:
    try:
        asl_model = load_asl_model()
    except Exception as e:
        print(f"Warning: Failed to load ASL model: {str(e)}")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 