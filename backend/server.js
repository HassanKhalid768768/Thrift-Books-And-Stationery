require('dotenv').config();

const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");
const couponRoutes = require("./routes/couponRoutes");
const messageRoutes = require("./routes/messageRoutes");

const connectDB = require("./db");
const { scheduleCleanup } = require('./utils/cleanupScheduler');

// app config
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(express.json());

// ✅ Allow frontend & admin (Render + localhost)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  "http://localhost:3000",
  "http://localhost:3001"
].filter(Boolean); // Remove any undefined values

// Debug: Log the allowed origins
console.log('Allowed CORS origins:', allowedOrigins);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('ADMIN_URL:', process.env.ADMIN_URL);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true
}));

// Optional: log incoming origins
app.use((req, res, next) => {
  console.log("Request origin:", req.headers.origin);
  next();
});

// api endpoints
app.use("/images", express.static("upload/images"));
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/messages", messageRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Backend is up and running');
});

// Test CORS endpoint
app.get('/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working',
    origin: req.headers.origin || 'No origin header',
    allowedOrigins: allowedOrigins
  });
});

// Test API endpoint for frontend connectivity
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is accessible from frontend',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'No origin header'
  });
});

// Error handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    error: message,
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      // Start the cleanup scheduler after server is running
      scheduleCleanup();
    });
  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
