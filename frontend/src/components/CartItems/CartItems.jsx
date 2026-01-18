import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './CartItems.css';
import { StoreContext } from "../../context/StoreContext";
import { DarkModeContext } from "../../context/DarkModeContext";
import bin from './../../assets/recycle-bin.png';
import { toast } from "react-toastify";

const CartItems = () => {
    const {
        all_product,
        cartItems,
        cartItemDetails,
        removeFromCart,
        removeItemCompletely,
        addToCart,
        getTotalCartAmount,
        validateCoupon,
        clearCoupon,
        coupon,
        getCouponDiscount,
        getTotalWithDiscount
    } = useContext(StoreContext);
    const [couponCode, setCouponCode] = useState("");
    const [isApplying, setIsApplying] = useState(false);
    const [cartValidation, setCartValidation] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const { darkMode } = useContext(DarkModeContext);
    const navigate = useNavigate();
    
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    
    // Validate cart items when component mounts or cart changes
    useEffect(() => {
        validateCartItems();
    }, [cartItems]);
    
    const validateCartItems = async () => {
        const token = localStorage.getItem('token');
        if (!token || getTotalCartAmount() === 0) {
            setCartValidation(null);
            return;
        }
        
        setIsValidating(true);
        try {
            const response = await fetch(`${backend_url}/api/cart/validate`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const validation = await response.json();
                setCartValidation(validation);
                
                // Show warning if there are unavailable items
                if (!validation.valid && validation.unavailableItems.length > 0) {
                    const itemNames = validation.unavailableItems.map(item => item.name).join(', ');
                    toast.warning(`Some items in your cart are no longer available: ${itemNames}`);
                }
            } else {
                console.error('Failed to validate cart');
            }
        } catch (error) {
            console.error('Error validating cart:', error);
        }
        setIsValidating(false);
    };
    
    const removeUnavailableItems = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
            const response = await fetch(`${backend_url}/api/cart/removeUnavailable`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                toast.success(result.message);
                
                // Refresh the page to update the cart display
                window.location.reload();
            } else {
                const error = await response.json();
                toast.error(error.error);
            }
        } catch (error) {
            console.error('Error removing unavailable items:', error);
            toast.error('Failed to remove unavailable items');
        }
    };
    
    const handleCheckout = () => {
        // Check if cart has unavailable items
        if (cartValidation && !cartValidation.valid) {
            toast.error('Please remove out-of-stock items from your cart before proceeding to checkout.');
            return;
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/order');
        } else {
            toast.warning("Please login first to proceed to checkout");
        }
    };
    
    return ( 
        <div className={`cartitems ${darkMode ? 'dark-mode' : ''}`}>
            <div className="cartitems-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
            </div>
            <hr />
            {Object.keys(cartItems).map((cartKey) => {
                if (cartItems[cartKey] > 0) {
                    // Extract itemId from cartKey (handle both "itemId" and "itemId_size" formats)
                    const itemId = cartItemDetails[cartKey]?.itemId || (cartKey.includes('_') ? parseInt(cartKey.split('_')[0]) : parseInt(cartKey));
                    const e = all_product.find(p => p.id === itemId);
                    
                    if (!e) return null;
                    
                    const isOutOfStock = e.available === false;
                    const itemDetails = cartItemDetails[cartKey];
                    
                    return (
                        <div key={cartKey}>
                            <div className={`cartitems-format cartitems-format-main ${isOutOfStock ? 'out-of-stock-item' : ''}`}>
                                <img src={e.image} alt="" className="carticon-product-icon"/>
                                <div className="product-info">
                                    <p>{e.name}</p>
                                    {itemDetails?.size && (
                                        <span style={{ fontSize: '0.9em', color: '#666', display: 'block', marginTop: '4px' }}>
                                            Size: {itemDetails.size}
                                        </span>
                                    )}
                                    {isOutOfStock && (
                                        <span className="out-of-stock-badge">Out of Stock</span>
                                    )}
                                </div>
                                <p>PKR {(itemDetails?.price || e.old_price).toLocaleString('en-PK')}</p>
                                <div className="cartitems-quantity-control">
                                    <button 
                                        className="quantity-btn minus-btn"
                                        onClick={() => removeFromCart(cartKey)}
                                        aria-label="Decrease quantity"
                                        disabled={isOutOfStock}
                                    >
                                        -
                                    </button>
                                    <span className="quantity-display">{cartItems[cartKey]}</span>
                                    <button 
                                        className="quantity-btn plus-btn"
                                        onClick={() => {
                                            // Get the product with size info if available
                                            const productWithSize = itemDetails?.size ? {
                                                ...e,
                                                selectedSize: itemDetails.size,
                                                selectedPrice: itemDetails.price
                                            } : e;
                                            addToCart(e.id, 1, productWithSize);
                                        }}
                                        aria-label="Increase quantity"
                                        disabled={isOutOfStock}
                                    >
                                        +
                                    </button>
                                </div>
                                <p>PKR {((itemDetails?.price || e.old_price) * cartItems[cartKey]).toLocaleString('en-PK')}</p>
                                <img className="cartitems-remove-icon" src={bin} onClick={()=>{removeItemCompletely(cartKey)}} alt="Remove item" />
                            </div>
                            <hr />
                        </div>
                    );
                }
                return null;
            })}
            
            <div className="cartitems-down">
                <div className="cartitems-total card">
                    <h1>Cart Totals</h1>
                    
                    {/* Coupon Section */}
                    <div className="coupon-section">
                        {!coupon.isValid ? (
                            <>
                                <div className="coupon-input-container">
                                    <input 
                                        type="text" 
                                        placeholder="Enter coupon code" 
                                        value={couponCode} 
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="coupon-input"
                                    />
                                    <button 
                                        className="apply-coupon-btn" 
                                        onClick={async () => {
                                            if (!couponCode.trim()) return;
                                            setIsApplying(true);
                                            await validateCoupon(couponCode);
                                            setIsApplying(false);
                                            setCouponCode("");
                                        }}
                                        disabled={isApplying || !couponCode.trim()}
                                    >
                                        {isApplying ? "Applying..." : "Apply Coupon"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="applied-coupon">
                                <div className="applied-coupon-info">
                                    <span className="coupon-label">Applied Coupon:</span>
                                    <span className="coupon-code">{coupon.code}</span>
                                    <span className="coupon-value">-PKR {coupon.value.toLocaleString('en-PK')}</span>
                                </div>
                                <button 
                                    className="remove-coupon-btn" 
                                    onClick={clearCoupon}
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <div className="cartitems-total-item">
                            <p>Subtotal</p>
                            <p>PKR {getTotalCartAmount().toLocaleString('en-PK')}</p>
                        </div>
                        <hr />
                        
                        {coupon.isValid && (
                            <>
                                <div className="cartitems-total-item discount">
                                    <p>Coupon Discount</p>
                                    <p>-PKR {getCouponDiscount().toLocaleString('en-PK')}</p>
                                </div>
                                <hr />
                            </>
                        )}
                        
                        <div className="cartitems-total-item">
                            <p>Shipping Fee</p>
                            <p>Will be calculated on checkout</p>
                        </div>
                        <hr />
                        
                        <div className="cartitems-total-item">
                            <h3>Total</h3>
                            <h3>PKR {(getTotalCartAmount()===0?0:getTotalWithDiscount()).toLocaleString('en-PK')}</h3>
                        </div>
                    </div>
                    
                    {/* Out of Stock Warning */}
                    {cartValidation && !cartValidation.valid && (
                        <div className="out-of-stock-warning">
                            <div className="warning-header">
                                <h3>⚠️ Some items are out of stock</h3>
                                <p>The following items in your cart are no longer available:</p>
                            </div>
                            <div className="unavailable-items-list">
                                {cartValidation.unavailableItems.map((item, index) => (
                                    <div key={index} className="unavailable-item">
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-reason">({item.reason})</span>
                                    </div>
                                ))}
                            </div>
                            <button 
                                className="remove-unavailable-btn"
                                onClick={removeUnavailableItems}
                            >
                                Remove Unavailable Items
                            </button>
                        </div>
                    )}
                    
                    <button 
                        onClick={handleCheckout}
                        className={cartValidation && !cartValidation.valid ? 'disabled' : ''}
                        disabled={cartValidation && !cartValidation.valid}
                    >
                        {cartValidation && !cartValidation.valid ? 'REMOVE OUT-OF-STOCK ITEMS FIRST' : 'PROCEED TO CHECKOUT'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CartItems;
