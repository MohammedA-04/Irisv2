import random
import string
from datetime import datetime, timedelta
from flask_mail import Mail, Message

mail = Mail()

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def send_verification_email(user):
    msg = Message('Email Verification',
                 sender='noreply@yourdomain.com',
                 recipients=[user.email])
    
    msg.body = f'''To verify your email, use the following OTP:
    
{user.otp}

This OTP will expire in 10 minutes.
'''
    mail.send(msg) 