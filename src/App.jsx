
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AddProduct from './components/AddProduct';
import ProductDetails from './components/ProductDetails';
import './App.css';

// Main App component with routing and context
// Provides UserContext, theme, and navigation between Dashboard and AddProduct pages
const App = () => {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          {/* Header with user info, theme toggle, and navigation */}
          <Header />
          {/* Main content routes */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddProduct />} />
            <Route path="/product/:id" element={<ProductDetails />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;
