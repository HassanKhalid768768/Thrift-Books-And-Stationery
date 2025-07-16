import React, { useEffect } from "react";
import "./CSS/Verify.css";
import { useNavigate, useSearchParams } from "react-router-dom";

const Verify = () => {
    const [searchParams,setSearchParams] = useSearchParams();
    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");
    const navigate = useNavigate();

    const backend_url = process.env.REACT_APP_BACKEND_URL;

    const verifyPayment = async () => {
        console.log('Verifying payment:', { success, orderId });
        
        try {
            const response = await fetch(`${backend_url}/api/orders/verify`,{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({success,orderId}),
            });
            
            const data = await response.json();
            console.log('Verification response:', data);
            
            if(response.ok){
                if(success === "true") {
                    // Payment successful
                    console.log('Payment successful, redirecting to orders');
                    navigate("/myorders");
                } else {
                    // Payment cancelled - order was deleted
                    console.log('Payment cancelled, redirecting to cart');
                    navigate("/cart");
                }
            } else {
                console.error('Verification failed:', data);
                navigate("/");
            }
        } catch (error) {
            console.error('Error during verification:', error);
            navigate("/");
        }
    }

    useEffect(()=>{
        verifyPayment();
    },[])
    
    return ( 
        <div className="verify">
        <div className="spinner"></div>
        </div>
     );
}
 
export default Verify;