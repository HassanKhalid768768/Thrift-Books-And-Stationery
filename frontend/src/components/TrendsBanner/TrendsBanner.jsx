import React, { useEffect, useRef } from 'react';
import './TrendsBanner.css';

const TrendsBanner = () => {
    const parallaxRef = useRef(null);
    
    const handleExploreClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Add delay to ensure scroll completes before navigation
        setTimeout(() => {
            window.location.href = 'http://localhost:3000/';
        }, 500); // 500ms delay to allow scroll animation to be visible
    };
    
    useEffect(() => {
        const handleScroll = () => {
            if (parallaxRef.current) {
                const scrollPosition = window.scrollY;
                const element = parallaxRef.current;
                const rect = element.getBoundingClientRect();
                const elementPosition = rect.top + window.scrollY;
                const offset = scrollPosition - elementPosition;
                const parallaxSpeed = 0.5;
                
                // Only apply parallax effect when element is in view
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const yPos = -(offset * parallaxSpeed);
                    element.style.backgroundPosition = `center ${yPos}px`;
                }
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    
    return (
        <div className="trends-banner" ref={parallaxRef}>
            <div className="trends-content">
                <div className="trends-text">
                    <h2>Summer 2025 Collection</h2>
                    <p>Discover the latest trends and styles for the season</p>
                    <div className="trends-features">
                        <div className="trend-feature">
                            <span className="trend-icon">🌿</span>
                            <span>Sustainable Materials</span>
                        </div>
                        <div className="trend-feature">
                            <span className="trend-icon">🎨</span>
                            <span>Vibrant Colors</span>
                        </div>
                        <div className="trend-feature">
                            <span className="trend-icon">✂️</span>
                            <span>Modern Cuts</span>
                        </div>
                    </div>
                    <div className="trends-button" onClick={handleExploreClick} style={{cursor: 'pointer'}}>
                        Explore The Collection
                        <span className="button-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                            </svg>
                        </span>
                    </div>
                </div>
                <div className="trends-badge">
                    <div className="badge-inner">
                        <span className="badge-text">NEW</span>
                        <span className="badge-text">ARRIVAL</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendsBanner;

