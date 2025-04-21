import unittest
import json
from app import app, db, User, Content, hash_password, check_password, check_password_strength, UploadType, ModelApplied
import os
import tempfile
from datetime import datetime, timedelta
import io
from PIL import Image
import numpy as np
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import time
import pyotp
from pydub import AudioSegment


# Class to 
class FlaskAppTestCase(unittest.TestCase):
    test_results = []

    def setUp(self):
        # Set up a test client and create a test database
        self.app = app
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['DEBUG'] = True  # Prevents loading ML models
        
        # Disable rate limiting for testing
        for handler in list(self.app.url_map.iter_rules()):
            if hasattr(handler.endpoint, '__name__'):
                endpoint_name = handler.endpoint.__name__
                if endpoint_name == 'register':
                    handler.refresh()
        
        self.client = self.app.test_client()
        
        # Create the database and tables
        with self.app.app_context():
            db.create_all()
    
    def tearDown(self):
        # Clean up after each test
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def print_test_summary(self):
        print("\nTest Summary:")
        print(f"{'Test Function':<50} {'Expected Output':<25} {'Actual Output':<25} {'Result':<25}")
        print("=" * 90)
        for result in self.test_results:
            function_name, expected, actual, passed = result
            status = "✅ Passed" if passed else "❌ Failed"
            print(f"{function_name:<50} {expected:<25} {actual:<25} {status}")

    # TEST #1: User Registration
    # PURPOSE: Tests that the '/api/'register' route correctly creates a new user
    # INPUT: POST request with username, email, and password
    # EXPECTED OUTPUT: 201 status code, success message, and user created in database
    def test_register_route_valid(self):
        
        # Make's a post to @route with smaple user inputs 
        response = self.client.post('/api/register', 
                                   json={
                                       'username': 'testuser',
                                       'email': 'test@example.com',
                                       'password': 'Test@123456'
                                   })
        
        # Load data from JSON to dictonary
        data = json.loads(response.data)

        # Expect: 201, sucess 
        expected_status = 201
        actual_status = response.status_code
        self.assertEqual(actual_status, expected_status)
        
        # Store the result
        self.test_results.append(
            ('test_register_route_valid', str(expected_status), str(actual_status), actual_status == expected_status)
        )

        self.assertIn('success', data['message'].lower())
        
        # Verify user was created in the database
        with self.app.app_context():
            # query to 'testuser' -> check != null -> check email == '$useremail'
            user = User.query.filter_by(username='testuser').first()
            self.assertIsNotNone(user)
            self.assertEqual(user.email, 'test@example.com')

    # TEST #2: User Registration (invalid)
    # PURPOSE: Tests that the '/api/'register' route correctly rejects invalid enteries
    # INPUT: POST requests to @route with invalid enteries
    # Expect Output: 400, fail
    def test_register_route_invalid(self):
    
        # Make's a post to @route with smaple user inputs 
        response = self.client.post('/api/register', 
                                    json={
                                        'username': '',
                                        'email': '',
                                        'password': ''
                                    })
        
        # Load data from JSON to dictonary
        data = json.loads(response.data)

        # Expect: 400, fail 
        expected_status = 400
        actual_status = response.status_code
        self.assertEqual(actual_status, expected_status)
        
        # Store the result
        self.test_results.append(
            ('test_register_route_invalid', str(expected_status), str(actual_status), actual_status == expected_status)
        )

        self.assertIn('All fields are required'.lower(), data['message'].lower())
        
        # Verify user was created in the database
        with self.app.app_context():
            # query to 'testuser' -> check != null -> check email == '$useremail'
            user = User.query.filter_by(username='').first()
            self.assertIsNone(user)

    
    # TEST #3: User Registration - Invalid Email Formats
    # PURPOSE: Tests that the /api/register route correctly rejects various invalid email formats
    # INPUT: POST requests to @route with various invalid email formats
    # EXPECTED OUTPUT: 400 status code and appropriate error message
    """
    def test_register_route_invalid_emails(self):
        # List of invalid email cases
        invalid_emails = [
            ('user@', 'user@'),  # Missing domain
            ('@example.com', '@example.com'),  # Missing local part
            ('user@.com', 'user@.com'),  # Missing domain name before the dot
            ('user@domain..com', 'user@domain.c'),  # Consecutive dots in the domain
            ('user@domain.c', 'user@domain.c'),  # Top-level domain too short
            ('user@domain@com', 'user@domain@com'),  # Multiple @ symbols
            ('user name@example.com', 'user name@example.com')  # Contains whitespace
        ]

        for email, description in invalid_emails:
            with self.subTest(email=email, description=description):
                # Make a POST request with invalid email
                response = self.client.post('/api/register', 
                                            json={
                                                'username': 'testuser',
                                                'email': email,
                                                'password': 'Test@123456'
                                            })
                
                # Load data from JSON to dictionary
                data = json.loads(response.data)

                # Expect: 400, fail 
                expected_status = 400
                actual_status = response.status_code
                self.assertEqual(actual_status, expected_status)

                # Store the result
                self.test_results.append(
                    (f'test_register_route_invalid_email_{description}', str(expected_status), str(actual_status), actual_status == expected_status)
                )

                # Check for a general error message about invalid email
                self.assertIn('invalid email', data['message'].lower())
    """

    # ========================================================================================================
    # @route: LOGIN unit tests
    # ========================================================================================================
    
    # TEST #4 to 6: User Login 
    # PURPOSE: Tests that the '/api/login' route correctly authenticates a user
    # INPUT: POST request with username and password
    # EXPECTED OUTPUT: 200 status code and OTP secret for valid credentials, 401 for invalid credentials
    def test_login_route_valid(self):
        # First, create a user to test login
        with self.app.app_context():
            user = User(username='testuser', email='test@example.com', password_hash=hash_password('Test@123456'))
            db.session.add(user)
            db.session.commit()

        # Attempt to log in with valid credentials
        response = self.client.post('/api/login', json={'username': 'testuser','password': 'Test@123456'})
        data = json.loads(response.data)

        # Expect: 200, success 
        expected_status = 200
        actual_status = response.status_code
        self.assertEqual(actual_status, expected_status)

        # Store the result
        self.test_results.append(
            ('test_login_route_valid', str(expected_status), str(actual_status), actual_status == expected_status)
        )

        self.assertIn('Please enter your authenticator code', data['message'])

    def test_login_route_invalid_username(self):
        # Attempt to log in with an invalid username
        response = self.client.post('/api/login', json={'username': 'invaliduser','password': 'Test@123456'})
        data = json.loads(response.data)

        # Expect: 401, fail 
        expected_status = 401
        actual_status = response.status_code
        self.assertEqual(actual_status, expected_status)

        # Store the result
        self.test_results.append(('test_login_route_invalid_username', str(expected_status), str(actual_status), actual_status == expected_status))
        self.assertIn('invalid username or password', data['message'].lower())

    def test_login_route_invalid_password(self):
        # First, create a user to test login
        with self.app.app_context():
            user = User(username='testuser', email='test@example.com', password_hash=hash_password('Test@123456'))
            db.session.add(user)
            db.session.commit()

        # Attempt to log in with valid username but invalid password
        response = self.client.post('/api/login', json={'username': 'testuser','password': 'WrongPassword'})
        data = json.loads(response.data)

        # Expect: 401, fail 
        expected_status = 401
        actual_status = response.status_code
        self.assertEqual(actual_status, expected_status)

        # Store the result
        self.test_results.append(
            ('test_login_route_invalid_password', str(expected_status), str(actual_status), actual_status == expected_status)
        )

        self.assertIn('invalid username or password', data['message'].lower())

    # TEST #7: [BUG] User Login Rate Limiter
    """
    def test_login_rate_limiter(self):
        # First, create a user to test login
        with self.app.app_context():
            user = User(username='testuser', email='test@example.com', password_hash=hash_password('Test@123456'))
            db.session.add(user)
            db.session.commit()

        # Attempt to log in repeatedly
        max_attempts = 10  # Number of attempts to make
        for attempt in range(max_attempts):
            response = self.client.post('/api/login', 
                                         json={
                                             'username': 'testuser',
                                             'password': 'Test@123456'
                                         })
            
            # Check if we receive a 429 status code
            if response.status_code == 429:
                print(f"Rate limit reached after {attempt + 1} attempts.")
                break
            
            # Wait a short time before the next attempt
            time.sleep(6)  # Wait for 6 seconds to space out the requests

        else:
            self.fail("Expected a 429 status code but did not receive it.")

        # Verify that the response is indeed a 429 status code
        self.assertEqual(response.status_code, 429)
        self.assertIn('Account temporarily locked', response.get_json()['message'])
        """

    # ========================================================================================================
    # @route: Verfiy OTP
    # ========================================================================================================
    
    # TEST #8: OTP Verification - Valid OTP
    def test_verify_otp_valid(self):
        # First, create a user with an OTP secret and store the OTP secret in a variable
        otp_secret = pyotp.random_base32()
        
        with self.app.app_context():
            user = User(
                username='testuser', 
                email='test@example.com', 
                password_hash=hash_password('Test@123456'), 
                otp_secret=otp_secret
            )
            db.session.add(user)
            db.session.commit()

        # Generate a valid OTP using the stored OTP secret
        totp = pyotp.TOTP(otp_secret)
        valid_otp = totp.now()

        # Attempt to verify the OTP
        response = self.client.post('/api/verify-otp', json={'username': 'testuser', 'otp': valid_otp})
        data = json.loads(response.data)

        # Expect: 200, success 
        expected_status = 200
        actual_status = response.status_code
        self.assertEqual(actual_status, expected_status)

        # Store the result
        self.test_results.append(
            ('test_verify_otp_valid', str(expected_status), str(actual_status), actual_status == expected_status)
        )

        self.assertIn('OTP verified successfully', data['message'])

    # TEST #9: OTP Verification - Invalid OTP
    def test_verify_otp_invalid(self):
        # First, create a user with an OTP secret
        with self.app.app_context():
            user = User(username='testuser', email='test@example.com', password_hash=hash_password('Test@123456'), otp_secret=pyotp.random_base32())
            db.session.add(user)
            db.session.commit()

        # Attempt to verify with an invalid OTP
        response = self.client.post('/api/verify-otp', json={'username': 'testuser', 'otp': '123456'})
        data = json.loads(response.data)

        # Expect: 400, fail 
        expected_status = 400
        actual_status = response.status_code
        self.assertEqual(actual_status, expected_status)

        # Store the result
        self.test_results.append(
            ('test_verify_otp_invalid', str(expected_status), str(actual_status), actual_status == expected_status)
        )

        self.assertIn('Invalid OTP', data['message'])

    # TEST #10: OTP Verification - User Not Found
    def test_verify_otp_user_not_found(self):
        # Attempt to verify OTP for a non-existent user
        response = self.client.post('/api/verify-otp', json={'username': 'nonexistentuser', 'otp': '123456'})
        data = json.loads(response.data)

        # Expect: 404, user not found
        expected_status = 404
        actual_status = response.status_code
        self.assertEqual(actual_status, expected_status)

        # Store the result
        self.test_results.append(
            ('test_verify_otp_user_not_found', str(expected_status), str(actual_status), actual_status == expected_status)
        )

        self.assertIn('User not found', data['message'])

        # ========================================================================================================
    
    # ========================================================================================================
    # @route: upload files
    # ========================================================================================================
    # TEST #11: Successful File Upload
    def test_upload_file_success(self):
        # Create a sample image file in memory
        image_data = io.BytesIO()
        image = Image.new('RGB', (224, 224), color='red')
        image.save(image_data, format='PNG')
        image_data.seek(0)  # Reset file pointer

        # Make a POST request to upload the image
        response = self.client.post('/api/upload', 
                                    data={'file': (image_data, 'test_image.png')})

        # Load data from JSON to dictionary
        data = json.loads(response.data)

        # Expect: 200, success 
        expected_status = 200
        actual_status = response.status_code
        self.assertEqual(actual_status, expected_status)

        # Store the result
        self.test_results.append(
            ('test_upload_file_success', str(expected_status), str(actual_status), actual_status == expected_status)
        )

        self.assertIn('result', data)
        self.assertIn('real_confidence', data)
        self.assertIn('fake_confidence', data)
        self.assertEqual(data['filename'], 'test_image.png')

    # TEST #12: No File Provided
    def test_upload_no_file(self):
        # Make a POST request without a file
        response = self.client.post('/api/upload')

        # Load data from JSON to dictionary
        data = json.loads(response.data)

        # Expect: 400, error 
        expected_status = 400
        actual_status = response.status_code
        self.assertEqual(actual_status, expected_status)

        # Store the result
        self.test_results.append(
            ('test_upload_no_file', str(expected_status), str(actual_status), actual_status == expected_status)
        )

        self.assertIn('No file provided', data['error'])

    # TEST #13: No File Selected
    def test_upload_no_file_selected(self):
        # Create a POST request with an empty file
        response = self.client.post('/api/upload', data={'file': (io.BytesIO(), '')})

        # Load data from JSON to dictionary
        data = json.loads(response.data)

        # Expect: 400, error 
        expected_status = 400
        actual_status = response.status_code
        self.assertEqual(actual_status, expected_status)

        # Store the result
        self.test_results.append(
            ('test_upload_no_file_selected', str(expected_status), str(actual_status), actual_status == expected_status)
        )

        self.assertIn('No file selected', data['error'])

    # TEST #14: Invalid File Type (if applicable)
    def test_upload_invalid_file_type(self):
        # Create a sample text file in memory
        text_data = io.BytesIO(b'This is a test text file.')
        
        # Make a POST request to upload the text file
        response = self.client.post('/api/upload', 
                                    data={'file': (text_data, 'test_file.txt')})

        # Load data from JSON to dictionary
        data = json.loads(response.data)

        # Expect: 400, error (assuming your API only accepts images)
        expected_status = 400
        actual_status = response.status_code
        self.assertEqual(actual_status, expected_status)

        # Store the result
        self.test_results.append(
            ('test_upload_invalid_file_type', str(expected_status), str(actual_status), actual_status == expected_status)
        )

        self.assertIn('Failed to process image', data['error'])

    # @route: analyse_files, @def: analyse_image, @def: analyse_audio
    
    # TEST #15: Successful Image Analysis
    def test_analyze_image_success(self):
        # Create a sample image file in memory
        image_data = io.BytesIO()
        image = Image.new('RGB', (224, 224), color='blue')
        image.save(image_data, format='PNG')
        image_data.seek(0)  # Reset file pointer

        # Make a POST request to analyze the image
        response = self.client.post('/api/analyze', 
                                    data={'file': (image_data, 'test_image.png'), 'type': 'image'})

        # Load data from JSON to dictionary
        data = json.loads(response.data)

        # Expect: 200, success 
        expected_status = 200
        actual_status = response.status_code
        self.assertEqual(actual_status, expected_status)

        # Store the result
        self.test_results.append(
            ('test_analyze_image_success', str(expected_status), str(actual_status), actual_status == expected_status)
        )

        self.assertIn('result', data)
        self.assertIn('real_confidence', data)
        self.assertIn('fake_confidence', data)

    # TEST #16: Successful Audio Analysis
    def test_analyze_audio_success(self):
        # Create a sample audio file in memory (WAV format)
        audio_data = io.BytesIO()
        audio_segment = AudioSegment.silent(duration=1000)  # 1 second of silence
        audio_segment.export(audio_data, format='wav')
        audio_data.seek(0)  # Reset file pointer

        # Make a POST request to analyze the audio
        response = self.client.post('/api/analyze', 
                                    data={'file': (audio_data, 'test_audio.wav'), 'type': 'audio'})

        # Load data from JSON to dictionary
        data = json.loads(response.data)

        # Expect: 200, success 
        expected_status = 200
        actual_status = response.status_code
        self.assertEqual(actual_status, expected_status)

        # Store the result
        self.test_results.append(
            ('test_analyze_audio_success', str(expected_status), str(actual_status), actual_status == expected_status)
        )

        self.assertIn('result', data)
        self.assertIn('real_confidence', data)
        self.assertIn('fake_confidence', data)

    # TEST #17: No File Provided
    def test_analyze_no_file(self):
        # Make a POST request without a file
        response = self.client.post('/api/analyze', data={'type': 'image'})

        # Load data from JSON to dictionary
        data = json.loads(response.data)

        # Expect: 400, error 
        expected_status = 400
        actual_status = response.status_code
        self.assertEqual(actual_status, expected_status)

        # Store the result
        self.test_results.append(
            ('test_analyze_no_file', str(expected_status), str(actual_status), actual_status == expected_status)
        )

        self.assertIn('No image file provided', data['error'])  # Update this line

    # TEST #18: Invalid File Type
    def test_analyze_invalid_file_type(self):
        # Create a sample text file in memory
        text_data = io.BytesIO(b'This is a test text file.')
        
        # Make a POST request to analyze the text file
        response = self.client.post('/api/analyze', 
                                    data={'file': (text_data, 'test_file.txt'), 'type': 'text'})

        # Load data from JSON to dictionary
        data = json.loads(response.data)

        # Expect: 400, error (assuming your API only accepts images and audio)
        expected_status = 400
        actual_status = response.status_code
        self.assertEqual(actual_status, expected_status)

        # Store the result
        self.test_results.append(
            ('test_analyze_invalid_file_type', str(expected_status), str(actual_status), actual_status == expected_status)
        )

        self.assertIn('error', data)


    # Add this method to run after all tests
    @classmethod
    def tearDownClass(cls):
        cls().print_test_summary()

# In your app.py where you define the limiter
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Add this check to disable rate limiting during tests
@limiter.request_filter
def limiter_check():
    return app.config.get('TESTING', False)

if __name__ == '__main__':
    unittest.main() 