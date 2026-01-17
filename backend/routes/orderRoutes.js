const orderController = require("./../controllers/orderController");
const express = require("express");
const authMiddleware = require("./../middleware/authMiddleware");

const router = express.Router();

//endpoints
router.post("/place-direct", authMiddleware, orderController.placeOrderDirect);
router.post("/verify", orderController.verifyOrder);
router.post("/verify-bank-transfer", orderController.verifyBankTransfer);
router.post("/userorders", authMiddleware, orderController.userOrders);
router.get("/", orderController.getAllOrders);
router.post("/status", authMiddleware,orderController.updateStatus);
router.delete("/:orderId", authMiddleware, orderController.deleteOrder);
router.post("/cleanup", orderController.cleanupAbandonedOrders);
router.post("/cleanup-user", authMiddleware, orderController.cleanupUserPendingOrders);
router.get("/pending", orderController.getPendingOrders);

module.exports = router;
