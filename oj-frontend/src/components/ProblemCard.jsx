import { Link } from 'react-router-dom';

const ProblemCard = ({ problem }) => {
  return (
    <Link to={`/problems/${problem._id}`} className="block">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{problem.title}</h3>
        <div className="flex justify-between items-center">
          <span className={`px-3 py-1 rounded-full text-sm ${
            problem.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
            problem.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' :
            'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
          }`}>
            {problem.difficulty}
          </span>
          <span className="text-gray-600 dark:text-gray-400 text-sm">Submissions: {problem.submissions || 0}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProblemCard;
