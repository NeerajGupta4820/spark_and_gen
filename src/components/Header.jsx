import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { user, updateUser } = useContext(UserContext);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const location = useLocation();

  const handleChangeUser = (e) => {
    e.preventDefault();
    updateUser({ name: newName });
    setShowForm(false);
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-gray-900 dark:to-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo/Brand */}
          <div className="text-2xl font-bold mb-4 md:mb-0">
            Spark&Next 🛍️
          </div>
          
          {/* Navigation */}
          <nav className="flex gap-2 mb-4 md:mb-0">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                location.pathname === '/' 
                  ? 'bg-white text-purple-600 shadow-md' 
                  : 'bg-purple-500 hover:bg-purple-700'
              }`}
            >
              📊 Dashboard
            </Link>
            <Link
              to="/add"
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                location.pathname === '/add' 
                  ? 'bg-white text-purple-600 shadow-md' 
                  : 'bg-purple-500 hover:bg-purple-700'
              }`}
            >
              ➕ Add Product
            </Link>
          </nav>
          
          {/* User Info and Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                {user.name.charAt(0)}
              </div>
              <span className="font-medium">{user.name}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                onClick={() => setShowForm(true)}
              >
                👤 Change User
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
      
      {/* Change User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Edit User Profile</h3>
            <form onSubmit={handleChangeUser} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">User Name:</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;