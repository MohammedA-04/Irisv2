import React, { useState } from 'react';
import { FiUpload, FiSearch, FiCheckCircle } from 'react-icons/fi';
import { FaInstagram, FaTwitter, FaFacebook, FaTiktok } from 'react-icons/fa';

const Predict = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState('Image');
  const [selectedModel, setSelectedModel] = useState('Dima Image Model');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Deepfake Detection</h1>
          <p className="text-gray-600 mt-2">Upload your content for instant analysis</p>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Model Selection Bar */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-8">
            <div className="flex gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Image">Image</option>
                <option value="Video">Video</option>
                <option value="Audio">Audio</option>
              </select>

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Dima Image Model">Dima Image Model</option>
                <option value="Other Model">Other Model</option>
              </select>
            </div>

            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Analyze
            </button>
          </div>

          {/* Upload Area */}
          <div
            className={`
              border-2 border-dashed rounded-xl p-12
              flex flex-col items-center justify-center
              transition-colors cursor-pointer mb-12
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
            `}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const droppedFile = e.dataTransfer.files[0];
              setFile(droppedFile);
            }}
          >
            <FiUpload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag and drop your file here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse from your computer
            </p>
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
              accept="image/*,.pdf"
            />
            {file && (
              <div className="mt-4 text-sm text-blue-600">
                Selected: {file.name}
              </div>
            )}
          </div>

          {/* Steps Section */}
          <div className="border-t border-gray-100 pt-12 mb-12">
            <h2 className="text-2xl font-semibold text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepCard
                icon={<FiUpload className="w-8 h-8" />}
                step="Step 1"
                title="Upload File"
                description="Ensure your file type is supported (images, videos, or audio)"
              />
              <StepCard
                icon={<FiSearch className="w-8 h-8" />}
                step="Step 2"
                title="Select Model"
                description="Choose the appropriate AI model for your content type"
              />
              <StepCard
                icon={<FiCheckCircle className="w-8 h-8" />}
                step="Step 3"
                title="Get Results"
                description="Receive detailed analysis of your content's authenticity"
              />
            </div>
          </div>

          {/* Social Links Section */}
          <div className="border-t border-gray-100 pt-8">
            <div className="text-center">
              <p className="text-gray-600 mb-6">Stay Updated With Our Latest Features</p>
              <div className="flex justify-center space-x-6">
                <SocialIcon icon={<FaInstagram />} color="text-pink-500" link="https://instagram.com" />
                <SocialIcon icon={<FaTwitter />} color="text-blue-400" link="https://twitter.com" />
                <SocialIcon icon={<FaFacebook />} color="text-blue-600" link="https://facebook.com" />
                <SocialIcon icon={<FaTiktok />} color="text-black" link="https://tiktok.com" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Card Component
const StepCard = ({ icon, step, title, description }) => (
  <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
    <div className="flex flex-col items-center text-center">
      <div className="text-blue-500 bg-blue-50 p-4 rounded-full mb-4">
        {icon}
      </div>
      <p className="text-sm font-medium text-blue-500 mb-2">{step}</p>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

// Social Icon Component
const SocialIcon = ({ icon, color, link }) => (
  <a 
    href={link} 
    target="_blank" 
    rel="noopener noreferrer" 
    className={`${color} hover:opacity-75 transition-opacity`}
  >
    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      {icon}
    </div>
  </a>
);

export default Predict;