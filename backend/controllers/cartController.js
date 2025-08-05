const User = require("./../models/userModel");

//add to cart
exports.addToCart = async (req, res, next) => {
  const { _id } = req.user;
  const { itemId } = req.body;
  try {
    const userData = await User.findById(_id);
    const cartData = await userData.cartData;
    if (!cartData[itemId]) {
      cartData[itemId] = 1;
    } else {
      cartData[itemId] += 1;
    }
    const user = await User.findByIdAndUpdate(_id, { cartData }, { new: true });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

//remove from cart
exports.removeFromCart = async (req, res, next) => {
  const { _id } = req.user;
  const { itemId } = req.body;
  try {
    const userData = await User.findById(_id);
    const cartData = await userData.cartData;
    if (cartData[itemId] > 0) cartData[itemId] -= 1;
    const user = await User.findByIdAndUpdate(_id, { cartData }, { new: true });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

//get cart
exports.getCart = async (req, res, next) => {
  try {
    // Check if user exists
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const { _id } = req.user;
    const userData = await User.findById(_id);
    
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const cartData = await userData.cartData;
    res.status(200).json(cartData);
  } catch (err) {
    next(err);
  }
};

// Validate cart items availability
exports.validateCart = async (req, res, next) => {
  try {
    // Check if user exists
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const { _id } = req.user;
    const userData = await User.findById(_id);
    
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const cartData = userData.cartData;
    const Product = require('./../models/productModel');
    
    const cartValidation = {
      valid: true,
      unavailableItems: [],
      availableItems: []
    };
    
    // Check each item in the cart
    for (const [productId, quantity] of Object.entries(cartData)) {
      if (quantity > 0) {
        const product = await Product.findOne({ id: parseInt(productId) });
        
        if (!product) {
          cartValidation.valid = false;
          cartValidation.unavailableItems.push({
            id: parseInt(productId),
            quantity: quantity,
            reason: 'Product not found',
            name: 'Unknown Product'
          });
        } else if (!product.available) {
          cartValidation.valid = false;
          cartValidation.unavailableItems.push({
            id: product.id,
            name: product.name,
            quantity: quantity,
            reason: 'Out of stock',
            image: product.image
          });
        } else {
          cartValidation.availableItems.push({
            id: product.id,
            name: product.name,
            quantity: quantity,
            available: true
          });
        }
      }
    }
    
    res.status(200).json(cartValidation);
  } catch (err) {
    next(err);
  }
};

// Remove unavailable items from cart
exports.removeUnavailableItems = async (req, res, next) => {
  try {
    // Check if user exists
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const { _id } = req.user;
    const userData = await User.findById(_id);
    
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const cartData = userData.cartData;
    const Product = require('./../models/productModel');
    const itemsRemoved = [];
    
    // Check each item in the cart and remove unavailable ones
    for (const [productId, quantity] of Object.entries(cartData)) {
      if (quantity > 0) {
        const product = await Product.findOne({ id: parseInt(productId) });
        
        if (!product || !product.available) {
          itemsRemoved.push({
            id: parseInt(productId),
            name: product ? product.name : 'Unknown Product',
            quantity: quantity,
            reason: !product ? 'Product not found' : 'Out of stock'
          });
          
          // Remove from cart
          delete cartData[productId];
        }
      }
    }
    
    // Update user's cart
    const updatedUser = await User.findByIdAndUpdate(_id, { cartData }, { new: true });
    
    res.status(200).json({
      success: true,
      message: `Removed ${itemsRemoved.length} unavailable item(s) from cart`,
      itemsRemoved: itemsRemoved,
      updatedCart: updatedUser.cartData
    });
  } catch (err) {
    next(err);
  }
};
