import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
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
  const { darkMode } = useTheme();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/problems/${id}`);
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
    setIsProcessing(true);
    setOutput(null);
    try {
      const response = await axios.post('http://localhost:5000/api/submissions/submit', {
        problemId: id,
        code,
        language,
        mode: 'run'
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setOutput({
        type: response.data.verdict === 'Accepted' ? 'success' : 'error',
        message: response.data.verdict,
        details: response.data.error || response.data.got || ''
      });
    } catch (error) {
      setOutput({
        type: 'error',
        message: 'Error running code',
        details: error.response?.data?.message || error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setOutput(null);
    try {
      const response = await axios.post('http://localhost:5000/api/submissions/submit', {
        problemId: id,
        code,
        language,
        mode: 'submit'
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setOutput({
        type: response.data.verdict === 'Accepted' ? 'success' : 'error',
        message: response.data.verdict,
        details: response.data.error || response.data.got || ''
      });
    } catch (error) {
      setOutput({
        type: 'error',
        message: 'Submission failed',
        details: error.response?.data?.message || error.message
      });
    } finally {
      setIsProcessing(false);
    }
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
            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-2">
              <p className="text-gray-800 dark:text-gray-200"><strong>Input:</strong> {testCase.input}</p>
              <p className="text-gray-800 dark:text-gray-200"><strong>Expected Output:</strong> {testCase.output}</p>
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
        </div>

        {output && (
          <div className={`mt-6 p-4 rounded-md ${
            output.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800'
          }`}>
            <h4 className={`font-semibold ${
              output.type === 'success' 
                ? 'text-green-800 dark:text-green-300' 
                : 'text-red-800 dark:text-red-300'
            }`}>
              {output.message}
            </h4>
            {output.type === 'success' && output.details && (
              <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                {output.details}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetail; 