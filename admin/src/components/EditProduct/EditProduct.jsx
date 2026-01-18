import React, { useState, useEffect, useContext } from "react";
import "./EditProduct.css";
import upload_area from "./../../assets/upload_area.svg";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { DarkModeContext } from "../../context/DarkModeContext";
import { FiUploadCloud, FiImage } from 'react-icons/fi';
import { api } from '../../utils/api';
import CloudinaryImageSelector from '../CloudinaryImageSelector/CloudinaryImageSelector';

const EditProduct = ({ isOpen, onClose, product, onProductUpdated }) => {
    // Move all hooks to the top level
    const { token, isAuthenticated } = useAuth();
    const { darkMode } = useContext(DarkModeContext);

    const [image, setImage] = useState(null);
    const [imageChanged, setImageChanged] = useState(false);
    const [productDetails, setProductDetails] = useState({
        name: "",
        category: "",
        description: "",
        old_price: ""
    });
    const [sizes, setSizes] = useState([{ size: "", price: "" }]);
    const [categories, setCategories] = useState([]);
    const [additionalImages, setAdditionalImages] = useState([]); // New images to upload
    const [existingAdditionalImages, setExistingAdditionalImages] = useState([]); // URLs of existing images
    const [newAdditionalImageUrls, setNewAdditionalImageUrls] = useState([]); // New URLs from library
    const [showImageSelector, setShowImageSelector] = useState(false);
    const [selectorMode, setSelectorMode] = useState('main'); // 'main' or 'additional'
    const [imageFromLibrary, setImageFromLibrary] = useState(null); // URL string from library for main image replacement

    // Fetch categories on component mount
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

    // Initialize form with product details when component opens
    // Place useEffect before conditional return
    useEffect(() => {
        if (product && isOpen) {
            console.log('EditProduct - Product received:', product);
            console.log('EditProduct - Product sizes:', product.sizes);
            setProductDetails({
                name: product.name || "",
                category: product.category || "books",
                description: product.description || "",
                old_price: product.old_price || ""
            });
            // Initialize sizes from product or default to empty
            if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
                const mappedSizes = product.sizes.map(s => ({
                    size: s.size || "",
                    price: (s.price || 0).toString()
                }));
                console.log('EditProduct - Mapped sizes:', mappedSizes);
                setSizes(mappedSizes);
            } else {
                console.log('EditProduct - No sizes found, setting default');
                setSizes([{ size: "", price: "" }]);
            }
            // Reset image state
            setImage(null);
            setImageChanged(false);

            // Initialize existing additional images
            setExistingAdditionalImages(product.additionalImages || []);
            setAdditionalImages([]);
            setNewAdditionalImageUrls([]);
            setImageFromLibrary(null);
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

    const additionalImagesHandler = (e) => {
        if (e.target.files) {
            setAdditionalImages(prev => [...prev, ...Array.from(e.target.files)]);
        }
    }

    const removeAdditionalImage = (index) => {
        setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    }

    const removeExistingImage = (index) => {
        setExistingAdditionalImages(prev => prev.filter((_, i) => i !== index));
    }



    const removeNewLibraryImage = (index) => {
        setNewAdditionalImageUrls(prev => prev.filter((_, i) => i !== index));
    }

    const openImageSelector = (mode) => {
        setSelectorMode(mode);
        setShowImageSelector(true);
    };

    const handleLibrarySelection = (selection) => {
        if (selectorMode === 'main') {
            setImageFromLibrary(selection);
            setImage(null);
            setImageChanged(true);
        } else {
            // mode is 'additional'
            if (Array.isArray(selection)) {
                setNewAdditionalImageUrls(prev => [...prev, ...selection]);
            }
        }
    };

    const handleSizeChange = (index, field, value) => {
        const newSizes = [...sizes];
        newSizes[index][field] = value;
        setSizes(newSizes);
    }

    const addSize = () => {
        setSizes([...sizes, { size: "", price: "" }]);
    }

    const removeSize = (index) => {
        if (sizes.length > 1) {
            const newSizes = sizes.filter((_, i) => i !== index);
            setSizes(newSizes);
        }
    }

    const updateProduct = async () => {
        // Basic validation
        if (!productDetails.name || !productDetails.old_price) {
            toast.error("Please fill all required fields");
            return;
        }

        // Validate and prepare sizes
        const validSizes = sizes.filter(s => s.size.trim() && s.price && !isNaN(parseFloat(s.price)) && parseFloat(s.price) > 0);

        console.log('EditProduct - All sizes:', sizes);
        console.log('EditProduct - Valid sizes:', validSizes);

        const formData = new FormData();
        formData.append("name", productDetails.name);
        formData.append("category", productDetails.category);
        formData.append("description", productDetails.description);
        formData.append("old_price", productDetails.old_price);
        formData.append("new_price", productDetails.old_price); // Set new_price same as old_price for backward compatibility

        // Always send sizes (even if empty array) to ensure they're saved/cleared
        const sizesToSend = validSizes.length > 0
            ? validSizes.map(s => ({
                size: s.size.trim(),
                price: parseFloat(s.price)
            }))
            : [];

        formData.append("sizes", JSON.stringify(sizesToSend));
        console.log('EditProduct - Sending sizes:', JSON.stringify(sizesToSend));

        // Only append image if it has been changed
        if (imageChanged && image) {
            formData.append("product", image);
        }

        // Append new additional images
        additionalImages.forEach((img) => {
            formData.append("additionalImages", img);
        });

        // Append list of existing images to keep
        // Append list of existing images to keep
        formData.append("existingAdditionalImages", JSON.stringify(existingAdditionalImages));

        // Append new additional images from library
        if (newAdditionalImageUrls.length > 0) {
            formData.append("newAdditionalImageUrls", JSON.stringify(newAdditionalImageUrls));
        }

        // Handle main image replacement from library
        if (imageChanged && imageFromLibrary) {
            // If we have a URL from library for main image, we can't send it as 'product' file
            // We need to signal backend to update image from URL.
            // Since backend expects file in 'product', we might need to change backend logic or 
            // append it as a separate field and handle it.
            // For now, let's append it to formData which might need backend adjustment if not already handling text field for main image
            // NOTE: Our backend updateProduct only checks req.files['product'].
            // We need to add logic to backend to check for req.body.image if no file is uploaded.
            // Let's assume we added that logic or will add it.
            formData.append("image", imageFromLibrary);
        }

        try {
            const response = await api.updateProduct(product.id, formData);

            const data = await response.json();

            if (response.ok) {
                console.log('EditProduct - Update successful, response data:', data);
                console.log('EditProduct - Updated product:', data.product);
                console.log('EditProduct - Updated product sizes:', data.product?.sizes);
                toast.success("Product updated successfully");

                // Small delay to ensure backend has saved
                setTimeout(() => {
                    onClose(); // Close the modal

                    // Call the callback to refresh product list
                    if (onProductUpdated) {
                        onProductUpdated();
                    }
                }, 500);
            } else {
                console.error('EditProduct - Update failed:', data);
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

                    <div className="editproduct-itemfield">
                        <p>Base Price (if no sizes are added, this will be used)</p>
                        <input
                            value={productDetails.old_price}
                            onChange={changeHandler}
                            type="text"
                            name="old_price"
                            placeholder="e.g. 1999"
                        />
                    </div>

                    <div className="editproduct-itemfield">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <p>Product Sizes & Prices (Optional)</p>
                            <button type="button" onClick={addSize} style={{ padding: '5px 15px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
                                + Add Size
                            </button>
                        </div>
                        {sizes.map((sizeItem, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Size (e.g., S, M, L, XL)"
                                    value={sizeItem.size}
                                    onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                                    style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Price"
                                    value={sizeItem.price}
                                    onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                                    style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                                {sizes.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSize(index)}
                                        style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="editproduct-itemfield">
                        <p>Product Category</p>
                        <select
                            value={productDetails.category}
                            onChange={changeHandler}
                            name="category"
                            className="edit-product-selector"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat.slug}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="editproduct-itemfield">
                        <p>Product Image</p>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <div
                                className="upload-area"
                                onClick={() => document.getElementById('edit-file-input').click()}
                                role="button"
                                tabIndex={0}
                                style={{ flex: 1 }}
                            >
                                {imageChanged && image ? (
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt="Preview"
                                        className="editproduct-thumbnail-img"
                                    />
                                ) : imageChanged && imageFromLibrary ? (
                                    <img
                                        src={imageFromLibrary}
                                        alt="New Library Selection"
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
                                        <p>Click to upload new file</p>
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

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>OR</p>
                                <button
                                    type="button"
                                    className="select-library-btn"
                                    onClick={() => openImageSelector('main')}
                                    style={{
                                        padding: '8px 12px',
                                        background: '#f0f0f0',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}
                                >
                                    <FiImage /> Select from Library
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="editproduct-itemfield">
                        <p>Additional Images (Optional)</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {/* Existing Images */}
                                {existingAdditionalImages.map((imgUrl, index) => (
                                    <div key={`existing-${index}`} style={{ position: 'relative' }}>
                                        <img
                                            src={imgUrl}
                                            alt={`Existing ${index}`}
                                            className="editproduct-thumbnail-img"
                                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '-5px',
                                                right: '-5px',
                                                background: 'red',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '20px',
                                                height: '20px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px'
                                            }}
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}

                                {/* New Images */}
                                {additionalImages.map((img, index) => (
                                    <div key={`new-${index}`} style={{ position: 'relative' }}>
                                        <img
                                            src={URL.createObjectURL(img)}
                                            alt={`New ${index}`}
                                            className="editproduct-thumbnail-img"
                                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeAdditionalImage(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '-5px',
                                                right: '-5px',
                                                background: 'red',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '20px',
                                                height: '20px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px'
                                            }}
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}

                                {/* New Images from Library */}
                                {newAdditionalImageUrls.map((imgUrl, index) => (
                                    <div key={`lib-new-${index}`} style={{ position: 'relative' }}>
                                        <img
                                            src={imgUrl}
                                            alt={`Library New ${index}`}
                                            className="editproduct-thumbnail-img"
                                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewLibraryImage(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '-5px',
                                                right: '-5px',
                                                background: 'red',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '20px',
                                                height: '20px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px'
                                            }}
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}

                                <label htmlFor="edit-additional-file-input" className="upload-area-container" style={{ width: '80px', height: '80px', minHeight: '80px', border: '1px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <FiUploadCloud className="upload-icon" style={{ fontSize: '24px' }} />
                                </label>
                                <button
                                    type="button"
                                    onClick={() => openImageSelector('additional')}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        background: '#f9f9f9',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '5px',
                                        fontSize: '10px'
                                    }}
                                >
                                    <FiImage size={20} />
                                    Select
                                </button>
                            </div>
                            <input
                                onChange={additionalImagesHandler}
                                type="file"
                                name="additionalImages"
                                id="edit-additional-file-input"
                                hidden
                                multiple
                                accept="image/*"
                            />
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>
                                {existingAdditionalImages.length + additionalImages.length + newAdditionalImageUrls.length} images total
                            </p>
                        </div>
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
                        disabled={!productDetails.name || !productDetails.old_price}
                        type="button"
                    >
                        Update
                    </button>
                </div>
            </div>

            <CloudinaryImageSelector
                isOpen={showImageSelector}
                onClose={() => setShowImageSelector(false)}
                onSelect={handleLibrarySelection}
                multiple={selectorMode === 'additional'}
            />
        </div>
    );
};

export default EditProduct;

