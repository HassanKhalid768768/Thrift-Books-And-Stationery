const Order = require("./../models/orderModel");
const User = require("./../models/userModel");
const errorHandler = require("./../utils/errorHandler");
const jwt = require("jsonwebtoken");
const Stripe = require("stripe");
const { normalizeCategory, categoriesMatch } = require('../utils/categoryUtils');
require("dotenv").config({ path: "./config.env" });

//configure stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Place order and create payment session
exports.placeOrder = async (req, res, next) => {
  const { _id } = req.user;
  const frontend_url = process.env.FRONTEND_URL;

  const { items, amount, address, appliedCoupon } = req.body;
  try {
    // Clean up ALL pending orders for this user instantly when placing new order
    await Order.deleteMany({
      userId: _id,
      payment: false
    });
    console.log('Cleaned up ALL pending orders for user', _id);
    // Normalize categories in items before saving
    const normalizedItems = items.map(item => {
      if (item.category) {
        return {
          ...item,
          category: normalizeCategory(item.category)
        };
      }
      return item;
    });
    
    console.log('Normalizing item categories for order');
    console.log('Before:', items.map(item => item.category));
    console.log('After:', normalizedItems.map(item => item.category));

    // Create the order with coupon information if applied and normalized categories
    // Mark as pending payment initially - cart will be cleared only after successful payment
    const order = await Order.create({
      userId: _id,
      items: normalizedItems,
      amount,
      address,
      appliedCoupon,
      payment: false, // Explicitly set to false until payment is verified
      status: 'Pending Payment'
    });

    // DO NOT clear cart here - only clear after successful payment verification

    // Calculate original total (without shipping)
    const originalTotal = items.reduce((sum, item) => sum + (item.new_price * item.quantity), 0);
    
    // Get discount amount if coupon applied
    const discountAmount = appliedCoupon ? appliedCoupon.value : 0;
    
    // Target total is the amount from request minus shipping (1)
    const targetTotalWithoutShipping = amount - 1;
    
    // Create line items with proportionally discounted prices
    let line_items = items.map((item) => {
      // Calculate item's proportion of the total
      const proportion = (item.new_price * item.quantity) / originalTotal;
      
      // Apply proportional discount
      let discountedUnitPrice;
      if (discountAmount > 0) {
        // Calculate the proportional discount for this item's total
        const itemTotalAfterDiscount = proportion * targetTotalWithoutShipping;
        // Get discounted unit price
        discountedUnitPrice = Math.round((itemTotalAfterDiscount / item.quantity) * 100) / 100;
      } else {
        discountedUnitPrice = item.new_price;
      }
      
      return {
        price_data: {
          currency: "pkr",
          product_data: {
            name: item.name + (discountAmount > 0 ? ` (Discounted with coupon: ${appliedCoupon.code})` : ""),
          },
          unit_amount: Math.round(discountedUnitPrice * 100), // Convert to paisa (1 PKR = 100 paisa)
        },
        quantity: item.quantity,
      };
    });
    
    // Add shipping fee
    line_items.push({
      price_data: {
        currency: "pkr",
        product_data: {
          name: "Shipping Fee",
        },
        unit_amount: 1 * 100, // Convert to paisa (1 PKR = 100 paisa)
      },
      quantity: 1,
    });
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${order._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${order._id}`,
    });
    
    res.status(200).json({ success: true, session_url: session.url });
  } catch (err) {
    next(err);
  }
};

// Verify order after payment
exports.verifyOrder = async (req, res, next) => {
  const { orderId, success } = req.body;
  try {
    if (success == "true") {
      // Find the order first to get user details
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, error: "Order not found" });
      }
      
      // Update order status to paid and confirmed
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { 
          payment: true,
          status: 'Order Confirmed'
        },
        { new: true }
      );
      
      // Clear user's cart ONLY after successful payment
      await User.findByIdAndUpdate(order.userId, { cartData: {} });
      
      console.log(`Payment successful for order ${orderId}, cart cleared for user ${order.userId}`);
      res.status(200).json(updatedOrder);
    } else {
      // Payment cancelled or failed - delete the pending order
      const deletedOrder = await Order.findByIdAndDelete(orderId);
      console.log(`Payment cancelled for order ${orderId}, order deleted`);
      res.status(200).json(deletedOrder);
    }
  } catch (err) {
    next(err);
  }
};

// Get user's orders
exports.userOrders = async (req, res, next) => {
  const { _id } = req.user;
  const { productId, productCategory } = req.body;
  
  try {
    console.log(`Finding orders for user ${_id} with productId: ${productId}, category: ${productCategory}`);
    
    // Start with basic query for user's orders - only return paid orders
    let query = { 
      userId: _id.toString(),
      payment: true // Only show successfully paid orders
    };
    
    // We'll fetch all user orders and then filter for product matches
    // This allows more flexible matching including by category
    const orders = await Order.find(query);
    
    console.log(`Found ${orders.length} orders for user ${_id}`);
    
    // If no product filtering is needed, return all orders
    if (!productId && !productCategory) {
      return res.status(200).json({
        orders,
        userId: _id
      });
    }
    
    // Filter orders that contain the product (by ID or category)
    const filteredOrders = orders.filter(order => {
      return order.items.some(item => {
        // Match by ID if productId is provided
        const idMatch = productId && (
          Number(item.id) === Number(productId) || 
          String(item.id) === String(productId)
        );
        
        // Match by category if productCategory is provided
        const categoryMatch = productCategory && 
          categoriesMatch(item.category, productCategory);
        
        // Log matching attempts for debugging
        if (idMatch || categoryMatch) {
          console.log(`Match found in order ${order._id}:`);
          console.log(`  Item: ${item.name}, Category: ${item.category}`);
          console.log(`  Match type: ${idMatch ? 'ID' : 'Category'}`);
        }
        
        return idMatch || categoryMatch;
      });
    });
    
    console.log(`Filtered to ${filteredOrders.length} orders containing requested product`);
    
    // Add the userId to the response for the frontend to use
    res.status(200).json({ 
      orders: filteredOrders,
      userId: _id,
      totalOrders: orders.length,
      matchingOrders: filteredOrders.length
    });
  } catch (err) {
    next(err);
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).sort({ date: -1 });
    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

// Update order status (admin)
exports.updateStatus = async (req, res, next) => {
  const { orderId, status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

// Clean up abandoned pending orders
exports.cleanupAbandonedOrders = async (req, res, next) => {
  try {
    // Clean up orders older than 15 minutes that are still pending payment
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const result = await Order.deleteMany({
      payment: false,
      date: { $lt: fifteenMinutesAgo }
    });
    
    console.log(`Cleaned up ${result.deletedCount} abandoned pending orders`);
    
    if (res) {
      res.status(200).json({ 
        success: true, 
        message: `Cleaned up ${result.deletedCount} abandoned orders`,
        deletedCount: result.deletedCount
      });
    }
    
    return result.deletedCount;
  } catch (err) {
    console.error('Error cleaning up abandoned orders:', err);
    if (next) next(err);
  }
};

// Instantly clean up user's pending orders
exports.cleanupUserPendingOrders = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    // If no userId provided, try to get from auth middleware
    const userIdToClean = userId || (req.user ? req.user._id : null);
    
    if (!userIdToClean) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }
    
    // Delete all pending orders for this user instantly
    const result = await Order.deleteMany({
      userId: userIdToClean,
      payment: false
    });
    
    console.log(`Instantly cleaned up ${result.deletedCount} pending orders for user ${userIdToClean}`);
    
    if (res) {
      res.status(200).json({ 
        success: true, 
        message: `Instantly cleaned up ${result.deletedCount} pending orders`,
        deletedCount: result.deletedCount
      });
    }
    
    return result.deletedCount;
  } catch (err) {
    console.error('Error cleaning up user pending orders:', err);
    if (next) next(err);
  }
};

// Get pending orders (admin - for debugging)
exports.getPendingOrders = async (req, res, next) => {
  try {
    const pendingOrders = await Order.find({ payment: false }).sort({ date: -1 });
    res.status(200).json({
      success: true,
      count: pendingOrders.length,
      orders: pendingOrders
    });
  } catch (err) {
    next(err);
  }
};
