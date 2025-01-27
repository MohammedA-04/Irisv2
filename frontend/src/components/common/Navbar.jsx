import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Navi from './Navi';

const Navbar = ({ isAuthenticated, logout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/20 backdrop-blur-md shadow-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Waffle Menu, Logo and Name */}
          <div className="flex items-center space-x-3">
            <Navi />
            <Logo />
          </div>

          {/* Right side: Empty or future elements */}
          <div className="flex items-center">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="py-2 px-4 bg-rose-500/80 hover:bg-rose-600 text-white rounded transition duration-300"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 