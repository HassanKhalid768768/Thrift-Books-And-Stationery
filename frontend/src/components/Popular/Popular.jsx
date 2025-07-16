import React,{useState,useEffect} from 'react'
import './Popular.css'
import Item from './../Item/Item'

const Popular = ({ onQuickView }) => {
    const [popularTShirts,setPopularTShirts] = useState([]);
    const backend_url = process.env.REACT_APP_API_URL;
    useEffect(()=>{
        const fetchData = async()=>{
            const response = await fetch(`${backend_url}/api/products/popularTShirts`);
            const json = await response.json();
            if(response.ok){
                setPopularTShirts(json);
            }
        };
        fetchData();
    },[]);
    return ( 
        <div className="popular">
            <h1>POPULAR T-SHIRTS</h1>
            <hr />
            <div className="popular-item">
                {popularTShirts.map((item,i)=>{
                    return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} onQuickView={onQuickView}/>
                })}
            </div>
        </div>
    );
}
 
export default Popular;