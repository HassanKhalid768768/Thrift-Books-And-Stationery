import React, { useState, useEffect, useContext } from 'react';
import './CategoryFilter.css';
import { DarkModeContext } from '../../context/DarkModeContext';
import { api } from '../../utils/api';

const CategoryFilter = ({ products, onFilterChange, disabled }) => {
    const [activeTab, setActiveTab] = useState("All");
    const [categories, setCategories] = useState([]);
    const { darkMode } = useContext(DarkModeContext);

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

    const tabs = ["All", ...categories.map(cat => cat.name)];

    const getCategoryCount = (category) => {
        if (category === "All") return products.length;

        const categoryObj = categories.find(cat => cat.name === category);
        if (!categoryObj) return 0;

        return products.filter(item => item.category === categoryObj.slug).length;
    };

    const handleTabClick = (tab) => {
        if (disabled) return;
        setActiveTab(tab);

        if (tab === "All") {
            onFilterChange(products);
            return;
        }

        const categoryObj = categories.find(cat => cat.name === tab);
        if (!categoryObj) {
            onFilterChange([]);
            return;
        }

        const filteredProducts = products.filter(item =>
            item.category === categoryObj.slug
        );

        onFilterChange(filteredProducts);
    };

    return (
        <div className={`category-filter ${darkMode ? 'dark-mode' : ''} ${disabled ? 'disabled' : ''}`}>
            <h3>Filter by Category</h3>
            <div className={`category-tabs ${disabled ? 'disabled-tabs' : ''}`}>
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

