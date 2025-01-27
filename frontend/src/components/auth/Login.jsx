import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../common/PasswordInput';
import { GoogleLogin } from '@react-oauth/google';
import LockoutScreen from './LockoutScreen';
import Notification from '../common/Notification';
import { API_URLS } from '../../config/api';
import OTPVerification from './OTPVerification';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [error, setError] = useState('');
  const [otpData, setOtpData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Attempting login with:', formData);  // Debug log
      const response = await fetch(API_URLS.login, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      // Log the full response details
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        if (data.requireOTP) {
          setOtpData({
            username: formData.username,
            otpSecret: data.otpSecret
          });
        } else {
          navigate('/');
        }
      } else if (response.status === 429) {
        setLockoutUntil(new Date(data.lockoutUntil));
      } else {
        setFailedAttempts(prev => prev + 1);
        if (failedAttempts >= 4) {
          setLockoutUntil(new Date(Date.now() + 15 * 60 * 1000));
        }
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);  // Debug log
      setError('Unable to connect to server. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLockoutEnd = () => {
    setLockoutUntil(null);
    setFailedAttempts(0);
  };

  return (
    <>
      {otpData ? (
        <OTPVerification
          username={otpData.username}
          otpSecret={otpData.otpSecret}
          onBack={() => setOtpData(null)}
        />
      ) : lockoutUntil ? (
        <LockoutScreen
          lockoutUntil={lockoutUntil}
          onLockoutEnd={handleLockoutEnd}
        />
      ) : (
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <PasswordInput
                value={formData.password}
                onChange={handleChange}
                name="password"
              />
            </div>

            <button
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl text-base font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
              type="submit"
            >
              Sign in
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or continue with</span>
            </div>
          </div>

          <div className="space-y-4">
            <GoogleLogin
              onSuccess={credentialResponse => {
                console.log(credentialResponse);
              }}
              onError={() => {
                console.log('Login Failed');
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Login; 