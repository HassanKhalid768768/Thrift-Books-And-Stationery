import React, { useState, useEffect, useContext } from "react";
import './ListProduct.css';
import bin from './../../assets/recycle-bin.png';
import editIcon from './../../assets/edit-icon.svg';
import { toast } from "react-toastify";
import CategoryFilter from "../CategoryFilter/CategoryFilter";
import ProductSearch from "../ProductSearch/ProductSearch";
import EditProduct from "../EditProduct/EditProduct";
import { useAuth } from "../../context/AuthContext";
import { DarkModeContext } from "../../context/DarkModeContext";
import { api } from '../../utils/api';

const ListProduct = () => {
    const { token, isAuthenticated } = useAuth();
    const { darkMode } = useContext(DarkModeContext);
    const [allproducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResultsCount, setSearchResultsCount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchInfo = async () => {
        const response = await api.getProducts();
        const json = await response.json();
        if (response.ok) {
            console.log('ListProduct - Fetched products:', json);
            // Log sizes for first product to debug
            if (json.length > 0) {
                console.log('ListProduct - First product sizes:', json[0].sizes);
            }
            setAllProducts(json);
            setFilteredProducts(json);
        }
        else toast.error(json.error);
    }

    useEffect(() => {
        fetchInfo();
    }, [])

    const removeProduct = async (id) => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            const response = await api.deleteProduct(id);
            const json = await response.json();
            if (!response.ok) toast.error(json.error);
            else {
                await fetchInfo();
                toast.success("Product removed");
            }
        } catch (error) {
            toast.error("Failed to remove product");
        } finally {
            setIsProcessing(false);
        }
    }

    const handleFilterChange = (filtered) => {
        setFilteredProducts(filtered);
    };

    const openEditModal = (product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedProduct(null);
    };

    const handleSearch = async (query, category) => {
        setIsSearching(true);
        try {
            const response = await api.searchProducts(query, category);
            const json = await response.json();
            if (response.ok) {
                setFilteredProducts(json);
                setSearchResultsCount(json.length);
            } else {
                toast.error(json.error);
            }
        } catch (error) {
            toast.error('Search failed. Please try again.');
        }
        setIsSearching(false);
    };

    const handleClearSearch = () => {
        setFilteredProducts(allproducts);
        setSearchResultsCount(allproducts.length);
        setIsSearching(false);
    };

    const toggleProductAvailability = async (id) => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            const response = await api.toggleProductAvailability(id);
            const json = await response.json();
            if (response.ok) {
                await fetchInfo();
                toast.success(json.message);
            } else {
                toast.error(json.error);
            }
        } catch (error) {
            toast.error('Failed to update product availability');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={`list-product ${darkMode ? 'dark-mode' : ''} ${isProcessing ? 'processing' : ''}`}>
            <h1>All Products</h1>
            <ProductSearch
                onSearch={handleSearch}
                onClear={handleClearSearch}
                disabled={isProcessing}
            />
            <CategoryFilter
                products={allproducts}
                onFilterChange={handleFilterChange}
                disabled={isProcessing}
            />
            <div className="listproduct-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Price</p>
                <p>Category</p>
                <p>Stock Status</p>
                <p>Edit</p>
                <p>Remove</p>
            </div>
            <div className="listproduct-allproducts">
                {isSearching ? (
                    <div className="search-loading">
                        <p>Searching products...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="no-products">
                        <p>No products found.</p>
                    </div>
                ) : (
                    <>
                        <hr />
                        {filteredProducts.map((product, index) => {
                            return <><div className="listproduct-format-main listproduct-format" key={index}>
                                <img src={product.image} alt="" className="listproduct-product-icon" />
                                <p>{product.name}</p>
                                <p>PKR {product.old_price.toLocaleString('en-PK')}</p>
                                <p>{product.category === "books" ? "Books" :
                                    product.category === "stationary" ? "Stationary" :
                                        product.category === "gadgets" ? "Gadgets" :
                                            product.category}</p>
                                <div className="stock-status-container">
                                    <span className={`stock-status ${product.available ? 'in-stock' : 'out-of-stock'}`}>
                                        {product.available ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                    <button
                                        className={`stock-toggle-btn ${product.available ? 'mark-out' : 'mark-in'}`}
                                        onClick={() => toggleProductAvailability(product.id)}
                                        title={product.available ? 'Mark as Out of Stock' : 'Mark as In Stock'}
                                        disabled={isProcessing}
                                    >
                                        {product.available ? 'Mark Out' : 'Mark In'}
                                    </button>
                                </div>
                                <img
                                    onClick={() => !isProcessing && openEditModal(product)}
                                    src={editIcon}
                                    alt="Edit"
                                    className={`listproduct-edit-icon ${isProcessing ? 'disabled' : ''}`}
                                    title="Edit product"
                                />
                                <img
                                    onClick={() => !isProcessing && removeProduct(product.id)}
                                    src={bin}
                                    alt="Delete"
                                    className={`listproduct-remove-icon ${isProcessing ? 'disabled' : ''}`}
                                    title="Remove product"
                                />
                            </div>
                                <hr />
                            </>
                        })}
                    </>
                )}
            </div>

            {/* Edit Product Modal */}
            <EditProduct
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                product={selectedProduct}
                onProductUpdated={fetchInfo}
            />
        </div>
    );
}

export default ListProduct;