import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaImage, FaCode, FaRobot, FaShieldAlt, FaPlay, FaPause, FaShare, F } from 'react-icons/fa';
import { SiTarget } from "react-icons/si";
import { FaQuestion } from "react-icons/fa";
import { TbBowFilled } from "react-icons/tb";
import { SiFuturelearn } from "react-icons/si";
// Import images
import classificationReportImg from '../assets/Classification Report Dima.png';
import confMatrixImg from '../assets/conf matrix dima.png';
import fake1Img from '../assets/0 (4).jpg';
import fake2Img from '../assets/F2.jpg';
import real1Img from '../assets/R1.jpg';
import real2Img from '../assets/R2.jpg';
import dimaNail from '../assets/Dima Thumbnail.png'

const IntroduceDima = () => {
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
            title: "What is Dima?",
            icon: <FaQuestion className="text-5xl mb-4 text-emerald-600" />,
            content: `Dima is a model which is image based model capable of taking images an an input then processing it and outputing resuslts to an accuracry of 98%
            
            The model is later tuned on for our newly introduce 'dima++ model' more on that later. This model which will be trained on dataste by the name '140k Real and Fake Faces' which is provided xhlulu is made up of GAN-generated and Flickr images capturing a diverse demogrpahic useful for out-performing the base model of certain skin complexions, backgrounds and more!`
        },
        {
            id: 2,
            title: "HuggingFace Enabled",
            icon: <SiTarget className="text-5xl mb-4 text-emerald-600" />,
            content: `At IRIS we dedcied it would be the best investment to look up and use pre-exsiting models. In the image classifcation development category on HF we selected Dima's Detection model due to its high precision and good scores across f1 and recall. 
            
            Averaging an impressive weighted of 98.25% `},
        {
            id: 3,
            title: "ViT Transfromer",
            icon: <FaCode className="text-5xl mb-4 text-emerald-600" />,
            content: `IrisAI employs proprietary algorithms specifically designed to detect the subtle artifacts left behind by deepfake generation tools. Our system uses:

• Vision Transformer trained on a the CI-Fake AI Generate Image dataset
• Convolutional Neural Networks (CNNs) for sign language (ASL) image analysis
• Melody Model is built on Facebook's 'wav2vec2' and series of fine tunes. Intregetingly Melody improves up-on on the 'mo-thecreator Deepfake-audio-detection' which uses smaller training batch size but Melody improves this by 4x batch size and imprves accruacy by 0.0091 from 0.9882 to 0.9973 (1% increase ~0.97%)
• Tokenizing procedure via Google's base BERT model 
• Stegogangraphy & Photo Response Non-Uniformity

These algorithms work in concert to provide a comprehensive assessment of any image's authenticity with remarkable accuracy.`
        },
        {
            id: 4,
            title: "Trained On",
            icon: <SiFuturelearn className="text-5xl mb-4 text-emerald-600 rotate-180" />,
            content: `Data
            • CI-Fake Dataset: total 120,000 images real and fake (GAN Generated)
            • CIFAKE dataset is focused on the task of distinguishing between real and AI-generated images of common objects and animals, not only representing Humans containing 10 classes which are inherited from the CIFAR-10

            IMAGE

            Hyper Parameters
            • 2 Epochs
            • 1e-6 Learn Rate
            • 64 Train Batch
            • 32 Eval Batch
            • 50 Warmup Steps 

            Steps of ViT
            • Patching: Images are patched into grid of fixed size
            • Embedding: Then each image is transformed into vector knowns as embedding
            • Encode: encoded based on potsition to indicate position within image
            • Pass: Then these passed into standard encoder with layers
              ~ Self Attention: helps model figure out how images relate to each other
              ~ MLP: data are passed into multi-layer neural network`
        },
        {
            id: 5,
            title: "Accuracy",
            icon: <TbBowFilled className="text-5xl mb-4 text-emerald-600" />,
            content: `

            The model developed by Dmytro has classification report`
        }
    ];

    // Function to render section content with conditional image rendering
    const renderSectionContent = (section) => {
        if (section.id === 5) {
            return (
                <>
                    <p className="text-black whitespace-pre-line font-semibold">
                        The model developed by Dmytro has classification report
                    </p>
                    <img src={classificationReportImg} alt="Classification Report" className="my-4 max-w-full border-4 border-white border-opacity-50 rounded-lg p-1 shadow-lg" />

                    <p className="text-black whitespace-pre-line mt-10 font-semibold">
                        Confusion Matrix
                    </p>
                    <img src={confMatrixImg} alt="Confusion Matrix" className="mt-6 my-4 max-w-full border-4 border-white border-opacity-50 rounded-lg p-1 shadow-lg" />

                    <p className="text-black whitespace-pre-line font-semibold mt-10">
                        Model Accurarcy 98%
                        <br /><br />
                        IRIS WILL NEVER ASK FOR YOUR PASSWORD OUTSIDE IRIS
                    </p>
                </>
            );
        } else if (section.id === 4) {
            // Parsing the content to replace \IMAGE\ with the 2x2 grid
            const contentParts = section.content.split('IMAGE');
            return (
                <>
                    <p className="text-black whitespace-pre-line">{contentParts[0]}</p>

                    {/* 2x2 Grid of images */}
                    <div className="my-8 w-full">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Row 1 */}
                            <div className="flex flex-col items-center">
                                <p className="font-semibold mb-2">Fake</p>
                                <img src={fake1Img} alt="Fake Image 1" className="blur-[3px] w-full border-4 border-white border-opacity-50 rounded-lg p-1 shadow-lg" />
                            </div>
                            <div className="flex flex-col items-center">
                                <p className="font-semibold mb-2">Fake</p>
                                <img src={fake2Img} alt="Fake Image 2" className="blur-[3px] w-full border-4 border-white border-opacity-50 rounded-lg p-1 shadow-lg" />
                            </div>
                            {/* Row 2 */}
                            <div className="flex flex-col items-center">

                                <img src={real1Img} alt="Real Image 1" className="blur-[3px] w-full border-4 border-white border-opacity-50 rounded-lg p-1 shadow-lg" />
                                <p className="font-semibold mb-2">Real</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <img src={real2Img} alt="Real Image 2" className="blur-[3px] w-full border-4 border-white border-opacity-50 rounded-lg p-1 shadow-lg" />
                                <p className="font-semibold mb-2">Real</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-black whitespace-pre-line -mt-10">{contentParts[1]}</p>
                </>
            );
        } else {
            return <p className="text-black whitespace-pre-line">{section.content}</p>;
        }
    };

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
                    <span>April 18, 2025</span>
                    <span className="mx-3">•</span>
                    <span className="hover:text-black cursor-pointer transition">Product</span>
                    <span className="mx-3">•</span>
                    <span className="hover:text-black cursor-pointer transition">Research</span>
                    <span className="mx-3">•</span>
                    <span className="hover:text-black cursor-pointer transition">Hugging Face</span>
                </div>

                <div className="mb-8">
                    <span className="text-emerald-500 font-semibold text-2xl block mb-2">Artificial Intelligence</span>
                    <h1 className="text-6xl font-bold">Introducing Dima Model</h1>
                </div>
                <p className="text-xl max-w-3xl mb-8">
                    Latest Image Classifier capable of detecting 'fake' media in image format upto accruacy of <strong>98%</strong> powered by the vision transformer. The model developed is strucutured on the base 'vit-base-patch16-224-in21k' by Google.
                    <br /><br />
                    <strong> Developed by Dmytro Iakubovskyi</strong>
                    <p className='mt-2'>
                        See Dmytro:
                        <a
                            href="https://huggingface.co/dima806"
                            className='text-blue-600 ml-2 underline'>huggingface.co/dima806</a>
                    </p>

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
                        <span className="text-gray-400">5 min read</span>
                    </div>

                    <button className="flex items-center space-x-2 bg-transparent p-4 rounded-full hover:bg-white hover:text-black transition">
                        <FaShare />
                        <span>Share</span>
                    </button>
                </div>
            </div>

            {/* Image section */}
            <div className="py-12 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center">
                        {/* You can replace this with an actual image later */}
                        <div className="flex justify-center items-center">
                            <img src={dimaNail} className="w-3/4  h-auto border-4 border-white border-opacity-50 rounded-lg p-1 shadow-lg" alt="Dima Thumbnail" />
                        </div>
                    </div>

                    <div className="mt-20 w-full flex justify-center">
                        <div className="w-11/12 h-px bg-black/20"></div>
                    </div>
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
                                        {section.icon}
                                        <h2 className="text-2xl font-bold mb-4 text-black">{section.title}</h2>
                                    </div>
                                    <div className="md:w-2/3">
                                        {renderSectionContent(section)}
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

export default IntroduceDima; 
