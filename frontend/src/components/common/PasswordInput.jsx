import React, { useState } from 'react';

const PasswordInput = ({ value, onChange, name = "password" }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          name: name,
          value: e.target.value
        }
      });
    }
  };

  return (
    <div className="relative">
      <input
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={handleChange}
        name={name}
        required
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700"
        onClick={() => setShowPassword(!showPassword)}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
    </div>
  );
};

export default PasswordInput; 