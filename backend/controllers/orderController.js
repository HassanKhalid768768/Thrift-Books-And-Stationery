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
    const order = await Order.create({
      userId: _id,
      items: normalizedItems,
      amount,
      address,
      appliedCoupon
    });

    // Clear user's cart
    await User.findByIdAndUpdate(_id, { cartData: {} });

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
      const order = await Order.findByIdAndUpdate(
        orderId,
        { payment: true },
        { new: true }
      );
      res.status(200).json(order);
    } else {
      const order = await Order.findByIdAndDelete(orderId);
      res.status(200).json(order);
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
    
    // Start with basic query for user's orders
    let query = { userId: _id.toString() };
    
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
