import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './Login';
import Register from './Register';


/**
 * AuthTabs component
 * @returns {JSX.Element}
 * @description component displays <login/> and <register/> tabs.
 */
const AuthTabs = () => {
  console.log("This is AuthTabs.jsx");
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-semibold text-gray-900 tracking-tight">
            Welcome to IrisAI
          </h1>
          <p className="text-lg text-gray-600 mt-3">Advanced Detection Platform</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8 shadow-inner">
          <button
            className={`flex-1 py-3 px-6 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'login'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-3 px-6 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'register'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('register')}
          >
            Sign Up
          </button>
        </div>

        {/* Form Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            {/* default: <Login/> will be shown and highlighted */}
            {activeTab === 'login' ? <Login /> : <Register />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthTabs; 