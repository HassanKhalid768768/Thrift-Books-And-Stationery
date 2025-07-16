import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DarkModeContext } from '../../context/DarkModeContext';
import './Sidebar.css';
import { useAuth } from "../../context/AuthContext";
import { MdInventory2, MdAddBox, MdRateReview } from 'react-icons/md';
import { FaShoppingBag } from 'react-icons/fa';
import { RiCoupon3Fill } from 'react-icons/ri';
import { IoMdChatboxes } from 'react-icons/io';

const Sidebar = () => {
    const location = useLocation();
    const { darkMode } = useContext(DarkModeContext);
    const { isAuthenticated, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState(location.pathname);
    
    // Only render sidebar for authenticated admin users
    if (!isAuthenticated || !isAdmin) {
        return null;
    }
    
    // Check if a path is the current active route
    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className={`sidebar ${darkMode ? 'dark-mode' : ''}`}>
            <Link to={'/listproduct'} style={{textDecoration:'none'}}>
                <div className={`sidebar-item ${isActive('/listproduct') ? 'active' : ''}`}>
                    <MdInventory2 style={{ color: '#FF9800', fontSize: '24px' }} />
                    <p>Product List</p>
                </div>
            </Link>
            <Link to={'/addproduct'} style={{textDecoration:'none'}}>
                <div className={`sidebar-item ${isActive('/addproduct') ? 'active' : ''}`}>
                    <MdAddBox style={{ color: '#4CAF50', fontSize: '24px' }} />
                    <p>Add Product</p>
                </div>
            </Link>
            <Link to={'/listorder'} style={{textDecoration:'none'}}>
                <div className={`sidebar-item ${isActive('/listorder') ? 'active' : ''}`}>
                    <FaShoppingBag style={{ color: '#2196F3', fontSize: '22px' }} />
                    <p>Orders</p>
                </div>
            </Link>
            <Link to={'/reviews'} style={{textDecoration:'none'}}>
                <div className={`sidebar-item ${isActive('/reviews') ? 'active' : ''}`}>
                    <MdRateReview style={{ color: '#9C27B0', fontSize: '24px' }} />
                    <p>Manage Reviews</p>
                </div>
            </Link>
            <Link to={'/managecoupons'} style={{textDecoration:'none'}}>
                <div className={`sidebar-item ${isActive('/managecoupons') ? 'active' : ''}`}>
                    <RiCoupon3Fill style={{ color: '#FFC107', fontSize: '24px' }} />
                    <p>Manage Coupons</p>
                </div>
            </Link>
            <Link to={'/messages'} style={{textDecoration:'none'}}>
                <div className={`sidebar-item ${isActive('/messages') ? 'active' : ''}`}>
                    <IoMdChatboxes style={{ color: '#009688', fontSize: '24px' }} />
                    <p>Messages</p>
                </div>
            </Link>
        </div>
    );
}

export default Sidebar;
