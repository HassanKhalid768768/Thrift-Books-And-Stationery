import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Import custom toast utility (for reference - used in other components)
// import customToast from './utils/toastUtils';

// Import contexts
import { DarkModeContext } from './context/DarkModeContext';  // DarkModeContextProvider is already in index.js
import { AuthProvider, useAuth } from './context/AuthContext';

// Import components
import Navbar from './components/Navbar/Navbar';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Main App component with routes
const AppContent = () => {
  const { darkMode } = useContext(DarkModeContext);
  
  // Dynamic import of pages to improve initial load time
  const Login = React.lazy(() => import('./pages/Login/Login'));
  const AddProduct = React.lazy(() => import('./pages/AddProduct/AddProduct'));
  const Orders = React.lazy(() => import('./pages/Orders/Orders'));
  const NotFound = React.lazy(() => import('./pages/NotFound/NotFound'));
  
  // Loading fallback component
  const LoadingFallback = () => (
    <div className="loading-fallback">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
  
  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      {/* 
       * Toast container with enhanced dark mode support 
       * Styling is handled by App.css and centralized toast utility in toastUtils.js
       */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
        className={`toast-container ${darkMode ? 'dark-mode' : ''}`}
        toastClassName={({ type }) => `toast-custom Toastify__toast--${type || 'default'} ${
          darkMode ? 'Toastify__toast--dark toast-dark' : 'Toastify__toast--light toast-light'
        }`}
        bodyClassName={`toast-body-custom ${
          darkMode ? 'toast-body-dark' : 'toast-body-light'
        }`}
        progressClassName={`toast-progress-custom ${
          darkMode ? 'toast-progress-dark' : 'toast-progress-light'
        }`}
        style={{
          transition: 'all 0.3s ease',
        }}
      />
      
      <Navbar />
      
      <main className="main-content">
        <React.Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Login />} />
            
            <Route 
              path="/addproduct" 
              element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback for any undefined routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </React.Suspense>
      </main>
    </div>
  );
};

// Root App component with AuthProvider
// Note: DarkModeContextProvider is already provided in index.js
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

