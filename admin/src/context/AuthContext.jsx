import React, { createContext, useContext, useState, useEffect } from 'react';
import customToast from '../utils/toastUtils';

// Create the authentication context
export const AuthContext = createContext();

// Create a custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for token and admin status in localStorage on component mount
  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedAdmin = localStorage.getItem('admin') === 'true';
      
      if (storedToken && storedAdmin) {
        setToken(storedToken);
        setIsAdmin(true);
        setIsAuthenticated(true);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const backend_url = process.env.REACT_APP_API_URL;
      const response = await fetch(`${backend_url}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.role === 'admin') {
          // Store auth data
          localStorage.setItem('token', data.token);
          localStorage.setItem('admin', 'true');
          
          // Update state
          setToken(data.token);
          setIsAdmin(true);
          setIsAuthenticated(true);
          
          customToast.success("You're logged in as admin");
          return true;
        } else {
          customToast.error("You don't have admin privileges");
          return false;
        }
      } else {
        customToast.error(data.error || "Login failed");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      customToast.error("An error occurred during login");
      return false;
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    
    // Reset state
    setToken(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
    
    customToast.info("You've been logged out");
  };

  // Create the value object that will be passed to consumers
  const value = {
    isAuthenticated,
    isAdmin,
    token,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

