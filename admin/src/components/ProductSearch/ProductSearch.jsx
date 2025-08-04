import React, { useState, useContext } from 'react';
import './ProductSearch.css';
import { DarkModeContext } from '../../context/DarkModeContext';

const ProductSearch = ({ onSearch, onClear }) => {
    const { darkMode } = useContext(DarkModeContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCategory, setSearchCategory] = useState('all');

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(searchQuery.trim(), searchCategory);
    };

    const handleClear = () => {
        setSearchQuery('');
        setSearchCategory('all');
        onClear();
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        // Auto-search as user types (with debouncing would be better in production)
        if (value.trim() === '') {
            onClear();
        }
    };

    return (
        <div className={`product-search ${darkMode ? 'dark-mode' : ''}`}>
            <form onSubmit={handleSearch} className="search-form">
                <div className="search-inputs">
                    <div className="search-input-group">
                        <input
                            type="text"
                            placeholder="Search products by name, description, or category..."
                            value={searchQuery}
                            onChange={handleInputChange}
                            className="search-input"
                        />
                    </div>
                    <div className="search-select-group">
                        <select
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                            className="search-select"
                        >
                            <option value="all">All Categories</option>
                            <option value="books">Books</option>
                            <option value="stationary">Stationary</option>
                            <option value="gadgets">Gadgets</option>
                        </select>
                    </div>
                </div>
                <div className="search-buttons">
                    <button type="submit" className="search-btn">
                        Search
                    </button>
                    <button type="button" onClick={handleClear} className="clear-btn">
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductSearch;
