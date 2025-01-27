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

# Defer ML imports to prevent startup issues
def load_ml_models():
    from transformers import AutoImageProcessor, AutoModelForImageClassification
    import torch
    
    processor = AutoImageProcessor.from_pretrained("dima806/deepfake_vs_real_image_detection")
    model = AutoModelForImageClassification.from_pretrained("dima806/deepfake_vs_real_image_detection")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    return processor, model, device

# Initialize Flask app
app = Flask(__name__)
# Load environment variables
app.config['ENV'] = os.environ.get('FLASK_ENV', 'development')
app.config['DEBUG'] = os.environ.get('FLASK_DEBUG', '1') == '1'
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
            # Generate OTP secret for QR code
            otp_secret = pyotp.random_base32()
            print(f"Generated OTP secret for {username}: {otp_secret}")
            
            # Create user
            hashed_password = hash_password(password)
            new_user = User(
                username=username,
                email=email,
                password_hash=hashed_password,
                otp_secret=otp_secret,
                otp_expiry=datetime.utcnow() + timedelta(minutes=5)
            )
            
            db.session.add(new_user)
            db.session.commit()

            print(f"Successfully created user {username}")  # Debug logging
            return jsonify({
                "message": "Registration successful",
                "requireOTP": True,
                "otpSecret": otp_secret,
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
    data = request.json
    otp = data.get('otp')
    username = data.get('username')

    print(f"\nOTP Verification Attempt:")
    print(f"Username: {username}")
    print(f"Provided OTP: {otp}")

    user = User.query.filter_by(username=username).first()
    if not user:
        print(f"Error: User {username} not found")
        return jsonify({"message": "User not found"}), 404

    print(f"User found, stored secret: {user.otp_secret}")
    print(f"OTP expiry: {user.otp_expiry}")
    server_time = datetime.utcnow()
    adjusted_time = server_time + timedelta(seconds=TIME_OFFSET)
    print(f"Server time: {server_time}")
    print(f"Adjusted time: {adjusted_time}")

    # Use TOTP verification with time offset
    totp = pyotp.TOTP(user.otp_secret)
    
    # Get codes for both original and adjusted time
    current_code = totp.at(server_time)
    adjusted_code = totp.at(adjusted_time)
    
    print(f"Server time: {datetime.utcnow()}")
    print(f"Current code: {current_code}")
    print(f"Adjusted code: {adjusted_code}")
    print(f"Provided code: {otp}")
    
    if user.otp_expiry > datetime.utcnow() and (
        totp.verify(otp) or  # Try standard verification
        otp == current_code or  # Try current time code
        otp == adjusted_code  # Try adjusted time code
    ):
        print(f"OTP verified successfully for {username}")
        user.otp_expiry = None
        user.reset_fail_attempts()
        db.session.commit()
        return jsonify({"message": "OTP verified"}), 200
    
    print(f"Verification failed:")
    if user.otp_expiry <= datetime.utcnow():
        print("- OTP has expired")
    else:
        print("- Code mismatch")
    print(f"- Provided code {otp} not in valid codes: [{current_code}, {adjusted_code}]")

    return jsonify({"message": "Invalid OTP"}), 401

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({"error": "No file selected"}), 400

    try:
        image = Image.open(file)
        inputs = processor_dima(images=image, return_tensors="pt").to(device)

        with torch.no_grad():
            outputs = model(**inputs)
        
        predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
        real_confidence, fake_confidence = predictions[0].tolist()
        predicted_class = predictions.argmax().item()
        label = model.config.id2label[predicted_class]

        # Save content to database
        content = Content(
            user_id=request.user.id,  # Assuming user authentication
            file_path=file.filename,  # You should save the file and store the path
            file_name=file.filename,
            file_size=len(file.read()),
            is_deepfake=label == "fake",
            analysis={
                "real_confidence": real_confidence,
                "fake_confidence": fake_confidence
            },
            upload_type=UploadType.image,
            upload_category="image",
            model_applied=ModelApplied.dima
        )
        db.session.add(content)
        db.session.commit()

        return jsonify({
            "result": label,
            "real_confidence": real_confidence,
            "fake_confidence": fake_confidence
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 