import React, { useState, useEffect, useRef, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';
import './QuickView.css';

const QuickView = ({ item, onClose }) => {
    // State for component functionality
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const modalRef = useRef(null);
    const closeButtonRef = useRef(null);
    const lastFocusableElementRef = useRef(null);
    
    // Access cart functionality from StoreContext
    const { addToCart } = useContext(StoreContext);
    
    // Handler for image loading
    const handleImageLoad = () => {
        setImageLoaded(true);
    };
    useEffect(() => {
        setIsVisible(true);
        
        // Enable scrolling when component unmounts
        return () => {
            document.body.style.overflow = '';
        };
    }, []);
    
    // Focus trap for accessibility
    useEffect(() => {
        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                // Set ref for last focusable element
                lastFocusableElementRef.current = lastElement;
                
                // If shift + tab pressed and first element is focused, move to last element
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
                
                // If tab pressed and last element is focused, move to first element
                else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };
        
        window.addEventListener('keydown', handleTabKey);
        
        // Focus first element when modal opens
        if (closeButtonRef.current) {
            closeButtonRef.current.focus();
        }
        
        return () => {
            window.removeEventListener('keydown', handleTabKey);
        };
    }, [isVisible]);
    
    // Disable scrolling when modal is open and handle escape key
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        
        // Handle escape key press
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        
        window.addEventListener('keydown', handleEscKey);
        
        return () => {
            window.removeEventListener('keydown', handleEscKey);
        };
    }, []);
    // No replacement - removing the image navigation event listener
    const handleOutsideClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            handleClose();
        }
    };
    
    // Close the modal with animation
    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300); // Wait for exit animation to complete
    };
    
    // Increment quantity with maximum limit
    const incrementQuantity = () => {
        setQuantity(prevQuantity => Math.min(prevQuantity + 1, 10));
    };
    
    // Decrement quantity with minimum limit
    const decrementQuantity = () => {
        setQuantity(prevQuantity => Math.max(prevQuantity - 1, 1));
    };
    
    // Get dynamic product description based on product name
    const getProductDescription = () => {
        // Check if product name contains certain keywords to customize description
        const name = item.name.toLowerCase();
        
        if (name.includes('shirt') || name.includes('tshirt') || name.includes('t-shirt')) {
            return 'Premium quality cotton T-shirt with breathable fabric and modern design. Perfect for casual outings and everyday wear. Ethically sourced materials with attention to detail.';
        } else if (name.includes('jeans') || name.includes('pant') || name.includes('trouser')) {
            return 'Durable denim with comfortable stretch and perfect fit. Designed for both style and comfort. Premium stitching with attention to detail ensures longevity.';
        } else if (name.includes('jacket') || name.includes('coat') || name.includes('hoodie')) {
            return 'Stylish and warm outerwear made with premium materials. Perfect for layering during cooler seasons. Features practical pockets and sophisticated design.';
        } else {
            return 'Premium quality, ethically sourced materials with attention to detail and modern design. Perfect for casual and formal occasions alike.';
        }
    };
    
    // Calculate delivery estimate (3-5 business days from current date)
    const getDeliveryEstimate = () => {
        const today = new Date();
        const deliveryStart = new Date(today);
        const deliveryEnd = new Date(today);
        
        // Add 3 business days for minimum
        deliveryStart.setDate(today.getDate() + 3);
        // Add 5 business days for maximum
        deliveryEnd.setDate(today.getDate() + 5);
        
        // Format dates
        const formatDate = (date) => {
            return date.toLocaleDateString('en-PK', { 
                day: 'numeric', 
                month: 'short'
            });
        };
        
        return `${formatDate(deliveryStart)} - ${formatDate(deliveryEnd)}`;
    };
    
    // Handle adding item to cart
    const handleAddToCart = async () => {
        // Prevent duplicate submissions
        if (isLoading) {
            return;
        }
        
        // Show loading state
        setIsLoading(true);
        
        try {
            // Add to cart with quantity in a single call
            await addToCart(item.id, quantity);
            
            // Success path
            setIsLoading(false);
            
            // Show success animation
            setShowSuccess(true);
            
            // Note: Don't need to show toast.success here as the addToCart function already does that
            
            // Close modal after success
            setTimeout(() => {
                setShowSuccess(false);
                handleClose();
            }, 1500);
            
        } catch (error) {
            // Error handling
            setIsLoading(false);
            toast.error('Could not add to cart. Please try again.');
            console.error('Add to cart error:', error);
        }
    };
    
    return (
        <div className={`quick-view-overlay ${isVisible ? 'visible' : ''}`} onClick={handleOutsideClick}>
            <div className={`quick-view-modal ${isVisible ? 'visible' : ''}`} ref={modalRef}>
                {/* Close button */}
                <button 
                    className="close-button" 
                    onClick={handleClose} 
                    ref={closeButtonRef}
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                
                <div className="quick-view-content">
                    {/* Product Image - Simplified */}
                    <div className="product-image" role="region" aria-label="Product image">
                        <div className="image-container">
                            {!imageLoaded && (
                                <div className="image-skeleton"></div>
                            )}
                            <img 
                                src={item.image} 
                                alt={item.name} 
                                className={`main-image ${imageLoaded ? 'loaded' : ''}`}
                                onLoad={handleImageLoad}
                            />
                        </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="product-details">
                        <h2 className="product-name">{item.name}</h2>
                        
                        <div className="product-price" aria-label="Product price information">
                            <span className="current-price">PKR {item.new_price.toLocaleString('en-PK')}</span>
                            {item.old_price && (
                                <span className="old-price">PKR {item.old_price.toLocaleString('en-PK')}</span>
                            )}
                            {item.old_price && (
                                <span className="discount-badge">
                                    {Math.round((1 - item.new_price / item.old_price) * 100)}% OFF
                                </span>
                            )}
                        </div>
                        
                        <div className="product-description">
                            <p>{getProductDescription()}</p>
                        </div>
                        
                        <div className="product-options">
                            {/* Quantity Selector */}
                            <div className="quantity-selector">
                                <h3>Quantity</h3>
                                <div className="quantity-controls">
                                    <button 
                                        className="quantity-btn" 
                                        onClick={decrementQuantity}
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="quantity-value">{quantity}</span>
                                    <button 
                                        className="quantity-btn" 
                                        onClick={incrementQuantity}
                                        disabled={quantity >= 10}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Add to Cart Button */}
                        <button 
                            className={`add-to-cart-btn ${showSuccess ? 'success' : ''} ${isLoading ? 'loading' : ''}`}
                            onClick={handleAddToCart}
                            disabled={isLoading}
                            aria-label="Add to cart"
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Adding to Cart...
                                </>
                            ) : showSuccess ? (
                                <>
                                    <span className="success-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                                        </svg>
                                    </span>
                                    Added to Cart!
                                </>
                            ) : (
                                <>
                                    <span className="cart-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                                        </svg>
                                    </span>
                                    Add to Cart
                                </>
                            )}
                        </button>
                        <p className="cart-help-text">Estimated delivery: {getDeliveryEstimate()}</p>
                        
                        {/* Product Meta Information */}
                        <div className="product-meta">
                            <div className="meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
                                </svg>
                                <span>Free shipping on orders over PKR 5,000</span>
                            </div>
                            <div className="meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                                </svg>
                                <span>In stock, ready for next-day delivery</span>
                            </div>
                            <div className="meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                                    <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A5.002 5.002 0 0 1 13.917 7H12.9A4.002 4.002 0 0 0 8 3zM3.1 9a4.002 4.002 0 0 0 7.9 0H12.9A5.002 5.002 0 0 1 3.83 13.81a.5.5 0 0 1-.771-.636A4.997 4.997 0 0 0 3.1 9z"/>
                                </svg>
                                <span>7-day easy returns policy</span>
                            </div>
                            <div className="meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                                </svg>
                                <span>Cash on delivery available</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickView;
