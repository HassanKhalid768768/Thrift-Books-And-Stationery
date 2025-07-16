import React, { useState, useEffect, useContext } from "react";
import './ListOrder.css'
import order_icon from './../../assets/order_icon.png'
import {toast} from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { DarkModeContext } from "../../context/DarkModeContext";
import StatusFilter from "../StatusFilter/StatusFilter";

// Status color mapping
const statusColors = {
  "Ordered": "#f0ad4e",      // Orange
  "Shipped": "#5bc0de",      // Blue
  "Out for delivery": "#0275d8", // Primary blue
  "Delivered": "#5cb85c"     // Green
};

const ListOrder = () => {
    const backend_url = process.env.REACT_APP_API_URL;
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeStatus, setActiveStatus] = useState("All");
    const { token, isAuthenticated } = useAuth();
    const { darkMode } = useContext(DarkModeContext);

    const fetchOrders = async() => {
        setLoading(true);
        try {
            const response = await fetch(`${backend_url}/api/orders`);
            const json = await response.json();
            if(response.ok){
                // Sort orders by date (newest first)
                const sortedOrders = json.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setOrders(sortedOrders);
                setFilteredOrders(sortedOrders);
                setError(null);
            } else {
                setError(json.error || "Failed to fetch orders");
                toast.error(json.error || "Failed to fetch orders");
            }
        } catch (err) {
            setError("Server error occurred");
            toast.error("Server error occurred");
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        fetchOrders();
    },[])

    const statusHandler = async (event, orderId) => {
        try {
            const newStatus = event.target.value;
            
            const response = await fetch(`${backend_url}/api/orders/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    orderId,
                    status: newStatus
                }),
            });
            
            const json = await response.json();
            
            if (response.ok) {
                toast.success(`Order status updated to ${newStatus}`);
                
                // Update local state instead of fetching all orders again
                const updatedOrders = orders.map(order => 
                    order._id === orderId ? { ...order, status: newStatus } : order
                );
                setOrders(updatedOrders);
                
                // Update filtered orders based on active status
                if (activeStatus === "All") {
                    setFilteredOrders(updatedOrders);
                } else if (activeStatus === newStatus) {
                    // If we're viewing the same status as the new status, keep the order
                    setFilteredOrders(updatedOrders.filter(order => order.status === activeStatus));
                } else {
                    // If we're viewing a different status, remove this order from filtered view
                    setFilteredOrders(prevFiltered => 
                        prevFiltered.filter(order => order._id !== orderId)
                    );
                }
            } else {
                toast.error(json.error || "Failed to update order status");
            }
        } catch (err) {
            toast.error("Error updating order status");
        }
    }

    const handleStatusFilterChange = (filtered) => {
        setFilteredOrders(filtered);
        
        // Track the active status
        if (filtered.length === orders.length) {
            setActiveStatus("All");
        } else if (filtered.length > 0) {
            setActiveStatus(filtered[0].status);
        }
    };

    return (
        <div className={`list-order-container ${darkMode ? 'dark-mode' : ''}`}>
            <div className="list-order-content">
                <div className="orders-header">
                    <h1>Order Management</h1>
                    <div className="orders-stats">
                    <div className="stat-item">
                        <span className="stat-value">{orders.length}</span>
                        <span className="stat-label">Total Orders</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">
                            {orders.filter(order => order.status === "Delivered").length}
                        </span>
                        <span className="stat-label">Delivered</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">
                            {orders.filter(order => order.status !== "Delivered").length}
                        </span>
                        <span className="stat-label">Pending</span>
                    </div>
                </div>
            </div>
            
            <StatusFilter 
                orders={orders} 
                onFilterChange={handleStatusFilterChange} 
                statusColors={statusColors}
            />
            
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading orders...</p>
                </div>
            ) : error ? (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchOrders} className="retry-button">Retry</button>
                </div>
            ) : orders.length === 0 ? (
                <div className="no-orders">
                    <p>No orders found</p>
                </div>
            ) : (
                <div className="order-list">
                    {filteredOrders.map((order, index) => (
                        <div key={order._id || index} className='order-card'>
                            <div className="order-header">
                                <div className="order-info">
                                    <span className="order-id">Order #{order._id?.substring(order._id.length - 6) || index}</span>
                                </div>
                                <div className="order-amount">PKR {order.amount?.toLocaleString('en-PK')}</div>
                            </div>
                            
                            <div className="order-customer">
                                <div className="customer-icon">
                                    <img src={order_icon} alt="" className="order-icon" />
                                </div>
                                <div className="customer-details">
                                    <h3 className='customer-name'>{order.address?.firstName + " " + order.address?.lastName}</h3>
                                    <div className="address-details">
                                        <p>{order.address?.street}</p>
                                        <p>{order.address?.city}, {order.address?.state}, {order.address?.zipcode}</p>
                                        <p>{order.address?.country}</p>
                                    </div>
                                    <p className="customer-phone">{order.address?.phone}</p>
                                </div>
                            </div>
                            
                            <div className="order-items">
                                <h4>Order Items ({order.items?.length})</h4>
                                <div className="items-grid">
                                    {order.items?.map((item, itemIndex) => (
                                        <div key={itemIndex} className="item-card">
                                            <div className="item-image">
                                                <img src={item.image} alt={item.name} onError={(e) => {e.target.src = order_icon}} />
                                            </div>
                                            <div className="item-details">
                                                <p className="item-name">{item.name}</p>
                                                <div className="item-meta">
                                                    <span className="item-price">PKR {item.price?.toLocaleString('en-PK')}</span>
                                                    <span className="item-quantity">x{item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="order-footer">
                                <div className="status-selector">
                                    <label htmlFor={`status-${order._id || index}`}>Status:</label>
                                    <div className="select-wrapper">
                                        <select 
                                            id={`status-${order._id || index}`}
                                            onChange={(event) => statusHandler(event, order._id)} 
                                            value={order.status}
                                            style={{
                                                backgroundColor: statusColors[order.status] + '20',
                                                borderColor: statusColors[order.status],
                                                color: order.status === "Delivered" ? "#2c722c" : "#333"
                                            }}
                                        >
                                            <option value="Ordered">Ordered</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Out for delivery">Out for delivery</option>
                                            <option value="Delivered">Delivered</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="status-badge" style={{ backgroundColor: statusColors[order.status] }}>
                                    {order.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
}

export default ListOrder;
