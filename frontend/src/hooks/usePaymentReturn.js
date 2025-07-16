import { useEffect, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';

export const usePaymentReturn = () => {
    const { cleanupUserPendingOrders } = useContext(StoreContext);
    
    useEffect(() => {
        // Function to handle when user returns to the site
        const handlePageShow = (event) => {
            // Check if page is being shown from cache (user pressed back button)
            if (event.persisted) {
                console.log('User returned from external site (back button pressed)');
                cleanupUserPendingOrders();
            }
        };

        // Function to handle when user returns from external site
        const handleFocus = () => {
            // Check if user was away from the site for a while
            const lastActivity = localStorage.getItem('lastActivity');
            const now = Date.now();
            
            if (lastActivity && (now - parseInt(lastActivity)) > 30000) { // 30 seconds threshold
                console.log('User returned after being away for a while');
                cleanupUserPendingOrders();
            }
            
            // Update last activity
            localStorage.setItem('lastActivity', now.toString());
        };

        // Function to handle when user navigates away
        const handleBlur = () => {
            localStorage.setItem('lastActivity', Date.now().toString());
        };

        // Set up event listeners
        window.addEventListener('pageshow', handlePageShow);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        // Clean up on component unmount
        return () => {
            window.removeEventListener('pageshow', handlePageShow);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, [cleanupUserPendingOrders]);
};
