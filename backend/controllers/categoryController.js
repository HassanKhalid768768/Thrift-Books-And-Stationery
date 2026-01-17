const Category = require("./../models/categoryModel");

// Get all categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 });
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

// Get all categories (including inactive) - for admin
exports.getAllCategoriesAdmin = async (req, res, next) => {
  try {
    const categories = await Category.find({})
      .sort({ displayOrder: 1, name: 1 });
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

// Get category by slug
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug, isActive: true });
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
};

// Create category
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, image, displayOrder, isActive } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }
    
    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if category with same name or slug already exists
    const existingCategory = await Category.findOne({
      $or: [
        { name: name.trim() },
        { slug: slug }
      ]
    });
    
    if (existingCategory) {
      return res.status(400).json({ error: "Category with this name already exists" });
    }
    
    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description || "",
      image: image || "",
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Category with this name or slug already exists" });
    }
    next(err);
  }
};

// Update category
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image, displayOrder, isActive } = req.body;
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    // If name is being updated, generate new slug
    if (name && name.trim() && name.trim() !== category.name) {
      const newSlug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Check if new slug conflicts with existing category
      const existingCategory = await Category.findOne({
        _id: { $ne: id },
        $or: [
          { name: name.trim() },
          { slug: newSlug }
        ]
      });
      
      if (existingCategory) {
        return res.status(400).json({ error: "Category with this name already exists" });
      }
      
      category.name = name.trim();
      category.slug = newSlug;
    }
    
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (isActive !== undefined) category.isActive = isActive;
    
    category.updatedAt = Date.now();
    
    await category.save();
    
    res.status(200).json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Category with this name or slug already exists" });
    }
    next(err);
  }
};

// Delete category
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    // Check if category is being used by any products
    const Product = require("./../models/productModel");
    const productsWithCategory = await Product.findOne({ category: category.slug });
    
    if (productsWithCategory) {
      return res.status(400).json({ 
        error: "Cannot delete category. It is being used by one or more products." 
      });
    }
    
    await Category.findByIdAndDelete(id);
    
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    next(err);
  }
};
