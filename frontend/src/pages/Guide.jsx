import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaCheck, FaTimes, FaImage } from 'react-icons/fa';

const Guide = () => {
    const [currentSection, setCurrentSection] = useState(1);
    const [currentUnit, setCurrentUnit] = useState(1);
    const [showQuiz, setShowQuiz] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState({});

    // Define sections content
    const sections = [
        {
            id: 1,
            title: "What Deepfakes Are?",
            units: [
                {
                    id: 1,
                    topic: "What is a deepfake?",
                    content: `Introduction to Deepfakes
                    
                    Deepfakes are synthetic media where a person's likeness is replaced with someone else's using artificial intelligence and machine learning techniques. 
                    
                    The term "deepfake" combines "deep learning" and "fake," reflecting how these AI systems learn to generate realistic but fabricated content.
                    
                    Deepfakes can alter faces in videos and images, clone voices, and even create entirely fictional scenes that appear authentic to the human eye.`,
                    quiz: {
                        question: "What technology is primarily used to create deepfakes?",
                        options: [
                            { id: 1, text: "Artificial Intelligence" },
                            { id: 2, text: "Basic Photoshop" },
                            { id: 3, text: "Traditional CGI" },
                            { id: 4, text: "Simple Video Editing" }
                        ],
                        correctAnswers: [1]
                    }
                },
                {
                    id: 2,
                    topic: "History of Deepfakes",
                    content: `History of Deepfakes
                    
                    While the term "deepfake" emerged around 2017, the technology has roots in academic research on generative adversarial networks (GANs) from 2014.
                    
                    Early deepfakes appeared in online forums, often creating celebrity face-swaps in various contexts without consent.
                    
                    The technology quickly evolved from requiring extensive technical knowledge to becoming accessible through consumer apps and software.`,
                    quiz: {
                        question: "When did the term 'deepfake' become widely known?",
                        options: [
                            { id: 1, text: "2010" },
                            { id: 2, text: "2017" },
                            { id: 3, text: "2005" },
                            { id: 4, text: "2020" }
                        ],
                        correctAnswers: [2]
                    }
                }
            ]
        },
        {
            id: 2,
            title: "Types of Deepfakes",
            units: [
                {
                    id: 1,
                    topic: "Face Swap Deepfakes",
                    content: `Face Swap Deepfakes
                    
                    Face swap is the most common type of deepfake, where a person's face is replaced with someone else's in images or videos.
                    
                    This technique analyzes facial features and expressions from source material and applies them to target footage.
                    
                    Advanced face swaps can maintain consistency across different angles, lighting conditions, and expressions.`,
                    quiz: {
                        question: "What is being analyzed in face swap deepfakes?",
                        options: [
                            { id: 1, text: "Background scenes" },
                            { id: 2, text: "Clothing styles" },
                            { id: 3, text: "Facial features and expressions" },
                            { id: 4, text: "Camera quality" }
                        ],
                        correctAnswers: [3]
                    }
                },
                {
                    id: 2,
                    topic: "Voice Cloning",
                    content: `Voice Cloning
                    
                    Voice cloning creates synthetic speech that mimics a specific person's voice characteristics, tone, and speaking patterns.
                    
                    Modern voice cloning can generate new speech from just minutes of sample audio, allowing for the creation of statements never actually said by the person.
                    
                    This technology has applications in assistive technology but also raises concerns about audio-based misinformation.`,
                    quiz: {
                        question: "How much sample audio is needed for modern voice cloning?",
                        options: [
                            { id: 1, text: "Several hours" },
                            { id: 2, text: "Just minutes" },
                            { id: 3, text: "At least a day" },
                            { id: 4, text: "Weeks of recordings" }
                        ],
                        correctAnswers: [2]
                    }
                }
            ]
        },
        {
            id: 3,
            title: "How Deepfakes Work",
            units: [
                {
                    id: 1,
                    topic: "AI and Neural Networks",
                    content: `AI and Neural Networks
                    
                    Deepfakes utilize deep neural networks, particularly autoencoders and generative adversarial networks (GANs).
                    
                    The encoder network learns to reduce face images to essential features, while the decoder reconstructs them.
                    
                    Through extensive training, these networks learn to transform one person's facial expressions onto another person's face.`,
                    quiz: {
                        question: "Which of these are neural network types used in deepfake creation?",
                        options: [
                            { id: 1, text: "Autoencoders" },
                            { id: 2, text: "Generative Adversarial Networks" },
                            { id: 3, text: "Both A and B" },
                            { id: 4, text: "Neither A nor B" }
                        ],
                        correctAnswers: [3]
                    }
                },
                {
                    id: 2,
                    topic: "The Creation Process",
                    content: `The Creation Process
                    
                    Creating a high-quality deepfake typically involves collecting many sample images of both source and target faces from multiple angles.
                    
                    The AI system is trained on these datasets to extract facial features and learn how to map expressions between individuals.
                    
                    Post-processing techniques such as color correction and edge blending are applied to increase realism and hide artifacts.`,
                    quiz: {
                        question: "What is important to collect for creating high-quality deepfakes?",
                        options: [
                            { id: 1, text: "Many sample images from multiple angles" },
                            { id: 2, text: "Just one good photo" },
                            { id: 3, text: "Only voice recordings" },
                            { id: 4, text: "Written descriptions" }
                        ],
                        correctAnswers: [1]
                    }
                }
            ]
        },
        {
            id: 4,
            title: "Detecting Deepfakes",
            units: [
                {
                    id: 1,
                    topic: "Visual Cues",
                    content: `Visual Cues
                    
                    Early deepfakes often contained visual artifacts that betrayed their synthetic nature, such as unnatural blinking patterns or inconsistent shadows.
                    
                    Skin texture inconsistencies, strange lighting effects, and blurry face boundaries can indicate manipulation.
                    
                    Unnatural head positions, movements, or facial expressions that seem mechanically perfect may suggest AI generation.`,
                    quiz: {
                        question: "Which of these could be a visual sign of a deepfake?",
                        options: [
                            { id: 1, text: "Consistent lighting" },
                            { id: 2, text: "Unnatural blinking patterns" },
                            { id: 3, text: "Perfectly natural skin texture" },
                            { id: 4, text: "Normal facial expressions" }
                        ],
                        correctAnswers: [2]
                    }
                },
                {
                    id: 2,
                    topic: "AI Detection Tools",
                    content: `AI Detection Tools
                    
                    Advanced detection systems like IrisAI analyze digital fingerprints and inconsistencies invisible to the human eye.
                    
                    These tools examine compression artifacts, noise patterns, and pixel-level anomalies that occur during the deepfake generation process.
                    
                    Machine learning models trained on both real and fake media can identify subtle patterns that distinguish synthetic content.`,
                    quiz: {
                        question: "What do advanced deepfake detection tools analyze?",
                        options: [
                            { id: 1, text: "Only file size" },
                            { id: 2, text: "Only video length" },
                            { id: 3, text: "Digital fingerprints and inconsistencies" },
                            { id: 4, text: "Only color patterns" }
                        ],
                        correctAnswers: [3]
                    }
                }
            ]
        },
        {
            id: 5,
            title: "Protecting Yourself",
            units: [
                {
                    id: 1,
                    topic: "Critical Media Literacy",
                    content: `Critical Media Literacy
                    
                    Developing critical media literacy involves questioning the source, context, and purpose of content you encounter online.
                    
                    Check if the content appears on multiple reputable sources or if it's limited to a single platform.
                    
                    Be especially cautious of emotionally charged or divisive content, as these are often targets for manipulation.`,
                    quiz: {
                        question: "What should you do when encountering suspicious content?",
                        options: [
                            { id: 1, text: "Share it immediately" },
                            { id: 2, text: "Check if it appears on multiple reputable sources" },
                            { id: 3, text: "Assume it's real if it looks convincing" },
                            { id: 4, text: "Ignore source information" }
                        ],
                        correctAnswers: [2]
                    }
                },
                {
                    id: 2,
                    topic: "Verification Methods",
                    content: `Verification Methods
                    
                    Use reverse image search tools to check if an image has been manipulated or taken out of context.
                    
                    Pay attention to official verification from the individuals supposedly shown in the content.
                    
                    Consider using tools like IrisAI to analyze suspicious media for potential deepfake characteristics.`,
                    quiz: {
                        question: "Which tool can help verify if an image has been manipulated?",
                        options: [
                            { id: 1, text: "Social media likes" },
                            { id: 2, text: "Reverse image search" },
                            { id: 3, text: "Word count" },
                            { id: 4, text: "Video length" }
                        ],
                        correctAnswers: [2]
                    }
                }
            ]
        },
        {
            id: 6,
            title: "Future Implications",
            units: [
                {
                    id: 1,
                    topic: "Ethical Considerations",
                    content: `Ethical Considerations
                    
                    The rise of deepfakes raises important questions about consent, privacy, and the potential for misrepresentation.
                    
                    There are ongoing discussions about legal frameworks to address unauthorized synthetic media of real people.
                    
                    Balance must be found between creative freedom and protecting individuals from harm.`,
                    quiz: {
                        question: "What ethical issue is most closely associated with deepfakes?",
                        options: [
                            { id: 1, text: "Software pricing" },
                            { id: 2, text: "Consent and privacy" },
                            { id: 3, text: "Image file sizes" },
                            { id: 4, text: "Video length" }
                        ],
                        correctAnswers: [2]
                    }
                },
                {
                    id: 2,
                    topic: "Technological Arms Race",
                    content: `Technological Arms Race
                    
                    As deepfake technology improves, detection methods must continuously evolve to keep pace.
                    
                    There's an ongoing arms race between deepfake creators and detection technologies like IrisAI.
                    
                    Cross-verification and multi-modal analysis (examining both audio and visual elements) are becoming increasingly important.`,
                    quiz: {
                        question: "What describes the relationship between deepfake creation and detection?",
                        options: [
                            { id: 1, text: "Static and unchanging" },
                            { id: 2, text: "An arms race" },
                            { id: 3, text: "Completely unrelated" },
                            { id: 4, text: "Officially regulated" }
                        ],
                        correctAnswers: [2]
                    }
                }
            ]
        }
    ];

    const currentSectionData = sections[currentSection - 1];
    const currentUnitData = currentSectionData?.units[currentUnit - 1];

    const handleOptionSelect = (optionId) => {
        setSelectedOptions(prev => {
            const newSelected = { ...prev };

            // If option is already selected, unselect it
            if (newSelected[optionId]) {
                delete newSelected[optionId];
            } else {
                // Otherwise select it
                newSelected[optionId] = true;
            }

            return newSelected;
        });
    };

    const nextUnit = () => {
        if (currentUnit < currentSectionData.units.length) {
            setCurrentUnit(currentUnit + 1);
            setShowQuiz(false);
            setSelectedOptions({});
        } else if (currentSection < sections.length) {
            setCurrentSection(currentSection + 1);
            setCurrentUnit(1);
            setShowQuiz(false);
            setSelectedOptions({});
        }
    };

    const prevUnit = () => {
        if (currentUnit > 1) {
            setCurrentUnit(currentUnit - 1);
            setShowQuiz(false);
            setSelectedOptions({});
        } else if (currentSection > 1) {
            setCurrentSection(currentSection - 1);
            setCurrentUnit(sections[currentSection - 2].units.length);
            setShowQuiz(false);
            setSelectedOptions({});
        }
    };

    const startQuiz = () => {
        setShowQuiz(true);
    };

    const isOptionSelected = (optionId) => {
        return selectedOptions[optionId] || false;
    };

    // Main content component - shows either learning content or quiz
    const renderMainContent = () => {
        if (showQuiz) {
            // Quiz view
            return (
                <div className="bg-yellow-100 rounded-xl p-8 w-full h-full">
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={() => setShowQuiz(false)}
                            className="text-black hover:text-gray-700"
                        >
                            <FaArrowLeft size={24} />
                        </button>

                        <h3 className="text-xl font-semibold">Quiz</h3>

                        <div className="text-xl font-semibold">
                            {currentSection}/{sections.length}
                        </div>
                    </div>

                    <div className="my-8">
                        <div className="bg-white rounded-lg p-6 shadow-md">
                            <div className="mb-6">
                                <h3 className="font-bold text-lg">Question:</h3>
                                <p className="text-lg">{currentUnitData.quiz.question}</p>
                            </div>

                            <div className="space-y-3">
                                {currentUnitData.quiz.options.map(option => (
                                    <div
                                        key={option.id}
                                        onClick={() => handleOptionSelect(option.id)}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors flex justify-between items-center
                        ${isOptionSelected(option.id) ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <span>Option {option.id}: {option.text}</span>
                                        {isOptionSelected(option.id) && (
                                            <div className="bg-emerald-600 text-white p-1 rounded-md">
                                                <FaCheck size={14} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between mt-8">
                        <button
                            onClick={() => setShowQuiz(false)}
                            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 flex items-center"
                        >
                            <FaArrowLeft className="mr-2" /> Back to content
                        </button>

                        <motion.button
                            onClick={nextUnit}
                            className="px-6 py-3 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors flex items-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Continue <FaArrowRight className="ml-2" />
                        </motion.button>
                    </div>
                </div>
            );
        } else {
            // Learning content view
            return (
                <div className="bg-clde-lgreen/60 rounded-xl w-full h-full flex">
                    {/* Left column - Learning content */}
                    <div className="bg-yellow-100 rounded-tl-xl rounded-bl-xl p-6 w-3/5">
                        <div className="bg-yellow-200 p-4 rounded-lg mb-6">
                            <h2 className="text-2xl font-bold">Section {currentSection}: Unit {currentUnit}</h2>
                            <h3 className="text-xl font-semibold">Topic: {currentUnitData.topic}</h3>
                        </div>

                        <div className="bg-yellow-200 p-4 rounded-lg mb-6 flex items-center justify-center">
                            <div className="w-full h-40 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <FaImage className="text-gray-400 text-6xl" />
                            </div>
                        </div>

                        <div className="bg-yellow-200 p-4 rounded-lg whitespace-pre-line">
                            <h3 className="text-xl font-bold mb-2">{currentUnitData.topic}</h3>
                            <p className="text-md">{currentUnitData.content}</p>
                        </div>
                    </div>

                    {/* Right column - Progress visualization */}
                    <div className="bg-clde-lgreen/80 rounded-tr-xl rounded-br-xl p-6 w-2/5 flex flex-col items-center justify-center">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Section {currentSection}</h2>
                            <div className="w-40 mx-auto h-px bg-gray-300 my-2"></div>
                            <h3 className="text-xl">{currentSectionData.title}</h3>
                        </div>

                        <div className="relative flex flex-col items-center">
                            {/* Progress path visualization */}
                            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-4">
                                <FaCheck className="text-white text-2xl" />
                            </div>

                            <div className="h-16 w-1 bg-emerald-500"></div>

                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="h-2 w-2 bg-emerald-500 rounded-full my-1"></div>
                            ))}

                            <div className="h-16 w-1 bg-emerald-500"></div>

                            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-4">
                                <FaCheck className="text-white text-2xl" />
                            </div>

                            <div className="h-16 w-1 bg-gray-300"></div>

                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="h-2 w-2 bg-gray-300 rounded-full my-1"></div>
                            ))}

                            <div className="absolute bottom-0 right-0 transform translate-x-20">
                                <motion.button
                                    onClick={startQuiz}
                                    className="px-6 py-3 bg-yellow-300 text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Continue
                                </motion.button>

                                <div className="mt-4 flex justify-center">
                                    <div className="w-12 h-12 rounded-full bg-yellow-300 flex items-center justify-center">
                                        <span className="text-2xl">★</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-clde-lgreen/60 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-row gap-8">
                    {/* Navigation sidebar */}
                    <div className="bg-emerald-900 text-white rounded-xl p-4 flex flex-col items-center">
                        {sections.map((section) => (
                            <div
                                key={section.id}
                                onClick={() => {
                                    setCurrentSection(section.id);
                                    setCurrentUnit(1);
                                    setShowQuiz(false);
                                }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 cursor-pointer
                        ${currentSection === section.id ? 'bg-white text-emerald-900' :
                                        currentSection > section.id ? 'bg-emerald-500' : 'bg-emerald-700'}`}
                            >
                                {section.id}
                            </div>
                        ))}
                    </div>

                    {/* Main content area */}
                    <div className="flex-1">
                        {renderMainContent()}

                        {/* Bottom navigation */}
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={prevUnit}
                                className={`px-6 py-3 rounded-lg font-semibold flex items-center ${(currentSection > 1 || currentUnit > 1) ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                disabled={currentSection === 1 && currentUnit === 1}
                            >
                                <FaArrowLeft className="mr-2" /> Previous
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
                            >
                                Exit Guide
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Guide;
