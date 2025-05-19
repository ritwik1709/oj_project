import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from '../assets/android-chrome-192x192.png';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="CodeArena Logo" className="w-8 h-8" />
          <span className="text-2xl font-bold">CodeArena</span>
        </Link>
        <div className="flex gap-6">
          <Link to="/problems" className="hover:text-blue-200">
            Problems
          </Link>
          {user ? (
            <>
              <Link to="/submissions" className="hover:text-blue-200">
                My Submissions
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:text-blue-200">
                  Admin Panel
                </Link>
              )}
              <button
                onClick={logout}
                className="hover:text-blue-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">
                Login
              </Link>
              <Link to="/register" className="hover:text-blue-200">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
