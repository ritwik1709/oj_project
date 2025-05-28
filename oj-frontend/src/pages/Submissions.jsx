import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

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
            
            {submission.aiFeedback && submission.verdict !== 'Accepted' && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">AI Hint:</h4>
                <p className="text-blue-700 dark:text-blue-200">{submission.aiFeedback}</p>
              </div>
            )}
            
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="space-x-4">
                <span className="text-gray-600 dark:text-gray-400">
                  Language: <span className="capitalize font-medium text-gray-800 dark:text-gray-200">{submission.language}</span>
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Submitted: <span className="font-medium text-gray-800 dark:text-gray-200">{new Date(submission.submittedAt).toLocaleString()}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Submissions;
