import React, { useState, useEffect } from 'react';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import './WhatsAppBanner.css';

const WhatsAppBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleWhatsAppClick = () => {
        window.open('https://api.whatsapp.com/send?phone=%2B923003383851&context=AfepripkwO52YOtyqBBXmRt-LrMnIucbELBLylQcrKlgU-j-f6Fea8PMKAKPOOqYTa98CwMwkS14vdMR9z30pXBTlj7KjHzNNDPF4xV9djlTG2KbEpD1NvjZev8s8JGvzUVKGFSyXmRuuvljVJbZB2wVTw&source=FB_Page&app=facebook&entry_point=page_cta&fbclid=IwY2xjawLkoOJleHRuA2FlbQIxMABicmlkETF2cjdPbEZuSGs4WHBlMEtrAR63RLZkCAbMXqXvBrotjsPDf9whlscHDWbaVWA3yK2ojFcAO8qAbw9xUtSIMQ_aem_TMnobXT3-k8sQr9epELmvg', '_blank');
    };

    return (
        <div className={`whatsapp-banner ${isVisible ? 'visible' : ''}`}>
            <div className="whatsapp-banner-content">
                <div className="whatsapp-banner-background">
                    <div className="floating-bubble bubble-1"></div>
                    <div className="floating-bubble bubble-2"></div>
                    <div className="floating-bubble bubble-3"></div>
                    <div className="floating-bubble bubble-4"></div>
                    <div className="floating-bubble bubble-5"></div>
                </div>
                
                <div className="whatsapp-banner-inner">
                    <div className="whatsapp-icon-container">
                        <div className="whatsapp-icon-wrapper">
                            <WhatsAppIcon className="whatsapp-icon" />
                            <div className="pulse-ring"></div>
                            <div className="pulse-ring-2"></div>
                        </div>
                    </div>
                    
                    <div className="whatsapp-content">
                        <h2 className="whatsapp-title">Need Product Details?</h2>
                        <p className="whatsapp-subtitle">
                            Get instant information about prices, availability, and product details
                        </p>
                        <div className="whatsapp-features">
                            <div className="feature-item">
                                <span className="feature-icon">💰</span>
                                <span>Best Prices</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📦</span>
                                <span>Stock Updates</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">⚡</span>
                                <span>Quick Response</span>
                            </div>
                        </div>
                        
                        <button 
                            className={`whatsapp-button ${isHovered ? 'hovered' : ''}`}
                            onClick={handleWhatsAppClick}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <span className="button-text">Chat with Us</span>
                            <div className="button-icon">
                                <WhatsAppIcon />
                            </div>
                            <div className="button-shine"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppBanner;
