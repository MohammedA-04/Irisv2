import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../common/PasswordInput';
import { GoogleLogin } from '@react-oauth/google';
import Notification from '../common/Notification';
import { API_URLS } from '../../config/api';
import OTPSetup from './OTPSetup';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    className: 'h-2 rounded-full mt-2 bg-gray-200'
  });
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupInstructions, setSetupInstructions] = useState({
    show: false,
    secret: '',
    username: ''
  });
  const maxRetries = 3;

  const checkPasswordStrength = (password) => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    let strength = 0;
    if (hasLower) strength++;
    if (hasUpper) strength++;
    if (hasNumber) strength++;
    if (hasSpecial) strength++;
    if (isLongEnough) strength++;

    const strengthClasses = {
      0: { class: 'bg-gray-200', text: 'Very weak', color: 'text-gray-500' },
      1: { class: 'bg-red-500', text: 'Weak', color: 'text-red-500' },
      2: { class: 'bg-orange-500', text: 'Fair', color: 'text-orange-500' },
      3: { class: 'bg-yellow-500', text: 'Good', color: 'text-yellow-600' },
      4: { class: 'bg-green-500', text: 'Strong', color: 'text-green-500' },
      5: { class: 'bg-green-600', text: 'Very strong', color: 'text-green-600' }
    };

    setPasswordStrength({
      score: strength,
      feedback: strengthClasses[strength].text,
      className: `h-2 rounded-full mt-2 ${strengthClasses[strength].class}`,
      textColor: strengthClasses[strength].color
    });
  };

  const handleSubmit = async (e, retryCount = 0) => {
    e.preventDefault();
    setNotification({ message: '', type: 'success' });
    setIsSubmitting(true);
    
    // Basic validation
    if (!formData.username || !formData.email || !formData.password) {
      setNotification({
        message: 'Please fill in all fields',
        type: 'error'
      });
      setIsSubmitting(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setNotification({
        message: 'Please enter a valid email address',
        type: 'error'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(API_URLS.register, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show OTP setup instructions
        const otpSecret = data.otpSecret;
        console.log('Received OTP secret:', otpSecret);  // Debug logging
        console.log('OTP Setup Instructions:', {
          username: formData.username,
          secret: otpSecret,
          username: formData.username
        });
        
        // Show QR code and instructions
        setSetupInstructions({
          show: true,
          secret: otpSecret,
          username: formData.username
        });
        
        setNotification({
          message: 'Account created successfully! Redirecting to login...',
          type: 'success'
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Handle specific error cases
        let errorMessage = data.message;
        switch (response.status) {
          case 400:
            if (data.message.includes('Username')) {
              errorMessage = 'This username is already taken. Please choose another.';
            } else if (data.message.includes('Email')) {
              errorMessage = 'This email is already registered. Please use another email.';
            } else if (data.message.includes('Password')) {
              errorMessage = 'Password does not meet requirements. Please use a stronger password.';
            }
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = 'Registration failed. Please try again.';
        }
        setNotification({
          message: errorMessage,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (retryCount < maxRetries) {
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return handleSubmit(e, retryCount + 1);
      }
      setNotification({
        message: `Unable to connect to server. Please ensure the server is running and try again. (Attempted ${retryCount + 1} times)`,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: 'success' })}
        />
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <PasswordInput
              value={formData.password}
              onChange={handleChange}
              name="password"
            />
            <div className={passwordStrength.className}></div>
            <p className={`text-sm mt-1 ${passwordStrength.textColor}`}>
              {passwordStrength.feedback}
            </p>
          </div>

          <button
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing up...' : 'Sign up'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or continue with</span>
          </div>
        </div>

        <div className="space-y-4">
          <GoogleLogin
            onSuccess={credentialResponse => {
              console.log(credentialResponse);
            }}
            onError={() => {
              console.log('Registration Failed');
            }}
          />
        </div>
      </div>

      {setupInstructions.show && (
        <OTPSetup
          secret={setupInstructions.secret}
          username={setupInstructions.username}
          onClose={() => {
            setSetupInstructions({ show: false, secret: '', username: '' });
            navigate('/login');
          }}
        />
      )}
    </>
  );
};

export default Register; 