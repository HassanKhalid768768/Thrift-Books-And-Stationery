import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { StoreContext } from '../context/StoreContext';
import './CSS/ShopCategory.css';
import Item from './../components/Item/Item';

const ShopCategory = () => {
    const { categorySlug } = useParams();
    const { all_product } = useContext(StoreContext);
    const category = categorySlug || '';

    return ( 
        <div className="shop-category">
            <div className="shopCategory-products">
                {all_product.map((item, i) => {
                    if (category && item.category === category) {
                        return <Item key={i} id={item.id} name={item.name} image={item.image} old_price={item.old_price} />;
                    }
                    return null;
                })}
            </div>
        </div>
     );
}
 
export default ShopCategory;