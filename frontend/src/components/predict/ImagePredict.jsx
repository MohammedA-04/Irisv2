import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ImagePredict = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to analyze image');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Image Deepfake Detection
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mb-4 rounded-lg"
                />
              ) : (
                <div className="text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>Click to upload an image</span>
                </div>
              )}
            </label>
          </div>

          {file && (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl text-base font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          )}
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-gray-50 rounded-xl"
          >
            <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Classification:</p>
                <p className={`text-lg font-medium ${
                  result.result === 'real' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.result.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Confidence Scores:</p>
                <div className="mt-2 space-y-2">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Real</span>
                      <span>{(result.real_confidence * 100).toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${result.real_confidence * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Fake</span>
                      <span>{(result.fake_confidence * 100).toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${result.fake_confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ImagePredict; 