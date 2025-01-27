import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const OTPSetup = ({ secret, qrCode, onClose }) => {
  // Debug logging when component mounts
  React.useEffect(() => {
    console.log('OTPSetup mounted with:', {
      secret,
      qrCode
    });
  }, [secret, qrCode]);

  const otpAuthUrl = `otpauth://totp/IrisApp:${secret}?secret=${secret}&issuer=IrisApp`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Set Up Two-Factor Authentication</h2>
        
        <ol className="list-decimal list-inside space-y-4 mb-6">
          <li>Install Google Authenticator or any TOTP app</li>
          <li>Scan this QR code or enter the secret manually</li>
          <li>Enter the 6-digit code when logging in</li>
        </ol>

        <div className="flex flex-col items-center space-y-4 mb-6">
          <QRCodeSVG 
            value={otpAuthUrl}
            size={192}
            level="M"
            className="border-4 border-white rounded-lg"
          />
          <div className="text-sm font-mono bg-gray-100 p-2 rounded select-all">
            {secret}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          I've saved these details
        </button>
      </div>
    </div>
  );
};

export default OTPSetup; 