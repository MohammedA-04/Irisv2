import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { API_URLS } from '../../config/api';
import { useNavigate } from 'react-router-dom';

const OTPVerification = ({ username, otpSecret, onBack }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const otpAuthUrl = `otpauth://totp/IrisApp:${username}?secret=${otpSecret}&issuer=IrisApp`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(API_URLS.verifyOtp, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/');
      } else {
        setError(data.message || 'Invalid OTP code');
      }
    } catch (error) {
      setError('Failed to verify OTP. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Two-Factor Authentication</h2>
        <p className="text-gray-600">Enter the 6-digit code from your authenticator app</p>
      </div>

      <div className="flex flex-col items-center space-y-4 mb-6">
        <QRCodeSVG 
          value={otpAuthUrl}
          size={192}
          level="M"
          className="border-4 border-white rounded-lg"
        />
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
        
        <div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={6}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
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