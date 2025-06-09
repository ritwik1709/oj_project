import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="relative">
        {/* Code brackets icon */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-lg flex items-center justify-center transform group-hover:rotate-3 transition-transform duration-300 shadow-lg">
          <div className="text-white font-mono text-xl font-bold">
            {'{'}
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 dark:bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-400 dark:bg-green-300 rounded-full"></div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
          JudgeX
        </span>
      </div>
    </Link>
  );
};

export default Logo; 