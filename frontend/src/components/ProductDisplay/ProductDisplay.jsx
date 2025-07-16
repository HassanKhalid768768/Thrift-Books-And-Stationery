import React, { useContext, useState, useEffect } from "react";
import "./ProductDisplay.css"
import star_icon from "../../assets/star_icon.png"
import star_dull_icon from "../../assets/star_dull_icon.png"
import { StoreContext } from "../../context/StoreContext";
import { DarkModeContext } from "../../context/DarkModeContext";
import { toast } from "react-toastify";

const ProductDisplay = (props) => {
    const {product} = props;
    const {addToCart} = useContext(StoreContext);
    const { darkMode } = useContext(DarkModeContext);
    
    // Initialize with default empty product if product is undefined
    const defaultProduct = {
        id: 0,
        name: "Loading...",
        image: "",
        category: "",
        description: "Loading product details...",
        new_price: 0,
        old_price: 0,
        reviews: [],
        averageRating: 0,
        numReviews: 0
    };

    const [isLoading, setIsLoading] = useState(!product);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        comment: ''
    });
    const [canReview, setCanReview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userReviewed, setUserReviewed] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [productData, setProductData] = useState(product || defaultProduct);
    
    const backend_url = process.env.REACT_APP_API_URL;

    // Check if user is authenticated and can review the product
    useEffect(() => {
        // Return early if product is not available
        if (!product) {
            setIsLoading(true);
            return;
        }
        
        setIsLoading(false);
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
        
        if (token && product && product.id) {
            // Check if user has purchased this product
            const checkOrderStatus = async () => {
                try {
                    const response = await fetch(`${backend_url}/api/orders/userorders`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ productId: product.id })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        // Check if there's at least one delivered order with this product
                        const hasDeliveredOrder = data.orders && data.orders.some(order => 
                            order.status === "Delivered" && 
                            order.items.some(item => item.id === product.id)
                        );
                        
                        setCanReview(hasDeliveredOrder);
                        
                        // Check if user already reviewed this product
                        const hasReviewed = productData && 
                                          productData.reviews && 
                                          productData.reviews.some(review => 
                                            review && review.userId && data.userId && 
                                            review.userId.toString() === data.userId.toString()
                                          );
                        setUserReviewed(hasReviewed);
                    } else {
                        console.error("Failed to check order status");
                        toast.error("Failed to verify purchase history");
                    }
                } catch (error) {
                    console.error("Error checking order status:", error);
                    toast.error("Error checking purchase history");
                }
            };
            
            checkOrderStatus();
        }
    }, [product, backend_url]);
    
    const handleReviewChange = (e) => {
        setReviewForm({
            ...reviewForm,
            [e.target.name]: e.target.value
        });
    };
    
    const handleStarClick = (rating) => {
        setReviewForm({
            ...reviewForm,
            rating
        });
    };
    
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        
        if (!product || !product.id) {
            toast.error("Product information is missing");
            return;
        }
        
        if (!reviewForm.comment.trim()) {
            toast.error("Please provide a review comment");
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backend_url}/api/products/${product.id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating: reviewForm.rating,
                    comment: reviewForm.comment
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                toast.success("Your review has been submitted!");
                setUserReviewed(true);
                setReviewForm({ rating: 5, comment: '' });
                
                // Update product data with new review
                if (data.product) {
                    // First update with the data we already have
                    setProductData(prevProduct => ({
                        ...prevProduct,
                        averageRating: data.product.averageRating,
                        numReviews: data.product.numReviews
                    }));
                    
                    // Refresh the product data to show the new review
                    try {
                        const productResponse = await fetch(`${backend_url}/api/products/${product.id}`);
                        if (productResponse.ok) {
                            const updatedProduct = await productResponse.json();
                            setProductData(updatedProduct);
                        } else {
                            console.error("Failed to fetch updated product data");
                        }
                    } catch (fetchError) {
                        console.error("Error fetching updated product:", fetchError);
                    }
                }
            } else {
                toast.error(data.error || "Failed to submit review");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error("An error occurred while submitting your review");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Function to render stars based on rating
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <img 
                    key={i} 
                    src={i <= rating ? star_icon : star_dull_icon} 
                    alt={`star ${i}`} 
                />
            );
        }
        return stars;
    };

    // Show a loading UI when product data is not available
    if (isLoading || !product) {
        return (
            <div className={`productdisplay ${darkMode ? 'dark-mode' : ''}`}>
                <div className="loading-container">
                    <div className="loading-message">Loading product details...</div>
                </div>
            </div>
        );
    }

    return ( 
        <div className={`productdisplay ${darkMode ? 'dark-mode' : ''}`}>
            <div className="productdisplay-left">
                <div className="productdisplay-img">
                    <img className="productdisplay-main-img" src={product.image || ''} alt="" />
                </div>
            </div>
            <div className="productdisplay-right">
                <h1>{productData?.name || "Product Name"}</h1>
                <div className="productdisplay-right-stars">
                    {renderStars(Math.round(productData?.averageRating || 0))}
                    <p>({productData?.numReviews || 0} reviews)</p>
                </div>
                <div className="productdisplay-right-prices">
                   <div className="productdisplay-right-price-old">
                    PKR {(product?.old_price || 0).toLocaleString('en-PK')}
                   </div>
                   <div className="productdisplay-right-price-new">
                    PKR {(product?.new_price || 0).toLocaleString('en-PK')}
                   </div>
                </div>
                <div className="productdisplay-right-description">
                    {product?.description || "No description available"}
                </div>
                <button onClick={()=>{addToCart(product?.id)}}>ADD TO CART</button>

                {/* Reviews Section */}
                <div className="productdisplay-reviews">
                    <h2>Customer Reviews</h2>
                    
                    {/* Review Form */}
                    {isAuthenticated ? (
                        canReview && !userReviewed ? (
                            <div className="review-form-container">
                                <h3>Write a Review for {productData?.name || "this product"}</h3>
                                <form onSubmit={handleReviewSubmit} className="review-form">
                                    <div className="rating-selector">
                                        <p>Rating:</p>
                                        <div className="star-rating">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <img 
                                                    key={star}
                                                    src={star <= reviewForm.rating ? star_icon : star_dull_icon}
                                                    alt={`${star} star`}
                                                    onClick={() => handleStarClick(star)}
                                                    className="rating-star clickable"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="review-input">
                                        <label htmlFor="comment">Your Review:</label>
                                        <textarea
                                            id="comment"
                                            name="comment"
                                            value={reviewForm.comment}
                                            onChange={handleReviewChange}
                                            required
                                            placeholder="Share your experience with this product..."
                                            rows="4"
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="submit-review-btn"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Review"}
                                    </button>
                                </form>
                            </div>
                        ) : userReviewed ? (
                            <div className="review-status-message">
                                <p>You have already reviewed this product.</p>
                            </div>
                        ) : (
                            <div className="review-status-message">
                                <p>You can only review products you've purchased and received. Please complete your purchase and wait for delivery.</p>
                            </div>
                        )
                    ) : (
                        <div className="review-status-message">
                            <p>Please <a href="/login">login</a> to write a review. Only customers who have purchased this product can leave reviews.</p>
                        </div>
                    )}
                    
                    {/* Reviews List */}
                    {productData.reviews && productData.reviews.length > 0 ? (
                        <div className="reviews-list">
                            {productData.reviews.map((review, index) => (
                                <div key={index} className="review-item">
                                    <div className="review-header">
                                        <div className="review-stars">
                                            {renderStars(review.rating)}
                                        </div>
                                        <div className="review-date">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="review-comment">
                                        {review.comment}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-reviews">No reviews yet</p>
                    )}
                </div>
            </div>
        </div>
     );
}
 
export default ProductDisplay;
