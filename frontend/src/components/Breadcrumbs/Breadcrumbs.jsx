import React from "react";
import './Breadcrumbs.css'
import arrow_icon from './../../assets/breadcrum_arrow.png'

const Breadcrumb = (props) => {
    const { product } = props;
    
    // Handle loading state or undefined product
    if (!product) {
        return (
            <div className="breadcrumb">
                Home <img src={arrow_icon} alt="" /> Shop
            </div>
        );
    }
    
    return ( 
        <div className="breadcrumb">
            Home <img src={arrow_icon} alt="" /> Shop <img src={arrow_icon} alt="" /> 
            {product.category || "Category"} <img src={arrow_icon} alt="" /> {product.name || "Product"}
        </div>
     );
}
 
export default Breadcrumb;