import React from 'react';

const StatsSection = () => {
  const stats = [
    {
      value: "HK $200m",
      description: "British Engineering Firm was tricked in video conference where AI voice and images was used to impersonate senior executives, [Guardian, 2024]"
    },
    {
      value: "50%",
      description: "On average, 40-50% of uploads appear to be manipulated"
    },
    {
      value: "1.8 Billion",
      description: "Nearly 1.8B images and videos are shared on social media platforms every day, 2023",
      source: "Z.Akhtar: Deepfake Generation Survey, 2023"
    }
  ];

  return (
    <div className="w-full bg-white">
      <div className="w-full px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-12 tracking-wider">
          CURRENT STATE
        </h2>
        <div className="space-y-16">
          {stats.map((stat, index) => (
            <div key={index} className="relative pb-12">
              <div className="grid grid-cols-12 gap-8">
                {/* Left side - Number */}
                <div className="col-span-4">
                  <div className="text-5xl font-light text-gray-900 tracking-tight"
                       style={{ 
                         fontFamily: 'var(--font-clash-display, sans-serif)',
                         letterSpacing: '-0.04em'
                       }}>
                    {stat.value}
                  </div>
                </div>

                {/* Right side - Description */}
                <div className="col-span-8 pt-4">
                  <p className="text-xl text-left text-gray-800 leading-relaxed font-bold" 
                     style={{ 
                       fontFamily: 'var(--font-satoshi, sans-serif)',
                       fontWeight: 800,
                     }}>
                    {/* Remove the reference from description */}
                    {stat.value === "HK $200m" 
                      ? "British Engineering Firm was tricked in video conference where AI voice and images was used to impersonate senior executives"
                      : stat.value === "1.8 Billion"
                      ? "Nearly 1.8B images and videos are shared on social media platforms every day, 2023"
                      : stat.description
                    }
                  </p>
                  {/* Show reference on new line */}
                  {stat.value === "HK $200m" && (
                    <p className="text-right mt-4 text-sm text-blue-700">
                      [Guardian, 2024]
                    </p>
                  )}
                  {stat.source && (
                    <div className="text-right mt-4">
                      <a 
                        href="#" 
                        className="inline-flex items-center text-sm text-blue-700 hover:text-blue-800 font-medium"
                        style={{ fontFamily: 'var(--font-satoshi, sans-serif)' }}
                      >
                        {stat.source}
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
              {/* Horizontal line */}
              {index !== stats.length - 1 && (
                <div className="absolute bottom-0 left-0 right-0 border-b border-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;