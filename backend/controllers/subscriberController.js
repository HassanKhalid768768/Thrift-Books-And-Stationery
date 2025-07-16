const Subscriber = require("../models/SubscriberModel");
const errorHandler = require("../utils/errorHandler");
const validator = require("validator");

exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next(errorHandler(400, "Email is required"));
    }
    
    if (!validator.isEmail(email)) {
      return next(errorHandler(400, "Email is not valid!"));
    }
    
    const exists = await Subscriber.findOne({ email });
    if (exists) {
      return next(errorHandler(400, "You have already subscribed !!"));
    }
    
    const subscriber = await Subscriber.create({ email });
    res.status(201).json({
      success: true,
      message: "Successfully subscribed to newsletter!",
      data: subscriber
    });
  } catch (err) {
    next(err);
  }
};
