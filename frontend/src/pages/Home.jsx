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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <motion.h1 
          className="text-6xl font-bold mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Introducing IrisAI
        </motion.h1>
        
        <motion.p 
          className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
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
            className="px-6 py-3 border border-gray-600 rounded-full font-semibold hover:bg-gray-900 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Learn about IrisAI
          </motion.button>
        </div>

        {/* Date and Type */}
        <motion.div 
          className="mt-16 text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <span className="mr-4">2024</span>
          <span>Deepfake Detection</span>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;