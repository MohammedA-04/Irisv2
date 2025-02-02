import React from 'react';

const SolutionsStats = () => {
  const solutions = [
    {
      value: "External Models",
      description: "Using existing Hugging Face Model's and then adding further techniques upon it"
    },
    {
      value: "45%",
      description: "Aim is to teach people of what deepfakes are, dangers of them, how to spot them and provide support",
      source: "https://www.ofcom.org.uk/online-safety/illegal-and-harmful-content/deepfakes-demean-defraud-disinform/?utm_source=chatgpt.com"
    },
    {
      value: "Gen-AI Analysis",
      description: "Results of classification model will be interpreted by AI to depict root cause given classification"
    }
  ];

  return (
    <div className="w-full bg-green-100">
      <div className="w-full px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-12 tracking-wider">
          OUR SOLUTION
        </h2>
        <div className="space-y-16">
          {solutions.map((solution, index) => (
            <div key={index} className="relative pb-12">
              <div className="grid grid-cols-12 gap-8">
                {/* Left side - Value */}
                <div className="col-span-4">
                  <div className="text-5xl font-light text-gray-900 tracking-tight"
                       style={{ 
                         fontFamily: 'var(--font-clash-display, sans-serif)',
                         letterSpacing: '-0.04em'
                       }}>
                    {solution.value}
                  </div>
                </div>

                {/* Right side - Description */}
                <div className="col-span-8 pt-4">
                  <p className="text-lg text-left text-gray-800 leading-relaxed font-bold" 
                     style={{ 
                       fontFamily: 'var(--font-satoshi, sans-serif)',
                       fontWeight: 800,
                     }}>
                    {/* Remove the reference from description */}
                    {solution.value === "45%" 
                      ? "Aim is to teach people of what deepfakes are, dangers of them, how to spot them and provide support"
                      : solution.description
                    }
                  </p>
                  {/* Show reference on new line */}
                  {solution.value === "45%" && (
                    <div className="text-right mt-4">
                      <a 
                        href={solution.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-700 hover:text-blue-800 font-medium"
                        style={{ fontFamily: 'var(--font-satoshi, sans-serif)' }}
                      >
                        [Ofcom, 2024]
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
              {/* Horizontal line */}
              {index !== solutions.length - 1 && (
                <div className="absolute bottom-0 left-0 right-0 border-b border-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SolutionsStats;