import React, { useContext, useState } from "react";
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
    const { darkMode } = useContext(DarkModeContext);
    const navigate = useNavigate();
    
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
            {all_product.map((e)=>{
                if(cartItems[e.id]>0) {
                    return (
                        <div key={e.id}>
                            <div className="cartitems-format cartitems-format-main">
                                <img src={e.image} alt="" className="carticon-product-icon"/>
                                <p>{e.name}</p>
                                <p>PKR {e.new_price.toLocaleString('en-PK')}</p>
                                <div className="cartitems-quantity-control">
                                    <button 
                                        className="quantity-btn minus-btn"
                                        onClick={() => removeFromCart(e.id)}
                                        aria-label="Decrease quantity"
                                    >
                                        -
                                    </button>
                                    <span className="quantity-display">{cartItems[e.id]}</span>
                                    <button 
                                        className="quantity-btn plus-btn"
                                        onClick={() => addToCart(e.id)}
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>
                                <p>PKR {(e.new_price*cartItems[e.id]).toLocaleString('en-PK')}</p>
                                <img className="cartitems-remove-icon" src={bin} onClick={()=>{removeItemCompletely(e.id)}} alt="Remove item" />
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
                            <p>PKR {(getTotalCartAmount()===0?0:1).toLocaleString('en-PK')}</p>
                        </div>
                        <hr />
                        
                        <div className="cartitems-total-item">
                            <h3>Total</h3>
                            <h3>PKR {(getTotalCartAmount()===0?0:getTotalWithDiscount()+1).toLocaleString('en-PK')}</h3>
                        </div>
                    </div>
                    
                    <button onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        const token = localStorage.getItem('token');
                        if (token) {
                            navigate('/order');
                        } else {
                            toast.warning("Please login first to proceed to checkout");
                        }
                    }}>PROCEED TO CHECKOUT</button>
                </div>
            </div>
        </div>
    );
}

export default CartItems;
