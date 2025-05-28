import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const DarkModeToggle = () => {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 
                 bg-blue-500/20 dark:bg-gray-700/50 shadow-md dark:shadow-lg 
                 hover:bg-blue-500/30 dark:hover:bg-gray-700/70
                 border border-blue-400/20 dark:border-gray-600/20"
      title={darkMode ? 'Light mode' : 'Dark mode'}
    >
      {darkMode ? (
        <FaSun className="text-yellow-300 transition-transform duration-300 transform scale-110" size={18} />
      ) : (
        <FaMoon className="text-blue-300 transition-transform duration-300 transform scale-110" size={18} />
      )}
    </button>
  );
};

export default DarkModeToggle;
