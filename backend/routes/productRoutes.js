const express = require("express");
const multer = require("multer");
const path = require("path");
const productController = require("./../controllers/productController");
const authMiddleware = require("./../middleware/authMiddleware");
const adminMiddleware = require("./../middleware/adminMiddleware");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./../utils/cloudinary")

const router = express.Router();

// image storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "images",
  }
});

const upload = multer({ storage: storage });

router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/suggestions", productController.getProductSuggestions);
router.get("/images", authMiddleware, adminMiddleware, productController.getCloudinaryImages);
router.post("/", authMiddleware, upload.fields([{ name: 'product', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), productController.createProduct);
router.delete("/:id", authMiddleware, adminMiddleware, productController.deleteProduct);
router.patch("/:id", authMiddleware, adminMiddleware, upload.fields([{ name: 'product', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), productController.updateProduct);
router.patch("/:id/toggle-availability", authMiddleware, adminMiddleware, productController.toggleProductAvailability);
router.get("/newCollections", productController.getNewCollections);
router.get("/popularBooks", productController.getPopularBooks);
router.get("/category/:category", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);
router.post("/:id/reviews", authMiddleware, productController.createReview);
router.delete("/:productId/reviews/:reviewId", authMiddleware, adminMiddleware, productController.deleteReview);
module.exports = router;
