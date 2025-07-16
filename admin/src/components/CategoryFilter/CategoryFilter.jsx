import React, { useState, useEffect, useContext } from 'react';
import './CategoryFilter.css';
import { DarkModeContext } from '../../context/DarkModeContext';

const CategoryFilter = ({ products, onFilterChange }) => {
    const [activeTab, setActiveTab] = useState("All");
    const tabs = ["All", "Polo", "T-Shirts", "Formal Shirts"];
    const { darkMode } = useContext(DarkModeContext);

    const getCategoryCount = (category) => {
        if (category === "All") return products.length;
        
        const categoryMap = {
            "Polo": "polo",
            "T-Shirts": "tshirts",
            "Formal Shirts": "formalshirts"
        };
        
        return products.filter(item => item.category === categoryMap[category]).length;
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        
        if (tab === "All") {
            onFilterChange(products);
            return;
        }
        
        const categoryMap = {
            "Polo": "polo",
            "T-Shirts": "tshirts",
            "Formal Shirts": "formalshirts"
        };
        
        const filteredProducts = products.filter(item => 
            item.category === categoryMap[tab]
        );
        
        onFilterChange(filteredProducts);
    };

    return (
        <div className={`category-filter ${darkMode ? 'dark-mode' : ''}`}>
            <h3>Filter by Category</h3>
            <div className="category-tabs">
                {tabs.map((tab) => (
                    <div 
                        key={tab}
                        className={`category-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab)}
                    >
                        <span>{tab}</span>
                        <span className="category-count">{getCategoryCount(tab)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryFilter;

