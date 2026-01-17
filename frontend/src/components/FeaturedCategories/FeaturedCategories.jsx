import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import './FeaturedCategories.css';

const FeaturedCategories = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.getCategories();
                const data = await response.json();
                if (response.ok) {
                    setCategories(Array.isArray(data) ? data : []);
                } else {
                    setCategories([]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Color palette for categories
    const colors = [
        "#3498db", "#e74c3c", "#647687", "#27ae60", "#9b59b6",
        "#f39c12", "#1abc9c", "#e67e22", "#34495e", "#16a085",
        "#d35400", "#c0392b"
    ];

    const getColor = (index) => colors[index % colors.length];

    if (isLoading) {
        return (
            <div className="featured-categories">
                <h1>Shop By Category</h1>
                <p className="featured-subtitle">Loading categories...</p>
            </div>
        );
    }

    return (
        <div className="featured-categories">
            <h1>Shop By Category</h1>
            <p className="featured-subtitle">Discover our curated collections</p>
            <hr />
            
            {categories.length === 0 ? (
                <div className="no-categories">
                    <p>No categories available at the moment.</p>
                </div>
            ) : (
                <div className="category-grid">
                    {categories.map((category, index) => (
                        <Link 
                            to={`/${category.slug}`} 
                            key={category._id || category.id} 
                            className="category-card" 
                            style={{'--card-color': getColor(index)}} 
                            data-index={index}
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <div className="category-image-container">
                                {category.image ? (
                                    <img src={category.image} alt={category.name} className="category-image" />
                                ) : (
                                    <div className="category-placeholder">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 11 5.828V12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 1 12.5v-10zM2.5 2a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V5.828a.5.5 0 0 0-.146-.353L7.146 2.354A.5.5 0 0 0 6.879 2H2.5z"/>
                                        </svg>
                                    </div>
                                )}
                                <div className="category-overlay"></div>
                            </div>
                            <div className="category-content">
                                <h3>{category.name}</h3>
                                <p>{category.description || 'Explore our collection'}</p>
                                <span className="category-button">
                                    Shop Now
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                                    </svg>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeaturedCategories;

