
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './CSS/PlaceOrder.css';
import { StoreContext } from "../context/StoreContext";
import { DarkModeContext } from "../context/DarkModeContext";
import { toast } from 'react-toastify';

const PlaceOrder = () => {
    const {
        getTotalCartAmount, 
        getTotalWithDiscount, 
        all_product, 
        cartItems, 
        coupon, 
        getCouponDiscount,
        clearCoupon,
        clearCart
    } = useContext(StoreContext);
    
    const { darkMode } = useContext(DarkModeContext);
    
    const token = localStorage.getItem('token');
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const navigate = useNavigate();
    
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        Address: "",
        city: "",
        country: "",
        Phone: ""
    });
    
    const [paymentMethod, setPaymentMethod] = useState("");
    
    const changeHandler = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const placeOrder = async (e) => {
        e.preventDefault();
        
        // Debug logging
        console.log('PlaceOrder - Starting order placement');
        console.log('PlaceOrder - Backend URL:', backend_url);
        console.log('PlaceOrder - Token:', token ? 'Present' : 'Missing');
        console.log('PlaceOrder - Form data:', data);
        console.log('PlaceOrder - Cart items:', cartItems);
        console.log('PlaceOrder - Total cart amount:', getTotalCartAmount());
        
        // Test backend connectivity first
        try {
            console.log('PlaceOrder - Testing backend connectivity...');
            const testResponse = await fetch(`${backend_url}/api/test`);
            const testData = await testResponse.json();
            console.log('PlaceOrder - Backend connectivity test:', testData);
        } catch (error) {
            console.error('PlaceOrder - Backend connectivity test failed:', error);
            toast.error('Cannot connect to server. Please check if the backend is running.');
            return;
        }
        
        // Validate required fields
        if (!data.firstName || !data.lastName || !data.email || !data.Address || !data.city || !data.country || !data.Phone) {
            toast.error('Please fill in all required fields');
            return;
        }
        
        // Validate payment method selection
        if (!paymentMethod) {
            toast.error('Please select a payment method');
            return;
        }
        
        // Check if cart has items
        if (getTotalCartAmount() === 0) {
            toast.error('Your cart is empty');
            return;
        }
        
        // Check if user is logged in
        if (!token) {
            toast.error('Please log in to place an order');
            return;
        }
        
        // Revalidate coupon if applied (check minimum order value)
        if (coupon.isValid) {
            try {
                const currentOrderAmount = getTotalCartAmount();
                const response = await fetch(`${backend_url}/api/coupons/validate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        code: coupon.code, 
                        orderAmount: currentOrderAmount 
                    }),
                });
                
                const couponData = await response.json();
                
                if (!response.ok || !couponData.valid) {
                    // Coupon is no longer valid, remove it
                    clearCoupon();
                    toast.error(couponData.error || 'Coupon is no longer valid for current order amount');
                    return;
                }
            } catch (error) {
                console.error('Error revalidating coupon:', error);
                toast.error('Error validating coupon. Please try again.');
                return;
            }
        }
        
        let orderItems = [];
        
        all_product.forEach((item) => {
            if (cartItems[item.id] > 0) {
                let itemInfo = { ...item };
                itemInfo['quantity'] = cartItems[item.id];
                orderItems.push(itemInfo);
            }
        });
        
        console.log('PlaceOrder - Order items:', orderItems);
        
        let orderData = {
            address: data,
            items: orderItems,
            amount: getTotalWithDiscount() + 1,
            paymentMethod: paymentMethod,
            appliedCoupon: coupon.isValid ? {
                code: coupon.code,
                value: coupon.value
            } : null
        };
        
        console.log('PlaceOrder - Order data:', orderData);
        
        try {
            console.log('PlaceOrder - Sending request to:', `${backend_url}/api/orders/place-direct`);
            
            let response = await fetch(`${backend_url}/api/orders/place-direct`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(orderData),
            });
            
            console.log('PlaceOrder - Response status:', response.status);
            
            const json = await response.json();
            console.log('PlaceOrder - Response data:', json);
            
            if (response.ok) {
                console.log('PlaceOrder - Order placed successfully:', json);
                
                // Clear coupon after successful order placement
                clearCoupon();
                
                // Clear cart for COD orders (backend already clears it, but update frontend too)
                if (paymentMethod === 'cod') {
                    clearCart();
                    toast.success('Order placed successfully! Cash on Delivery confirmed.');
                } else if (paymentMethod === 'bankTransfer') {
                    toast.success('Order placed successfully! Please send payment proof via WhatsApp.');
                }
                
                // Navigate to orders page or home after a short delay
                setTimeout(() => {
                    navigate('/myorders');
                }, 2000);
                
            } else {
                console.error('PlaceOrder - Error response:', json);
                toast.error(json.error || "Failed to place order");
            }
        } catch (error) {
            console.error('PlaceOrder - Network error:', error);
            toast.error("Error connecting to server");
        }
    };
    
    useEffect(() => {
        if (!token || getTotalCartAmount() === 0) {
            navigate('/cart');
        }
    }, [token, getTotalCartAmount, navigate]);

    return ( 
        <form onSubmit={placeOrder} className={`place-order ${darkMode ? 'dark-mode' : ''}`}>
            <div className="place-order-left card">
                <p className="title">Delivery Information</p>
                <div className="multi-fields">
                    <input name="firstName" onChange={changeHandler} value={data.firstName} type="text" placeholder="First Name" required/>
                    <input name="lastName" onChange={changeHandler} value={data.lastName} type="text" placeholder="Last Name" required/>
                </div>
                <input name="email" onChange={changeHandler} value={data.email} type="email" placeholder="Email Address" required/>
                <input name="Address" onChange={changeHandler} value={data.Address} type="text" placeholder="Address" required/>
                <div className="multi-fields">
                    <input name="city" onChange={changeHandler} value={data.city} type="text" placeholder="City" required/>
                    <input name="country" onChange={changeHandler} value={data.country} type="text" placeholder="Country" required/>
                </div>
                <input name="Phone" onChange={changeHandler} value={data.Phone} type="text" placeholder="Phone" required/>
            </div>
            
            <div className="place-order-right card">
                <div className="cart-total">
                    <h1>Cart Totals</h1>
                    <div>
                        <div className="cart-total-details">
                            <p>Subtotal</p>
                            <p>PKR {getTotalCartAmount().toLocaleString('en-PK')}</p>
                        </div>
                        <hr />
                        
                        {coupon.isValid && (
                            <>
                                <div className="cart-total-details discount">
                                    <p>
                                        Coupon Discount <span className="coupon-code-label">({coupon.code})</span>
                                    </p>
                                    <p className="discount-value">-PKR {getCouponDiscount().toLocaleString('en-PK')}</p>
                                </div>
                                <hr />
                            </>
                        )}
                        
                        <div className="cart-total-details">
                            <p>Shipping Fee</p>
                            <p>PKR {(getTotalCartAmount() === 0 ? 0 : 1).toLocaleString('en-PK')}</p>
                        </div>
                        <hr />
                        
                        <div className="cart-total-details">
                            <h3>Total </h3>
                            <h3>PKR {(getTotalCartAmount() === 0 ? 0 : getTotalWithDiscount() + 1).toLocaleString('en-PK')}</h3>
                        </div>
</div>

                    <div className="payment-methods">
                        <h2>Payment Options</h2>
                        <div className="payment-option">
                            <input 
                                type="radio" 
                                id="cod" 
                                name="paymentOption" 
                                value="cod" 
                                checked={paymentMethod === "cod"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                required 
                            />
                            <label htmlFor="cod">Cash on Delivery (Karachi residents only, additional charges apply)</label>
                        </div>
                        <div className="payment-option">
                            <input 
                                type="radio" 
                                id="bankTransfer" 
                                name="paymentOption" 
                                value="bankTransfer" 
                                checked={paymentMethod === "bankTransfer"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                required 
                            />
                            <label htmlFor="bankTransfer">Bank Transfer via EasyPaisa or JazzCash: 03003383851 (Account Title: NASRA TANVEER)</label>
                            {paymentMethod === "bankTransfer" && (
                                <div className="bank-transfer-details">
                                    <p>Please send payment proof to WhatsApp.</p>
                                    <a href="https://api.whatsapp.com/send?phone=%2B923003383851&context=AfepripkwO52YOtyqBBXmRt-LrMnIucbELBLylQcrKlgU-j-f6Fea8PMKAKPOOqYTa98CwMwkS14vdMR9z30pXBTlj7KjHzNNDPF4xV9djlTG2KbEpD1NvjZev8s8JGvzUVKGFSyXmRuuvljVJbZB2wVTw&source=FB_Page&app=facebook&entry_point=page_cta&fbclid=IwY2xjawLkoOJleHRuA2FlbQIxMABicmlkETF2cjdPbEZuSGs4WHBlMEtrAR63RLZkCAbMXqXvBrotjsPDf9whlscHDWbaVWA3yK2ojFcAO8qAbw9xUtSIMQ_aem_TMnobXT3-k8sQr9epELmvg" className="whatsapp-button" target="_blank" rel="noopener noreferrer">Send via WhatsApp</a>
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" disabled={!paymentMethod} className={!paymentMethod ? 'disabled' : ''}>PLACE ORDER</button>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;
