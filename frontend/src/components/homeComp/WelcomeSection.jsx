import React from 'react';

/**
 * WelcomeSection component
 * @Parent Home
 * @returns {JSX.Element}
 * @description Displays a welcome message to the user
 */

const WelcomeSection = ({ username }) => {
  console.log("WelcomeSection received username:", username);
  
  return (
    <div className="py-8">
      <h1 className="text-6xl font-bold tracking-tight">
        <span className="text-gray-800">Hello, </span>
        <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
          {username || 'User'}
        </span>
      </h1>
      <p className="mt-4 text-lg text-gray-600" style={{ fontFamily: 'var(--font-satoshi, sans-serif)' }}>
        Welcome back to your dashboard.
      </p>
    </div>
  );
};

export default WelcomeSection; 