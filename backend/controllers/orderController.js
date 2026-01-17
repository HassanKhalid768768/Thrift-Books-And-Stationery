const Order = require("./../models/orderModel");
const User = require("./../models/userModel");
const errorHandler = require("./../utils/errorHandler");
const jwt = require("jsonwebtoken");
const Stripe = require("stripe");
const { normalizeCategory, categoriesMatch } = require('../utils/categoryUtils');
const { generateOrderNumber } = require('../utils/orderUtils');
require("dotenv").config();

//configure stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Place order directly without Stripe (for COD and Bank Transfer)
exports.placeOrderDirect = async (req, res, next) => {
  const { _id } = req.user;
  const { items, amount, address, appliedCoupon, paymentMethod } = req.body;
  
  try {
    // First validate that all items in the order are available
    const Product = require('./../models/productModel');
    const unavailableItems = [];
    
    for (const item of items) {
      const product = await Product.findOne({ id: item.id });
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product '${item.name}' no longer exists and has been removed from our catalog.`,
          unavailableItems: [{ ...item, reason: 'Product not found' }]
        });
      }
      
      if (!product.available) {
        unavailableItems.push({
          ...item,
          reason: 'Out of stock'
        });
      }
    }
    
    // If any items are unavailable, return error with details
    if (unavailableItems.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Some items in your cart are no longer available. Please remove them from your cart and try again.`,
        unavailableItems: unavailableItems
      });
    }
    
    // Clean up only Stripe pending orders, keep bank transfer orders for longer
    await Order.deleteMany({
      userId: _id,
      payment: false,
      $or: [
        { paymentMethod: { $exists: false } }, // Old orders without paymentMethod (Stripe)
        { paymentMethod: 'stripe' },
        { paymentMethod: { $ne: 'bankTransfer' } } // Not bank transfer
      ]
    });
    console.log('Cleaned up non-bank-transfer pending orders for user', _id);
    
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

    // Determine order status based on payment method
    let orderStatus = 'Order Confirmed';
    let paymentStatus = true;
    
    if (paymentMethod === 'cod') {
      orderStatus = 'Order Confirmed - COD';
    } else if (paymentMethod === 'bankTransfer') {
      orderStatus = 'Pending Payment Verification';
      paymentStatus = false; // Will be updated when payment proof is verified
    }

    // Generate unique order number
    const orderNumber = await generateOrderNumber();

    // Create the order
    const order = await Order.create({
      orderNumber,
      userId: _id,
      items: normalizedItems,
      amount,
      address,
      appliedCoupon,
      payment: paymentStatus,
      status: orderStatus,
      paymentMethod: paymentMethod
    });

    // Clear user's cart for COD orders, keep for bank transfer until payment verified
    if (paymentMethod === 'cod') {
      await User.findByIdAndUpdate(_id, { cartData: {} });
      console.log(`COD order placed successfully, cart cleared for user ${_id}`);
    } else {
      console.log(`Bank transfer order placed, awaiting payment verification for user ${_id}`);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Order placed successfully',
      order: order,
      orderId: order._id
    });

    // Send order summary email
    await sendOrderSummaryEmail(order);
  } catch (err) {
    next(err);
  }
};

// Function to send email using nodemailer
const nodemailer = require('nodemailer');

async function sendOrderSummaryEmail(order) {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      secure: true,
      port: 465,
    });

    // Verify the transporter configuration
    try {
      await transporter.verify();
      console.log('Email transporter verified successfully');
    } catch (verifyError) {
      console.error('Email transporter verification failed:', verifyError);
      return;
    }

    // Create detailed order summary
    const itemsList = order.items.map(item => 
      `- ${item.name} (Qty: ${item.quantity}) - PKR ${item.new_price} each`
    ).join('\n');
    
    const couponInfo = order.appliedCoupon ? 
      `\nCoupon Applied: ${order.appliedCoupon.code} (-PKR ${order.appliedCoupon.value})` : '';
    
    // Handle address fields correctly based on frontend naming
    const firstName = order.address.firstName;
    const lastName = order.address.lastName;
    const email = order.address.email;
    const phone = order.address.Phone;
    const address = order.address.Address;
    const city = order.address.city;
    const country = order.address.country;

    const emailText = `
New Order Received!
==================

Order Details:
- Order Number: ${order.orderNumber}
- Order ID: ${order._id}
- Status: ${order.status}
- Payment Method: ${order.paymentMethod || 'Stripe'}
- Payment Status: ${order.payment ? 'Paid' : 'Pending'}
- Order Date: ${new Date(order.date).toLocaleString()}

Customer Information:
- Name: ${firstName} ${lastName}
- Email: ${email}
- Phone: ${phone}
- Address: ${address}, ${city}, ${country}

Items Ordered:
${itemsList}
${couponInfo}

Total Amount: PKR ${order.amount}

==================
TBS-Thrift & Budget Store
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'hassanjack01@gmail.com',
      subject: `New Order #${order.orderNumber} - PKR ${order.amount}`,
      text: emailText,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order summary email sent successfully for order ${order.orderNumber}`);
  } catch (error) {
    console.error('Error sending order summary email:', error);
    // Don't throw error to avoid disrupting order placement
  }
};

// Place order and create payment session (kept for backward compatibility)
exports.placeOrder = async (req, res, next) => {
  const { _id } = req.user;
  const frontend_url = process.env.FRONTEND_URL;

  const { items, amount, address, appliedCoupon } = req.body;
  try {
    // Clean up only Stripe pending orders, keep bank transfer orders for longer
    await Order.deleteMany({
      userId: _id,
      payment: false,
      $or: [
        { paymentMethod: { $exists: false } }, // Old orders without paymentMethod (Stripe)
        { paymentMethod: 'stripe' },
        { paymentMethod: { $ne: 'bankTransfer' } } // Not bank transfer
      ]
    });
    console.log('Cleaned up non-bank-transfer pending orders for user', _id);
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

    // Generate unique order number
    const orderNumber = await generateOrderNumber();

    // Create the order with coupon information if applied and normalized categories
    // Mark as pending payment initially - cart will be cleared only after successful payment
    const order = await Order.create({
      orderNumber,
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
      
      // Send order summary email
      await sendOrderSummaryEmail(updatedOrder);
      
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
    
    // Start with basic query for user's orders - show all orders (paid and pending)
    let query = { 
      userId: _id.toString()
      // Show all orders regardless of payment status
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
    // Clean up Stripe orders older than 15 minutes that are still pending payment
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const stripeResult = await Order.deleteMany({
      payment: false,
      date: { $lt: fifteenMinutesAgo },
      $or: [
        { paymentMethod: { $exists: false } }, // Old orders without paymentMethod (Stripe)
        { paymentMethod: 'stripe' },
        { paymentMethod: { $ne: 'bankTransfer' } } // Not bank transfer
      ]
    });
    
    // Clean up bank transfer orders older than 24 hours that are still pending payment
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const bankTransferResult = await Order.deleteMany({
      payment: false,
      paymentMethod: 'bankTransfer',
      date: { $lt: twentyFourHoursAgo }
    });
    
    const totalDeleted = stripeResult.deletedCount + bankTransferResult.deletedCount;
    console.log(`Cleaned up ${stripeResult.deletedCount} abandoned Stripe orders and ${bankTransferResult.deletedCount} old bank transfer orders`);
    
    if (res) {
      res.status(200).json({ 
        success: true, 
        message: `Cleaned up ${totalDeleted} abandoned orders (${stripeResult.deletedCount} Stripe, ${bankTransferResult.deletedCount} bank transfer)`,
        deletedCount: totalDeleted,
        stripeDeleted: stripeResult.deletedCount,
        bankTransferDeleted: bankTransferResult.deletedCount
      });
    }
    
    return totalDeleted;
  } catch (err) {
    console.error('Error cleaning up abandoned orders:', err);
    if (next) next(err);
  }
};

// Instantly clean up user's pending orders (excluding bank transfers)
exports.cleanupUserPendingOrders = async (req, res, next) => {
  try {
    const { userId, includeBankTransfer = false } = req.body;
    
    // If no userId provided, try to get from auth middleware
    const userIdToClean = userId || (req.user ? req.user._id : null);
    
    if (!userIdToClean) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }
    
    let query = {
      userId: userIdToClean,
      payment: false
    };
    
    // By default, don't delete bank transfer orders unless explicitly requested
    if (!includeBankTransfer) {
      query.$or = [
        { paymentMethod: { $exists: false } }, // Old orders without paymentMethod (Stripe)
        { paymentMethod: 'stripe' },
        { paymentMethod: { $ne: 'bankTransfer' } } // Not bank transfer
      ];
    }
    
    // Delete pending orders for this user based on criteria
    const result = await Order.deleteMany(query);
    
    const orderType = includeBankTransfer ? 'all pending' : 'non-bank-transfer pending';
    console.log(`Instantly cleaned up ${result.deletedCount} ${orderType} orders for user ${userIdToClean}`);
    
    if (res) {
      res.status(200).json({ 
        success: true, 
        message: `Instantly cleaned up ${result.deletedCount} ${orderType} orders`,
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

// Delete order (admin)
exports.deleteOrder = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    // Find the order first to check if it exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: "Order not found" 
      });
    }
    
    // Delete the order
    await Order.findByIdAndDelete(orderId);
    
    console.log(`Order ${orderId} deleted by admin`);
    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      deletedOrderId: orderId
    });
  } catch (err) {
    next(err);
  }
};

// Verify bank transfer payment (admin)
exports.verifyBankTransfer = async (req, res, next) => {
  const { orderId } = req.body;
  try {
    // Find the order first to get user details
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    
    // Check if it's a bank transfer order
    if (order.paymentMethod !== 'bankTransfer') {
      return res.status(400).json({ 
        success: false, 
        error: "This order is not a bank transfer order" 
      });
    }
    
    // Update order status to paid and confirmed
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        payment: true,
        status: 'Order Confirmed - Payment Verified'
      },
      { new: true }
    );
    
    // Clear user's cart after successful payment verification
    await User.findByIdAndUpdate(order.userId, { cartData: {} });
    
    console.log(`Bank transfer payment verified for order ${orderId}, cart cleared for user ${order.userId}`);
    
    // Send order summary email
    await sendOrderSummaryEmail(updatedOrder);
    
    res.status(200).json({
      success: true,
      message: 'Bank transfer payment verified successfully',
      order: updatedOrder
    });
  } catch (err) {
    next(err);
  }
};
