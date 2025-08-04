const Order = require("../models/orderModel");

/**
 * Generates a unique order number
 * Format: ORD-YYYYMMDD-XXXXXX (where X is a unique sequential number)
 * @returns {Promise<string>} Unique order number
 */
const generateOrderNumber = async () => {
  const today = new Date();
  const dateString = today.getFullYear().toString() + 
                    (today.getMonth() + 1).toString().padStart(2, '0') + 
                    today.getDate().toString().padStart(2, '0');
  
  const prefix = `ORD-${dateString}-`;
  
  // Find the last order number created today
  const lastOrder = await Order.findOne({
    orderNumber: { $regex: `^${prefix}` }
  }).sort({ orderNumber: -1 });
  
  let sequenceNumber = 1;
  
  if (lastOrder) {
    // Extract sequence number from last order number
    const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
    sequenceNumber = lastSequence + 1;
  }
  
  // Pad sequence number to 6 digits
  const paddedSequence = sequenceNumber.toString().padStart(6, '0');
  
  return `${prefix}${paddedSequence}`;
};

/**
 * Calculates total quantity of items in an order
 * @param {Array} items - Array of order items
 * @returns {number} Total quantity
 */
const calculateTotalQuantity = (items) => {
  return items.reduce((total, item) => total + (item.quantity || 0), 0);
};

/**
 * Formats order number for display (shortens for UI display)
 * @param {string} orderNumber - Full order number
 * @returns {string} Shortened order number for display
 */
const formatOrderNumberForDisplay = (orderNumber) => {
  if (!orderNumber) return 'N/A';
  
  // For display, show last 8 characters: DDDD-XXXXXX
  if (orderNumber.length >= 8) {
    return orderNumber.slice(-8);
  }
  
  return orderNumber;
};

module.exports = {
  generateOrderNumber,
  calculateTotalQuantity,
  formatOrderNumberForDisplay
};
