const Product = require("./../models/productModel");
const Order = require("./../models/orderModel");
const fs = require("fs");
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

exports.searchProducts = async (req, res, next) => {
  try {
    const { query, category } = req.query;

    // Build search criteria
    let searchCriteria = {};

    // Add text search if query is provided
    if (query && query.trim()) {
      const searchRegex = new RegExp(query.trim(), 'i'); // Case-insensitive search
      searchCriteria.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
    }

    // Add category filter if provided
    if (category && category.trim() && category !== 'all') {
      const normalizedCategory = normalizeCategory(category);
      const categoryRegex = new RegExp(`^${normalizedCategory}$`, 'i');
      searchCriteria.category = categoryRegex;
    }

    // If no search criteria provided, return all products
    if (Object.keys(searchCriteria).length === 0) {
      const products = await Product.find({});
      return res.status(200).json(products);
    }

    // Execute search
    const products = await Product.find(searchCriteria);

    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

exports.getProductSuggestions = async (req, res, next) => {
  try {
    const { query, category, limit = 10 } = req.query;

    // Require at least 2 characters for suggestions to avoid too many results
    if (!query || query.trim().length < 2) {
      return res.status(200).json([]);
    }

    // Build search criteria
    let searchCriteria = {};

    const searchRegex = new RegExp(query.trim(), 'i'); // Case-insensitive search
    searchCriteria.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { category: searchRegex }
    ];

    // Add category filter if provided
    if (category && category.trim() && category !== 'all') {
      const normalizedCategory = normalizeCategory(category);
      const categoryRegex = new RegExp(`^${normalizedCategory}$`, 'i');
      searchCriteria.category = categoryRegex;
    }

    // Execute search with limit and only return essential fields for suggestions
    const products = await Product.find(searchCriteria)
      .select('id name category image new_price old_price')
      .limit(parseInt(limit))
      .sort({ name: 1 }); // Sort alphabetically

    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    // Optimize ID generation: find only the last product by ID
    const lastProduct = await Product.findOne().sort({ id: -1 });
    let id = 1;
    if (lastProduct) {
      id = lastProduct.id + 1;
    }

    const { name, category, new_price, old_price, description, sizes } = req.body;

    console.log('CreatesProduct - Body:', JSON.stringify(req.body, null, 2));
    console.log('CreateProduct - Files:', req.files);

    // upload image to Cloudinary
    let mainImage = "";
    if (req.files && req.files['product']) {
      mainImage = req.files['product'][0].path;
    } else if (req.body.mainImage) {
      mainImage = req.body.mainImage;
    }

    let additionalImages = [];
    if (req.files && req.files['additionalImages']) {
      additionalImages = req.files['additionalImages'].map(file => file.path);
    }

    // Handle additional images from library
    if (req.body.additionalImageUrls) {
      try {
        const libraryImages = JSON.parse(req.body.additionalImageUrls);
        if (Array.isArray(libraryImages)) {
          additionalImages = [...additionalImages, ...libraryImages];
        }
      } catch (e) {
        console.error('Error parsing additionalImageUrls:', e);
      }
    }

    // Parse sizes if provided
    let parsedSizes = [];
    if (sizes) {
      try {
        parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (e) {
        console.error('Error parsing sizes:', e);
        parsedSizes = [];
      }
    }

    const product = await Product.create({
      id,
      name,
      image: mainImage,
      additionalImages: additionalImages,
      category,
      description,
      new_price,
      old_price,
      sizes: parsedSizes,
    });
    console.log('Create Product - Created product:', product);
    console.log('Create Product - Created product sizes:', product.sizes);
    res.status(200).json(product);
  } catch (err) {
    console.error("Error creating product:", err);
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const { id } = req.params;
  try {
    const product = await Product.findOne({ id });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 1. Delete main Image from Cloudinary
    if (product.image) {
      const publicId = cloudinary.getPublicIdFromUrl(product.image);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    // 2. Delete Additional Images from Cloudinary
    if (product.additionalImages && product.additionalImages.length > 0) {
      for (const imgUrl of product.additionalImages) {
        const publicId = cloudinary.getPublicIdFromUrl(imgUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
    }

    // 3. Delete Review Images from Cloudinary
    if (product.reviews && product.reviews.length > 0) {
      for (const review of product.reviews) {
        if (review.images && review.images.length > 0) {
          for (const imgUrl of review.images) {
            const publicId = cloudinary.getPublicIdFromUrl(imgUrl);
            if (publicId) await cloudinary.uploader.destroy(publicId);
          }
        }
      }
    }

    await Product.findOneAndDelete({ id });
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

exports.getNewCollections = async (req, res, next) => {
  try {
    const products = await Product.find({
      category: { $in: ['stationary', 'gadgets'] }
    }).sort({ createdAt: -1 }).limit(8);
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

exports.getPopularBooks = async (req, res, next) => {
  try {
    const products = await Product.find({ category: "course-books" });
    const popularBooks = products.slice(0, 4);
    res.status(200).json(popularBooks);
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
    console.log(`Review Files:`, req.files ? req.files.length : 0);
    if (req.files) {
      req.files.forEach((f, i) => console.log(`  File ${i + 1}: ${f.originalname} -> ${f.path}`));
    }

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
        const priceMatch = item.old_price && product.old_price &&
          Number(item.old_price) === Number(product.old_price);

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
    const reviewImages = req.files ? req.files.map(file => file.path) : [];

    const review = {
      userId,
      rating: ratingNum,
      comment,
      images: reviewImages,
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

    // Delete associated images from Cloudinary
    const reviewToDelete = product.reviews[reviewIndex];
    if (reviewToDelete.images && reviewToDelete.images.length > 0) {
      for (const imgUrl of reviewToDelete.images) {
        const publicId = cloudinary.getPublicIdFromUrl(imgUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (e) {
            console.error('Error deleting review image from Cloudinary:', e);
          }
        }
      }
    }

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
    const { name, category, new_price, old_price, description, available, sizes } = req.body;

    console.log('Update Product - Received body:', req.body);
    console.log('Update Product - Sizes field:', sizes);

    // Parse sizes if provided
    // Note: With multer FormData, sizes comes as a JSON string
    let parsedSizes = [];

    // Check if sizes field exists in request (even if empty)
    if (sizes !== undefined) {
      // Handle empty string or empty array string
      if (sizes === '' || sizes === '[]' || (typeof sizes === 'string' && sizes.trim() === '[]')) {
        parsedSizes = [];
        console.log('Update Product - Setting sizes to empty array');
      } else if (sizes !== null) {
        try {
          // If it's a string, try to parse it as JSON
          parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
          // Ensure it's an array
          if (!Array.isArray(parsedSizes)) {
            console.warn('Update Product - Parsed sizes is not an array:', parsedSizes);
            parsedSizes = [];
          } else {
            console.log('Update Product - Parsed sizes successfully:', parsedSizes);
          }
        } catch (e) {
          console.error('Update Product - Error parsing sizes:', e);
          console.error('Update Product - Sizes value that failed:', sizes);
          parsedSizes = [];
        }
      } else {
        // sizes is null, set to empty array
        parsedSizes = [];
      }
    } else {
      // If sizes is undefined (not sent in request), keep existing sizes
      parsedSizes = product.sizes || [];
      console.log('Update Product - Sizes not provided in request, keeping existing:', parsedSizes);
    }

    // Create updated product object
    const updatedFields = {
      name: name || product.name,
      category: category || product.category,
      new_price: new_price || product.new_price,
      old_price: old_price || product.old_price,
      description: description || product.description,
      sizes: parsedSizes
    };

    // Handle availability field (allow boolean values)
    if (available !== undefined) {
      updatedFields.available = Boolean(available);
    }

    // Check if there's a new image to upload or selected from library
    if (req.files && req.files['product']) {
      // Delete the old image from Cloudinary if it exists
      if (product.image) {
        const publicId = cloudinary.getPublicIdFromUrl(product.image);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (e) { console.error('Error deleting old image:', e); }
        }
      }
      updatedFields.image = req.files['product'][0].path;
    } else if (req.body.image) {
      // Handle image selected from library (passed as URL string)
      updatedFields.image = req.body.image;
    }

    // Check for existing images to keep
    let currentAdditionalImages = product.additionalImages || [];
    let imagesToRemove = [];

    if (req.body.existingAdditionalImages) {
      try {
        const keptImages = JSON.parse(req.body.existingAdditionalImages);
        const keptImagesSet = new Set(keptImages);

        // Identify images that were removed
        imagesToRemove = currentAdditionalImages.filter(img => !keptImagesSet.has(img));
        currentAdditionalImages = Array.isArray(keptImages) ? keptImages : [];
      } catch (e) {
        console.error('Error parsing existingAdditionalImages:', e);
      }
    } else if (req.body.existingAdditionalImages === undefined) {
      // If not provided at all, we keep everything (standard behavior)
    } else {
      // Explicitly empty or invalid
      imagesToRemove = [...currentAdditionalImages];
      currentAdditionalImages = [];
    }

    // Delete removed additional images from Cloudinary
    if (imagesToRemove.length > 0) {
      for (const imgUrl of imagesToRemove) {
        const publicId = cloudinary.getPublicIdFromUrl(imgUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
            console.log(`Deleted removed additional image: ${publicId}`);
          } catch (e) {
            console.error('Error deleting additional image from Cloudinary:', e);
          }
        }
      }
    }

    // Initialize additionalImages with kept images
    let finalAdditionalImages = [...currentAdditionalImages];

    // Append new uploaded files
    if (req.files && req.files['additionalImages']) {
      const newFiles = req.files['additionalImages'].map(file => file.path);
      finalAdditionalImages = [...finalAdditionalImages, ...newFiles];
    }

    // Append new images selected from library
    if (req.body.newAdditionalImageUrls) {
      try {
        const libraryImages = JSON.parse(req.body.newAdditionalImageUrls);
        if (Array.isArray(libraryImages)) {
          finalAdditionalImages = [...finalAdditionalImages, ...libraryImages];
        }
      } catch (e) {
        console.error('Error parsing newAdditionalImageUrls:', e);
      }
    }

    updatedFields.additionalImages = finalAdditionalImages;

    console.log('UpdateProduct - Final updatedFields.additionalImages:', updatedFields.additionalImages);

    // Update the product
    const updatedProduct = await Product.findOneAndUpdate(
      { id: numericId },
      updatedFields,
      { new: true, runValidators: true }
    );

    console.log('Update Product - Updated product:', updatedProduct);
    console.log('Update Product - Updated product sizes:', updatedProduct?.sizes);

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleProductAvailability = async (req, res, next) => {
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

    // Toggle availability
    const updatedProduct = await Product.findOneAndUpdate(
      { id: numericId },
      { available: !product.available },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: `Product ${updatedProduct.available ? 'marked as available' : 'marked as out of stock'}`,
      product: updatedProduct
    });
  } catch (err) {
    next(err);
  }
};

exports.getCloudinaryImages = async (req, res, next) => {
  try {
    console.log('getCloudinaryImages - Request received');
    const { next_cursor } = req.query;
    // Fetch images (resource_type: image)
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'image',
      max_results: 30,
      next_cursor: next_cursor
    });
    console.log('getCloudinaryImages - Fetched resources count:', result.resources ? result.resources.length : 'No resources field');
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching Cloudinary images:", err);
    next(err);
  }
};

/**
 * Helper to get all referenced public IDs from the database
 */
async function getReferencedPublicIds() {
  const products = await Product.find({}, 'image additionalImages reviews.images');
  const publicIds = new Set();

  products.forEach(product => {
    // Main image
    if (product.image) {
      const pid = cloudinary.getPublicIdFromUrl(product.image);
      if (pid) publicIds.add(pid);
    }

    // Additional images
    if (product.additionalImages) {
      product.additionalImages.forEach(url => {
        const pid = cloudinary.getPublicIdFromUrl(url);
        if (pid) publicIds.add(pid);
      });
    }

    // Review images
    if (product.reviews) {
      product.reviews.forEach(review => {
        if (review.images) {
          review.images.forEach(url => {
            const pid = cloudinary.getPublicIdFromUrl(url);
            if (pid) publicIds.add(pid);
          });
        }
      });
    }
  });

  return publicIds;
}

/**
 * Detect orphaned images in Cloudinary (Admin only)
 */
exports.getOrphanedImages = async (req, res, next) => {
  try {
    const referencedIds = await getReferencedPublicIds();

    // Fetch all assets from Cloudinary (prefix 'images/' to be safe as per route config)
    let allAssets = [];
    let nextCursor = null;

    do {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'images/',
        max_results: 100,
        next_cursor: nextCursor
      });
      allAssets = allAssets.concat(result.resources);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    const orphans = allAssets.filter(asset => !referencedIds.has(asset.public_id))
      .map(asset => ({
        public_id: asset.public_id,
        url: asset.secure_url,
        created_at: asset.created_at
      }));

    res.status(200).json({
      count: orphans.length,
      orphans: orphans
    });
  } catch (err) {
    console.error("Error detecting orphaned images:", err);
    next(err);
  }
};

/**
 * Delete orphaned images from Cloudinary (Admin only)
 */
exports.cleanupCloudinary = async (req, res, next) => {
  try {
    const referencedIds = await getReferencedPublicIds();

    let allAssets = [];
    let nextCursor = null;

    do {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'images/',
        max_results: 100,
        next_cursor: nextCursor
      });
      allAssets = allAssets.concat(result.resources);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    const orphanPublicIds = allAssets.filter(asset => !referencedIds.has(asset.public_id))
      .map(asset => asset.public_id);

    if (orphanPublicIds.length === 0) {
      return res.status(200).json({ message: "No orphaned images found." });
    }

    // Delete in batches of 100 (Cloudinary limit)
    const batchSize = 100;
    for (let i = 0; i < orphanPublicIds.length; i += batchSize) {
      const batch = orphanPublicIds.slice(i, i + batchSize);
      await cloudinary.api.delete_resources(batch);
    }

    res.status(200).json({
      message: `Successfully deleted ${orphanPublicIds.length} orphaned images.`,
      deletedIds: orphanPublicIds
    });
  } catch (err) {
    console.error("Error cleaning up Cloudinary:", err);
    next(err);
  }
};
