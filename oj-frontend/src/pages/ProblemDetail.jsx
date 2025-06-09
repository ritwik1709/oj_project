import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/axiosConfig';
import CodeEditor from '../components/CodeEditor';
import { useTheme } from '../context/ThemeContext';

const ProblemDetail = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [loading, setLoading] = useState(true);
  const [output, setOutput] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAIHint, setShowAIHint] = useState(false);
  const [aiHint, setAIHint] = useState(null);
  const [hasWrongSubmission, setHasWrongSubmission] = useState(false);
  const { darkMode } = useTheme();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await api.get(`/problems/${id}`);
        setProblem(response.data);
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  const handleRun = async () => {
    if (!code.trim()) {
      setOutput({
        type: 'error',
        message: 'Please enter some code to run',
        details: null
      });
      return;
    }

    setIsProcessing(true);
    setOutput(null);
    try {
      console.log('Running code for problem:', {
        problemId: id,
        language,
        codeLength: code.length,
        baseURL: api.defaults.baseURL
      });

      const response = await api.post('/submissions/submit', {
        problemId: id,
        code,
        language,
        mode: 'run',
        isOnlineCompiler: false
      });
      
      console.log('Run response:', response.data);
      
      if (response.data.verdict === 'Accepted') {
        setOutput({
          type: 'success',
          message: 'Sample test cases passed successfully!',
          details: response.data.output || null
        });
      } else {
        setOutput({
          type: 'error',
          message: response.data.verdict,
          details: response.data.error || response.data.output || null
        });
      }
    } catch (error) {
      console.error('Run error:', {
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
      let errorMessage = 'Error running code';
      let errorDetails = null;

      if (error.response?.status === 401) {
        errorMessage = 'Please login to run code';
      } else if (error.response?.status === 413) {
        errorMessage = 'Code is too large';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please try again later';
      } else {
        errorMessage = error.response?.data?.message || error.message;
        errorDetails = error.response?.data?.error || null;
      }

      setOutput({
        type: 'error',
        message: errorMessage,
        details: errorDetails
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setOutput({
        type: 'error',
        message: 'Please enter some code to submit',
        details: null
      });
      return;
    }

    setIsProcessing(true);
    setOutput(null);
    setShowAIHint(false);
    try {
      console.log('Submitting code for problem:', {
        problemId: id,
        language,
        codeLength: code.length,
        baseURL: api.defaults.baseURL
      });

      const response = await api.post('/submissions/submit', {
        problemId: id,
        code,
        language,
        mode: 'submit',
        isOnlineCompiler: false
      });
      
      console.log('Submit response:', response.data);
      
      setOutput({
        type: response.data.verdict === 'Accepted' ? 'success' : 'error',
        message: response.data.verdict,
        details: response.data.error || response.data.output || null
      });

      if (response.data.verdict !== 'Accepted') {
        setHasWrongSubmission(true);
        setAIHint(response.data.aiFeedback);
      } else {
        setHasWrongSubmission(false);
        setAIHint(null);
      }
    } catch (error) {
      console.error('Submit error:', {
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
      let errorMessage = 'Submission failed';
      let errorDetails = null;

      if (error.response?.status === 401) {
        errorMessage = 'Please login to submit code';
      } else if (error.response?.status === 413) {
        errorMessage = 'Code is too large';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please try again later';
      } else {
        errorMessage = error.response?.data?.message || error.message;
        errorDetails = error.response?.data?.error || null;
      }

      setOutput({
        type: 'error',
        message: errorMessage,
        details: errorDetails
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShowAIHint = () => {
    setShowAIHint(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!problem) {
    return <div className="text-center p-4 text-gray-800 dark:text-white">Problem not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{problem.title}</h1>
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm ${
            problem.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
            problem.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' :
            'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
          }`}>
            {problem.difficulty}
          </span>
        </div>
        <div className="prose max-w-none mb-6 dark:prose-invert">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Problem Description</h2>
          <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{problem.description}</p>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Sample Test Cases</h3>
          {problem.sampleTestCases.map((testCase, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
              <div className="mb-2">
                <p className="text-gray-800 dark:text-gray-200 font-medium mb-1">Input:</p>
                <pre className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-mono text-sm whitespace-pre-wrap">{testCase.input}</pre>
              </div>
              <div>
                <p className="text-gray-800 dark:text-gray-200 font-medium mb-1">Expected Output:</p>
                <pre className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-mono text-sm whitespace-pre-wrap">{testCase.output}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
            disabled={isProcessing}
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        <CodeEditor
          code={code}
          setCode={setCode}
          language={language}
          disabled={isProcessing}
        />

        <div className="mt-4 flex gap-4">
          <button
            onClick={handleRun}
            disabled={isProcessing}
            className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {isProcessing ? 'Running...' : 'Run Code'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {isProcessing ? 'Submitting...' : 'Submit Solution'}
          </button>
          {hasWrongSubmission && !showAIHint && (
            <button
              onClick={handleShowAIHint}
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white px-6 py-2 rounded"
            >
              Get AI Hint
            </button>
          )}
        </div>

        {output && (
          <div className={`mt-4 p-4 rounded-lg ${
            output.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800'
          }`}>
            <h4 className={`font-semibold ${
              output.type === 'success' 
                ? 'text-green-800 dark:text-green-300' 
                : 'text-red-800 dark:text-red-300'
            }`}>
              {output.message}
            </h4>
            {output.details && (
              <pre className="mt-2 whitespace-pre-wrap text-sm text-red-700 dark:text-red-300">
                {output.details}
              </pre>
            )}
          </div>
        )}

      
        {showAIHint && aiHint && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4">AI Hint:</h4>
            <div className="space-y-4">
              {aiHint.split('\n\n').map((section, index) => {
                const [header, ...content] = section.split('\n');
                return (
                  <div key={index} className="bg-white dark:bg-gray-800/50 p-3 rounded-md">
                    <h5 className="font-medium text-blue-700 dark:text-blue-400 mb-2">{header}</h5>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{content.join('\n')}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetail; 