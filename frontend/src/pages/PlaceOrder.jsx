
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
        cartItemDetails,
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

    const subtotal = getTotalWithDiscount();
    const isFreeShipping = subtotal >= 5000;
    const baseShippingFee = data.city ? (data.city.trim().toLowerCase() === 'karachi' ? 250 : 350) : 0;
    const shippingFee = isFreeShipping ? 0 : baseShippingFee;

    const [paymentMethod, setPaymentMethod] = useState("bankTransfer");
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const changeHandler = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const placeOrder = async (e) => {
        e.preventDefault();

        // Prevent duplicate orders
        if (isPlacingOrder) {
            toast.warning('Please wait, your order is being processed...');
            return;
        }

        setIsPlacingOrder(true);
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
            setIsPlacingOrder(false);
            toast.error('Cannot connect to server. Please check if the backend is running.');
            return;
        }

        // Validate required fields
        if (!data.firstName || !data.lastName || !data.email || !data.Address || !data.city || !data.country || !data.Phone) {
            setIsPlacingOrder(false);
            toast.error('Please fill in all required fields');
            return;
        }

        // Validate payment method selection
        if (!paymentMethod) {
            setIsPlacingOrder(false);
            toast.error('Please select a payment method');
            return;
        }

        // Check if cart has items
        if (getTotalCartAmount() === 0) {
            setIsPlacingOrder(false);
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

        // Iterate through cartItems using cartKeys (which can be itemId or itemId_size)
        Object.keys(cartItems).forEach((cartKey) => {
            if (cartItems[cartKey] > 0) {
                const itemDetails = cartItemDetails[cartKey];
                const itemId = itemDetails?.itemId || (cartKey.includes('_') ? parseInt(cartKey.split('_')[0]) : parseInt(cartKey));
                const item = all_product.find(p => p.id === itemId);

                if (item) {
                    let itemInfo = { ...item };
                    itemInfo['quantity'] = cartItems[cartKey];

                    // Use size price if available from cartItemDetails
                    if (itemDetails) {
                        itemInfo['selectedSize'] = itemDetails.size;
                        itemInfo['old_price'] = itemDetails.price;
                    } else if (item.sizes && item.sizes.length > 0) {
                        // Fallback: use the first size's price or base price
                        itemInfo['selectedSize'] = item.sizes[0]?.size || null;
                        itemInfo['old_price'] = item.sizes[0]?.price || item.old_price;
                    }
                    orderItems.push(itemInfo);
                }
            }
        });

        console.log('PlaceOrder - Order items:', orderItems);

        let orderData = {
            address: data,
            items: orderItems,
            amount: subtotal + shippingFee,
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

                // Clear cart after successful order placement
                if (paymentMethod === 'bankTransfer') {
                    clearCart();
                    toast.success('Order placed successfully! Please send payment proof via WhatsApp.');
                }

                // Navigate to orders page or home after a short delay
                setTimeout(() => {
                    navigate('/myorders');
                }, 2000);

            } else {
                console.error('PlaceOrder - Error response:', json);

                // Handle specific out-of-stock error
                if (json.unavailableItems && json.unavailableItems.length > 0) {
                    const itemNames = json.unavailableItems.map(item => item.name).join(', ');
                    toast.error(`The following items are no longer available: ${itemNames}. Please update your cart.`);

                    // Navigate back to cart to resolve the issue
                    setTimeout(() => {
                        navigate('/cart');
                    }, 3000);
                } else {
                    toast.error(json.error || "Failed to place order");
                }
            }
        } catch (error) {
            console.error('PlaceOrder - Network error:', error);
            setIsPlacingOrder(false);
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
                    <input name="firstName" onChange={changeHandler} value={data.firstName} type="text" placeholder="First Name" required />
                    <input name="lastName" onChange={changeHandler} value={data.lastName} type="text" placeholder="Last Name" required />
                </div>
                <input name="email" onChange={changeHandler} value={data.email} type="email" placeholder="Email Address" required />
                <input name="Address" onChange={changeHandler} value={data.Address} type="text" placeholder="Address" required />
                <div className="multi-fields">
                    <input name="city" onChange={changeHandler} value={data.city} type="text" placeholder="City" required />
                    <input name="country" onChange={changeHandler} value={data.country} type="text" placeholder="Country" required />
                </div>
                <input name="Phone" onChange={changeHandler} value={data.Phone} type="text" placeholder="Phone" required />
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
                            <p>
                                {!data.city ? (
                                    "Will be calculated when you enter address"
                                ) : isFreeShipping ? (
                                    <span style={{ color: '#12b76a', fontWeight: 'bold' }}>FREE SHIPPING</span>
                                ) : (
                                    `PKR ${baseShippingFee.toLocaleString('en-PK')}`
                                )}
                            </p>
                        </div>
                        <hr />

                        <div className="cart-total-details">
                            <h3>Total </h3>
                            <h3>PKR {(getTotalCartAmount() === 0 ? 0 : subtotal + shippingFee).toLocaleString('en-PK')}</h3>
                        </div>
                        {isFreeShipping && (
                            <div className="free-shipping-note" style={{ color: '#12b76a', fontSize: '0.85rem', marginTop: '5px', fontWeight: '500' }}>
                                ✨ Amazing! You've unlocked FREE SHIPPING on this order.
                            </div>
                        )}
                        <div className="shipping-disclaimer" style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px', fontStyle: 'italic' }}>
                            <p>* For parcels above 2 kg, additional Rs. 50 per kg will be charged.</p>
                        </div>
                    </div>

                    <div className="payment-methods">
                        <h2>Payment Options</h2>
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

                    <button
                        type="submit"
                        disabled={!paymentMethod || isPlacingOrder}
                        className={(!paymentMethod || isPlacingOrder) ? 'disabled' : ''}
                    >
                        {isPlacingOrder ? 'PLACING ORDER...' : 'PLACE ORDER'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;
