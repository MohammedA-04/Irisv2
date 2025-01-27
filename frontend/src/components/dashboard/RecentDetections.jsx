import React from 'react';

const RecentDetections = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Detections</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 hover:shadow-md transition duration-300">
          <p className="text-gray-600">No recent detections</p>
        </div>
      </div>
    </div>
  );
};

export default RecentDetections; 