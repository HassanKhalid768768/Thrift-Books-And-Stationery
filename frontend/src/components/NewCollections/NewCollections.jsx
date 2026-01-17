import React, { useEffect, useState } from 'react';
import './NewCollections.css';
import Item from '../Item/Item'

const NewCollections = ({ onQuickView }) => {
    const [new_collection,setNew_collection] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const backend_url = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
    
    console.log('Backend URL:', backend_url);
    useEffect(()=>{
        const fetchData = async()=>{
            console.log('Fetching new collections from:', `${backend_url}/api/products/newCollections`);
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${backend_url}/api/products/newCollections`);
                console.log('New collections response status:', response.status);
                const json = await response.json();
                console.log('New collections data:', json);
                if(response.ok){
                    setNew_collection(json);
                } else {
                    console.error('Failed to fetch new collections:', json);
                    setError('Failed to fetch new collections');
                }
            } catch (error) {
                console.error('Error fetching new collections:', error);
                setError('Network error: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    },[backend_url]);
    return ( 
        <div className="new-collections">
            <h1>NEW ARRIVALS</h1>
            <hr />
            <div className="collections">
                {loading && <p>Loading new arrivals...</p>}
                {error && <p style={{color: 'red'}}>Error: {error}</p>}
                {!loading && !error && new_collection.length === 0 && <p>No new arrivals found.</p>}
                {!loading && !error && new_collection.map((item,i)=>{
                   return <Item key={i} id={item.id} name={item.name} image={item.image} old_price={item.old_price} onQuickView={onQuickView}/>
                })}
            </div>
        </div>
     );
}
 
export default NewCollections;