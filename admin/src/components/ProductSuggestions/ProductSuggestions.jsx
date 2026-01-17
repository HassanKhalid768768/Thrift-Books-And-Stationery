import React from 'react';
import './ProductSuggestions.css';

const ProductSuggestions = ({ 
    suggestions, 
    isVisible, 
    onSuggestionSelect, 
    isLoading, 
    darkMode 
}) => {
    if (!isVisible || (!suggestions.length && !isLoading)) {
        return null;
    }

    return (
        <div className={`suggestions-dropdown ${darkMode ? 'dark-mode' : ''}`}>
            {isLoading ? (
                <div className="suggestions-loading">
                    <span className="loading-spinner"></span>
                    <span>Searching...</span>
                </div>
            ) : suggestions.length > 0 ? (
                <>
                    <div className="suggestions-header">
                        <span className="suggestions-count">
                            {suggestions.length} product{suggestions.length !== 1 ? 's' : ''} found
                        </span>
                    </div>
                    <div className="suggestions-list">
                        {suggestions.map((product) => (
                            <div
                                key={product.id}
                                className="suggestion-item"
                                onClick={() => onSuggestionSelect(product)}
                            >
                                <div className="suggestion-image">
                                    <img 
                                        src={product.image} 
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjJGMkYyIi8+CjxwYXRoIGQ9Ik0yMCAyNy41QzI0LjE0MjEgMjcuNSAyNy41IDI0LjE0MjEgMjcuNSAyMEMyNy41IDE1Ljg1NzkgMjQuMTQyMSAxMi41IDIwIDEyLjVDMTUuODU3OSAxMi41IDEyLjUgMTUuODU3OSAxMi41IDIwQzEyLjUgMjQuMTQyMSAxNS44NTc5IDI3LjUgMjAgMjcuNVoiIGZpbGw9IiNEREREREQiLz4KPC9zdmc+Cg==';
                                        }}
                                    />
                                </div>
                                <div className="suggestion-details">
                                    <div className="suggestion-name">
                                        {product.name}
                                    </div>
                                    <div className="suggestion-meta">
                                        <span className="suggestion-category">
                                            {product.category === "books" ? "Books" : 
                                             product.category === "stationary" ? "Stationary" : 
                                             product.category === "gadgets" ? "Gadgets" : 
                                             product.category}
                                        </span>
                                        <span className="suggestion-price">
                                            PKR {product.old_price.toLocaleString('en-PK')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="suggestions-empty">
                    <span>No products found matching your search</span>
                </div>
            )}
        </div>
    );
};

export default ProductSuggestions;
