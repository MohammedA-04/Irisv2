from flask import Flask, jsonify, request
from flask_cors import CORS
import os

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
    return jsonify({"status": "ok", "message": "API is running"}), 200

@app.route('/api/analyze', methods=['POST'])
def analyze():
    # Mock response for testing
    return jsonify({
        "result": "fake",
        "confidence": 0.92,
        "fake_confidence": 0.92,
        "real_confidence": 0.08,
        "filename": request.files.get('file').filename if 'file' in request.files else "test.jpg"
    }), 200

@app.route('/api/analyze-ai', methods=['POST'])
def analyze_ai():
    # Mock AI analysis response
    return jsonify({
        "analysis": "This image shows signs of manipulation. The analysis detected inconsistencies in facial features that are typical indicators of deepfake technology. There are subtle artifacts around the facial areas and unnatural smoothing effects."
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 