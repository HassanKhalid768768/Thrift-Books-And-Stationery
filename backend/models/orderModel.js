const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  address: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    default: "Ordered",
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  payment: {
    type: Boolean,
    default: false,
  },
  appliedCoupon: {
    type: Object,
    default: null,
    validate: {
      validator: function(value) {
        // If no coupon applied, value will be null
        if (value === null) return true;
        
        // If coupon applied, it must have code and value
        return value.code && typeof value.code === 'string' && 
               value.value !== undefined && typeof value.value === 'number';
      },
      message: 'Applied coupon must have a code (string) and value (number)'
    }
  },
});

const orderModel = mongoose.model("Order",orderSchema);
module.exports = orderModel;
