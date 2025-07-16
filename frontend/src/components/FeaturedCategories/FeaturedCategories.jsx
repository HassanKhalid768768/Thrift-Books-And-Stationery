import React from 'react';
import { Link } from 'react-router-dom';
import './FeaturedCategories.css';

const FeaturedCategories = () => {
    // Category data with images, titles, and links - now focused on shirt types
    const categories = [
        {
            id: 1,
            title: "T-Shirts",
            subtitle: "Casual Comfort",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHqdr3lNyrJcrBbFB3WMBdiiS8MgspH1TAfw&s",
            color: "#3498db",
            link: "/tshirts"
        },
        {
            id: 2,
            title: "Polo Shirts",
            subtitle: "Smart Casual",
            image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            color: "#e74c3c",
            link: "/polo"
        },
        {
            id: 3,
            title: "Formal Shirts",
            subtitle: "Professional Elegance",
            image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            color: "#647687",
            link: "/formalshirts"
        }
    ];

    return (
        <div className="featured-categories">
            <h1>Shop By Category</h1>
            <p className="featured-subtitle">Discover our curated collections</p>
            <hr />
            
            <div className="category-grid">
                {categories.map((category, index) => (
                    <Link 
                        to={category.link} 
                        key={category.id} 
                        className="category-card" 
                        style={{'--card-color': category.color}} 
                        data-index={index}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="category-image-container">
                            <img src={category.image} alt={category.title} className="category-image" />
                            <div className="category-overlay"></div>
                        </div>
                        <div className="category-content">
                            <h3>{category.title}</h3>
                            <p>{category.subtitle}</p>
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
        </div>
    );
};

export default FeaturedCategories;

