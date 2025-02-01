import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VerifyOTP = () => {
  console.log("This is VerifyOTP.jsx");

  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      });

      if (response.ok) {
        setError('');
        setIsSuccess(true);
        // Wait for 2 seconds to show success message before redirecting
        setTimeout(() => {
          navigate('/', { state: { message: 'Authentication successful!' } });
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Verify Authenticator Code
        </h2>
        <p className="text-gray-600 mb-6">
          Please enter the code from your authenticator app
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter authenticator code"
              required
              disabled={isLoading || isSuccess}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {isSuccess && (
            <div className="text-green-500 text-sm">
              QR Code verified successfully! Redirecting to sign in...
            </div>
          )}

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-3 px-6 rounded-xl text-base font-medium 
              ${!isLoading && !isSuccess ? 'hover:bg-blue-700' : 'opacity-75 cursor-not-allowed'} 
              transition-colors duration-200`}
            disabled={isLoading || isSuccess}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </div>
            ) : isSuccess ? (
              'Verified!'
            ) : (
              'Verify Code'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP; 