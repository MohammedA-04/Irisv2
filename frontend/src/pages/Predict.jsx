import React, { useState, useEffect, useRef } from 'react';
import { FiUpload, FiSearch, FiCheckCircle, FiX, FiFile } from 'react-icons/fi';
import { FaInstagram, FaTwitter, FaFacebook, FaTiktok } from 'react-icons/fa';
import ollamaIcon from '../assets/ollama.png';
import brainIcon from '../assets/icons8-brain-50.png';

// Completely rewritten TypingEffect component
const TypingEffect = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const textRef = useRef(text);
  const indexRef = useRef(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reset when text changes
    textRef.current = text;
    indexRef.current = 0;
    setDisplayedText('');
    setIsStarted(false);
    setIsComplete(false);

    if (!text) return;

    // Small delay before starting to ensure component is fully mounted
    const startDelay = setTimeout(() => {
      setIsStarted(true);
    }, 100);

    return () => clearTimeout(startDelay);
  }, [text]);

  useEffect(() => {
    if (!isStarted || !textRef.current) return;

    // Create typing interval
    const typingInterval = setInterval(() => {
      if (indexRef.current < textRef.current.length) {
        setDisplayedText(prev => prev + textRef.current.charAt(indexRef.current));
        indexRef.current += 1;
      } else {
        clearInterval(typingInterval);
        setIsComplete(true);
      }
    }, 20);

    return () => clearInterval(typingInterval);
  }, [isStarted]);

  return (
    <div className="font-sans text-gray-800 leading-relaxed whitespace-pre-wrap">
      {displayedText}
      {!isComplete && indexRef.current < (textRef.current?.length || 0) && (
        <span className="inline-block w-2 h-4 bg-gray-500 ml-1 animate-pulse"></span>
      )}
    </div>
  );
};

const Predict = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState('Image');
  const [selectedModel, setSelectedModel] = useState('Dima Image Model');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // New state for AI analysis
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const [newsTitle, setNewsTitle] = useState('');
  const [newsText, setNewsText] = useState('');
  const [newsSubject, setNewsSubject] = useState('');
  const [newsDate, setNewsDate] = useState('');

  const clearFileSelection = () => {
    setFile(null);
    setResult(null);
    setAiAnalysis('');
    setNewsTitle('');
    setNewsText('');
    setNewsSubject('');
    setNewsDate('');
  };

  // Add function to fetch AI analysis
  const fetchAiAnalysis = async (resultData) => {
    if (!resultData) return;

    setLoadingAnalysis(true);
    console.log("Fetching AI analysis for:", resultData);

    try {
      // Fix the confidence calculation to use the correct confidence value
      // based on the actual result (real or fake)
      const confidence = resultData.result && resultData.result.toLowerCase() === 'real'
        ? resultData.real_confidence * 100
        : resultData.fake_confidence * 100;

      const requestBody = {
        type: selectedType ? selectedType.toLowerCase() : 'unknown',
        result: resultData.result || 'unknown',
        confidence: confidence,
        real_confidence: resultData.real_confidence * 100,
        fake_confidence: resultData.fake_confidence * 100,
        filename: resultData.filename || 'file'
      };
      console.log("Sending request to analyze-ai:", requestBody);

      const response = await fetch('http://localhost:5000/api/analyze-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error('Failed to get AI analysis');
      }

      const data = await response.json();
      console.log("Received AI analysis:", data);
      setAiAnalysis(data.analysis);
    } catch (err) {
      console.error('AI analysis error:', err);
      setAiAnalysis('Unable to generate AI analysis at this time.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const analyzeFile = async () => {
    if (selectedType === 'Text') {
      if (!newsTitle || !newsText || !newsSubject || !newsDate) {
        setError('Please fill in all fields');
        return;
      }
    } else if (!file) {
      setError('Please select a file first');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setLoadingProgress(0);
    setLoadingStatus('Initializing...');
    setAiAnalysis('');

    try {
      const formData = new FormData();

      if (selectedType === 'Text') {
        formData.append('type', 'text');
        formData.append('title', newsTitle);
        formData.append('text', newsText);
        formData.append('subject', newsSubject);
        formData.append('date', newsDate);
      } else {
        formData.append('file', file);
        formData.append('type', selectedType ? selectedType.toLowerCase() : 'image');
      }
      formData.append('model', selectedModel);

      setLoadingStatus('Processing...');
      setLoadingProgress(30);

      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      setLoadingProgress(60);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setLoadingProgress(90);

      setTimeout(() => {
        setResult(data);
        setLoadingProgress(100);
        setLoadingStatus('');
        fetchAiAnalysis(data);
      }, 500);

    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Update the model selection based on type
  const getModelOptions = (type) => {
    switch (type) {
      case 'Audio':
        return ['Melody Audio Model'];
      case 'Text':
        return ['Mosko News Model'];
      case 'Video':
        return ['ASL Video Model'];
      case 'Image':
        return ['Dima Image Model', 'Dima++ Image Model', 'Medical Image Model', 'ASL Sign Model'];
      default:
        return [];
    }
  };

  // Now, let's update the renderAiAnalysis function with a simpler approach
  const renderAiAnalysis = () => {
    // Remove the debug output and simplify
    if (!aiAnalysis && !loadingAnalysis) return null;

    return (
      <div className="mt-8 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4">AI Interpretation</h3>
        <p className="text-sm text-gray-600 mb-4">
          {loadingAnalysis
            ? "Generating AI analysis of your content..."
            : "This is a hypothetical explanation of what might have led to this classification result."}
        </p>

        <div className="bg-white rounded-lg p-4 shadow-sm min-h-[120px]">
          {loadingAnalysis ? (
            <div className="flex flex-col items-center justify-center h-full py-6">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 text-center">
                {selectedType === 'Audio'
                  ? "Audio analysis takes longer to process. Please wait..."
                  : "Generating analysis..."}
              </p>
            </div>
          ) : (
            <TypingEffect text={aiAnalysis} />
          )}
        </div>
      </div>
    );
  };

  // Update the renderMetadataAnalysis function to correctly display confidence
  const renderMetadataAnalysis = () => {
    if (!result) return null;

    // Calculate processing time (mock for now, you can replace with actual data)
    const processingTime = result.processingTime || "100ms";

    // Fix the confidence percentage calculation to show the correct confidence
    // based on the actual result
    const confidencePercentage = result.result && result.result.toLowerCase() === 'real'
      ? Math.round(result.real_confidence * 100)
      : Math.round(result.fake_confidence * 100);

    // Get the correct model name based on the selected type
    const getModelName = () => {
      switch (selectedType) {
        case 'Image':
          return 'Dima Image Model';
        case 'Audio':
          return 'Melody Audio Model';
        case 'Text':
          return 'Mosko: News Text Model';
        case 'Video':
          return 'Sign Language (ASL)';
        default:
          return 'Unknown Model';
      }
    };

    return (
      <div className="mt-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Analysis Details</h3>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Dimensions */}
            <div className="flex items-center gap-3">
              <div className="text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Dimensions</p>
                <p className="text-lg font-semibold">{selectedType === 'Image' ? '1080×600' : 'N/A'}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-3">
              <div className="text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Date</p>
                <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Processing Time */}
            <div className="flex items-center gap-3">
              <div className="text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Processing Time</p>
                <p className="text-lg font-semibold">{processingTime}</p>
              </div>
            </div>

            {/* Confidence */}
            <div className="flex items-center gap-3">
              <div className="text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Confidence</p>
                <p className="text-lg font-semibold">{confidencePercentage}%</p>
              </div>
            </div>

            {/* Classification Model */}
            <div className="flex items-center gap-3">
              <div className="text-gray-600 flex items-center justify-center w-5 h-5">
                <img src={brainIcon} alt="AI Model" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Classification Model</p>
                <p className="text-lg font-semibold">{getModelName()}</p>
              </div>
            </div>

            {/* LLM Model - Ollama3 with simplified icon */}
            <div className="flex items-center gap-3">
              <div className="text-gray-600 flex items-center justify-center w-5 h-5">
                <img src={ollamaIcon} alt="Ollama" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">LLM</p>
                <p className="text-lg font-semibold">Ollama3</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // New function to render video analysis results
  const renderVideoAnalysis = () => {
    if (!result || selectedType !== 'Video' || !result.predictions) return null;

    return (
      <div className="mt-8 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Video Frame Analysis</h3>
        <p className="text-sm text-gray-600 mb-4">
          Frame-by-frame analysis of your video content
        </p>

        <div className="bg-white rounded-lg p-4 shadow-sm overflow-auto max-h-64">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">Frame</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">Classification</th>
              </tr>
            </thead>
            <tbody>
              {result.predictions.map((prediction, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 text-sm text-gray-700">{prediction.frame}</td>
                  <td className={`py-2 px-4 text-sm font-medium ${prediction.label && prediction.label.toLowerCase() === 'real' ? 'text-green-600' : 'text-red-600'}`}>
                    {prediction.label || 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 bg-white/80 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="font-medium text-gray-700">Summary:</div>
            {(() => {
              const realFrames = result.predictions.filter(p => p.label && p.label === 'Real').length;
              const totalFrames = result.predictions.length;
              const realPercentage = (realFrames / totalFrames) * 100;

              // Set overall result based on percentage of real frames
              const overallResult = realPercentage > 50 ? 'Likely Real' : 'Likely Fake';
              const colorClass = realPercentage > 50 ? 'text-green-600' : 'text-red-600';

              return (
                <div className={`font-bold ${colorClass}`}>
                  {overallResult} ({realPercentage.toFixed(1)}% real frames)
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!result) return null;

    // Handle ASL Sign Model results
    if (selectedModel === 'ASL Sign Model') {
      return (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">ASL Sign Prediction</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Predicted Sign:</span>
              <span className="font-semibold">{result.result}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Confidence:</span>
              <span className="font-semibold">{(result.confidence * 100).toFixed(2)}%</span>
            </div>
            <div className="mt-4">
              <h4 className="text-lg font-medium mb-2">Top Predictions:</h4>
              <div className="space-y-2">
                {result.all_predictions
                  .map((confidence, index) => ({ sign: `Sign_${index}`, confidence }))
                  .sort((a, b) => b.confidence - a.confidence)
                  .slice(0, 5)
                  .map((pred, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-600">{pred.sign}</span>
                      <span className="font-semibold">{(pred.confidence * 100).toFixed(2)}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Existing result rendering code...
    return (
      <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Result:</span>
            <span className={`font-semibold ${result.result === 'real' ? 'text-green-600' : 'text-red-600'}`}>
              {result.result.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Real Confidence:</span>
            <span className="font-semibold">{(result.real_confidence * 100).toFixed(2)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Fake Confidence:</span>
            <span className="font-semibold">{(result.fake_confidence * 100).toFixed(2)}%</span>
          </div>
          {result.reason && (
            <div className="mt-4">
              <h4 className="text-lg font-medium mb-2">Reason:</h4>
              <p className="text-gray-600">{result.reason}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main return
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Deepfake Detection</h1>
          <p className="text-gray-600 mt-2">Upload your content for instant analysis</p>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Model Selection Bar */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-8">
            <div className="flex gap-4">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setSelectedModel(getModelOptions(e.target.value)[0]);
                  setFile(null);
                  setResult(null);
                }}
                className=" px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 w-32 h-10"
              >
                <option value="Image">Image</option>
                <option value="Audio">Audio</option>
                <option value="Text">Text</option>
                <option value="Video">Video</option>
              </select>

              <div className="mb-4">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={analyzing}
                >
                  {getModelOptions(selectedType).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={analyzeFile}
              disabled={
                analyzing ||
                (selectedType === 'Text'
                  ? (!newsTitle || !newsText || !newsSubject || !newsDate)
                  : !file
                )
              }
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors relative
                ${(selectedType === 'Text'
                  ? (!newsTitle || !newsText || !newsSubject || !newsDate)
                  : !file
                ) || analyzing
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700'}`}
            >
              {analyzing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{loadingStatus || 'Analyzing...'}</span>
                </div>
              ) : (
                'Analyze'
              )}
            </button>
          </div>

          {/* Loading Progress */}
          {analyzing && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1 text-center">{loadingStatus}</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-lg">
              <p className="font-medium">{error}</p>
              {error.includes('FFmpeg') && (
                <p className="text-sm mt-2">
                  To process MP3 files, please install FFmpeg:
                  <br />
                  1. Download from <a href="https://www.gyan.dev/ffmpeg/builds/ffmpeg-git-full.7z" className="underline">here</a>
                  <br />
                  2. Extract the archive
                  <br />
                  3. Copy the bin folder contents to C:\ffmpeg\bin
                  <br />
                  4. Add C:\ffmpeg\bin to your system PATH
                  <br />
                  Or try uploading a WAV file instead.
                </p>
              )}
            </div>
          )}

          {/* Conditional Rendering for Upload Area or Results */}
          {result ? (
            <div>
              {/* File Info and Clear Button */}
              <div className="mb-6 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <FiFile className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">
                    {selectedType === 'Text' ? result.title : file?.name}
                  </span>
                </div>
                <button
                  onClick={clearFileSelection}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors flex items-center gap-1"
                >
                  <FiX className="w-4 h-4" />
                  Clear
                </button>
              </div>

              {/* Analysis Results */}
              <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left side - Result and File Info */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="text-xl font-semibold mb-2">Result</h3>
                      <div className={`text-lg font-bold rounded-md p-2 text-center ${result.result && result.result.toLowerCase() === 'real'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}>
                        {result.result ? result.result.toUpperCase() : 'UNKNOWN'}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <FiFile className="w-5 h-5" />
                        <span className="font-medium">{result.filename}</span>
                      </div>
                      {result.reason && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                          {result.reason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - Analysis Details */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Analysis</h3>
                    <div className="space-y-4">
                      {/* Real Confidence */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Real</span>
                          <span className="text-sm font-medium text-gray-700">
                            {(result.real_confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${(result.real_confidence * 100)}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Fake Confidence */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Fake</span>
                          <span className="text-sm font-medium text-gray-700">
                            {(result.fake_confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${(result.fake_confidence * 100)}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Undecided Confidence - Only show for Text analysis */}
                      {selectedType === 'Text' && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Undecided</span>
                            <span className="text-sm font-medium text-gray-700">
                              {(result.undecided_confidence * 100 || 0).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{
                                width: `${(result.undecided_confidence * 100 || 0)}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Interpretation */}
              {renderAiAnalysis()}

              {/* Metadata Analysis */}
              {renderMetadataAnalysis()}

              {/* Video Analysis */}
              {renderVideoAnalysis()}

              {/* Result Analysis */}
              {renderResult()}
            </div>
          ) : selectedType === 'Text' ? (
            // Text Input Form
            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <div className="space-y-4">
                {/* Title Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="Enter news title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Text Content Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Content
                  </label>
                  <textarea
                    value={newsText}
                    onChange={(e) => setNewsText(e.target.value)}
                    placeholder="Enter the news content"
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Subject Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={newsSubject}
                    onChange={(e) => setNewsSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a subject</option>
                    <option value="Politics">Politics</option>
                    <option value="Technology">Technology</option>
                    <option value="Science">Science</option>
                    <option value="Health">Health</option>
                    <option value="Business">Business</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Sports">Sports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date (Month DD, YYYY)
                  </label>
                  <input
                    type="text"
                    value={newsDate}
                    onChange={(e) => setNewsDate(e.target.value)}
                    placeholder="April 7, 2025"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Form Validation Message */}
                {error && (
                  <div className="text-red-500 text-sm mt-2">
                    {error}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Drag and Drop Upload Area for Image and Audio
            <div
              className={`
                relative
                border-2 border-dashed rounded-xl p-12
                flex flex-col items-center justify-center
                transition-colors cursor-pointer mb-12
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
              `}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const droppedFile = e.dataTransfer.files[0];
                setFile(droppedFile);
              }}
              onClick={() => document.querySelector('input[type="file"]').click()}
            >
              <FiUpload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag and drop your file here
              </p>
              <p className="text-sm text-gray-500">
                or click to browse from your computer
              </p>

              {/* Warning Message - Repositioned */}
              <p className="text-xs text-gray-400 italic mt-8">
                Beware IRIS can make mistakes!
              </p>

              <p className="text-xs text-gray-500 mt-2">
                {selectedType === 'Audio'
                  ? 'Supported formats: WAV, MP3'
                  : selectedType === 'Video'
                    ? 'Supported formats: MP4, MOV, AVI'
                    : 'Supported formats: JPG, PNG, GIF'}
              </p>

              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
                accept={
                  selectedType === 'Audio'
                    ? 'audio/*'
                    : selectedType === 'Video'
                      ? 'video/*'
                      : 'image/*'
                }
              />
              {file && !result && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="text-blue-600">Selected: {file.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFileSelection();
                    }}
                    className="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                    title="Remove file"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Steps Section */}
          <div className="border-t border-gray-100 pt-12 mb-12">
            <h2 className="text-2xl font-semibold text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepCard
                icon={<FiUpload className="w-8 h-8" />}
                step="Step 1"
                title="Upload File"
                description="Ensure your file type is supported (images, videos, or audio)"
              />
              <StepCard
                icon={<FiSearch className="w-8 h-8" />}
                step="Step 2"
                title="Select Model"
                description="Choose the appropriate AI model for your content type"
              />
              <StepCard
                icon={<FiCheckCircle className="w-8 h-8" />}
                step="Step 3"
                title="Get Results"
                description="Receive detailed analysis of your content's authenticity"
              />
            </div>
          </div>

          {/* Social Links Section */}
          <div className="border-t border-gray-100 pt-8">
            <div className="text-center">
              <p className="text-gray-600 mb-6">Stay Updated With Our Latest Features</p>
              <div className="flex justify-center space-x-6">
                <SocialIcon icon={<FaInstagram />} color="text-pink-500" link="https://instagram.com" />
                <SocialIcon icon={<FaTwitter />} color="text-blue-400" link="https://twitter.com" />
                <SocialIcon icon={<FaFacebook />} color="text-blue-600" link="https://facebook.com" />
                <SocialIcon icon={<FaTiktok />} color="text-black" link="https://tiktok.com" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Card Component
const StepCard = ({ icon, step, title, description }) => (
  <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
    <div className="flex flex-col items-center text-center">
      <div className="text-blue-500 bg-blue-50 p-4 rounded-full mb-4">
        {icon}
      </div>
      <p className="text-sm font-medium text-blue-500 mb-2">{step}</p>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

// Social Icon Component
const SocialIcon = ({ icon, color, link }) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className={`${color} hover:opacity-75 transition-opacity`}
  >
    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      {icon}
    </div>
  </a>
);

export default Predict;