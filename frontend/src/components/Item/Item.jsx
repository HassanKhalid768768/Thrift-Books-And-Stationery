import React from 'react';
import { Link } from 'react-router-dom';
import './Item.css'

const Item = (props) => {
    // Handle quick view button click
    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // If onQuickView prop exists, call it with the item data
        if (props.onQuickView) {
            props.onQuickView({
                id: props.id,
                name: props.name,
                image: props.image,
                new_price: props.new_price,
                old_price: props.old_price
            });
        }
    };
    
    return ( 
        <div className="item" role="article">
            <div className="item-image-container">
                <Link to={`/product/${props.id}`}>
                    <img 
                        onClick={() => window.scrollTo(0,0)} 
                        src={props.image} 
                        alt={props.name} 
                    />
                </Link>
                
                {/* Quick view button overlay */}
                {props.onQuickView && (
                    <button 
                        className="quick-view-btn"
                        onClick={handleQuickView}
                        aria-label={`Quick view ${props.name}`}
                        tabIndex="0"
                        onKeyDown={(e) => e.key === 'Enter' && handleQuickView(e)}
                    >
                        <span className="btn-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                            </svg>
                        </span>
                        <span className="btn-text">Quick View</span>
                    </button>
                )}
            </div>
            
            <p className="item-name" aria-label="Product name">{props.name}</p>
            <div className="item-prices" aria-label="Product price information">
                <div className="item-price-new" aria-label="Current price">
                    PKR {props.new_price.toLocaleString('en-PK')}
                </div>
                <div className="item-price-old" aria-label="Original price">
                    PKR {props.old_price.toLocaleString('en-PK')}
                </div>
                {props.new_price < props.old_price && (
                    <span className="item-discount" aria-label="Discount percentage">
                        {Math.round((1 - props.new_price / props.old_price) * 100)}% OFF
                    </span>
                )}
            </div>
        </div>
     );
}
 
export default Item;
