import React from 'react';
import { Link } from 'react-router-dom';
import brainIcon from '../../assets/BrainIconImage-removebg.png';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-3">
      <span
        className="text-2xl font-bold tracking-wide"
        style={{
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          letterSpacing: '0.06em',
          fontWeight: '600',
          borderRadius: '4px'
        }}
      >
        {/* Style for IRIS in span and then another span for AI style */}
        IRIS <span className="text-green-400">AI</span>
      </span>

      {/* Logo Rendered */}
      <img
        src={brainIcon}
        alt="IRIS AI Brain Icon"
        className="w-8 h-8"
        style={{
          // filter: 'brightness(0) invert(1)', // Makes the icon white
          objectFit: 'contain'
        }}
      />
    </Link>
  );
};

export default Logo; 