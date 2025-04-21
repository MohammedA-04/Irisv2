import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaImage, FaCode, FaRobot, FaShieldAlt, FaPlay, FaPause, FaShare } from 'react-icons/fa';
import { SiTarget } from "react-icons/si";
import { FaQuestion } from "react-icons/fa";
import RobotThink from '../assets/Robot Think.png';

const HowItWorks = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Define the sections with titles, icons and content
    const sections = [
        {
            id: 1,
            title: "What is IRIS?",
            icon: <FaQuestion className="text-5xl mb-4 text-emerald-600" />,
            content: `IRIS is lifelong project inspired by TrueMedia.org. The attempt is to continue the continuous development and research to find full a proof solution to identify and detecting forged media.
            
            The goal of IRIS is to be the 'learning-hub' for forged content while providing necessary tools for automating detecting tampered media on the fly. Ultimately, this project transcends mere learning and identification; it's integral to a larger vision of establishing an extensible platform for deepfake research `
        },
        {
            id: 2,
            title: "Goals",
            icon: <SiTarget className="text-5xl mb-4 text-emerald-600" />,
            content: `At IRIS we aim to acheive over the course of our tenure:

• Teach people about deepfakes  
• Allowing free and open acess to our models to ingnite ideas
• Inform of various techniques, generation and detection
• Multimodel approach whereby tools are developed to detect for various mediums 
• Maintain privacy and ensure stringent safety protocols 

This multi-layered approach allows our system to detect even the most sophisticated deepfakes that might appear completely authentic to human observers.`
        },
        {
            id: 3,
            title: "AI Detection Algorithms",
            icon: <FaCode className="text-5xl mb-4 text-emerald-600" />,
            content: `IrisAI employs proprietary algorithms specifically designed to detect the subtle artifacts left behind by deepfake generation tools. Our system uses:

• Vision Transformer trained on a the CI-Fake AI Generate Image dataset
• Convolutional Neural Networks (CNNs) for sign language (ASL) image analysis
• *TBC*: Melodo Model 
• Tokenizing procedure via Google's base BERT model 
• Stegogangraphy & Photo Response Non-Uniformity

These algorithms work in concert to provide a comprehensive assessment of any image's authenticity with remarkable accuracy.`
        },
        {
            id: 4,
            title: "Continuous Learning",
            icon: <FaRobot className="text-5xl mb-4 text-emerald-600" />,
            content: `What sets IrisAI apart is its continuous learning capabilities. As deepfake technology evolves, so does our detection system. Our AI:

• Trained on varied sample sets; with aim of cicrumventing issues where certain demographic are discrimated agasint by the model due model weights, data (lack of) quantity & quality
• Newer and Improved models are in pre-prdocution and being trained on 
• Team is on mission to develop sets of data covering lesser researched topics

This ensures that IrisAI remains at the cutting edge of deepfake detection, even as creation technology becomes increasingly sophisticated.`
        },
        {
            id: 5,
            title: "User Protection",
            icon: <FaShieldAlt className="text-5xl mb-4 text-emerald-600" />,
            content: `The ultimate goal of IrisAI is to protect users from misinformation and digital manipulation. Our system provides:

• Infamous use RSA Encryption and CapTCHA
• Use Bcyrpt and Encryption Protocols (Andersons Formula)
• Educational resources about deepfake technology
• Tools to verify content 

By empowering users with these capabilities, IrisAI helps combat the spread of synthetic media and protects individuals from deception in an increasingly digital world.

IRIS WILL NEVER ASK FOR YOUR PASSWORD OUTSIDE IRIS`


        }
    ];

    return (
        <div className="min-h-screen bg-clde-lgreen/60 text-black">
            {/* Hidden audio element for text-to-speech */}
            <audio
                ref={audioRef}
                src="/how-it-works-audio.mp3"
                onEnded={() => setIsPlaying(false)}
            />

            {/* Category tag and title */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
                {/* Date and categories */}
                <div className="flex items-center mb-12 text-black font-medium">
                    <span>April 14, 2025</span>
                    <span className="mx-3">•</span>
                    <span className="hover:text-black cursor-pointer transition">Product</span>
                    <span className="mx-3">•</span>
                    <span className="hover:text-black cursor-pointer transition">Research</span>
                    <span className="mx-3">•</span>
                    <span className="hover:text-black cursor-pointer transition">Publication</span>
                </div>

                <div className="mb-8">
                    <span className="text-emerald-500 font-semibold text-2xl block mb-2">Artificial Intelligence</span>
                    <h1 className="text-6xl font-bold">How IrisAI Works</h1>
                </div>
                <p className="text-xl max-w-3xl mb-8">
                    Advanced AI technology that detects manipulated media through multi-layered analysis and pattern recognition—revealing what the human eye often misses.
                </p>

                {/* Try button */}
                <div className="mt-12 mb-16">
                    <button
                        onClick={() => window.location.href = '/predict/image'}
                        className="bg-neutral-800 hover:bg-white hover:text-black text-white py-3 px-6 rounded-full transition"
                    >
                        Try in Prediction
                    </button>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-neutral-800 my-8"></div>

                {/* Listen and share controls */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handlePlayPause}
                            className="flex items-center space-x-2 bg-transparent p-4 rounded-full hover:bg-white hover:text-black transition"
                        >
                            {isPlaying ? <FaPause /> : <FaPlay />}
                            <span>Listen to article</span>
                        </button>
                        <span className="text-red-400">5 min read</span>
                    </div>

                    <button className="flex items-center space-x-2 bg-transparent p-4 rounded-full hover:bg-white hover:text-black transition">
                        <FaShare />
                        <span>Share</span>
                    </button>
                </div>
            </div>



            {/* Content sections */}
            <div className="py-16 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-20">
                        {sections.map((section, index) => (
                            <div key={section.id}>
                                <motion.div
                                    className="flex flex-col md:flex-row gap-8 items-start"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                >
                                    <div className="md:w-1/3 flex flex-col items-center md:items-start">
                                        {/* if title is not what is IRIS then then have icon */}
                                        {section.title !== 'What is IRIS?' && (
                                            section.icon
                                        )}

                                        {/* if title is what is IRIS then add image */}
                                        {section.title === 'What is IRIS?' && (
                                            <img
                                                src={RobotThink}
                                                alt="IrisAI Robot thinking"
                                                className="w-1/2 mb-2 h-auto object-contain rounded-lg"
                                            />
                                        )}
                                        <h2 className="text-2xl font-bold mb-4 text-black">{section.title}</h2>

                                    </div>
                                    <div className="md:w-2/3">
                                        <p className="text-black whitespace-pre-line">{section.content}</p>
                                    </div>
                                </motion.div>
                                {index !== sections.length - 1 && (
                                    <div className="mt-20 w-full flex justify-center">
                                        <div className="w-11/12 h-px bg-black/50"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Call to action */}
            <div className="bg-neutral-900 py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-8 text-white">Experience IrisAI's Deepfake Detection</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <motion.button
                            onClick={() => window.location.href = '/predict/image'}
                            className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Try IrisAI Now
                        </motion.button>
                        <motion.button
                            onClick={() => window.location.href = '/guide'}
                            className="px-8 py-3 bg-neutral-800 text-white rounded-lg font-semibold hover:bg-neutral-700 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Learn More
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks; 