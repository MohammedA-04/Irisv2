import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';

const Navi = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPredictHovering, setIsPredictHovering] = useState(false);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Guide', path: '/guide' },
    {
      name: 'Predict',
      submenu: [
        { name: 'Image', path: '/predict/image' },
        { name: 'Video', path: '/predict/video' },
        { name: 'Audio', path: '/predict/audio' },
        { name: 'Text', path: '/predict/text' },
      ],
    },
    { name: 'Account', path: '/account' },
  ];

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setIsPredictHovering(false);
      }}
    >
      <button className="flex items-center justify-center p-1 rounded-md hover:bg-gray-100 focus:outline-none">
        <div className="grid grid-cols-3 gap-0.5 p-1">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-sm bg-black"
            />
          ))}
        </div>
      </button>

      <Transition
        show={isHovering}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-in"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <div className="absolute left-0 w-56 mt-2 origin-top-left bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1">
            {menuItems.map((item) => (
              <div key={item.name}>
                {item.submenu ? (
                  <div 
                    className="relative"
                    onMouseEnter={() => setIsPredictHovering(true)}
                    onMouseLeave={() => setIsPredictHovering(false)}
                  >
                    <button
                      className={`group flex rounded-md items-center w-full px-3 py-2 text-sm relative hover:bg-gray-100`}
                    >
                      {item.name}
                      <svg
                        className="w-4 h-4 ml-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                    
                    <Transition
                      show={isPredictHovering}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <div className="absolute left-full top-0 w-48 -ml-1 transform -translate-x-0 translate-y-0">
                        <div className="rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.path}
                              className="flex rounded-md items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </Transition>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className="flex rounded-md items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default Navi; 