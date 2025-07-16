import React, { useState, useEffect, useContext } from "react";
import "./EditProduct.css";
import upload_area from "./../../assets/upload_area.svg";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { DarkModeContext } from "../../context/DarkModeContext";

const EditProduct = ({ isOpen, onClose, product, onProductUpdated }) => {
    // Move all hooks to the top level
    const backend_url = process.env.REACT_APP_API_URL;
    const { token, isAuthenticated } = useAuth();
    const { darkMode } = useContext(DarkModeContext);
    
    const [image, setImage] = useState(null);
    const [imageChanged, setImageChanged] = useState(false);
    const [productDetails, setProductDetails] = useState({
        name: "",
        category: "",
        description: "",
        new_price: "",
        old_price: ""
    });

    // Initialize form with product details when component opens
    // Place useEffect before conditional return
    useEffect(() => {
        if (product && isOpen) {
            setProductDetails({
                name: product.name || "",
                category: product.category || "tshirts",
                description: product.description || "",
                new_price: product.new_price || "",
                old_price: product.old_price || ""
            });
            // Reset image state
            setImage(null);
            setImageChanged(false);
        }
    }, [product, isOpen]);

    // Early return after all hooks
    if (!isOpen) return null;
    const imageHandler = (e) => {
        setImage(e.target.files[0]);
        setImageChanged(true);
    };

    const changeHandler = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    };

    const updateProduct = async () => {
        // Basic validation
        if (!productDetails.name || !productDetails.new_price || !productDetails.old_price) {
            toast.error("Please fill all required fields");
            return;
        }

        const formData = new FormData();
        formData.append("name", productDetails.name);
        formData.append("category", productDetails.category);
        formData.append("description", productDetails.description);
        formData.append("new_price", productDetails.new_price);
        formData.append("old_price", productDetails.old_price);

        // Only append image if it has been changed
        if (imageChanged && image) {
            formData.append("product", image);
        }

        try {
            const response = await fetch(`${backend_url}/api/products/${product.id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Product updated successfully");
                onClose(); // Close the modal
                
                // Call the callback to refresh product list
                if (onProductUpdated) {
                    onProductUpdated();
                }
            } else {
                toast.error(data.error || "Failed to update product");
            }
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("An error occurred while updating the product");
        }
    };
    // Handle clicking outside the modal to close it
    const handleModalClick = (e) => {
        // Check if className includes modal-overlay instead of exact match
        // This ensures it works with additional classes like dark-mode
        if (e.target.className.includes("modal-overlay")) {
            onClose();
        }
    };

    return (
        <div className={`modal-overlay ${darkMode ? 'dark-mode' : ''}`} onClick={handleModalClick}>
            <div 
                className={`edit-product ${darkMode ? 'dark-mode' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="edit-product-header">
                    <h2>Edit Product</h2>
                    <button 
                        className="close-button" 
                        onClick={onClose}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>
                
                <div className="edit-product-form">
                    <div className="editproduct-itemfield">
                        <p>Product Title</p>
                        <input 
                            value={productDetails.name} 
                            onChange={changeHandler} 
                            type="text" 
                            name="name" 
                            placeholder="Type here"
                        />
                    </div>
                    
                    <div className="editproduct-itemfield">
                        <p>Product Description</p>
                        <textarea 
                            value={productDetails.description}
                            onChange={changeHandler}
                            name="description"
                            placeholder="Enter product description"
                            className="editproduct-description"
                            rows="4"
                        />
                    </div>

                    <div className="editproduct-price">
                        <div className="editproduct-itemfield">
                            <p>Original Price</p>
                            <input 
                                value={productDetails.old_price} 
                                onChange={changeHandler} 
                                type="text" 
                                name="old_price" 
                                placeholder="e.g. 1999"
                            />
                        </div>
                        <div className="editproduct-itemfield">
                            <p>Sale Price</p>
                            <input 
                                value={productDetails.new_price} 
                                onChange={changeHandler} 
                                type="text" 
                                name="new_price" 
                                placeholder="e.g. 1499"
                            />
                        </div>
                    </div>
                    
                    <div className="editproduct-itemfield">
                        <p>Product Category</p>
                        <select 
                            value={productDetails.category} 
                            onChange={changeHandler} 
                            name="category" 
                            className="edit-product-selector"
                        >
                            <option value="tshirts">T-Shirts</option>
                            <option value="polo">Polo</option>
                            <option value="formalshirts">Formal Shirts</option>
                        </select>
                    </div>
                    
                    <div className="editproduct-itemfield">
                        <p>Product Image</p>
                        <div 
                            className="upload-area"
                            onClick={() => document.getElementById('edit-file-input').click()}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    document.getElementById('edit-file-input').click();
                                }
                            }}
                        >
                            {imageChanged && image ? (
                                <img 
                                    src={URL.createObjectURL(image)} 
                                    alt="Preview" 
                                    className="editproduct-thumbnail-img"
                                />
                            ) : product?.image ? (
                                <img 
                                    src={product.image} 
                                    alt="Current" 
                                    className="editproduct-thumbnail-img"
                                />
                            ) : (
                                <div className="upload-placeholder">
                                    <img 
                                        src={upload_area} 
                                        alt="Upload Area" 
                                        className="upload-icon"
                                    />
                                    <p>Click or drag image to upload</p>
                                </div>
                            )}
                        </div>
                        <input 
                            onChange={imageHandler} 
                            type="file" 
                            name="image" 
                            id="edit-file-input" 
                            hidden
                            accept="image/*"
                        />
                    </div>
                </div>
                    
                <div className="edit-product-buttons">
                    <button 
                        onClick={onClose} 
                        className="cancel-btn"
                        type="button"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={updateProduct} 
                        className="update-btn"
                        disabled={!productDetails.name || !productDetails.new_price || !productDetails.old_price}
                        type="button"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;

