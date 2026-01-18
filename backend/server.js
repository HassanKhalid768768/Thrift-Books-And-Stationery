require('dotenv').config();

console.log("Cloudinary Config Check:");
console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "EXISTS" : "MISSING");
console.log("API_KEY:", process.env.CLOUDINARY_API_KEY ? "EXISTS" : "MISSING");
console.log("SECRET_KEY:", process.env.CLOUDINARY_SECRET_KEY ? "EXISTS" : "MISSING");
console.log("API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "EXISTS" : "MISSING");

const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");
const couponRoutes = require("./routes/couponRoutes");
const messageRoutes = require("./routes/messageRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

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
app.use("/api/categories", categoryRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Backend is up and running');
});

// Health check endpoint (for UptimeRobot to keep server awake)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
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
  console.error("SERVER ERROR DETECTED:");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
    // Provide stack for debugging if it's a 500
    details: statusCode === 500 ? "Check server logs for details" : undefined
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
