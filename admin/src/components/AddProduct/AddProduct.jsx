import React, { useState, useContext } from "react";
import "./AddProduct.css";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { DarkModeContext } from "../../context/DarkModeContext";
import { FiUploadCloud } from 'react-icons/fi';
import { api } from '../../utils/api';

const AddProduct = () => {

    const { token, isAuthenticated } = useAuth();
    const { darkMode } = useContext(DarkModeContext);
    const [image,setImage] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [productDetails, setProductDetails] = useState({
        name: "",
        category:"books",
        description: "", // Added description field
        old_price:""
    });

    const imageHandler = (e) =>{
        if (e.target.files[0]) {
            setUploading(true);
            setImage(e.target.files[0]);
            setTimeout(() => setUploading(false), 1000);
        }
    }

    const changeHandler = (e)=>{
        setProductDetails({...productDetails,[e.target.name]:e.target.value})
    }

    const addProduct = async () =>{
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
        
        // Setup FormData with all product details
        const formData = new FormData();
        formData.append("name", productDetails.name);
        formData.append("product", image);
        formData.append("category", productDetails.category);
        formData.append("description", productDetails.description);
        formData.append("old_price", productDetails.old_price);
        formData.append("new_price", productDetails.old_price); // Set new_price same as old_price for backward compatibility
      
        const response = await api.addProduct(formData);
        if(response.ok){
            setProductDetails({
                name: "",
                category:"books",
                description: "", // Reset description
                old_price:""
            });
            setImage(false);
            toast.success("product added");
        }
        else toast.error("failed");
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
                <p>Price</p>
                <input 
                    value={productDetails.old_price} 
                    onChange={changeHandler} 
                    type="text" 
                    name="old_price" 
                    placeholder="e.g. 1999"
                />
            </div>
            
            <div className="addproduct-itemfield">
                <p>Product Category</p>
                <select 
                    value={productDetails.category} 
                    onChange={changeHandler} 
                    name="category" 
                    className="add-product-selector"
                >
                    <option value="books">Books</option>
                    <option value="stationary">Stationary</option>
                    <option value="gadgets">Gadgets</option>
                    <option value="water-bottles-and-lunch-boxes">Water Bottles and Lunch Boxes</option>
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
