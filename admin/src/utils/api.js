// API utility for admin
const backend_url = (process.env.REACT_APP_BACKEND_URL || "http://localhost:4000").replace(/\/$/, "");

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
  const url = `${backend_url}${endpoint}`;
  
  // Don't set Content-Type for FormData, let browser handle it
  const isFormData = options.body instanceof FormData;
  
  const defaultOptions = {
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
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

// Specific API functions for admin
export const api = {
  // Admin authentication
  login: (credentials) => apiCall('/api/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  // Products management
  getProducts: () => apiCall('/api/products'),
  
  addProduct: (formData) => apiCall('/api/products', {
    method: 'POST',
    body: formData
  }),

  updateProduct: (id, formData) => apiCall(`/api/products/${id}`, {
    method: 'PATCH',
    body: formData
  }),

  deleteProduct: (id) => apiCall(`/api/products/${id}`, {
    method: 'DELETE'
  }),

  // Orders management
  getOrders: () => apiCall('/api/orders'),
  
  updateOrderStatus: (orderId, status) => apiCall(`/api/orders/status`, {
    method: 'POST',
    body: JSON.stringify({ orderId, status })
  }),

  // Coupons management
  getCoupons: () => apiCall('/api/coupons'),
  
  createCoupon: (couponData) => apiCall('/api/coupons', {
    method: 'POST',
    body: JSON.stringify(couponData)
  }),

  updateCoupon: (id, couponData) => apiCall(`/api/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(couponData)
  }),

  deleteCoupon: (id) => apiCall(`/api/coupons/${id}`, {
    method: 'DELETE'
  }),

  // Messages management
  getMessages: () => apiCall('/api/messages'),
  
  updateMessageStatus: (id, status) => apiCall(`/api/messages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  deleteMessage: (id) => apiCall(`/api/messages/${id}`, {
    method: 'DELETE'
  }),

  // Reviews management
  getReviews: () => apiCall('/api/reviews'),
  
  approveReview: (id) => apiCall(`/api/reviews/${id}/approve`, {
    method: 'PUT'
  }),

  deleteReview: (id) => apiCall(`/api/reviews/${id}`, {
    method: 'DELETE'
  }),

  // Dashboard stats
  getDashboardStats: () => apiCall('/api/dashboard/stats')
};

// Export backend URL for direct use if needed
export { backend_url };
