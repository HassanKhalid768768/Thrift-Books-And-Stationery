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

// app config
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(express.json());

// ✅ Allow both frontend and admin panel origins
const allowedOrigins = [
  'https://thrift-books-and-stationery-frontend.onrender.com',
  'https://thrift-books-and-stationery-admin.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Optional: log incoming origins (for debugging CORS)
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

// Root test route
app.get('/', (req, res) => {
  res.send('Backend is up and running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    error: message,
  });
});

// Server listener
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
