import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import Logo from './Logo';
import Navi from './Navi';


/**
 * Navbar component
 * @Parent App
 * @returns {JSX.Element}
 * @description Navbar component displays navigation links and authentication buttons.
 */
const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-green-900/95 backdrop-blur-sm shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Waffle Menu, Logo and Name */}
          <div className="flex items-center space-x-4">
            <Navi />
            <div className="text-white">
              <Logo />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/how-it-works" 
              className="text-white hover:text-gray-200 transition-colors duration-200"
              style={{ fontFamily: 'var(--font-satoshi, sans-serif)' }}
            >
              How it Works
            </Link>
            <Link 
              to="/about" 
              className="text-white hover:text-gray-200 transition-colors duration-200"
              style={{ fontFamily: 'var(--font-satoshi, sans-serif)' }}
            >
              About
            </Link>
            <Link 
              to="/press" 
              className="text-white hover:text-gray-200 transition-colors duration-200"
              style={{ fontFamily: 'var(--font-satoshi, sans-serif)' }}
            >
              Press
            </Link>
          </div>

          {/* Right side: Auth buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <Link 
                  to="/predict/image" 
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                  style={{ fontFamily: 'var(--font-satoshi, sans-serif)' }}
                >
                  Predict
                </Link>
                <button
                  onClick={handleLogout}
                  className="py-2 px-4 bg-rose-500/80 hover:bg-rose-600 text-white rounded transition duration-300"
                  style={{ fontFamily: 'var(--font-satoshi, sans-serif)' }}
                >
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="bg-green-400/45 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-400/100 transition duration-300"
                style={{ fontFamily: 'var(--font-satoshi, sans-serif)' }}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button - Only shows on mobile */}
          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 