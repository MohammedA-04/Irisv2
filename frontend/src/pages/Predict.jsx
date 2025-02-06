import React, { useState } from 'react';
import { FiUpload, FiSearch, FiCheckCircle, FiArrowUp } from 'react-icons/fi';
import { FaInstagram, FaTwitter, FaFacebook, FaTiktok } from 'react-icons/fa';

const Predict = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState('Image');
  const [selectedModel, setSelectedModel] = useState('Dima Image Model');

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

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  const handleSubmit = () => {
    console.log('Submitting:', { file, selectedType, selectedModel });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center mb-4 transition-colors
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

          {/* Curved container for buttons - bottom half only */}
          <div className="relative mb-8">
            {/* Background with top half hidden */}
            <div 
              className="absolute inset-0 bg-gray-100 rounded-[48px] overflow-hidden"
              style={{
                clipPath: 'inset(50% 0 0 0)',  // Clips top half
                transform: 'translateY(-25%)'   // Moves the container up
              }}
            ></div>
            
            {/* Content container */}
            <div
              className="relative flex justify-end items-center space-x-2 p-4 pr-6"
              style={{ marginTop: '-2rem' }}
            >
              <div className="flex items-center space-x-4">
                <SelectInput
                  value={selectedType}
                  onChange={handleTypeChange}
                  options={[
                    { value: 'Image', label: 'Image' },
                    { value: 'Video', label: 'Video' },
                    { value: 'Audio', label: 'Audio' }
                  ]}
                />

                <SelectInput
                  value={selectedModel}
                  onChange={handleModelChange}
                  options={[
                    { value: 'Dima Image Model', label: 'Dima Image Model' },
                    { value: 'Other Model', label: 'Other Model' }
                  ]}
                />

                <button
                  onClick={handleSubmit}
                  className="p-2 bg-white rounded-full hover:bg-gray-300 transition-colors"
                >
                  <FiArrowUp className="w-5 h-5 text-black font-bold" />
                </button>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StepCard
              icon={<FiUpload className="w-6 h-6" />}
              step="Step 1"
              title="Upload File"
              description="Ensure File Type Is Supported"
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

// New reusable select component
const SelectInput = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={onChange}
    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white appearance-none cursor-pointer"
  >
    {options.map(option => (
      <option
        key={option.value}
        value={option.value}
        className={`
          text-gray-900
          ${value === option.value ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'}
        `}
        disabled={value === option.value}
      >
        {option.label}
      </option>
    ))}
  </select>
);

export default Predict;