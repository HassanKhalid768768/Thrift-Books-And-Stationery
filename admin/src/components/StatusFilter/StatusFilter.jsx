import React, { useState, useEffect } from 'react';
import './StatusFilter.css';

const StatusFilter = ({ orders, onFilterChange, statusColors }) => {
    const [activeTab, setActiveTab] = useState("All");
    const statuses = ["All", "Ordered", "Shipped", "Out for delivery", "Delivered"];
    
    // Add All to statusColors if not present
    const allStatusColors = { ...statusColors, "All": "#666" };

    const getStatusCount = (status) => {
        if (status === "All") return orders.length;
        return orders.filter(order => order.status === status).length;
    };

    const handleTabClick = (status) => {
        setActiveTab(status);
        
        if (status === "All") {
            onFilterChange(orders);
            return;
        }
        
        const filteredOrders = orders.filter(order => order.status === status);
        onFilterChange(filteredOrders);
    };
    
    // Set the default tab if it's provided externally
    useEffect(() => {
        if (activeTab !== "All" && orders.length > 0) {
            const filteredOrders = orders.filter(order => order.status === activeTab);
            onFilterChange(filteredOrders);
        }
    }, [orders, activeTab, onFilterChange]);

    return (
        <div className="status-filter">
            <h3>Filter by Status</h3>
            <div className="status-tabs">
                {statuses.map((status) => (
                    <div 
                        key={status}
                        className={`status-tab ${activeTab === status ? 'active' : ''}`}
                        onClick={() => handleTabClick(status)}
                        style={{
                            borderLeft: `4px solid ${allStatusColors[status]}`,
                            ...(activeTab === status ? { 
                                backgroundColor: `${allStatusColors[status]}40` // 40 is hex for 25% opacity
                            } : {})
                        }}
                    >
                        <span>{status}</span>
                        <span className="status-count">{getStatusCount(status)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatusFilter;
