import React,{useState,useEffect} from 'react'
import './Popular.css'
import Item from './../Item/Item'

const Popular = ({ onQuickView }) => {
    const [popularBooks,setPopularBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const backend_url = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
    
    console.log('Backend URL:', backend_url);
    useEffect(()=>{
        const fetchData = async()=>{
            console.log('Fetching popular books from:', `${backend_url}/api/products/popularBooks`);
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${backend_url}/api/products/popularBooks`);
                console.log('Popular books response status:', response.status);
                const json = await response.json();
                console.log('Popular books data:', json);
                if(response.ok){
                    setPopularBooks(json);
                } else {
                    console.error('Failed to fetch popular books:', json);
                    setError('Failed to fetch popular books');
                }
            } catch (error) {
                console.error('Error fetching popular books:', error);
                setError('Network error: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    },[backend_url]);
    return ( 
        <div className="popular">
            <h1>POPULAR BOOKS</h1>
            <hr />
            <div className="popular-item">
                {loading && <p>Loading popular books...</p>}
                {error && <p style={{color: 'red'}}>Error: {error}</p>}
                {!loading && !error && popularBooks.length === 0 && <p>No popular books found.</p>}
                {!loading && !error && popularBooks.map((item,i)=>{
                    return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} onQuickView={onQuickView}/>
                })}
            </div>
        </div>
    );
}
 
export default Popular;