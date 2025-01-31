import React from 'react';

const Home = ({ user }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-200 flex items-center justify-center">
      <div className="bg-white bg-opacity-90 rounded-3xl shadow-xl p-12 text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          Hello, {user?.username || 'User'}!
        </h1>
        <p className="text-green-500 text-lg">
          Welcome to your dashboard
        </p>
      </div>
    </div>
  );
};

export default Home; 