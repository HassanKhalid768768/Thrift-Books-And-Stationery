import React, {useState, useEffect, useContext} from "react";
import './ListProduct.css';
import bin from './../../assets/recycle-bin.png';
import editIcon from './../../assets/edit-icon.svg';
import {toast} from "react-toastify";
import CategoryFilter from "../CategoryFilter/CategoryFilter";
import EditProduct from "../EditProduct/EditProduct";
import { useAuth } from "../../context/AuthContext";
import { DarkModeContext } from "../../context/DarkModeContext";

const ListProduct = () => {
    const backend_url = process.env.REACT_APP_API_URL;
    const { token, isAuthenticated } = useAuth();
    const { darkMode } = useContext(DarkModeContext);
    const [allproducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const fetchInfo = async ()=>{
        const response = await fetch(`${backend_url}/api/products`);
        const json = await response.json();
        if(response.ok){
            setAllProducts(json);
            setFilteredProducts(json);
        }
        else toast.error(json.error);
    }

    useEffect(()=>{
        fetchInfo();
    },[])

    const removeProduct = async (id)=>{
        const response = await fetch(`${backend_url}/api/products/${id}`,{
            method:'DELETE',
            headers:{
                'Content-Type':'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const json = await response.json();
        if(!response.ok) toast.error(json.error);
        else {
            await fetchInfo();
            toast.success("Product removed");
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

    return ( 
        <div className={`list-product ${darkMode ? 'dark-mode' : ''}`}>
            <h1>All Products</h1>
            <CategoryFilter products={allproducts} onFilterChange={handleFilterChange} />
            <div className="listproduct-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Old Price</p>
                <p>New Price</p>
                <p>Category</p>
                <p>Edit</p>
                <p>Remove</p>
            </div>
            <div className="listproduct-allproducts">
                <hr />
                {filteredProducts.map((product,index)=>{
                    return <><div className="listproduct-format-main listproduct-format" key={index}>
                        <img src={product.image} alt="" className="listproduct-product-icon" />
                        <p>{product.name}</p>
                        <p>PKR {product.old_price.toLocaleString('en-PK')}</p>
                        <p>PKR {product.new_price.toLocaleString('en-PK')}</p>
                        <p>{product.category === "polo" ? "Polo" : 
                           product.category === "tshirts" ? "T-Shirts" : 
                           product.category === "formalshirts" ? "Formal Shirts" : 
                           product.category}</p>
                        <img 
                            onClick={() => openEditModal(product)} 
                            src={editIcon} 
                            alt="Edit" 
                            className="listproduct-edit-icon"
                            title="Edit product"
                        />
                        <img 
                            onClick={() => removeProduct(product.id)} 
                            src={bin} 
                            alt="Delete" 
                            className="listproduct-remove-icon"
                            title="Remove product"
                        />
                    </div>
                    <hr />
                    </>
                })}
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