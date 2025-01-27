import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      });

      if (response.ok) {
        navigate('/');
      } else {
        const data = await response.json();
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Failed to verify OTP');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Enter Verification Code
        </h2>
        <p className="text-gray-600 mb-6">
          Please enter the verification code sent to your email
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl text-base font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP; 