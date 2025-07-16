import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DarkModeContext } from '../../context/DarkModeContext';
import Sidebar from '../Sidebar/Sidebar';
import './ProtectedRoute.css';

// Component to protect admin routes from unauthorized access
const ProtectedRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { darkMode } = useContext(DarkModeContext);

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If authenticated and is admin, render the route with sidebar
  if (isAuthenticated && isAdmin) {
    return (
      <div className={`admin ${darkMode ? 'dark-mode' : ''}`}>
        <Sidebar />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    );
  }

  // If not authenticated or not admin, redirect to login
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;

