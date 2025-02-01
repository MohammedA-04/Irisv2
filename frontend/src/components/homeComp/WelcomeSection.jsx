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
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-2">
        Welcome, {username ? username : 'User'}!
      </h1>
      <p className="text-gray-600 mt-2">Welcome back to your dashboard.</p>
    </div>
  );
};

export default WelcomeSection; 