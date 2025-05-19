import { Link } from 'react-router-dom';

const ProblemCard = ({ problem }) => {
  return (
    <Link to={`/problems/${problem._id}`} className="block">
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{problem.title}</h3>
        <div className="flex justify-between items-center">
          <span className={`px-3 py-1 rounded-full text-sm ${
            problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
            problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {problem.difficulty}
          </span>
          <span className="text-gray-600 text-sm">Submissions: {problem.submissions || 0}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProblemCard;
