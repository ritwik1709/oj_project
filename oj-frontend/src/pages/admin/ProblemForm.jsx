import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/axiosConfig';

const ProblemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    sampleTestCases: [{ input: '', output: '' }],
    fullTestCases: [{ input: '', output: '' }]
  });

  useEffect(() => {
    if (id) {
      fetchProblem();
    }
  }, [id]);

  const fetchProblem = async () => {
    try {
      const response = await api.get(`/problems/${id}`);
      setProblem(response.data);
    } catch (error) {
      console.error('Error fetching problem:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Failed to fetch problem');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Log the problem data being sent
      console.log('Submitting problem data:', problem);

      // Validate test cases before submission
      if (!problem.sampleTestCases.length || !problem.fullTestCases.length) {
        throw new Error('At least one sample test case and one full test case are required');
      }

      const isValidTestCases = (testCases) => {
        return testCases.every(tc => tc.input.trim() !== '' && tc.output.trim() !== '');
      };

      if (!isValidTestCases(problem.sampleTestCases) || !isValidTestCases(problem.fullTestCases)) {
        throw new Error('All test cases must have both input and output values');
      }

      // Get token and check if it exists
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      console.log('Token exists:', !!token);

      if (id) {
        const response = await api.put(`/problems/${id}`, problem);
        console.log('Problem updated successfully:', response.data);
      } else {
        const response = await api.post('/problems', problem);
        console.log('Problem created successfully:', response.data);
      }
      navigate('/admin');
    } catch (error) {
      console.error('Error saving problem:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response error data:', error.response.data);
        console.error('Response error status:', error.response.status);
        console.error('Response error headers:', error.response.headers);
        alert(error.response.data.message || 'Failed to save problem');
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        alert('No response received from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTestCaseChange = (index, field, value, type = 'sample') => {
    setProblem(prev => {
      const testCases = type === 'sample' ? [...prev.sampleTestCases] : [...prev.fullTestCases];
      testCases[index] = { ...testCases[index], [field]: value };
      return {
        ...prev,
        [type === 'sample' ? 'sampleTestCases' : 'fullTestCases']: testCases
      };
    });
  };

  const addTestCase = (type = 'sample') => {
    setProblem(prev => ({
      ...prev,
      [type === 'sample' ? 'sampleTestCases' : 'fullTestCases']: [
        ...(type === 'sample' ? prev.sampleTestCases : prev.fullTestCases),
        { input: '', output: '' }
      ]
    }));
  };

  const removeTestCase = (index, type = 'sample') => {
    setProblem(prev => {
      const testCases = type === 'sample' ? [...prev.sampleTestCases] : [...prev.fullTestCases];
      testCases.splice(index, 1);
      return {
        ...prev,
        [type === 'sample' ? 'sampleTestCases' : 'fullTestCases']: testCases
      };
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        {id ? 'Edit Problem' : 'Create New Problem'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={problem.title}
            onChange={(e) => setProblem({ ...problem, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={problem.description}
            onChange={(e) => setProblem({ ...problem, description: e.target.value })}
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Difficulty</label>
          <select
            value={problem.difficulty}
            onChange={(e) => setProblem({ ...problem, difficulty: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sample Test Cases</label>
          {problem.sampleTestCases.map((testCase, index) => (
            <div key={index} className="flex gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={testCase.input}
                  onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                  placeholder="Input"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={testCase.output}
                  onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                  placeholder="Output"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeTestCase(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addTestCase('sample')}
            className="text-blue-600 hover:text-blue-800"
          >
            Add Sample Test Case
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Test Cases</label>
          {problem.fullTestCases.map((testCase, index) => (
            <div key={index} className="flex gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={testCase.input}
                  onChange={(e) => handleTestCaseChange(index, 'input', e.target.value, 'full')}
                  placeholder="Input"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={testCase.output}
                  onChange={(e) => handleTestCaseChange(index, 'output', e.target.value, 'full')}
                  placeholder="Output"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeTestCase(index, 'full')}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addTestCase('full')}
            className="text-blue-600 hover:text-blue-800"
          >
            Add Full Test Case
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Saving...' : id ? 'Update Problem' : 'Create Problem'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProblemForm; 