const Product = require("./../models/productModel");
const Order = require("./../models/orderModel");
const fs = require("fs");
require("dotenv").config({ path: "./config.env" });
const cloudinary = require("./../utils/cloudinary");
const { normalizeCategory, categoriesMatch, isValidCategory, getValidCategories } = require('./../utils/categoryUtils');

const backend_url = process.env.BACKEND_URL;

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  const products = await Product.find({});
  const length = products.length;
  let id = 1;
  if (length > 0) id = products[length - 1].id + 1;
  const { name, category, new_price, old_price, description } = req.body;
  try {
    // upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    const product = await Product.create({
      id,
      name,
      image: result.secure_url,
      category,
      description,
      new_price,
      old_price,
    });
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const { id } = req.params;
  try {
    const product = await Product.findOne({ id });
    // Delete the image from Cloudinary 
    const imageId = product.image.split("/").pop().split(".")[0]; 
    await cloudinary.uploader.destroy(imageId);
    await Product.findOneAndDelete({ id });
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

exports.getNewCollections = async (req, res, next) => {
  try {
    const products = await Product.find({});
    const newCollection = products.slice(-8);
    res.status(200).json(newCollection);
  } catch (err) {
    next(err);
  }
};

exports.getPopularTShirts = async (req, res, next) => {
  try {
    const products = await Product.find({ category: "tshirts" });
    const popularTShirts = products.slice(0, 4);
    res.status(200).json(popularTShirts);
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;
    
    console.log(`Review attempt - Product ID: ${id}, User ID: ${userId}`);
    
    // Validate review data
    if (!rating || !comment) {
      return res.status(400).json({ error: "Rating and comment are required" });
    }
    
    // Convert rating to number and validate range
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
    }
    
    // Find product by id (convert to number to ensure type consistency)
    const productId = Number(id);
    const product = await Product.findOne({ id: productId });
    if (!product) {
      console.log(`Product not found with ID: ${productId}`);
      return res.status(404).json({ error: "Product not found" });
    }
    
    console.log(`Found product: ${product.name}, Category: ${product.category}`);
    
    // Normalize product category for consistent comparison
    const normalizedProductCategory = normalizeCategory(product.category);
    console.log(`Product category normalized: ${product.category} → ${normalizedProductCategory}`);
    
    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (review) => review.userId.toString() === userId.toString()
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({ error: "Product already reviewed" });
    }
    
    // Find user's delivered orders - using exact match for status
    const orders = await Order.find({
      userId: userId.toString(),
      status: "Delivered" // Exact match for "Delivered" status
    });
    
    console.log(`Found ${orders.length} delivered orders for user ${userId}`);
    console.log(`Looking for product ID: ${productId}, name: "${product.name}", category: "${product.category}" (normalized: "${normalizedProductCategory}")`);
    
    // Log details of all delivered orders and their items
    orders.forEach((order, idx) => {
      console.log(`Order ${idx + 1} (ID: ${order._id}):`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Items: ${order.items.length}`);
      
      // Log individual items in this order with normalized categories
      order.items.forEach((item, itemIdx) => {
        const normalizedItemCategory = normalizeCategory(item.category);
        console.log(`  Item ${itemIdx + 1}: id=${item.id}, name=${item.name}, category=${item.category || 'unknown'}`);
        console.log(`    Normalized category: ${item.category} → ${normalizedItemCategory}`);
        
        // Check if this item's category matches the product's category
        const categoryMatches = categoriesMatch(item.category, product.category);
        console.log(`    Category match with product: ${categoryMatches ? 'YES' : 'NO'}`);
      });
    });
    
    // Check if any of these orders contain the product we want to review
    let foundInOrderId = null;
    let matchDetail = null;
    
    const hasOrderedProduct = orders.some(order => {
      // Check each item in the order for a match with our product
      const containsProduct = order.items.some(item => {
        console.log(`\nMatch attempt - Order ${order._id}, Item: ${item.name || 'unnamed'}`);
        
        // Three ways to match a product:
        
        // 1. ID matching (preferred if available)
        const idMatch = (
          Number(item.id) === productId || 
          String(item.id) === String(productId)
        );
        
        // 2. Category and name matching (for consistent products)
        const categoryMatch = categoriesMatch(item.category, product.category);
        const nameMatch = item.name && product.name && 
                         item.name.toLowerCase() === product.name.toLowerCase();
        
        // 3. Properties matching (fallback)
        const priceMatch = item.new_price && product.new_price && 
                          Number(item.new_price) === Number(product.new_price);
        
        // Combined match strategy
        const isCategoryAndNameMatch = categoryMatch && nameMatch;
        const match = idMatch || isCategoryAndNameMatch || (categoryMatch && priceMatch);
        
        // Log match details
        console.log(`  ID match: ${idMatch}`);
        console.log(`  Category match: ${categoryMatch}`);
        console.log(`    Product category: ${product.category} → ${normalizeCategory(product.category)}`);
        console.log(`    Item category: ${item.category} → ${normalizeCategory(item.category)}`);
        console.log(`  Name match: ${nameMatch}`);
        console.log(`  Price match: ${priceMatch}`);
        console.log(`  FINAL RESULT: ${match ? 'MATCH!' : 'No match'}`);
        
        // Save match details for successful matches
        if (match) {
          foundInOrderId = order._id;
          matchDetail = {
            orderId: order._id,
            orderStatus: order.status,
            itemId: item.id,
            itemName: item.name,
            itemCategory: item.category,
            matchType: idMatch ? 'ID' : (isCategoryAndNameMatch ? 'Category+Name' : 'Category+Price')
          };
          
          console.log(`Match found! Product ${productId} (${product.name}) in order ${order._id}`);
          console.log(`  Order item: ID=${item.id}, Name=${item.name}, Category=${item.category || 'unknown'}`);
        }
        
        return match;
      });
      
      return containsProduct;
    });
    
    // Handle result of validation
    if (!hasOrderedProduct) {
      console.log(`User ${userId} has not purchased and received product ${productId}`);
      
      return res.status(403).json({ 
        error: "You can only review products you've purchased and received",
        details: {
          productId,
          productName: product.name,
          productCategory: product.category,
          normalizedCategory: normalizedProductCategory,
          validCategories: getValidCategories(),
          ordersChecked: orders.length,
          message: "No matching product found in your delivered orders"
        }
      });
    }
    
    console.log(`✅ Validation passed! User ${userId} can review product ${productId} (${product.name})`);
    console.log(`Found in order: ${foundInOrderId}`);
    if (matchDetail) {
      console.log(`Match details:`, JSON.stringify(matchDetail, null, 2));
    }
    
    // Create review object
    const review = {
      userId,
      rating: ratingNum,
      comment,
      createdAt: Date.now()
    };
    
    // Add review to product
    product.reviews.push(review);
    
    // Save product (pre-save hook will handle ratings calculation)
    await product.save();
    
    res.status(201).json({ 
      message: "Review added successfully", 
      product: {
        id: product.id,
        name: product.name,
        averageRating: product.averageRating,
        numReviews: product.numReviews
      } 
    });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ id: Number(id) });
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    
    // Log the category request
    console.log(`Getting products for category: ${category}`);
    
    // Validate category parameter
    if (!category) {
      return res.status(400).json({ error: "Category parameter is required" });
    }
    
    // Normalize category using the utility function
    const normalizedCategory = normalizeCategory(category);
    console.log(`Normalized category: ${category} → ${normalizedCategory}`);
    
    // Use a case-insensitive regex for finding products with this category
    const categoryRegex = new RegExp(`^${normalizedCategory}$`, 'i');
    const products = await Product.find({ category: categoryRegex });
    
    console.log(`Found ${products.length} products in category ${normalizedCategory}`);
    
    // If no products found, check if it's an invalid category or just empty
    if (products.length === 0) {
      // List all unique categories in the database for debugging
      const allCategories = await Product.distinct('category');
      console.log(`Available categories: ${allCategories.join(', ')}`);
      
      // Check if this is a valid category that's just empty
      if (!isValidCategory(normalizedCategory)) {
        return res.status(404).json({ 
          error: "Invalid category", 
          message: `${category} is not a valid category`,
          validCategories: getValidCategories()
        });
      }
    }
    
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a review from a product (admin only)
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.params;
    
    console.log(`Deleting review ${reviewId} from product ${productId}`);
    
    // Convert product ID to number for consistency
    const numericProductId = Number(productId);
    
    // Find the product
    const product = await Product.findOne({ id: numericProductId });
    
    if (!product) {
      return res.status(404).json({ 
        error: "Product not found",
        message: `No product found with ID ${productId}`
      });
    }
    
    console.log('Current product state:');
    console.log('Average rating:', product.averageRating);
    console.log('Number of reviews:', product.numReviews);
    
    // Check if the review exists
    const reviewIndex = product.reviews.findIndex(
      review => review._id.toString() === reviewId
    );
    
    if (reviewIndex === -1) {
      return res.status(404).json({ 
        error: "Review not found",
        message: `No review found with ID ${reviewId} for this product`
      });
    }
    
    // Get review details for the response
    const deletedReview = {
      _id: product.reviews[reviewIndex]._id,
      userId: product.reviews[reviewIndex].userId,
      rating: product.reviews[reviewIndex].rating,
      comment: product.reviews[reviewIndex].comment,
      createdAt: product.reviews[reviewIndex].createdAt
    };
    
    console.log('Removing review:', deletedReview);
    
    // Remove the review
    product.reviews.splice(reviewIndex, 1);
    
    // Save the product and wait for the operation to complete
    console.log('Saving product...');
    await product.save();
    
    // Verify the update by fetching the fresh product from database
    const updatedProduct = await Product.findOne({ id: numericProductId });
    console.log('Updated product state:');
    console.log('New average rating:', updatedProduct.averageRating);
    console.log('New number of reviews:', updatedProduct.numReviews);
    
    res.status(200).json({
      message: "Review deleted successfully",
      deletedReview,
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        averageRating: updatedProduct.averageRating,
        numReviews: updatedProduct.numReviews
      }
    });
  } catch (err) {
    console.error('Error in deleteReview:', err);
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);
    
    // Find product by id
    const product = await Product.findOne({ id: numericId });
    
    if (!product) {
      return res.status(404).json({ 
        error: "Product not found",
        message: `No product found with ID ${id}`
      });
    }
    
    // Get updated fields from request body
    const { name, category, new_price, old_price, description } = req.body;
    
    // Create updated product object
    const updatedFields = {
      name: name || product.name,
      category: category || product.category,
      new_price: new_price || product.new_price,
      old_price: old_price || product.old_price,
      description: description || product.description
    };
    
    // Check if there's a new image to upload
    if (req.file) {
      // Delete the old image from Cloudinary if it exists
      if (product.image) {
        const imageId = product.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(imageId);
      }
      
      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      updatedFields.image = result.secure_url;
    }
    
    // Update the product
    const updatedProduct = await Product.findOneAndUpdate(
      { id: numericId },
      updatedFields,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct
    });
  } catch (err) {
    next(err);
  }
};
