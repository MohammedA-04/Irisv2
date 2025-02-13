import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Home page component
 * @returns {JSX.Element}
 * @description Main landing page after successful login [(login -> otp ? register -> login -> otp) -> home]
 */

const Home = () => {
  const navigate = useNavigate();

  const scrollToSection = () => {
    const element = document.getElementById('dima-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-clde-lgreen/60">
      {/* Hero Section - Modified to cover full viewport */}
      <div className="h-screen flex flex-col justify-center items-center px-4">
        <div className="max-w-6xl mx-auto text-center -mt-60">
          <motion.h1
            className="text-6xl font-light mb-8 font-satoshi"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Introducing
          </motion.h1>

          <motion.h1
            className="text-7xl font-bold mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            IrisAI.
          </motion.h1>

          <motion.p
            className="text-2xl text-gray-30 mt-10 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Advanced deepfake detection powered by AI. Upload any image and get instant analysis on its authenticity.
          </motion.p>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              onClick={() => navigate('/predict/image')}
              className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Try IrisAI →
            </motion.button>

            <motion.button
              onClick={() => navigate('/guide')}
              className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Learn about IrisAI
            </motion.button>
          </div>

          {/* Date and Type */}
          <motion.div
            className="mt-8 text-gray-500 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <span className="mr-4 font-semibold">2024</span>
            <span className="font-semibold">Deepfake Detection</span>
          </motion.div>
        </div>

        {/* Arrow Button */}
        <motion.div className="absolute bottom-12">
          <motion.button
            onClick={scrollToSection}
            className="px-4 py-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all flex items-center gap-2"
            whileHover={{ y: 5 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span className="text-sm font-medium">News</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </motion.button>
        </motion.div>
      </div>

      {/* Dima Section */}
      <div id="dima-section" className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-4 py-24">
          <div className="flex flex-col items-start">
            <motion.h2
              className="text-6xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Introducing Dima
            </motion.h2>

            <div className="flex items-center gap-4 mt-4 mb-12">
              <span className="text-gray-600">Product</span>
              <span className="text-gray-400">Feb 2, 2025</span>
              <span className="text-gray-400">8 min read</span>
            </div>

            {/* Learn More Button */}
            <motion.button
              onClick={() => {
                const element = document.getElementById('research-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-gray-100 rounded-full text-gray-900 hover:bg-gray-200 transition-all flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Learn more <span className="text-lg">↓</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Research Content Section */}
      <div id="research-section" className="w-full bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-24">
          <div className="prose max-w-none">
            <h3 className="text-4xl font-bold mb-8">Pushing the frontier of cost-effective reasoning</h3>
            <p className="text-xl text-gray-600 mb-6">
              Advanced research and development in AI technology enables more accurate and efficient deepfake detection.
            </p>
            {/* Add more content as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;