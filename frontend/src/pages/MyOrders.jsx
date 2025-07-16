import React, { useEffect, useState, useContext } from "react";
import './CSS/MyOrders.css'
import { toast } from 'react-toastify';
import { DarkModeContext } from '../context/DarkModeContext';

const MyOrders = () => {
    const { darkMode } = useContext(DarkModeContext);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    const backend_url = process.env.REACT_APP_API_URL;
    
    const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${backend_url}/api/orders/userorders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });
            
            const json = await response.json();
            
            if (response.ok) {
                // Extract orders array from response
                const ordersData = json.orders || [];
                setOrders(ordersData);
            } else {
                setError(json.error || 'Failed to fetch orders');
                toast.error(json.error || 'Failed to fetch orders');
            }
        } catch (err) {
            setError('Error connecting to server');
            toast.error('Error connecting to server');
            console.error('Error fetching orders:', err);
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
        switch(status?.toLowerCase()) {
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
                        <a href="/shop" className="shop-now-btn">Shop Now</a>
                    </div>
                ) : (
                    // Render orders when available
                    orders.map((order, index) => {
                        const statusClass = getStatusColor(order.status);
                        return (
                            <div key={order._id || index} className={`my-orders-order card ${statusClass} ${darkMode ? 'dark' : ''}`}>
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
                                                if (itemIndex === order.items.length-1) {
                                                    return `${item.name} x ${item.quantity}`
                                                } else {
                                                    return `${item.name} x ${item.quantity}, `
                                                }
                                            }) : 'No items'}
                                    </p>
                                    <p className="order-amount">PKR {order.amount ? order.amount.toLocaleString('en-PK') : '0'}</p>
                                    <p className="order-count">Items: {order.items && Array.isArray(order.items) ? order.items.length : 0}</p>
                                    <p className="order-status"><span>&#x25cf;</span> <b>{order.status || 'Processing'}</b></p>
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