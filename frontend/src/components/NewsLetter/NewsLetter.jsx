import React, { useState } from 'react'
import './NewsLetter.css'
import {toast} from 'react-toastify'
import { api } from '../../utils/api';

const NewsLetter = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const changeHandler = (e)=>{
        setEmail(e.target.value);
    };
    
    const submitHandler = async()=>{
        if (!email.trim()) {
            toast.error('Please enter your email address');
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await api.subscribe(email);
            const json = await response.json();
            
            if(response.ok){
                toast.success('Subscribed successfully!');
                setEmail('');
            }
            else {
                toast.error(json.error || 'Subscription failed');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            toast.error('Failed to connect to the server');
        } finally {
            setIsLoading(false);
        }
    }
    return ( 
        <div className="newsletter">
            <h1>Get Exclusive Offers On Your Email</h1>
            <p>Subscribe to our newsletter and stay updated</p>
            <div>
                    <input 
                        value={email} 
                        onChange={changeHandler} 
                        type="email" 
                        placeholder='Your Email id'
                        disabled={isLoading}
                    />
                    <button 
                        onClick={submitHandler} 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Subscribing...' : 'Subscribe'}
                    </button>
            </div>
        </div>
     );
}
 
export default NewsLetter;