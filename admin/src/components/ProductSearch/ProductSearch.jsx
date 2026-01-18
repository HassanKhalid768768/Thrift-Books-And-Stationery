import React, { useState, useContext, useRef, useEffect } from 'react';
import './ProductSearch.css';
import { DarkModeContext } from '../../context/DarkModeContext';
import ProductSuggestions from '../ProductSuggestions/ProductSuggestions';
import { api } from '../../utils/api';

const ProductSearch = ({ onSearch, onClear, disabled }) => {
    const { darkMode } = useContext(DarkModeContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCategory, setSearchCategory] = useState('all');
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [categories, setCategories] = useState([]);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.getCategories();
                const data = await response.json();
                if (response.ok) {
                    setCategories(data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Hide suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (disabled) return;
        onSearch(searchQuery.trim(), searchCategory);
        setShowSuggestions(false);
    };

    const handleClear = () => {
        if (disabled) return;
        setSearchQuery('');
        setSearchCategory('all');
        setSuggestions([]);
        setShowSuggestions(false);
        onClear();
    };

    const fetchSuggestions = async (query, category) => {
        if (disabled || !query || query.trim().length < 2) {
            setSuggestions([]);
            setIsSuggestionLoading(false);
            return;
        }

        setIsSuggestionLoading(true);
        try {
            const response = await api.getProductSuggestions(query.trim(), category);
            const json = await response.json();
            if (response.ok) {
                setSuggestions(json);
            } else {
                console.error('Suggestion fetch error:', json.error);
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Suggestion fetch failed:', error);
            setSuggestions([]);
        }
        setIsSuggestionLoading(false);
    };

    const handleInputChange = (e) => {
        if (disabled) return;
        const value = e.target.value;
        setSearchQuery(value);
        setShowSuggestions(true);

        // Clear existing debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (value.trim() === '') {
            setSuggestions([]);
            setIsSuggestionLoading(false);
            onClear();
        } else {
            // Debounce suggestions fetch
            debounceRef.current = setTimeout(() => {
                fetchSuggestions(value, searchCategory);
            }, 300);
        }
    };

    const handleCategoryChange = (e) => {
        if (disabled) return;
        const newCategory = e.target.value;
        setSearchCategory(newCategory);

        // Re-fetch suggestions with new category if there's a query
        if (searchQuery.trim()) {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
                fetchSuggestions(searchQuery, newCategory);
            }, 300);
        }
    };

    const handleSuggestionSelect = (product) => {
        if (disabled) return;
        setSearchQuery(product.name);
        setShowSuggestions(false);
        onSearch(product.name, searchCategory);
    };

    return (
        <div className={`product-search ${darkMode ? 'dark-mode' : ''} ${disabled ? 'disabled' : ''}`} ref={searchRef}>
            <form onSubmit={handleSearch} className="search-form">
                <div className="search-inputs">
                    <div className="search-input-group">
                        <input
                            type="text"
                            placeholder="Search products by name, description, or category..."
                            value={searchQuery}
                            onChange={handleInputChange}
                            onFocus={() => !disabled && searchQuery.trim() && setShowSuggestions(true)}
                            className="search-input"
                            autoComplete="off"
                            disabled={disabled}
                        />
                        {!disabled && (
                            <ProductSuggestions
                                suggestions={suggestions}
                                isVisible={showSuggestions}
                                onSuggestionSelect={handleSuggestionSelect}
                                isLoading={isSuggestionLoading}
                                darkMode={darkMode}
                            />
                        )}
                    </div>
                    <div className="search-select-group">
                        <select
                            value={searchCategory}
                            onChange={handleCategoryChange}
                            className="search-select"
                            disabled={disabled}
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat.slug}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="search-buttons">
                    <button type="submit" className="search-btn" disabled={disabled}>
                        Search
                    </button>
                    <button type="button" onClick={handleClear} className="clear-btn" disabled={disabled}>
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductSearch;
