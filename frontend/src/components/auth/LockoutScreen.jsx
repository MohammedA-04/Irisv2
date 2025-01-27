import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LockoutScreen = ({ lockoutUntil, onLockoutEnd }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const endTime = new Date(lockoutUntil).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = endTime - now;
      
      if (difference <= 0) {
        setTimeLeft(0);
        onLockoutEnd();
        return;
      }
      
      setTimeLeft(Math.floor(difference / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [lockoutUntil, onLockoutEnd]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-8 bg-white rounded-2xl shadow-xl text-center"
    >
      <div className="mb-6">
        <svg
          className="mx-auto h-16 w-16 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Account Temporarily Locked
      </h2>
      
      <p className="text-gray-600 mb-6">
        Too many failed login attempts. Please try again in:
      </p>
      
      <div className="text-4xl font-bold text-gray-900 mb-8">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      
      <motion.div
        className="w-full bg-gray-200 h-2 rounded-full overflow-hidden"
        initial={{ width: '100%' }}
      >
        <motion.div
          className="h-full bg-blue-600"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: timeLeft, ease: 'linear' }}
        />
      </motion.div>
    </motion.div>
  );
};

export default LockoutScreen; 