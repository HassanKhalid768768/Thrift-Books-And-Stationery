# TBS-Thrift & Budget Store

A full-stack e-commerce application for buying and selling thrift books and stationery items. This project features a React frontend, Node.js/Express backend, and supports Cash on Delivery (COD) and Bank Transfer payment methods.

## 🚀 Features

- **User Authentication**: Secure registration and login system
- **Product Management**: Browse, search, and filter books and stationery items
- **Shopping Cart**: Add/remove items with real-time updates
- **Payment Processing**: Cash on Delivery (COD) and Bank Transfer payment methods
- **Image Upload**: Cloudinary integration for product images
- **Email Notifications**: Automated email system using Nodemailer
- **Admin Panel**: Manage products, orders, and users
- **Responsive Design**: Mobile-friendly UI with Material-UI components

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - Modern UI library
- **Material-UI (MUI)** - Component library for styling
- **React Router** - Client-side routing
- **React Toastify** - Toast notifications
- **JWT Decode** - JSON Web Token handling

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage and management
- **Nodemailer** - Email service
- **Node-cron** - Task scheduling

## 📁 Project Structure

```
Thrift-Books-And-Stationery/
├── frontend/           # React application
├── backend/            # Express server
├── admin/              # Admin panel
├── node_modules/       # Dependencies
├── package.json        # Root package configuration
└── README.md          # This file
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Cloudinary account for image storage

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Thrift-Books-And-Stationery
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
   
   Create environment files:
   - Copy `.env.development` to `.env`
   - Configure your environment variables:
     - MongoDB connection string
     - JWT secret
     - Cloudinary credentials
     - Email service configuration

4. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```
   
   Configure environment files:
   - Copy `.env.development` to `.env`
   - Set API endpoints and client-side configurations

5. **Setup Admin Panel**
   ```bash
   cd admin
   npm install
   ```
   
   Configure environment files similar to frontend

## 🔧 Running the Application

### Development Mode

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on `http://localhost:5000` (or configured port)

2. **Start Frontend Application**
   ```bash
   cd frontend
   npm start
   ```
   Application runs on `http://localhost:3000`

3. **Start Admin Panel** (if needed)
   ```bash
   cd admin
   npm start
   ```

### Production Mode

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm start
   ```

## 📝 Environment Variables

### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - User authentication and authorization
  - Product catalog and shopping cart
  - Payment processing with COD and Bank Transfer
  - Admin panel for management
  - Email notifications

---

**Happy Shopping! 📚✏️**
