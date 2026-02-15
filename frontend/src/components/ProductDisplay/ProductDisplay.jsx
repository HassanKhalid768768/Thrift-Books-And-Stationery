import React, { useContext, useState, useEffect, useRef } from "react";
import "./ProductDisplay.css"
import star_icon from "../../assets/star_icon.png"
import star_dull_icon from "../../assets/star_dull_icon.png"
import { StoreContext } from "../../context/StoreContext";
import { DarkModeContext } from "../../context/DarkModeContext";
import { toast } from "react-toastify";
import bin_icon from "../../assets/recycle-bin.png";

const ProductDisplay = (props) => {
    const { product } = props;
    const { addToCart } = useContext(StoreContext);
    const { darkMode } = useContext(DarkModeContext);

    // Initialize with default empty product if product is undefined
    const defaultProduct = {
        id: 0,
        name: "Loading...",
        image: "",
        category: "",
        description: "Loading product details...",
        old_price: 0,
        reviews: [],
        averageRating: 0,
        numReviews: 0
    };

    // Image zoom functionality
    const imageRef = useRef(null);
    const zoomRef = useRef(null);
    const [isZooming, setIsZooming] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        if (!imageRef.current || !zoomRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate percentage positions
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        setZoomPosition({ x: xPercent, y: yPercent });

        // Position the zoom view near the cursor
        const zoomSize = 200;
        let zoomX = e.clientX + 20;
        let zoomY = e.clientY - zoomSize / 2;

        // Keep zoom view within viewport
        if (zoomX + zoomSize > window.innerWidth) {
            zoomX = e.clientX - zoomSize - 20;
        }
        if (zoomY < 0) {
            zoomY = 10;
        }
        if (zoomY + zoomSize > window.innerHeight) {
            zoomY = window.innerHeight - zoomSize - 10;
        }

        zoomRef.current.style.left = `${zoomX}px`;
        zoomRef.current.style.top = `${zoomY}px`;
    };

    const handleMouseEnter = () => {
        setIsZooming(true);
    };

    const handleMouseLeave = () => {
        setIsZooming(false);
    };

    const [isLoading, setIsLoading] = useState(!product);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        comment: ''
    });
    const [reviewImages, setReviewImages] = useState([]);
    const [canReview, setCanReview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userReviewed, setUserReviewed] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [productData, setProductData] = useState(product || defaultProduct);
    const [selectedSize, setSelectedSize] = useState(null);
    const [displayPrice, setDisplayPrice] = useState(product?.old_price || 0);
    const [activeImage, setActiveImage] = useState("");

    // Update active image and product data when product changes
    useEffect(() => {
        if (product) {
            if (product.image) {
                setActiveImage(product.image);
            }
            setProductData(product);
        }
    }, [product]);

    const backend_url = process.env.REACT_APP_BACKEND_URL;

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

    const handleImageChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setReviewImages(prev => {
                const totalCount = prev.length + filesArray.length;
                if (totalCount > 5) {
                    toast.error("You can only upload up to 5 images in total");
                    return prev;
                }
                return [...prev, ...filesArray];
            });
        }
    };

    const removeImage = (index) => {
        setReviewImages(prev => prev.filter((_, i) => i !== index));
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
            const formData = new FormData();
            formData.append('rating', reviewForm.rating);
            formData.append('comment', reviewForm.comment);

            reviewImages.forEach((image) => {
                formData.append('reviewImages', image);
            });

            const response = await fetch(`${backend_url}/api/products/${product.id}/reviews`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Your review has been submitted!");
                setUserReviewed(true);
                setReviewForm({ rating: 5, comment: '' });
                setReviewImages([]);

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

    // Update display price when size is selected or product changes
    useEffect(() => {
        if (product) {
            console.log('ProductDisplay - Product:', product);
            console.log('ProductDisplay - Product sizes:', product.sizes);
            if (selectedSize && product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
                const sizeObj = product.sizes.find(s => s.size === selectedSize);
                if (sizeObj) {
                    setDisplayPrice(sizeObj.price);
                }
            } else {
                setDisplayPrice(product.old_price || 0);
            }
        }
    }, [selectedSize, product]);

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
                    <img
                        ref={imageRef}
                        className="productdisplay-main-img zoomable-image"
                        src={activeImage || product.image || ''}
                        alt={product.name || 'Product'}
                        onMouseMove={handleMouseMove}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                    {/* Zoom lens - follows mouse cursor */}
                    {isZooming && (
                        <div
                            ref={zoomRef}
                            className="zoom-lens"
                            style={{
                                backgroundImage: `url(${activeImage || product.image})`,
                                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                backgroundSize: '300%',
                                backgroundRepeat: 'no-repeat'
                            }}
                        />
                    )}
                </div>
                {/* Image Gallery */}
                {(product.additionalImages && product.additionalImages.length > 0) && (
                    <div className="productdisplay-img-list">
                        <img
                            src={product.image}
                            alt="Main View"
                            onClick={() => setActiveImage(product.image)}
                            className={activeImage === product.image ? 'active-thumbnail' : ''}
                        />
                        {product.additionalImages.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`View ${index + 1}`}
                                onClick={() => setActiveImage(img)}
                                className={activeImage === img ? 'active-thumbnail' : ''}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="productdisplay-right">
                <h1>{productData?.name || "Product Name"}</h1>
                <div className="productdisplay-right-stars">
                    {renderStars(Math.round(productData?.averageRating || 0))}
                    <p>({productData?.numReviews || 0} reviews)</p>
                </div>
                <div className="productdisplay-right-prices">
                    <div className="productdisplay-right-price-new">
                        PKR {displayPrice.toLocaleString('en-PK')}
                    </div>
                </div>

                {/* Size Selection */}
                {product?.sizes && product.sizes.length > 0 && (
                    <div className="productdisplay-right-sizes" style={{ marginBottom: '20px' }}>
                        <p style={{ marginBottom: '10px', fontWeight: '500' }}>Select Size:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {product.sizes.map((sizeObj, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedSize(sizeObj.size)}
                                    style={{
                                        padding: '10px 20px',
                                        border: selectedSize === sizeObj.size ? '2px solid #4CAF50' : '1px solid #ddd',
                                        backgroundColor: selectedSize === sizeObj.size ? '#4CAF50' : 'transparent',
                                        color: selectedSize === sizeObj.size ? 'white' : '#333',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        fontWeight: selectedSize === sizeObj.size ? 'bold' : 'normal',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {sizeObj.size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="productdisplay-right-description">
                    {product?.description || "No description available"}
                </div>
                {product?.available === false ? (
                    <div className="out-of-stock-section">
                        <button className="out-of-stock-btn" disabled>
                            OUT OF STOCK
                        </button>
                        <p className="out-of-stock-message">
                            This product is currently out of stock. Please check back later.
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
                                toast.error("Please select a size");
                                return;
                            }
                            // Store size info in product for cart
                            const productWithSize = {
                                ...product,
                                selectedSize: selectedSize,
                                selectedPrice: displayPrice
                            };
                            addToCart(product?.id, 1, productWithSize);
                        }}
                        className="add-to-cart-btn"
                    >
                        ADD TO CART
                    </button>
                )}

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
                                    <div className={`review-image-input ${reviewImages.length >= 5 ? 'disabled' : ''}`}>
                                        <label htmlFor="reviewImages">
                                            {reviewImages.length >= 5 ? "Image Limit Reached (Max 5)" : "Add Pictures (Max 5):"}
                                        </label>
                                        <input
                                            type="file"
                                            id="reviewImages"
                                            name="reviewImages"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            disabled={reviewImages.length >= 5}
                                        />
                                        <div className="selected-images-preview">
                                            {reviewImages.map((img, index) => (
                                                <div key={index} className="preview-item">
                                                    <img src={URL.createObjectURL(img)} alt={`preview-${index}`} />
                                                    <button
                                                        type="button"
                                                        className="remove-img-btn"
                                                        onClick={() => removeImage(index)}
                                                        aria-label="Remove"
                                                    >
                                                        <img src={bin_icon} alt="Remove" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
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
                                    {review.images && review.images.length > 0 && (
                                        <div className="review-images">
                                            {review.images.map((img, imgIndex) => (
                                                <img
                                                    key={imgIndex}
                                                    src={img}
                                                    alt={`Review image ${imgIndex + 1}`}
                                                    onClick={() => window.open(img, '_blank')}
                                                />
                                            ))}
                                        </div>
                                    )}
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
