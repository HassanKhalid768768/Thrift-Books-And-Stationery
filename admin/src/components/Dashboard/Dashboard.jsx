import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { api } from '../../utils/api';

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.getProducts();
                const data = await response.json();
                if (response.ok) {
                    setProducts(data);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const getCategoryStats = () => {
        return {
            "Books": products.filter(p => p.category === "books").length,
            "Stationary": products.filter(p => p.category === "stationary").length,
            "Gadgets": products.filter(p => p.category === "gadgets").length,
            "Total": products.length
        };
    };

    const stats = getCategoryStats();

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            
            <div className="dashboard-stats">
                <div className="stats-card total">
                    <h2>Total Products</h2>
                    <div className="stat-value">{stats.Total}</div>
                </div>
                
                <div className="stats-card books">
                    <h2>Books</h2>
                    <div className="stat-value">{stats["Books"]}</div>
                    <div className="stat-percent">
                        {stats.Total > 0 ? Math.round((stats["Books"] / stats.Total) * 100) : 0}%
                    </div>
                </div>
                
                <div className="stats-card stationary">
                    <h2>Stationary</h2>
                    <div className="stat-value">{stats["Stationary"]}</div>
                    <div className="stat-percent">
                        {stats.Total > 0 ? Math.round((stats["Stationary"] / stats.Total) * 100) : 0}%
                    </div>
                </div>
                
                <div className="stats-card gadgets">
                    <h2>Gadgets</h2>
                    <div className="stat-value">{stats["Gadgets"]}</div>
                    <div className="stat-percent">
                        {stats.Total > 0 ? Math.round((stats["Gadgets"] / stats.Total) * 100) : 0}%
                    </div>
                </div>
            </div>
            
            <div className="latest-products">
                <h2>Latest Products</h2>
                <div className="product-list">
                    {loading ? (
                        <p>Loading products...</p>
                    ) : (
                        products.slice(-5).reverse().map((product, index) => (
                            <div className="product-item" key={index}>
                                <img src={product.image} alt={product.name} />
                                <div className="product-details">
                                    <h3>{product.name}</h3>
                                    <p className="category">
                                        {product.category === "books" ? "Books" : 
                                        product.category === "stationary" ? "Stationary" : 
                                        product.category === "gadgets" ? "Gadgets" : 
                                        product.category}
                                    </p>
                                    <p className="price">${product.new_price}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

