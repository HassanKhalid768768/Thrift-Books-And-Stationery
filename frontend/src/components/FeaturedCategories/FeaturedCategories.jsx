import React from 'react';
import { Link } from 'react-router-dom';
import './FeaturedCategories.css';

const FeaturedCategories = () => {
    // Category data with images, titles, and links - focused on books, stationary, and gadgets
    const categories = [
        {
            id: 1,
            title: "Books",
            subtitle: "Knowledge & Learning",
            image: "https://static.scientificamerican.com/sciam/cache/file/1DDFE633-2B85-468D-B28D05ADAE7D1AD8_source.jpg?w=1200",
            color: "#3498db",
            link: "/books"
        },
        {
            id: 2,
            title: "Stationary",
            subtitle: "Office & School Supplies",
            image: "https://profit.pakistantoday.com.pk/wp-content/uploads/2018/07/k%C4%B1rtasiye1.jpg",
            color: "#e74c3c",
            link: "/stationary"
        },
        {
            id: 3,
            title: "Gadgets",
            subtitle: "Kitchen & Household Items",
            image: "https://scontent.flhe42-1.fna.fbcdn.net/v/t39.30808-6/502673051_122229597104191732_3774908406470497486_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=833d8c&_nc_ohc=IPAA76KP6q8Q7kNvwG4x_pv&_nc_oc=AdlVoeHsqe7H8mjfWhuV8bLi-xBYsDhuRIPJ2Z3xj-HmA6DKiIT0X5EVSkijHsJdT58&_nc_zt=23&_nc_ht=scontent.flhe42-1.fna&_nc_gid=JzAvL9XouUSkT6ZqZKokFQ&oh=00_AfR8Cy_6Er2xOmpynug78fGRZp7r3m5ABj6UCQk0g4AgGw&oe=687D77B8",
            color: "#647687",
            link: "/gadgets"
        }
    ];

    return (
        <div className="featured-categories">
            <h1>Shop By Category</h1>
            <p className="featured-subtitle">Discover our curated collections</p>
            <hr />
            
            <div className="category-grid">
                {categories.map((category, index) => (
                    <Link 
                        to={category.link} 
                        key={category.id} 
                        className="category-card" 
                        style={{'--card-color': category.color}} 
                        data-index={index}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="category-image-container">
                            <img src={category.image} alt={category.title} className="category-image" />
                            <div className="category-overlay"></div>
                        </div>
                        <div className="category-content">
                            <h3>{category.title}</h3>
                            <p>{category.subtitle}</p>
                            <span className="category-button">
                                Shop Now
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                                </svg>
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default FeaturedCategories;

