import React, {createContext, useEffect, useState} from 'react';
import {toast} from "react-toastify";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    const [all_product, setAll_product] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [coupon, setCoupon] = useState({ code: "", value: 0, isValid: false });
    const backend_url = process.env.REACT_APP_API_URL;

    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async() => {
            try {
                // Fetch all products
                const response = await fetch(`${backend_url}/api/products`);
                const json = await response.json();
                
                if (response.ok && isMounted) {
                    setAll_product(json);
                } else if (isMounted) {
                    toast.error(json.error || "Failed to fetch products");
                }
                
                // Get the current token for cart operations
                const token = localStorage.getItem('token');
                
                if (token && isMounted) {
                    try {
                        const cartResponse = await fetch(`${backend_url}/api/cart/getCart`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        
                        const cartJson = await cartResponse.json();
                        
                        if (cartResponse.ok && isMounted) {
                            setCartItems(cartJson);
                        } else if (isMounted) {
                            toast.error(cartJson.error || "Failed to fetch cart");
                        }
                    } catch (error) {
                        console.error("Error fetching cart:", error);
                        if (isMounted) {
                            toast.error("Could not connect to server");
                        }
                    }
                }
            } catch (error) {
                console.error("Error in data fetching:", error);
                if (isMounted) {
                    toast.error("Network error occurred");
                }
            }
        };
        
        fetchData();
        
        // Cleanup function to prevent state updates after unmount
        return () => {
            isMounted = false;
        };
    }, [backend_url]);

    const addToCart = async (itemId, quantity = 1) => {
        // Update cart state with the specified quantity (default is 1)
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: quantity }))
        }
        else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + quantity }))
        }
        
        // Get product name for the notification
        const product = all_product.find(item => item.id === Number(itemId));
        const productName = product ? product.name : 'Item';
        
        // Show success notification with quantity information
        if (quantity > 1) {
            toast.success(`Added ${quantity} ${productName}${quantity > 1 ? 's' : ''} to cart`);
        } else {
            toast.success(`Added to cart: ${productName}`);
        }
        
        const token = localStorage.getItem('token');
        if(token){
            // Make API calls for each item in the quantity
            for (let i = 0; i < quantity; i++) {
                try {
                    const response = await fetch(`${backend_url}/api/cart/addToCart`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({'itemId': itemId}),
                    });
                    const json = await response.json();
                    if(!response.ok){
                        toast.error(json.error);
                    }
                } catch (error) {
                    console.error("Error adding item to cart:", error);
                    toast.error("Failed to update cart on server");
                }
            }
        }
    }

    const removeFromCart = async (itemId) =>{
        // Get current quantity and product info before updating
        const currentQuantity = cartItems[itemId];
        const product = all_product.find(item => item.id === Number(itemId));
        const productName = product ? product.name : 'Item';
        
        // Update cart state
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}));
        
        // Show appropriate notification based on remaining quantity
        if (currentQuantity > 1) {
            toast.info(`Quantity decreased: ${productName}`);
        } else {
            toast.info(`Removed from cart: ${productName}`);
        }
        
        const token = localStorage.getItem('token');
        if(token){
            const response = await fetch(`${backend_url}/api/cart/removeFromCart`,{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body:JSON.stringify({'itemId':itemId}),
            });
            const json = await response.json();
            if(!response.ok){
                toast.error(json.error);
            }
        }
    }

    const removeItemCompletely = async (itemId) => {
        // Get product info before removing
        const product = all_product.find(item => item.id === Number(itemId));
        const productName = product ? product.name : 'Item';
        const quantity = cartItems[itemId];
        
        // Update cart state - remove the item completely
        setCartItems((prev) => {
            const newCart = {...prev};
            delete newCart[itemId];
            return newCart;
        });
        
        // Show removal notification
        toast.info(`Removed from cart: ${productName} (${quantity} ${quantity > 1 ? 'items' : 'item'})`);
        
        // Update server if user is logged in
        const token = localStorage.getItem('token');
        if(token){
            try {
                // Remove the item completely from cart - we need to call the API multiple times
                // to remove all quantities of the item
                for (let i = 0; i < quantity; i++) {
                    await fetch(`${backend_url}/api/cart/removeFromCart`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({'itemId': itemId}),
                    });
                }
            } catch (error) {
                console.error("Error removing item from cart:", error);
                toast.error("Failed to update cart on server");
            }
        }
    };

    const validateCoupon = async (code) => {
        try {
            const response = await fetch(`${backend_url}/api/coupons/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });
            
            const data = await response.json();
            
            if (response.ok && data.valid) {
                setCoupon({
                    code: data.code,
                    value: data.value,
                    isValid: true
                });
                toast.success(`Coupon applied: $${data.value} discount`);
                return true;
            } else {
                setCoupon({ code: "", value: 0, isValid: false });
                toast.error(data.error || "Invalid coupon code");
                return false;
            }
        } catch (error) {
            toast.error("Error validating coupon");
            return false;
        }
    };
    
    const clearCoupon = () => {
        setCoupon({ code: "", value: 0, isValid: false });
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = all_product.find((product) => product.id === Number(item));
                totalAmount += itemInfo.new_price * cartItems[item];
            }
        }
        return totalAmount;
    };
    
    const getCouponDiscount = () => {
        return coupon.isValid ? coupon.value : 0;
    };
    
    const getTotalWithDiscount = () => {
        const subtotal = getTotalCartAmount();
        const discount = getCouponDiscount();
        return Math.max(0, subtotal - discount);
    };

    const getTotalCartItems = () => {
        let totalItem = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) totalItem += cartItems[item];
        }
        return totalItem;
    };

    const contextValue = {
        all_product,
        cartItems,
        addToCart,
        removeFromCart,
        removeItemCompletely,
        getTotalCartAmount,
        getTotalCartItems,
        validateCoupon,
        clearCoupon,
        coupon,
        getCouponDiscount,
        getTotalWithDiscount
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
