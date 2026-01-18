import React, { useContext, useRef, useState, useEffect } from 'react';
import './Navbar.css';
import cart_icon from '../../assets/cart_icon.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { DarkModeContext } from '../../context/DarkModeContext';
import { api } from '../../utils/api';
import hamburger from './../../assets/hamburger.png';
import hamburgerWhite from './../../assets/hamburger.png';
import profile_icon from './../../assets/profile_icon.png';

const Navbar = () => {
    const [menu, setMenu] = useState("shop");
    const { getTotalCartItems, all_product, userProfile } = useContext(StoreContext);
    const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
    const menuRef = useRef();
    const searchRef = useRef();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [showSearchOverlay, setShowSearchOverlay] = useState(false);
    const [categories, setCategories] = useState([]);
    const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
    const [showMobileCategories, setShowMobileCategories] = useState(true); // Default open for easier access
    const categoriesRef = useRef(null);
    const dropdownTimeoutRef = useRef(null);
    const { pathname } = useLocation();

    // Fetch categories for Shop dropdown
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.getCategories();
                const data = await res.json();
                if (res.ok) setCategories(Array.isArray(data) ? data : []);
            } catch (e) { setCategories([]); }
        };
        fetchCategories();
    }, []);

    // Close categories dropdown when clicking outside
    useEffect(() => {
        const handle = (e) => {
            if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
                setShowCategoriesDropdown(false);
            }
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    const currentCategory = categories.find(c => pathname === `/${c.slug}`);

    const hamburger_toggle = (e) => {
        menuRef.current.classList.toggle('nav-menu-visible');
        // Close search if it's open
        setShowMobileSearch(false);
        setShowSearchOverlay(false);
    }

    // Add scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    const logout = () => {
        localStorage.removeItem('token');
        window.location.replace('/');
    }

    const navigate = useNavigate();

    // Filter products as user types
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setSearchResults([]);
            return;
        }

        const filtered = all_product
            .filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice(0, 5); // Limit to 5 results

        setSearchResults(filtered);
    }, [searchTerm, all_product]);

    // Close search results when clicking outside
    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutsideSearch = (event) => {
            // Only handle search-related clicks if the click wasn't on the menu
            if (!event.target.closest('.nav-menu') && !event.target.closest('.nav-hamburger')) {
                if (searchRef.current && !searchRef.current.contains(event.target)) {
                    setShowResults(false);

                    // Add mobile search handling
                    // Only close if clicking outside search area and not clicking the search icon
                    if (!event.target.closest('.mobile-search-icon') &&
                        !event.target.closest('.search-input-container')) {
                        setShowMobileSearch(false);
                        setShowSearchOverlay(false);
                        setSearchTerm('');
                    }
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutsideSearch);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsideSearch);
        };
    }, []);

    // Close hamburger menu when clicking outside
    useEffect(() => {
        const handleClickOutsideMenu = (event) => {
            // Check if menu is visible and click is outside menu and hamburger button
            if (
                menuRef.current?.classList.contains('nav-menu-visible') &&
                !menuRef.current.contains(event.target) &&
                !event.target.closest('.nav-hamburger')
            ) {
                menuRef.current.classList.remove('nav-menu-visible');
            }
        };

        document.addEventListener('mousedown', handleClickOutsideMenu);
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideMenu);
        };
    }, []);

    // Handle search result click
    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
        setSearchTerm("");
        setShowResults(false);
        // Close both menus
        menuRef.current.classList.remove('nav-menu-visible');
        setShowMobileSearch(false);
        setShowSearchOverlay(false);
    };

    // Handle search form submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim() !== "") {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setShowResults(false);
            // Close both menus
            menuRef.current.classList.remove('nav-menu-visible');
            setShowMobileSearch(false);
            setShowSearchOverlay(false);
        }
    };

    // Handle key press in search input
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit(e);
        }
    };

    // Handler for menu item clicks
    const handleMenuClick = (menuType) => {
        setMenu(menuType);
        scrollToTop();
        // Close both menus
        menuRef.current.classList.remove('nav-menu-visible');
        setShowMobileSearch(false);
        setShowSearchOverlay(false);
    };

    // Toggle mobile search
    const toggleMobileSearch = () => {
        setShowMobileSearch(!showMobileSearch);
        setShowSearchOverlay(!showMobileSearch);
        if (!showMobileSearch) {
            setSearchTerm('');
            setShowResults(false);
        }
        // Close hamburger menu if it's open
        menuRef.current.classList.remove('nav-menu-visible');
    };

    // Handle overlay click
    const handleOverlayClick = () => {
        setShowMobileSearch(false);
        setShowSearchOverlay(false);
        setSearchTerm('');
        setShowResults(false);
    };

    return (
        <div className="header-wrapper">
            <div className='shipping-banner'>
                <p>Free Shipping Over Rs. 5000</p>
            </div>
            <div className='navbar'>
                <div className="nav-logo">
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <p>TBS-Thrift & Budget Store</p>
                    </Link>
                </div>

                <img className="nav-hamburger" onClick={hamburger_toggle} src={darkMode ? hamburgerWhite : hamburger} alt="menu" />

                <ul ref={menuRef} className="nav-menu">
                    {/* Desktop: Shop dropdown with all categories */}
                    <li
                        className="nav-categories-wrapper nav-categories-desktop"
                        ref={categoriesRef}
                        onMouseEnter={() => {
                            clearTimeout(dropdownTimeoutRef.current);
                            setShowCategoriesDropdown(true);
                        }}
                        onMouseLeave={() => {
                            dropdownTimeoutRef.current = setTimeout(() => {
                                setShowCategoriesDropdown(false);
                            }, 200);
                        }}
                    >
                        <span className={`nav-categories-trigger ${currentCategory ? 'active' : ''}`}>Categories</span>
                        {showCategoriesDropdown && (
                            <div className="nav-categories-dropdown">
                                {categories.length === 0 ? (
                                    <div className="nav-categories-empty">No categories yet</div>
                                ) : (
                                    categories.map((cat) => (
                                        <Link
                                            key={cat._id}
                                            to={`/${cat.slug}`}
                                            style={{ textDecoration: 'none' }}
                                            onClick={() => { handleMenuClick(cat.slug); setShowCategoriesDropdown(false); }}
                                            className={currentCategory?.slug === cat.slug ? 'active' : ''}
                                        >
                                            {cat.name}
                                        </Link>
                                    ))
                                )}
                            </div>
                        )}
                    </li>
                    {/* Mobile: full list of categories */}
                    {/* Mobile: Collapsible Categories Menu */}
                    <li
                        className="nav-categories-mobile-trigger"
                        onClick={() => setShowMobileCategories(!showMobileCategories)}
                    >
                        <span>Categories</span>
                        <span className={`mobile-dropdown-arrow ${showMobileCategories ? 'open' : ''}`}>▼</span>
                    </li>

                    <div className={`nav-categories-mobile-container ${showMobileCategories ? 'open' : ''}`}>
                        {categories.map((cat) => (
                            <li
                                key={cat._id}
                                className="nav-categories-mobile-item"
                                onClick={() => handleMenuClick(cat.slug)}
                            >
                                <Link
                                    to={`/${cat.slug}`}
                                    style={{ textDecoration: 'none' }}
                                    className={currentCategory?.slug === cat.slug ? 'active' : ''}
                                >
                                    {cat.name}
                                </Link>
                            </li>
                        ))}
                    </div>
                </ul>
                <div className="nav-search" ref={searchRef}>
                    {/* Mobile search icon */}
                    <div
                        className="mobile-search-icon"
                        onClick={toggleMobileSearch}
                        title="Search"
                    ></div>

                    {/* Search overlay */}
                    {showSearchOverlay && (
                        <div className="search-overlay" onClick={handleOverlayClick}></div>
                    )}

                    <form onSubmit={handleSearchSubmit} className={`search-input-container ${showMobileSearch ? 'show-mobile' : ''}`}>
                        <input
                            type="text"
                            placeholder="Search & press Enter..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowResults(true);
                            }}
                            onFocus={() => setShowResults(true)}
                            onKeyPress={handleKeyPress}
                        />
                        <div
                            className="search-icon"
                            onClick={handleSearchSubmit}
                            title="Search"
                        ></div>
                    </form>

                    {showResults && searchResults.length > 0 && (
                        <ul className="search-results">
                            {searchResults.map((item) => (
                                <li
                                    key={item.id}
                                    onClick={() => handleProductClick(item.id)}
                                >
                                    <div className="search-result-item">
                                        <img src={item.image} alt={item.name} className="search-result-image" />
                                        <span className="search-result-name">{item.name}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="nav-login-cart">
                    <div className="dark-mode-toggle" onClick={toggleDarkMode} title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                        {darkMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        )}
                    </div>
                    {!localStorage.getItem('token') ? <Link to="/login"><button>Login</button></Link> :
                        <div className='navbar-profile'>
                            <img src={profile_icon} alt="" />
                            <ul className="nav-profile-dropdown">
                                {userProfile && (
                                    <>
                                        <div className="nav-profile-info">
                                            <p className="profile-name">{userProfile.name}</p>
                                            <p className="profile-email">{userProfile.email}</p>
                                        </div>
                                        <hr />
                                    </>
                                )}
                                <li onClick={() => { navigate("/myorders"); scrollToTop(); }}>Orders</li>
                                <hr />
                                <li onClick={logout}>Logout</li>
                            </ul>
                        </div>}
                    <Link to="/cart" onClick={scrollToTop}><img src={cart_icon} alt="" /></Link>
                    <div className="nav-cart-count">{getTotalCartItems()}</div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;
