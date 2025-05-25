import { useState } from 'react';
import axios from 'axios';

const OnlineCompiler = () => {
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [isLoading, setIsLoading] = useState(false);

  const handleRun = async () => {
    if (!code.trim()) {
      setOutput('Error: Please enter some code to run');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/compile', {
        code,
        input,
        language
      });
      setOutput(response.data.output);
    } catch (error) {
      setOutput(error.response?.data?.error || 'An error occurred');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
          Online Compiler
        </h1>

        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        {/* Code and Input Editors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-2">
              Code Editor
            </h2>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-[300px] md:h-[400px] p-3 border border-gray-300 rounded-lg font-mono text-sm md:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter your ${language} code here...`}
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-2">
              Custom Input
            </h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-[300px] md:h-[400px] p-3 border border-gray-300 rounded-lg font-mono text-sm md:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your input here..."
            />
          </div>
        </div>

        {/* Run Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleRun}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition duration-200 disabled:from-blue-400 disabled:to-blue-500 shadow-md"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running...
              </span>
            ) : (
              'Run'
            )}
          </button>
        </div>

        {/* Output */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-2">
            Output
          </h2>
          <pre className="w-full min-h-[100px] p-4 bg-white border border-gray-200 rounded-lg font-mono text-sm md:text-base text-gray-800 whitespace-pre-wrap overflow-x-auto">
            {output || 'Output will appear here...'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default OnlineCompiler;
