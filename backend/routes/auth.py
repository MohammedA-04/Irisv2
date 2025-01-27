from flask import Blueprint, request, jsonify, current_app
from google.oauth2 import id_token
from google.auth.transport import requests
import requests as http_requests
from models import db, User

auth = Blueprint('auth', __name__)

@auth.route('/auth/google', methods=['POST'])
def google_auth():
    try:
        token = request.json.get('token')
        
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            current_app.config['GOOGLE_CLIENT_ID']
        )

        email = idinfo['email']
        user = User.query.filter_by(email=email).first()

        if not user:
            # Create new user
            user = User(
                email=email,
                username=idinfo['name'],
                is_verified=True  # Google accounts are pre-verified
            )
            db.session.add(user)
            db.session.commit()

        # Generate JWT token or session
        # Return user data and token
        return jsonify({
            'success': True,
            'user': {
                'email': user.email,
                'username': user.username
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@auth.route('/auth/github', methods=['POST'])
def github_auth():
    try:
        code = request.json.get('code')
        
        # Exchange code for access token
        response = http_requests.post(
            'https://github.com/login/oauth/access_token',
            headers={'Accept': 'application/json'},
            data={
                'client_id': current_app.config['GITHUB_CLIENT_ID'],
                'client_secret': current_app.config['GITHUB_CLIENT_SECRET'],
                'code': code
            }
        )
        
        access_token = response.json()['access_token']
        
        # Get user data
        user_data = http_requests.get(
            'https://api.github.com/user',
            headers={
                'Authorization': f'token {access_token}',
                'Accept': 'application/json'
            }
        ).json()

        # Get user email
        emails = http_requests.get(
            'https://api.github.com/user/emails',
            headers={
                'Authorization': f'token {access_token}',
                'Accept': 'application/json'
            }
        ).json()
        
        primary_email = next(email['email'] for email in emails if email['primary'])

        user = User.query.filter_by(email=primary_email).first()

        if not user:
            user = User(
                email=primary_email,
                username=user_data['login'],
                is_verified=True
            )
            db.session.add(user)
            db.session.commit()

        return jsonify({
            'success': True,
            'user': {
                'email': user.email,
                'username': user.username
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400 