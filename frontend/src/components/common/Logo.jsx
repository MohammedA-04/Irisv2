import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center">
      <span className="text-2xl tracking-tight font-bold" style={{ fontFamily: 'var(--font-clash-display, sans-serif)' }}>
        Project-<span className="font-bold">Iris</span>.com
      </span>
    </Link>
  );
};

export default Logo; 