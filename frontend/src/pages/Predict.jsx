import React, { useState } from 'react';
import { FiUpload, FiSearch, FiCheckCircle } from 'react-icons/fi';
import { FaInstagram, FaTwitter, FaFacebook, FaTiktok } from 'react-icons/fa';

const Predict = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="w-32 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center mb-8 transition-colors
              ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'}
              hover:border-green-400`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Drag Drop File</h2>
              <div className="text-gray-500">
                <p>1. Select "Model" and Click on enter</p>
              </div>
              <input
                type="file"
                id="fileInput"
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,.pdf"
              />
              <label
                htmlFor="fileInput"
                className="inline-block px-6 py-2 bg-green-500 text-white rounded-full cursor-pointer hover:bg-green-600 transition-colors"
              >
                Choose File
              </label>
              {file && <p className="text-green-600">File selected: {file.name}</p>}
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StepCard
              icon={<FiUpload className="w-6 h-6" />}
              step="Step 1"
              title="Upload File"
              description="Smart File Type Is Supported"
            />
            <StepCard
              icon={<FiSearch className="w-6 h-6" />}
              step="Step 2"
              title="Select Model"
              description="From the dropdown provided"
            />
            <StepCard
              icon={<FiCheckCircle className="w-6 h-6" />}
              step="Step 3"
              title="Get Results"
              description=""
            />
          </div>

          {/* Social Links */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">To Hear Latest Follow Us On</p>
            <div className="flex justify-center space-x-4">
              <SocialIcon icon={<FaInstagram />} color="text-pink-500" />
              <SocialIcon icon={<FaTwitter />} color="text-blue-400" />
              <SocialIcon icon={<FaFacebook />} color="text-blue-600" />
              <SocialIcon icon={<FaTiktok />} color="text-black" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StepCard = ({ icon, step, title, description }) => (
  <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
    <div className="text-green-500 mb-2">{icon}</div>
    <p className="text-sm text-gray-500">{step}</p>
    <h3 className="font-semibold mb-1">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </div>
);

const SocialIcon = ({ icon, color }) => (
  <a href="#" className={`${color} hover:opacity-75 transition-opacity`}>
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md">
      {icon}
    </div>
  </a>
);

export default Predict;