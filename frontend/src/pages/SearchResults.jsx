import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Item from "../components/Item/Item";
import { StoreContext } from "../context/StoreContext";
import { DarkModeContext } from "../context/DarkModeContext";
import "./CSS/SearchResults.css";

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { all_product } = useContext(StoreContext);
    const { darkMode } = useContext(DarkModeContext);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Filter states
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 99999999 });
    const [showFilters, setShowFilters] = useState(false);
    
    // Available categories
    const categories = [
        { id: "tshirts", name: "T-Shirts" },
        { id: "polo", name: "Polo" },
        { id: "formalshirts", name: "Formal Shirts" }
    ];

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const query = queryParams.get("q") || "";
        setSearchQuery(query);

        if (query.trim() === "") {
            setSearchResults([]);
            return;
        }

        // Filter products based on search query
        const results = all_product.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase())
        );
        
        setSearchResults(results);
    }, [location.search, all_product]);
    
    // Apply filters to get filtered results
    const getFilteredResults = () => {
        let filtered = [...searchResults];
        
        // Apply category filter if any categories are selected
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(item => {
                const itemCategory = item.category.toLowerCase();
                return selectedCategories.some(category => category.toLowerCase() === itemCategory);
            });
        }
        
        // Always apply price range filter regardless of default values
        filtered = filtered.filter(item => {
            const price = Number(item.new_price);
            return price >= Number(priceRange.min) && price <= Number(priceRange.max);
        });
        
        return filtered;
    };
    
    // Handle category filter
    const handleCategoryChange = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };
    
    // Handle price range change
    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setPriceRange({
            ...priceRange,
            [name]: Number(value)
        });
    };
    
    // Clear all filters
    const clearFilters = () => {
        setSelectedCategories([]);
        setPriceRange({ min: 0, max: 99999999 });
    };
    
    // Toggle filter visibility on mobile
    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    return (
        <div className={`search-results-page ${darkMode ? 'dark-mode' : ''}`}>
            <div className="search-results-header">
                <h1>Search Results for "{searchQuery}"</h1>
                <p>{getFilteredResults().length} products found</p>
                
                <button className="filter-toggle" onClick={toggleFilters}>
                    {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
            </div>
            
            <div className="search-results-container">
                <div className={`filter-sidebar ${showFilters ? "show" : ""}`}>
                    <div className="filter-section">
                        <h3>Filter By Category</h3>
                        <div className="filter-options">
                            {categories.map(category => (
                                <label key={category.id} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(category.id)}
                                        onChange={() => handleCategoryChange(category.id)}
                                    />
                                    <span>{category.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    <div className="filter-section">
                        <h3>Filter By Price</h3>
                        <div className="price-range">
                            <div className="price-inputs">
                                <div>
                                    <label>Min (PKR)</label>
                                    <input
                                        type="number"
                                        name="min"
                                        value={priceRange.min}
                                        onChange={handlePriceChange}
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label>Max (PKR)</label>
                                    <input
                                        type="number"
                                        name="max"
                                        value={priceRange.max}
                                        onChange={handlePriceChange}
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button className="clear-filters" onClick={clearFilters}>
                        Clear All Filters
                    </button>
                </div>
                
                {searchResults.length > 0 ? (
                    <div className="search-results-grid">
                        {getFilteredResults().map((item, i) => (
                            <Item 
                                key={i} 
                                id={item.id} 
                                name={item.name} 
                                image={item.image} 
                                new_price={item.new_price} 
                                old_price={item.old_price}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="no-results">
                        <h2>No products found</h2>
                        <p>Try a different search term or browse our categories</p>
                        <button onClick={() => navigate("/")}>Back to Home</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
