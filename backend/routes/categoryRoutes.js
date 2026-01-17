const express = require("express");
const router = express.Router();
const categoryController = require("./../controllers/categoryController");
const authMiddleware = require("./../middleware/authMiddleware");

// Public routes
router.get("/", categoryController.getAllCategories);
// IMPORTANT: /admin/all must come before /:slug or "admin" would be matched as a slug
router.get("/admin/all", authMiddleware, categoryController.getAllCategoriesAdmin);
router.get("/:slug", categoryController.getCategoryBySlug);

// Admin routes (require authentication) - create, update, delete
router.post("/", authMiddleware, categoryController.createCategory);
router.patch("/:id", authMiddleware, categoryController.updateCategory);
router.delete("/:id", authMiddleware, categoryController.deleteCategory);

module.exports = router;
