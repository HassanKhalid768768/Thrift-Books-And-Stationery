const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    reviews: [reviewSchema],
    averageRating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now(),
    },
    available: {
        type: Boolean,
        default: true,
    },
});

// Calculate average rating before saving
productSchema.pre("save", function(next) {
    console.log('Pre-save hook triggered for product:', this.id);
    console.log('Current reviews count:', this.reviews.length);
    
    if (this.reviews.length > 0) {
        const totalRating = this.reviews.reduce((acc, review) => {
            console.log(`Adding rating: ${review.rating}`);
            return acc + review.rating;
        }, 0);
        console.log('Total rating sum:', totalRating);
        
        this.averageRating = totalRating / this.reviews.length;
        this.numReviews = this.reviews.length;
        
        console.log('New average rating:', this.averageRating);
        console.log('New number of reviews:', this.numReviews);
    } else {
        // Reset ratings when no reviews exist
        this.averageRating = 0;
        this.numReviews = 0;
        console.log('No reviews - reset ratings to 0');
    }
    next();
});

const productModel = mongoose.model("Product", productSchema);
module.exports = productModel;
