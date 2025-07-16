import React, { useState, useEffect, useContext } from "react";
import './ManageCoupons.css';
import bin from './../../assets/recycle-bin.png';
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { DarkModeContext } from "../../context/DarkModeContext";

const ManageCoupons = () => {
    const { token, isAuthenticated } = useAuth();
    const { darkMode } = useContext(DarkModeContext);
    const backend_url = process.env.REACT_APP_API_URL;
    const [coupons, setCoupons] = useState([]);
    const [couponDetails, setCouponDetails] = useState({
        code: "",
        value: "",
        expiryDate: ""
    });

    useEffect(() => {
        const fetchCoupons = async () => {
            if (!isAuthenticated || !token) return;
            
            try {
                const response = await fetch(`${backend_url}/api/coupons`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setCoupons(data);
                } else {
                    toast.error(data.error || "Failed to fetch coupons");
                }
            } catch (error) {
                toast.error("Error connecting to server");
            }
        };

        if (isAuthenticated && token) {
            fetchCoupons();
        }
    }, [isAuthenticated, token, backend_url]);

    const changeHandler = (e) => {
        setCouponDetails({ ...couponDetails, [e.target.name]: e.target.value });
    };

    const addCoupon = async () => {
        try {
            if (!couponDetails.code || !couponDetails.value) {
                return toast.error("Coupon code and value are required");
            }

            const response = await fetch(`${backend_url}/api/coupons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(couponDetails)
            });

            const data = await response.json();
            
            if (response.ok) {
                toast.success("Coupon added successfully");
                setCouponDetails({
                    code: "",
                    value: "",
                    expiryDate: ""
                });
                // Refetch coupons after adding a new one
                const response = await fetch(`${backend_url}/api/coupons`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const couponsData = await response.json();
                if (response.ok) {
                    setCoupons(couponsData);
                }
            } else {
                toast.error(data.error || "Failed to add coupon");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        }
    };

    const deleteCoupon = async (id) => {
        try {
            const response = await fetch(`${backend_url}/api/coupons/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (response.ok) {
                toast.success("Coupon deleted successfully");
                // Refetch coupons after deletion
                const response = await fetch(`${backend_url}/api/coupons`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const couponsData = await response.json();
                if (response.ok) {
                    setCoupons(couponsData);
                }
            } else {
                toast.error(data.error || "Failed to delete coupon");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        }
    };

    // Check if coupon is expired
    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        return new Date() > new Date(expiryDate);
    };
    return (
        <div className={`manage-coupons-container ${darkMode ? 'dark-mode' : ''}`}>
            <h1>Manage Coupons</h1>
            
            <div className="add-coupon-section">
                <h2>Add New Coupon</h2>
                <div className="coupon-form">
                    <div className="coupon-form-field">
                        <p>Coupon Code</p>
                        <input 
                            type="text" 
                            name="code" 
                            placeholder="Enter coupon code" 
                            value={couponDetails.code}
                            onChange={changeHandler}
                        />
                    </div>
                    <div className="coupon-form-field">
                        <p>Discount Value (PKR)</p>
                        <input 
                            type="number" 
                            name="value" 
                            placeholder="Enter discount amount in PKR" 
                            value={couponDetails.value}
                            onChange={changeHandler}
                        />
                    </div>
                    <div className="coupon-form-field">
                        <p>Expiry Date (Optional)</p>
                        <input 
                            type="date" 
                            name="expiryDate" 
                            value={couponDetails.expiryDate}
                            onChange={changeHandler}
                        />
                    </div>
                    <button className="add-coupon-btn" onClick={addCoupon}>ADD COUPON</button>
                </div>
            </div>

            <div className="coupon-list-section">
                <h2>Current Coupons</h2>
                <div className="coupon-list-format-main">
                    <p>Code</p>
                    <p>Value</p>
                    <p>Expiry Date</p>
                    <p>Status</p>
                    <p>Remove</p>
                </div>
                <div className="coupon-list">
                    <hr />
                    {coupons.length === 0 ? (
                        <div className="no-coupons">
                            <p>No coupons found. Add one to get started.</p>
                        </div>
                    ) : (
                        coupons.map((coupon, index) => (
                            <React.Fragment key={index}>
                                <div className="coupon-list-format-main coupon-list-item">
                                    <p>{coupon.code}</p>
                                    <p>PKR {coupon.value.toLocaleString('en-PK')}</p>
                                    <p>{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : "No expiry"}</p>
                                    <p className={isExpired(coupon.expiryDate) ? "expired" : "active"}>
                                        {isExpired(coupon.expiryDate) ? "Expired" : "Active"}
                                    </p>
                                    <img 
                                        src={bin} 
                                        alt="delete" 
                                        className="coupon-remove-icon" 
                                        onClick={() => deleteCoupon(coupon._id)}
                                    />
                                </div>
                                <hr />
                            </React.Fragment>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageCoupons;

