const express = require("express");
const authMiddleware = require('./../middleware/authMiddleware')
const cartController = require('./../controllers/cartController');

const router = express.Router();

router.post("/addToCart", authMiddleware, cartController.addToCart);
router.post("/removeFromCart", authMiddleware, cartController.removeFromCart);
router.get("/getCart", authMiddleware, cartController.getCart);
router.get("/validate", authMiddleware, cartController.validateCart);
router.post("/removeUnavailable", authMiddleware, cartController.removeUnavailableItems);

module.exports = router;