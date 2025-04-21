import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import Logo from './Logo';
import Navi from './Navi';
import brainIcon from '../../assets/BrainIconImage-removebg.png';

/**
 * Navbar component
 * @Parent App
 * @returns {JSX.Element}
 * @description Navbar component displays navigation links and authentication buttons.
 */
const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkStyle = {
    position: 'relative',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.25rem',
    fontFamily: 'var(--font-satoshi, sans-serif)',
    transition: 'all 0.2s ease-in-out',
  };

  // Default display name if user exists but name is not available
  const displayName = user?.name || user?.email || "User";

  return (
    <nav className="sticky top-0 z-50 bg-green-900/95 backdrop-blur-sm shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Waffle Menu, Logo and Name */}
          <div className="flex items-center space-x-4">
            <Navi />
            <div className="text-white">
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
                  IRIS <span className="text-green-400">AI</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Navigation Links with evenly spaced items and larger brain icon */}
          <div className="hidden md:flex items-center -ml-16">
            <Link
              to="/how-it-works"
              className="text-white hover:text-black hover:bg-lime-400 transition-all duration-200 mx-5"
              style={navLinkStyle}
            >
              How it Works
            </Link>

            <div className="flex items-center mx-5">
              <Link
                to="/predict/image"
                className="text-white hover:text-black hover:bg-lime-400 transition-all duration-200 mr-4"
                style={navLinkStyle}
              >
                Predict
              </Link>

              {/* Larger brain icon in the middle */}
              <img
                src={brainIcon}
                alt="IRIS AI Brain Icon"
                className="pl-5 w-20 h-20"
                style={{
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 4px rgba(74, 222, 128, 0.5))'
                }}
              />
            </div>
            <Link
              to="/guide"
              className="text-white hover:text-black hover:bg-lime-400 transition-all duration-200 mx-5"
              style={navLinkStyle}
            >
              Learning Hub
            </Link>
            <Link
              to="/about"
              className="text-white hover:text-black hover:bg-lime-400 transition-all duration-200 mx-5"
              style={navLinkStyle}
            >
              About
            </Link>
          </div>

          {/* Right side: Auth buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                {/* User Profile Section */}
                <div className="flex items-center space-x-2 text-white px-3 py-2 rounded-lg bg-green-800/40">
                  <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center text-green-900 font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium" style={{ fontFamily: 'var(--font-satoshi, sans-serif)' }}>
                    {displayName}
                  </span>
                </div>

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
                className="bg-green-400/45 text-white px-4 py-2 rounded-lg font-bold hover:bg-lime-400 hover:text-black transition duration-300"
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