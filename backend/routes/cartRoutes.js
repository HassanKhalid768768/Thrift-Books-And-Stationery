const express = require("express");
const authMiddleware = require('./../middleware/authMiddleware')
const cartController = require('./../controllers/cartController');

const router = express.Router();

router.post("/addToCart", authMiddleware, cartController.addToCart);
router.post("/removeFromCart", authMiddleware, cartController.removeFromCart);
router.get("/getCart", authMiddleware, cartController.getCart);

module.exports = router;