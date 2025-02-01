import React from 'react';

const QuickLinks = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-blue-100 rounded-lg p-6 shadow-md hover:shadow-lg transition duration-300">
        <h3 className="text-xl font-semibold text-blue-800 mb-2">Recent Activity</h3>
        <p className="text-blue-600">View your recent detection history</p>
      </div>
      
      <div className="bg-green-100 rounded-lg p-6 shadow-md hover:shadow-lg transition duration-300">
        <h3 className="text-xl font-semibold text-green-800 mb-2">Try Detection</h3>
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300">
          Start Detection
        </button>
      </div>
      
      <div className="bg-purple-100 rounded-lg p-6 shadow-md hover:shadow-lg transition duration-300">
        <h3 className="text-xl font-semibold text-purple-800 mb-2">Quick Links</h3>
        <ul className="space-y-2 text-purple-600">
          <li>📊 Statistics</li>
          <li>⚙️ Settings</li>
          <li>📝 Documentation</li>
        </ul>
      </div>
    </div>
  );
};

export default QuickLinks; 