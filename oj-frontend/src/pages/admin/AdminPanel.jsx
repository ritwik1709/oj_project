import { useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import UserManagement from './UserManagement';
import ProblemManagement from './ProblemManagement';
import ProblemForm from './ProblemForm';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('problems');

  return (
    <div className="container mx-auto p-4">
      <Routes>
        <Route path="problems/new" element={<ProblemForm />} />
        <Route path="problems/edit/:id" element={<ProblemForm />} />
        <Route path="*" element={
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
              <Link
                to="/admin/problems/new"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded transition-colors duration-200"
              >
                Add New Problem
              </Link>
            </div>

            <div className="mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('problems')}
                    className={`py-4 px-6 ${
                      activeTab === 'problems'
                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Problems
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`py-4 px-6 ${
                      activeTab === 'users'
                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Users
                  </button>
                </nav>
              </div>
            </div>

            {activeTab === 'problems' ? <ProblemManagement /> : <UserManagement />}
          </>
        } />
      </Routes>
    </div>
  );
};

export default AdminPanel; 