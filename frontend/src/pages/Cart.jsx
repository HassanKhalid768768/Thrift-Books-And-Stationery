import React, { useContext, useEffect } from "react";
import CartItems from "../components/CartItems/CartItems";
import { StoreContext } from "../context/StoreContext";

const Cart = () => {
    const { cleanupUserPendingOrders } = useContext(StoreContext);
    
    useEffect(() => {
        // Instantly clean up user's pending orders when they visit cart
        // This handles cases where users have pending orders that need cleanup
        cleanupUserPendingOrders();
    }, [cleanupUserPendingOrders]);
    
    return ( 
        <div>
           <CartItems/> 
        </div>
     );
}
 
export default Cart;