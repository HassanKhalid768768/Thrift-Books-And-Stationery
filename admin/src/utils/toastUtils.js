import { toast } from 'react-toastify';

// Helper function to check if dark mode is enabled
const isDarkMode = () => {
  return localStorage.getItem('adminDarkMode') === 'true';
};

// Get theme-appropriate colors for toast messages
const getToastThemeColors = () => {
  // Instead of hardcoding colors, use CSS variables when possible
  // This ensures consistency with our CSS styling
  const darkMode = isDarkMode();
  
  return {
    success: {
      border: darkMode ? 'var(--toast-success, #2ecc71)' : 'var(--toast-success, #12b76a)',
      icon: darkMode ? 'var(--toast-success, #2ecc71)' : 'var(--toast-success, #12b76a)'
    },
    error: {
      border: darkMode ? 'var(--toast-error, #ff6666)' : 'var(--toast-error, #ff4444)',
      icon: darkMode ? 'var(--toast-error, #ff6666)' : 'var(--toast-error, #ff4444)'
    },
    warning: {
      border: darkMode ? 'var(--toast-warning, #ffa726)' : 'var(--toast-warning, #ff9800)',
      icon: darkMode ? 'var(--toast-warning, #ffa726)' : 'var(--toast-warning, #ff9800)'
    },
    info: {
      border: darkMode ? 'var(--toast-info, #4db5ff)' : 'var(--toast-info, #0089d0)',
      icon: darkMode ? 'var(--toast-info, #4db5ff)' : 'var(--toast-info, #0089d0)'
    },
    custom: {
      border: darkMode ? '#9c27b0' : '#673ab7',
      icon: darkMode ? '#9c27b0' : '#673ab7'
    }
  };
};

/**
 * Custom toast utility with consistent styling for both light and dark modes
 * 
 * This provides a standardized way to show notifications throughout the app
 * with consistent styling, animations, and behavior.
 */
const customToast = {
  /**
   * Show success toast notification
   * @param {string} message - The message to display
   * @param {Object} options - Optional configuration overrides
   */
  success: (message, options = {}) => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      icon: '✅',
      className: isDarkMode() ? 'Toastify__toast--dark' : 'Toastify__toast--light',
      style: {
        fontSize: '0.95rem',
        fontWeight: '500',
        lineHeight: '1.5',
        borderLeft: `4px solid ${getToastThemeColors().success.border}`
      },
      ...options
    });
  },

  /**
   * Show error toast notification
   * @param {string} message - The message to display
   * @param {Object} options - Optional configuration overrides
   */
  error: (message, options = {}) => {
    toast.error(message, {
      position: 'top-right',
      autoClose: 4000, // Errors stay a bit longer
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      icon: '❌',
      className: isDarkMode() ? 'Toastify__toast--dark' : 'Toastify__toast--light',
      style: {
        fontSize: '0.95rem',
        fontWeight: '500',
        lineHeight: '1.5',
        borderLeft: `4px solid ${getToastThemeColors().error.border}`
      },
      ...options
    });
  },

  /**
   * Show warning toast notification
   * @param {string} message - The message to display
   * @param {Object} options - Optional configuration overrides
   */
  warning: (message, options = {}) => {
    toast.warning(message, {
      position: 'top-right',
      autoClose: 3500,
      hideProgressBar: false, 
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      icon: '⚠️',
      className: isDarkMode() ? 'Toastify__toast--dark' : 'Toastify__toast--light',
      style: {
        fontSize: '0.95rem',
        fontWeight: '500',
        lineHeight: '1.5',
        borderLeft: `4px solid ${getToastThemeColors().warning.border}`
      },
      ...options
    });
  },

  /**
   * Show info toast notification
   * @param {string} message - The message to display
   * @param {Object} options - Optional configuration overrides
   */
  info: (message, options = {}) => {
    toast.info(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      icon: 'ℹ️',
      className: isDarkMode() ? 'Toastify__toast--dark' : 'Toastify__toast--light',
      style: {
        fontSize: '0.95rem',
        fontWeight: '500',
        lineHeight: '1.5',
        borderLeft: `4px solid ${getToastThemeColors().info.border}`
      },
      ...options
    });
  },

  /**
   * Show a custom toast notification
   * @param {string} message - The message to display
   * @param {Object} options - Optional configuration overrides
   */
  custom: (message, options = {}) => {
    toast(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: isDarkMode() ? 'Toastify__toast--dark' : 'Toastify__toast--light',
      style: {
        fontSize: '0.95rem',
        fontWeight: '500',
        lineHeight: '1.5',
        borderLeft: `4px solid ${getToastThemeColors().custom.border}`
      },
      ...options
    });
  }
};

export default customToast;

