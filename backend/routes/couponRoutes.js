const express = require("express");
const couponController = require("./../controllers/couponController");
const authMiddleware = require("./../middleware/authMiddleware");

const router = express.Router();

// Routes for coupon management
router.post("/", authMiddleware, couponController.createCoupon);
router.get("/", authMiddleware, couponController.getAllCoupons);
router.delete("/:id", authMiddleware, couponController.deleteCoupon);
router.post("/validate", couponController.validateCoupon);

module.exports = router;

