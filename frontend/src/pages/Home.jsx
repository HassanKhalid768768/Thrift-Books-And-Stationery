import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainCarousel from "../components/MainCarousel/MainCarousel";
import Popular from "../components/Popular/Popular";
import NewCollections from "../components/NewCollections/NewCollections";
import FeaturedCategories from "../components/FeaturedCategories/FeaturedCategories";
import TrendsBanner from "../components/TrendsBanner/TrendsBanner";
import NewsletterSubscribe from "../components/NewsletterSubscribe/NewsletterSubscribe";
import QuickView from "../components/QuickView/QuickView";
import "./HomePage.css";

const Home = () => {
    const [quickViewItem, setQuickViewItem] = useState(null);
    const navigate = useNavigate();
    
    const handleQuickView = (item) => {
        setQuickViewItem(item);
    };
    
    const closeQuickView = () => {
        setQuickViewItem(null);
    };
    
    const handleShopClick = () => {
        navigate('/formalshirts');
        window.scrollTo(0, 0);
    };
    
    return ( 
        <div className="home-page">
            {/* Main Carousel - unchanged as per requirements */}
            <MainCarousel />
            
            <div className="home-container">
                {/* Featured Categories - New section */}
                <section className="home-section featured-section">
                    <FeaturedCategories />
                </section>
                
                {/* Coupon Banner */}
                <div className="coupon-banner">
                    <div className="coupon-content">
                        <div className="coupon-badge">
                            <span>NEW</span>
                        </div>
                        <div className="coupon-text">
                            <h3>Welcome Offer</h3>
                            <p>Use coupon <span className="coupon-code">WELCOME100</span> for a discount of Rs. 100</p>
                        </div>
                        <div className="coupon-action">
                            <button className="coupon-button" onClick={handleShopClick}>Shop Now</button>
                        </div>
                    </div>
                </div>
                
                {/* Popular Products - Existing section */}
                <section className="home-section popular-section">
                    <Popular onQuickView={handleQuickView} />
                </section>
                
                {/* Trends Banner - New section with parallax effect */}
                <section className="trends-banner-container">
                    <TrendsBanner />
                </section>
                
                {/* New Collections - Existing section */}
                <section className="home-section collections-section">
                    <NewCollections onQuickView={handleQuickView} />
                </section>
                
                {/* Newsletter Subscribe - New section */}
                <section className="home-section newsletter-section">
                    <NewsletterSubscribe />
                </section>
            </div>
            
            {/* Quick View Modal */}
            {quickViewItem && (
                <QuickView item={quickViewItem} onClose={closeQuickView} />
            )}
        </div>
     );
}
 
export default Home;
