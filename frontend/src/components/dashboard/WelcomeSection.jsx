import React from 'react';

const WelcomeSection = ({ username }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h1 className="text-3xl font-bold text-gray-800">Hello, {username}! 👋</h1>
      <p className="text-gray-600 mt-2">Welcome back to your dashboard.</p>
    </div>
  );
};

export default WelcomeSection; 