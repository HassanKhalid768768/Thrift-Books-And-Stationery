import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
    const backend_url = process.env.REACT_APP_API_URL;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${backend_url}/api/products`);
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
    }, [backend_url]);

    const getCategoryStats = () => {
        return {
            "Polo": products.filter(p => p.category === "polo").length,
            "T-Shirts": products.filter(p => p.category === "tshirts").length,
            "Formal Shirts": products.filter(p => p.category === "formalshirts").length,
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
                
                <div className="stats-card polo">
                    <h2>Polo Shirts</h2>
                    <div className="stat-value">{stats["Polo"]}</div>
                    <div className="stat-percent">
                        {stats.Total > 0 ? Math.round((stats["Polo"] / stats.Total) * 100) : 0}%
                    </div>
                </div>
                
                <div className="stats-card tshirts">
                    <h2>T-Shirts</h2>
                    <div className="stat-value">{stats["T-Shirts"]}</div>
                    <div className="stat-percent">
                        {stats.Total > 0 ? Math.round((stats["T-Shirts"] / stats.Total) * 100) : 0}%
                    </div>
                </div>
                
                <div className="stats-card formalshirts">
                    <h2>Formal Shirts</h2>
                    <div className="stat-value">{stats["Formal Shirts"]}</div>
                    <div className="stat-percent">
                        {stats.Total > 0 ? Math.round((stats["Formal Shirts"] / stats.Total) * 100) : 0}%
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
                                        {product.category === "polo" ? "Polo" : 
                                        product.category === "tshirts" ? "T-Shirts" : 
                                        product.category === "formalshirts" ? "Formal Shirts" : 
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

