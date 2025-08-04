const express = require("express");
const subscriberController = require("./../controllers/subscriberController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Public route - subscribe to newsletter
router.post("/", subscriberController.subscribe);

// Debug route - test auth without admin
router.get("/test-auth", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Auth middleware working",
    user: req.user
  });
});

// Debug route - test admin middleware
router.get("/test-admin", authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Admin middleware working",
    user: req.user
  });
});

// Admin routes - get all subscribers and delete subscriber
router.get("/", authMiddleware, adminMiddleware, subscriberController.getAllSubscribers);
router.delete("/:id", authMiddleware, adminMiddleware, subscriberController.deleteSubscriber);

module.exports = router;
