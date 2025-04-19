import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { API_URLS } from '../../config/api';
import { AuthContext } from './AuthContext';

/**
 * OTPVerification component
 * @Parent Login <- AuthTabs
 * @returns {JSX.Element}
 * @description component displays OTP verification form and handles OTP verification process.
 */

const OTPVerification = ({ username, otpSecret, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Array for 6 digits
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Fix the QR code URL format to be compatible with authenticator apps
  const otpAuthUrl = `otpauth://totp/${encodeURIComponent('IrisAI')}:${encodeURIComponent(username)}?secret=${otpSecret}&issuer=${encodeURIComponent('IrisAI')}&algorithm=SHA1&digits=6&period=30`;

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const otpString = otp.join('');

    console.log('Frontend - Submitting OTP:', {
      username,
      otpProvided: otpString,
      currentTime: new Date().toISOString()
    });

    try {
      const response = await fetch(API_URLS.verifyOtp, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          otp: otpString,
        }),
      });

      const data = await response.json();
      console.log('Frontend - Server Response:', data);

      if (response.ok) {
        // Create user data object
        const userData = {
          name: data.username || username,
          email: data.email || username
        };

        // Login with user data
        login(userData);
        navigate('/home', {
          replace: true,
          state: { username }
        });
      } else {
        setError(data.message || 'Invalid OTP code');
      }
    } catch (error) {
      console.error('Frontend - OTP Verification Error:', error);
      setError('Failed to verify OTP. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Two-Factor Authentication</h2>
        <p className="text-gray-600">Scan the QR code with your authenticator app</p>
        <p className="text-sm text-gray-500 mt-2">
          (Google Authenticator, Microsoft Authenticator, or similar)
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <QRCodeSVG
            value={otpAuthUrl}
            size={200}
            level="H"
            includeMargin={true}
            className="border-4 border-white rounded-lg"
          />
        </div>
        <div className="text-sm font-mono bg-gray-100 p-2 rounded select-all">
          {otpSecret}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          disabled={otp.some(digit => !digit)}
        >
          Verify Code
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200"
        >
          Back to Login
        </button>
      </form>
    </div>
  );
};

export default OTPVerification; 