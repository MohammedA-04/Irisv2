import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../common/PasswordInput';
import { GoogleLogin } from '@react-oauth/google';
import Notification from '../common/Notification';
import { API_URLS } from '../../config/api';
import OTPSetup from './OTPSetup';

/**
 * Register component
 * @Parent AuthTabs
 * @returns {JSX.Element}
 * @description component displays registration form and handles registration process.
 */

const Register = ({ onSwitchToLogin }) => {

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    className: 'h-2 rounded-full mt-2 bg-gray-200'
  });
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOTPSetup, setShowOTPSetup] = useState(false);
  const [otpSecret, setOtpSecret] = useState(null);

  // Add maxRetries constant
  const maxRetries = 3; // Maximum number of retry attempts for registration

  //* RegEX: checks $password strength
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
      feedback: strengthClasses[strength].text, //* ex: "Very weak"
      className: `h-2 rounded-full mt-2 ${strengthClasses[strength].class}`,
      textColor: strengthClasses[strength].color
    });
  };

  //* Handles registration form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: '', type: 'success' });
    setIsSubmitting(true);

    try {
      const response = await fetch(API_URLS.register, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSecret(data.otpSecret);
        setShowOTPSetup(true);
        setNotification({
          message: 'Account created successfully! Please set up 2FA.',
          type: 'success'
        });
      } else {
        setNotification({
          message: data.message || 'Registration failed',
          type: 'error'
        });
      }
    } catch (error) {
      setNotification({
        message: 'Failed to connect to server',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  //* Handles input changes in registration form
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

  const handleOTPInstructionsAccepted = () => {
    // Switch to login tab after OTP setup is acknowledged
    onSwitchToLogin();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Notification banner: renders based on registration status */}
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: 'success' })}
        />

        {/* <form/>: username, email, password, submit button */}
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
            PasswordInput
            value={formData.password}
            onChange={handleChange}
            name="password"
            /
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

      {showOTPSetup && (
        <OTPSetup
          username={formData.username}
          otpSecret={otpSecret}
          onBack={() => setShowOTPSetup(false)}
          onAccept={handleOTPInstructionsAccepted}
        />
      )}
    </>
  );
};

export default Register; 