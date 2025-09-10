import React, { createContext, useState, useEffect } from 'react';

// Default user object
const defaultUser = {
  name: 'Admin',
  role: 'Manager',
  theme: 'light',
};

// Create UserContext
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Load theme from localStorage or use default
  const storedTheme = localStorage.getItem('theme') || defaultUser.theme;
  const [user, setUser] = useState({ ...defaultUser, theme: storedTheme });

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('theme', user.theme);
    // Add/remove dark class on body
    if (user.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user.theme]);

  // Function to update user
  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
