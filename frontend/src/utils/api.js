// API utility for frontend
const backend_url = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
  const url = `${backend_url}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers
    }
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, finalOptions);
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Specific API functions
export const api = {
  // User authentication
  login: (credentials) => apiCall('/api/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  signup: (userData) => apiCall('/api/users/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  // Products
  getProducts: () => apiCall('/api/products'),
  
  getProduct: (id) => apiCall(`/api/products/${id}`),

  // Cart operations
  getCart: () => apiCall('/api/cart/getCart'),
  
  addToCart: (itemId) => apiCall('/api/cart/addToCart', {
    method: 'POST',
    body: JSON.stringify({ itemId })
  }),

  removeFromCart: (itemId) => apiCall('/api/cart/removeFromCart', {
    method: 'POST',
    body: JSON.stringify({ itemId })
  }),

  // Orders
  placeOrder: (orderData) => apiCall('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),

  getUserOrders: (filters = {}) => apiCall('/api/orders/userorders', {
    method: 'POST',
    body: JSON.stringify(filters)
  }),

  verifyPayment: (paymentData) => apiCall('/api/orders/verify', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  }),

  // Coupons
  validateCoupon: (code) => apiCall('/api/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code })
  }),

  // Messages/Contact
  sendMessage: (messageData) => apiCall('/api/messages', {
    method: 'POST',
    body: JSON.stringify(messageData)
  }),

  // Newsletter
  subscribe: (email) => apiCall('/api/subscribers', {
    method: 'POST',
    body: JSON.stringify({ email })
  })
};

// Export backend URL for direct use if needed
export { backend_url };
