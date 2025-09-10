import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';

// Theme toggle button component
const ThemeToggle = () => {
  const { user, updateUser } = useContext(UserContext);

  // Toggle theme between light and dark
  const handleToggle = () => {
    updateUser({ theme: user.theme === 'light' ? 'dark' : 'light' });
  };

  return (
    <button
      className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition"
      onClick={handleToggle}
      aria-label="Toggle theme"
    >
      {user.theme === 'light' ? '🌞 Light' : '🌙 Dark'}
    </button>
  );
};

export default ThemeToggle;
