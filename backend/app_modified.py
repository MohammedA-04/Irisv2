import os
import re
import enum
from flask import Flask, request, jsonify
from datetime import datetime, timedelta
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy 
import bcrypt as bcrypt_lib
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import pyotp
import requests

# Initialize Flask app
app = Flask(__name__)
app.config['DEBUG'] = os.environ.get('FLASK_DEBUG', 'False').lower() in ('1', 'true', 'yes')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///iris.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Configure CORS
CORS(app, 
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "https://iris-frontend.netlify.app",
                "https://your-netlify-app.netlify.app"
            ],
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

# Health check route
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "API is running"}), 200

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
            return jsonify({"message": "Error creating account"}), 500

    except Exception as e:
        print(f"Server error in registration: {str(e)}")
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

@app.route('/api/analyze', methods=['POST'])
def analyze_file():
    try:
        content_type = request.form.get('type', 'image')
        
        if 'file' not in request.files and content_type != 'text':
            return jsonify({"error": f"No {content_type} file provided"}), 400
            
        # Mock responses for deployment - simplified to avoid ML dependencies
        if content_type == 'text':
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
            
        elif content_type == 'audio':
            file = request.files['file']
            # Mock audio analysis
            return jsonify({
                "result": "fake",
                "real_confidence": 0.18,
                "fake_confidence": 0.82,
                "filename": file.filename,
                "reason": "Voice pattern manipulation detected"
            }), 200
            
        elif content_type == 'video':
            file = request.files['file']
            # Mock video analysis
            return jsonify({
                "result": "Real",
                "real_confidence": 0.75,
                "fake_confidence": 0.25,
                "filename": file.filename,
                "processingTime": "500ms"
            }), 200
            
        else:  # image
            file = request.files['file']
            # Mock image analysis
            return jsonify({
                "result": "fake",
                "real_confidence": 0.08,
                "fake_confidence": 0.92,
                "filename": file.filename,
                "reason": "Model detected fake image patterns"
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