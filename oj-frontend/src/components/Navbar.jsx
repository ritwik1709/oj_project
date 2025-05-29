import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import DarkModeToggle from "./DarkModeToggle";
import Logo from "./Logo";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-gray-800 dark:to-gray-900 text-white p-4 transition-colors duration-300 shadow-lg">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Logo />

          {/* Mobile menu button and dark mode toggle */}
          <div className="md:hidden flex items-center gap-2">
            <DarkModeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-blue-500/20 dark:hover:bg-gray-700/50 transition duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex gap-6 items-center text-white text-base font-medium">
            <Link
              to="/compiler"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:from-blue-600 hover:to-indigo-600 dark:hover:from-blue-700 dark:hover:to-indigo-700 transition duration-300"
            >
              Online Compiler
            </Link>
            <Link
              to="/problems"
              className="hover:text-blue-300 dark:hover:text-blue-400 transition duration-200"
            >
              Problems
            </Link>

            {user ? (
              <>
                <Link
                  to="/submissions"
                  className="hover:text-blue-300 dark:hover:text-blue-400 transition duration-200"
                >
                  My Submissions
                </Link>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="hover:text-blue-300 dark:hover:text-blue-400 transition duration-200"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="hover:text-blue-300 dark:hover:text-blue-400 transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-blue-300 dark:hover:text-blue-400 transition duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hover:text-blue-300 dark:hover:text-blue-400 transition duration-200"
                >
                  Register
                </Link>
              </>
            )}

            <DarkModeToggle />
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4">
            <Link
              to="/compiler"
              className="block bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:from-blue-600 hover:to-indigo-600 dark:hover:from-blue-700 dark:hover:to-indigo-700 transition duration-300 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Online Compiler
            </Link>
            <Link
              to="/problems"
              className="block hover:text-blue-300 dark:hover:text-blue-400 transition duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Problems
            </Link>

            {user ? (
              <>
                <Link
                  to="/submissions"
                  className="block hover:text-blue-300 dark:hover:text-blue-400 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Submissions
                </Link>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="block hover:text-blue-300 dark:hover:text-blue-400 transition duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block hover:text-blue-300 dark:hover:text-blue-400 transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block hover:text-blue-300 dark:hover:text-blue-400 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block hover:text-blue-300 dark:hover:text-blue-400 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
