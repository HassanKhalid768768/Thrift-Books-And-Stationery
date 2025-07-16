# API Implementation Guide

## Overview

This guide explains how to use the new centralized API pattern implemented in your React applications (frontend and admin).

## Key Changes

### 1. Environment Variables
- **Frontend**: Uses `REACT_APP_BACKEND_URL` from environment variables
- **Admin**: Uses `REACT_APP_BACKEND_URL` from environment variables
- **Default**: Falls back to `http://localhost:4000` if not set

### 2. Centralized API Utilities
- **Frontend**: `src/utils/api.js`
- **Admin**: `src/utils/api.js`

## Environment Setup

### Development
```bash
# Frontend (.env.development)
REACT_APP_BACKEND_URL=http://localhost:4000

# Admin (.env.development)
PORT=3001
REACT_APP_BACKEND_URL=http://localhost:4000
```

### Production
```bash
# Frontend (.env.production)
REACT_APP_BACKEND_URL=https://your-production-backend-url.com

# Admin (.env.production)
REACT_APP_BACKEND_URL=https://your-production-backend-url.com
```

## Usage Examples

### Frontend API Usage

```javascript
import { api } from '../utils/api';

// User authentication
const response = await api.login({ email, password });
const response = await api.signup({ name, email, password });

// Products
const response = await api.getProducts();
const response = await api.getProduct(id);

// Cart operations
const response = await api.getCart();
const response = await api.addToCart(itemId);
const response = await api.removeFromCart(itemId);

// Orders
const response = await api.placeOrder(orderData);
const response = await api.getUserOrders();

// Coupons
const response = await api.validateCoupon(code);
```

### Admin API Usage

```javascript
import { api } from '../utils/api';

// Admin authentication
const response = await api.login({ email, password });

// Products management
const response = await api.getProducts();
const response = await api.addProduct(formData);
const response = await api.updateProduct(id, formData);
const response = await api.deleteProduct(id);

// Orders management
const response = await api.getOrders();
const response = await api.updateOrderStatus(orderId, status);

// Coupons management
const response = await api.getCoupons();
const response = await api.createCoupon(couponData);
const response = await api.updateCoupon(id, couponData);
const response = await api.deleteCoupon(id);

// Messages management
const response = await api.getMessages();
const response = await api.updateMessageStatus(id, status);
const response = await api.deleteMessage(id);

// Reviews management
const response = await api.getReviews();
const response = await api.deleteReview(id);
```

## Benefits

1. **Centralized Configuration**: All API endpoints are managed in one place
2. **Environment-Specific URLs**: Easy switching between development and production
3. **Automatic Authentication**: Token handling is built-in
4. **Type Safety**: All API calls are predefined and documented
5. **Error Handling**: Consistent error handling across all API calls
6. **Maintainability**: Easy to update API endpoints or add new ones

## Best Practices

1. Always use the API utility functions instead of direct fetch calls
2. Set environment variables for different environments
3. Handle responses and errors appropriately in your components
4. Use try-catch blocks for API calls that might fail

## Environment Variables Priority

React will load environment variables in this order:
1. `.env.development.local` (development only)
2. `.env.local` (always loaded except test)
3. `.env.development` (development only)
4. `.env`

## Security Notes

- Never commit sensitive API keys to version control
- Use `.env.local` for local development secrets
- Always use HTTPS in production
- Environment variables starting with `REACT_APP_` are embedded in the build and are public

## Migration Guide

### Before (Old Pattern)
```javascript
const backend_url = process.env.REACT_APP_BACKEND_URL;
const response = await fetch(`${backend_url}/api/users/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### After (New Pattern)
```javascript
import { api } from '../utils/api';
const response = await api.login(data);
```

This new pattern provides better maintainability, consistency, and ease of use across your entire application.
