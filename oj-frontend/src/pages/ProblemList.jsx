import { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import ProblemCard from '../components/ProblemCard';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        console.log('Fetching problems from:', api.defaults.baseURL);
        const response = await api.get('/problems');
        console.log('Problems response:', response.data);
        setProblems(response.data);
      } catch (error) {
        console.error('Error fetching problems:', {
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
        setError(error.response?.data?.message || 'Failed to fetch problems');
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-red-800 dark:text-red-300 font-semibold">Error</h2>
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Problems</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {problems.map(problem => (
          <ProblemCard key={problem._id} problem={problem} />
        ))}
      </div>
    </div>
  );
};

export default ProblemList;
