import React, { useEffect, useState, useContext } from "react";
import './CSS/MyOrders.css'
import { toast } from 'react-toastify';
import { DarkModeContext } from '../context/DarkModeContext';
import { api } from '../utils/api';

// Utility function to format order number for display
const formatOrderNumber = (orderNumber) => {
    if (!orderNumber) return 'N/A';
    // Show last 8 characters for better display
    return orderNumber.length >= 8 ? orderNumber.slice(-8) : orderNumber;
};

// Utility function to calculate total quantity
const calculateTotalQuantity = (items) => {
    return items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
};

const MyOrders = () => {
    const { darkMode } = useContext(DarkModeContext);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);

        // Check if user has token
        if (!token) {
            setError('Please login to view your orders');
            setIsLoading(false);
            return;
        }

        try {
            console.log('Fetching orders for user with token:', token ? 'Token present' : 'No token');
            const response = await api.getUserOrders();
            console.log('API response status:', response.status);

            const json = await response.json();
            console.log('API response data:', json);

            if (response.ok) {
                // Extract orders array from response
                const ordersData = json.orders || [];
                console.log('Fetched orders:', ordersData);
                setOrders(ordersData);

                if (ordersData.length === 0) {
                    console.log('No orders found for user');
                }
            } else {
                const errorMessage = json.error || `Failed to fetch orders (${response.status})`;
                console.error('API error:', errorMessage);
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } catch (err) {
            const errorMessage = 'Error connecting to server';
            console.error('Network error:', err);
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'processing':
                return 'status-processing';
            case 'shipped':
                return 'status-shipped';
            case 'delivered':
                return 'status-delivered';
            default:
                return 'status-processing';
        }
    }

    return (
        <div className={`my-orders ${darkMode ? 'dark-mode' : ''}`}>
            <h2>My Orders</h2>
            <div className="container">
                {isLoading ? (
                    <div className="loading-message">
                        <p>Loading your orders...</p>
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={fetchOrders}>Try Again</button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="empty-orders">
                        <p>You haven't placed any orders yet.</p>
                        <a href="/books" className="shop-now-btn">Shop Now</a>
                    </div>
                ) : (
                    // Render orders when available
                    orders.map((order, index) => {
                        const statusClass = getStatusColor(order.status);
                        return (
                            <div key={order._id || index} className={`my-orders-order card ${statusClass} ${darkMode ? 'dark' : ''}`}>
                                <div className="order-header">
                                    <div className="order-number">
                                        <span className="order-number-label">Order #</span>
                                        <span className="order-number-value">{formatOrderNumber(order.orderNumber) || order._id?.substring(order._id.length - 6) || index}</span>
                                    </div>
                                    <div className="order-info">
                                        <span className="order-date">{new Date(order.date).toLocaleDateString('en-PK')}</span>
                                        <span className="total-quantity">{calculateTotalQuantity(order.items)} items</span>
                                    </div>
                                </div>
                                <div className="order-images">
                                    {order.items && Array.isArray(order.items) &&
                                        order.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="order-image-container">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="order-product-image"
                                                    title={`${item.name} x ${item.quantity}`}
                                                />
                                                <span className="item-quantity">{item.quantity}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                                <div className="order-details">
                                    <p className="order-items">
                                        {order.items && Array.isArray(order.items) ?
                                            order.items.map((item, itemIndex) => {
                                                if (itemIndex === order.items.length - 1) {
                                                    return `${item.name} x ${item.quantity}`
                                                } else {
                                                    return `${item.name} x ${item.quantity}, `
                                                }
                                            }) : 'No items'}
                                    </p>
                                    <p className="order-amount">PKR {order.amount ? order.amount.toLocaleString('en-PK') : '0'}</p>
                                    <p className="order-count">Items: {order.items && Array.isArray(order.items) ? order.items.length : 0}</p>
                                    <p className="order-status"><span>&#x25cf;</span> <b>{order.status || 'Processing'}</b></p>

                                    <div className="order-whatsapp-container">
                                        <p>Send payment screenshot via WhatsApp:</p>
                                        <a href={`https://api.whatsapp.com/send?phone=%2B923003383851&text=Hello, I'm sending payment proof for Order %23${formatOrderNumber(order.orderNumber) || order._id?.substring(order._id.length - 6)}`} className="whatsapp-button" target="_blank" rel="noopener noreferrer">Send via WhatsApp</a>
                                    </div>

                                    <button className="track-button" onClick={fetchOrders}>Track Order</button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
}

export default MyOrders;