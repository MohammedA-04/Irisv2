import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpenIcon, 
  BeakerIcon, 
  EyeIcon 
} from '@heroicons/react/24/outline';

const QuickLinks = () => {
  const links = [
    {
      title: "Learn More About Deepfakes",
      icon: <BookOpenIcon className="w-6 h-6" />,
      href: "/learn",
      arrow: true
    },
    {
      title: "Try Our Dima Model",
      icon: <BeakerIcon className="w-6 h-6" />,
      href: "/predict/image",
      arrow: true
    },
    {
      title: "See Our Mission",
      icon: <EyeIcon className="w-6 h-6" />,
      href: "/about",
      arrow: true
    }
  ];

  return (
    <div className="container mx-auto px-4 mb-8">
      <h2 className="text-xl font-bold mb-6">Quick Links</h2>
      <div className="grid grid-cols-2 gap-4">
        {links.map((link, index) => (
          <Link
            key={index}
            to={link.href}
            className="group relative flex items-center justify-between bg-white/50 backdrop-blur-sm 
                     border border-gray-200 rounded-2xl p-6 hover:bg-white 
                     transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-xl">
                {link.icon}
              </div>
              <span className="text-lg font-medium" style={{ fontFamily: 'var(--font-satoshi, sans-serif)' }}>
                {link.title}
              </span>
            </div>

            {/* Right side icons */}
            <div className="flex items-center">
              {link.lightBulb && (
                <span className="text-2xl">💡</span>
              )}
              {link.arrow && (
                <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
              {link.target && (
                <span className="text-2xl">🎯</span>
              )}
            </div>
          </Link>
        ))}
        {/* Empty spot in the grid */}
        <div className="border border-dashed border-gray-200 rounded-2xl p-6 flex items-center justify-center text-gray-400">
          Coming Soon
        </div>
      </div>
    </div>
  );
};

export default QuickLinks; 