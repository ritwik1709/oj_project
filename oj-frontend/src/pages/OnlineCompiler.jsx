import { useState } from 'react';
import api from '../utils/axiosConfig';
import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';

const OnlineCompiler = () => {
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [isLoading, setIsLoading] = useState(false);
  const { darkMode } = useTheme();

  const handleRun = async () => {
    if (!code.trim()) {
      setOutput('Error: Please enter some code to run');
      return;
    }

    setIsLoading(true);
    setOutput('');
    try {
      console.log('Running code with:', {
        code: code.substring(0, 100) + '...', // Log first 100 chars of code
        input: input.substring(0, 100) + '...', // Log first 100 chars of input
        language,
        baseURL: api.defaults.baseURL
      });
      
      const response = await api.post('/submissions/submit', {
        code,
        input,
        language,
        mode: 'run',
        isOnlineCompiler: true // Add flag to identify online compiler submissions
      });
      
      console.log('Compilation response:', response.data);
      
      if (response.data.verdict === 'Accepted') {
        setOutput(response.data.output || 'No output');
      } else {
        setOutput(`Error: ${response.data.error || response.data.verdict}`);
      }
    } catch (error) {
      console.error('Compilation error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          headers: error.config?.headers
        }
      });
      
      // More specific error messages
      if (error.response?.status === 401) {
        setOutput('Error: Please login to use the online compiler');
      } else if (error.response?.status === 413) {
        setOutput('Error: Code or input is too large');
      } else if (error.response?.status === 429) {
        setOutput('Error: Too many requests. Please try again later');
      } else {
        setOutput(error.response?.data?.error || error.response?.data?.message || 'An error occurred while running the code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getMonacoLanguage = () => {
    switch (language) {
      case 'cpp': return 'cpp';
      case 'python': return 'python';
      case 'java': return 'java';
      default: return 'plaintext';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Online Compiler
        </h1>

        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base text-gray-800 dark:text-white"
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        {/* Code and Input Editors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Code Editor
            </h2>
            <div className="h-[300px] md:h-[400px]">
              <Editor
                height="100%"
                defaultLanguage={getMonacoLanguage()}
                language={getMonacoLanguage()}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme={darkMode ? "vs-dark" : "vs-light"}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Custom Input
            </h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-[300px] md:h-[400px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm md:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              placeholder="Enter your input here..."
            />
          </div>
        </div>

        {/* Run Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleRun}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 transition duration-200 disabled:from-blue-400 disabled:to-blue-500 shadow-md"
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
        <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Output
          </h2>
          <pre className="w-full min-h-[100px] p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg font-mono text-sm md:text-base text-gray-800 dark:text-white whitespace-pre-wrap overflow-x-auto">
            {output || 'Output will appear here...'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default OnlineCompiler;
