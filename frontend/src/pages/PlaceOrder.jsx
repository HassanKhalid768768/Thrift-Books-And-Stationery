
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
        clearCoupon
    } = useContext(StoreContext);
    
    const { darkMode } = useContext(DarkModeContext);
    
    const token = localStorage.getItem('token');
    const backend_url = process.env.REACT_APP_BACKEND_URL;
    const navigate = useNavigate();
    
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phone: ""
    });
    
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
        if (!data.firstName || !data.lastName || !data.email || !data.street || !data.city || !data.state || !data.zipcode || !data.country || !data.phone) {
            toast.error('Please fill in all required fields');
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
            appliedCoupon: coupon.isValid ? {
                code: coupon.code,
                value: coupon.value
            } : null
        };
        
        console.log('PlaceOrder - Order data:', orderData);
        
        try {
            console.log('PlaceOrder - Sending request to:', `${backend_url}/api/orders/place`);
            
            let response = await fetch(`${backend_url}/api/orders/place`, {
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
                const { session_url } = json;
                console.log('PlaceOrder - Redirecting to:', session_url);
                // Don't clear the coupon here - it should persist until payment is complete
                window.location.replace(session_url);
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
                <input name="street" onChange={changeHandler} value={data.street} type="text" placeholder="Street" required/>
                <div className="multi-fields">
                    <input name="city" onChange={changeHandler} value={data.city} type="text" placeholder="City" required/>
                    <input name="state" onChange={changeHandler} value={data.state} type="text" placeholder="State" required/>
                </div>
                <div className="multi-fields">
                    <input name="zipcode" onChange={changeHandler} value={data.zipcode} type="text" placeholder="Zip code" required/>
                    <input name="country" onChange={changeHandler} value={data.country} type="text" placeholder="Country" required/>
                </div>
                <input name="phone" onChange={changeHandler} value={data.phone} type="text" placeholder="phone" required/>
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
                    
                    <button type="submit">PROCEED TO PAYMENT</button>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;
