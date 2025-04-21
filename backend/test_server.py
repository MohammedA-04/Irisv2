import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
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

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "API is running", "version": "1.0.0"}), 200

@app.route('/api/analyze', methods=['POST'])
def analyze():
    content_type = request.form.get('type', 'image')
    
    if 'file' not in request.files and content_type != 'text':
        return jsonify({"error": f"No {content_type} file provided"}), 400
        
    # Mock responses for testing
    if content_type == 'text':
        title = request.form.get('title', 'Sample Title')
        text = request.form.get('text', 'Sample text content')
        
        return jsonify({
            "result": "fake",
            "real_confidence": 0.15,
            "fake_confidence": 0.85,
            "label": "Fake News",
            "title": title,
            "text": text[:50] + "...",
            "reason": "Test server: Mock detection results"
        }), 200
        
    elif content_type == 'audio':
        file = request.files['file']
        return jsonify({
            "result": "fake",
            "real_confidence": 0.18,
            "fake_confidence": 0.82,
            "filename": file.filename,
            "reason": "Test server: Mock audio detection"
        }), 200
        
    else:  # image or video
        file = request.files['file']
        return jsonify({
            "result": "fake",
            "real_confidence": 0.08,
            "fake_confidence": 0.92,
            "filename": file.filename,
            "reason": "Test server: Mock media detection"
        }), 200

@app.route('/api/analyze-ai', methods=['POST'])
def analyze_ai():
    data = request.json
    
    content_type = data.get('type', 'image')
    filename = data.get('filename', 'sample.jpg')
    result = data.get('result', 'fake')
    
    # Mock AI analysis response
    analysis = f"[TEST SERVER] This {content_type} named '{filename}' appears to be {result}. "
    analysis += "This is a test response from the simplified test server to verify your setup."
            
    return jsonify({
        "analysis": analysis
    }), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    
    return jsonify({
        "message": "Registration successful (TEST SERVER)",
        "otpSecret": "TESTSECRET123456"
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    return jsonify({
        "message": "Please enter your authenticator code",
        "requireOTP": True,
        "otpSecret": "TESTSECRET123456"
    }), 200

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    return jsonify({
        "message": "OTP verified successfully (TEST SERVER)",
        "debug_info": {
            "time": "Test time",
            "valid_codes": ["123456"]
        }
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting test server on port {port}...")
    print(f"Health check endpoint: http://localhost:{port}/api/health")
    print("This is a simplified test server for validating the application setup.")
    print("Use this to verify your frontend can connect properly.")
    app.run(host='0.0.0.0', port=port) 