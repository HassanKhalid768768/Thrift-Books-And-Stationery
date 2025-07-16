const Coupon = require("./../models/couponModel");
require("dotenv").config({ path: "./config.env" });

// Create a new coupon (admin only)
exports.createCoupon = async (req, res, next) => {
  const { code, value, expiryDate } = req.body;
  try {
    // Check if coupon with same code already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ error: "Coupon code already exists" });
    }

    // Create new coupon
    const coupon = await Coupon.create({
      code,
      value,
      active: true,
      expiryDate: expiryDate || null,
    });
    
    res.status(200).json(coupon);
  } catch (err) {
    next(err);
  }
};

// Get all coupons (admin only)
exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({});
    res.status(200).json(coupons);
  } catch (err) {
    next(err);
  }
};

// Delete a coupon (admin only)
exports.deleteCoupon = async (req, res, next) => {
  const { id } = req.params;
  try {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    
    await Coupon.findByIdAndDelete(id);
    res.status(200).json(coupon);
  } catch (err) {
    next(err);
  }
};

// Validate a coupon (user accessible)
exports.validateCoupon = async (req, res, next) => {
  const { code } = req.body;
  try {
    // Find the coupon
    const coupon = await Coupon.findOne({ code });
    
    // Check if coupon exists
    if (!coupon) {
      return res.status(404).json({ error: "Invalid coupon code" });
    }
    
    // Check if coupon is active
    if (!coupon.active) {
      return res.status(400).json({ error: "Coupon is inactive" });
    }
    
    // Check if coupon is expired
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ error: "Coupon has expired" });
    }
    
    // Return the coupon if valid
    res.status(200).json({
      valid: true,
      code: coupon.code,
      value: coupon.value
    });
  } catch (err) {
    next(err);
  }
};

