import React, { useState, useContext, useEffect } from "react";
import "./AddProduct.css";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { DarkModeContext } from "../../context/DarkModeContext";
import { FiUploadCloud } from 'react-icons/fi';
import { api } from '../../utils/api';

const AddProduct = () => {

    const { token, isAuthenticated } = useAuth();
    const { darkMode } = useContext(DarkModeContext);
    const [image, setImage] = useState(false);
    const [additionalImages, setAdditionalImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [productDetails, setProductDetails] = useState({
        name: "",
        category: "",
        description: "", // Added description field
        old_price: ""
    });
    const [sizes, setSizes] = useState([{ size: "", price: "" }]);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.getCategories();
                const data = await response.json();
                if (response.ok && data.length > 0) {
                    setCategories(data);
                    // Set default category to first one if available
                    if (!productDetails.category) {
                        setProductDetails(prev => ({ ...prev, category: data[0].slug }));
                    }
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const imageHandler = (e) => {
        if (e.target.files[0]) {
            setUploading(true);
            setImage(e.target.files[0]);
            setTimeout(() => setUploading(false), 1000);
        }
    }

    const additionalImagesHandler = (e) => {
        if (e.target.files) {
            setAdditionalImages(prev => [...prev, ...Array.from(e.target.files)]);
        }
    }

    const removeAdditionalImage = (index) => {
        setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    }

    const changeHandler = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value })
    }

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

    const addProduct = async () => {
        // Validate required fields
        if (!productDetails.name || !productDetails.old_price || !image) {
            toast.error("Please fill all required fields and upload an image");
            return;
        }

        // Convert price string to number and validate it is a valid number
        const oldPrice = parseFloat(productDetails.old_price);

        // Check if price is a valid number
        if (isNaN(oldPrice) || oldPrice <= 0) {
            toast.error("Please enter a valid numeric price");
            return;
        }

        // Validate and prepare sizes
        const validSizes = sizes.filter(s => s.size.trim() && s.price && !isNaN(parseFloat(s.price)) && parseFloat(s.price) > 0);

        console.log('AddProduct - All sizes:', sizes);
        console.log('AddProduct - Valid sizes:', validSizes);

        // Setup FormData with all product details
        const formData = new FormData();
        formData.append("name", productDetails.name);
        formData.append("product", image);
        formData.append("category", productDetails.category);
        formData.append("description", productDetails.description);
        formData.append("old_price", productDetails.old_price);
        formData.append("new_price", productDetails.old_price); // Set new_price same as old_price for backward compatibility

        // Always send sizes (even if empty array)
        const sizesToSend = validSizes.length > 0
            ? validSizes.map(s => ({
                size: s.size.trim(),
                price: parseFloat(s.price)
            }))
            : [];

        formData.append("sizes", JSON.stringify(sizesToSend));
        console.log('AddProduct - Sending sizes:', JSON.stringify(sizesToSend));

        // Append additional images
        additionalImages.forEach((img) => {
            formData.append("additionalImages", img);
        });

        const response = await api.addProduct(formData);
        if (response.ok) {
            setProductDetails({
                name: "",
                category: "books",
                description: "", // Reset description
                old_price: ""
            });
            setSizes([{ size: "", price: "" }]);
            setImage(false);
            setAdditionalImages([]);
            toast.success("product added");
        } else {
            const data = await response.json();
            console.error("Add Product failed:", data);
            toast.error(data.message || data.error || "Detailed error not provided");
        }
    }

    return (
        <div className={`add-product ${darkMode ? 'dark-mode' : ''}`}>
            <h2 className="add-product-title">Add New Product</h2>
            <div className="addproduct-itemfield">
                <p>Product Title</p>
                <input
                    value={productDetails.name}
                    onChange={changeHandler}
                    type="text"
                    name="name"
                    placeholder="Enter product title"
                />
            </div>

            <div className="addproduct-itemfield">
                <p>Product Description</p>
                <textarea
                    value={productDetails.description}
                    onChange={changeHandler}
                    name="description"
                    placeholder="Enter product description (features, materials, etc.)"
                    className="addproduct-description"
                    rows="4"
                />
            </div>

            <div className="addproduct-itemfield">
                <p>Base Price (if no sizes are added, this will be used)</p>
                <input
                    value={productDetails.old_price}
                    onChange={changeHandler}
                    type="text"
                    name="old_price"
                    placeholder="e.g. 1999"
                />
            </div>

            <div className="addproduct-itemfield">
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

            <div className="addproduct-itemfield">
                <p>Product Category</p>
                <select
                    value={productDetails.category}
                    onChange={changeHandler}
                    name="category"
                    className="add-product-selector"
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

            <div className="addproduct-itemfield">
                <p>Product Image</p>
                <label htmlFor="file-input" className="upload-area-container">
                    {image ? (
                        <img
                            src={URL.createObjectURL(image)}
                            alt="Product Preview"
                            className="addproduct-thumbnail-img"
                        />
                    ) : (
                        <>
                            <FiUploadCloud className="upload-icon" />
                            <p className="upload-text">
                                {uploading ? 'Uploading...' : 'Click or drag image to upload'}
                            </p>
                        </>
                    )}
                </label>
                <input
                    onChange={imageHandler}
                    type="file"
                    name="image"
                    id="file-input"
                    hidden
                    accept="image/*"
                />
            </div>

            <div className="addproduct-itemfield">
                <p>Additional Images (Optional)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {additionalImages.map((img, index) => (
                            <div key={index} style={{ position: 'relative' }}>
                                <img
                                    src={URL.createObjectURL(img)}
                                    alt={`Preview ${index}`}
                                    className="addproduct-thumbnail-img"
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
                        <label htmlFor="additional-file-input" className="upload-area-container" style={{ width: '80px', height: '80px', minHeight: '80px' }}>
                            <FiUploadCloud className="upload-icon" style={{ fontSize: '24px' }} />
                        </label>
                    </div>
                    <input
                        onChange={additionalImagesHandler}
                        type="file"
                        name="additionalImages"
                        id="additional-file-input"
                        hidden
                        multiple
                        accept="image/*"
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666' }}>
                        {additionalImages.length} additional image{additionalImages.length !== 1 ? 's' : ''} selected
                    </p>
                </div>
            </div>

            <button
                onClick={addProduct}
                className="addproduct-btn"
                disabled={!image || !productDetails.name || !productDetails.old_price}
            >
                ADD PRODUCT
            </button>
        </div>
    );
}

export default AddProduct;
