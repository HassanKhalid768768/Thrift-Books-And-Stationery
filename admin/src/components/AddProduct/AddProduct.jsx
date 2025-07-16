import React, { useState, useContext } from "react";
import "./AddProduct.css";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { DarkModeContext } from "../../context/DarkModeContext";
import { FiUploadCloud } from 'react-icons/fi';

const AddProduct = () => {

    const backend_url = process.env.REACT_APP_API_URL;
    const { token, isAuthenticated } = useAuth();
    const { darkMode } = useContext(DarkModeContext);
    const [image,setImage] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [productDetails, setProductDetails] = useState({
        name: "",
        category:"tshirts",
        description: "", // Added description field
        new_price:"",
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
        if (!productDetails.name || !productDetails.new_price || !productDetails.old_price || !image) {
            toast.error("Please fill all required fields and upload an image");
            return;
        }

        // Convert price strings to numbers for comparison and validate they are valid numbers
        const oldPrice = parseFloat(productDetails.old_price);
        const newPrice = parseFloat(productDetails.new_price);
        
        // Check if prices are valid numbers
        if (isNaN(oldPrice) || isNaN(newPrice)) {
            toast.error("Please enter valid numeric prices");
            return;
        }
        
        // Validate that original price is higher than sale price
        if (oldPrice <= newPrice) {
            toast.error("Original price must be higher than sale price");
            return;
        }
        
        // Setup FormData with all product details
        const formData = new FormData();
        formData.append("name", productDetails.name);
        formData.append("product", image);
        formData.append("category", productDetails.category);
        formData.append("description", productDetails.description);
        formData.append("new_price", productDetails.new_price);
        formData.append("old_price", productDetails.old_price);
      
        const response = await fetch(`${backend_url}/api/products`,{
            method:"POST",
            headers:{
                "Authorization": `Bearer ${token}`
            },
            body:formData,
        });
        if(response.ok){
            setProductDetails({
                name: "",
                category:"tshirts",
                description: "", // Reset description
                new_price:"",
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

            <div className="addproduct-price">
                <div className="addproduct-itemfield">
                    <p>Original Price</p>
                    <input 
                        value={productDetails.old_price} 
                        onChange={changeHandler} 
                        type="text" 
                        name="old_price" 
                        placeholder="e.g. 1999"
                    />
                </div>
                <div className="addproduct-itemfield">
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
            
            <div className="addproduct-itemfield">
                <p>Product Category</p>
                <select 
                    value={productDetails.category} 
                    onChange={changeHandler} 
                    name="category" 
                    className="add-product-selector"
                >
                    <option value="tshirts">T-Shirts</option>
                    <option value="polo">Polo</option>
                    <option value="formalshirts">Formal Shirts</option>
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
                disabled={!image || !productDetails.name || !productDetails.new_price}
            >
                ADD PRODUCT
            </button>
        </div>
    );
}
 
export default AddProduct;
