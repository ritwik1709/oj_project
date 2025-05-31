import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Toast from '../components/Toast';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [toast, setToast] = useState(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/submissions/my-submissions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setSubmissions(response.data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleViewCode = (submission) => {
    setSelectedSubmission(submission);
    setShowCodeModal(true);
  };

  const handleCopyCode = async () => {
    if (selectedSubmission?.code) {
      try {
        await navigator.clipboard.writeText(selectedSubmission.code);
        setToast({
          message: 'Code copied to clipboard!',
          type: 'success'
        });
      } catch (err) {
        console.error('Failed to copy code:', err);
        setToast({
          message: 'Failed to copy code. Please try again.',
          type: 'error'
        });
      }
    }
  };

  const getVerdictStyle = (verdict) => {
    switch (verdict) {
      case 'Accepted':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
      case 'Wrong Answer':
        return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
      case 'Time Limit Exceeded':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
      case 'Runtime Error':
        return 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getLanguageIcon = (language) => {
    switch (language) {
      case 'cpp':
        return '📘 C++';
      case 'java':
        return '☕ Java';
      case 'python':
        return '🐍 Python';
      default:
        return language;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">My Submissions</h2>
      <div className="space-y-4">
        {submissions.map((submission) => (
          <div 
            key={submission._id} 
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-4">
              <Link 
                to={`/problems/${submission.problemId._id}`}
                className="text-xl font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                {submission.problemId.title}
              </Link>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getVerdictStyle(submission.verdict)}`}>
                {submission.verdict}
              </span>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="space-x-4">
                <span className="text-gray-600 dark:text-gray-400">
                  Language: <span className="capitalize font-medium text-gray-800 dark:text-gray-200">{getLanguageIcon(submission.language)}</span>
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Submitted: <span className="font-medium text-gray-800 dark:text-gray-200">{new Date(submission.submittedAt).toLocaleString()}</span>
                </span>
              </div>
              <button
                onClick={() => handleViewCode(submission)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 border border-blue-200 dark:border-blue-800"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View Code
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Code Modal */}
      {showCodeModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {selectedSubmission.problemId.title} - {getLanguageIcon(selectedSubmission.language)}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-md hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors duration-200 border border-green-200 dark:border-green-800"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                  </svg>
                  Copy Code
                </button>
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors duration-200 border border-gray-200 dark:border-gray-800"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Close
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-grow">
              <pre className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'} font-mono text-sm whitespace-pre-wrap`}>
                {selectedSubmission.code}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Submissions;
