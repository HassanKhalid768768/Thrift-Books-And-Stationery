import React, { useState, useEffect, useContext } from 'react';
import './ReviewManagement.css';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { DarkModeContext } from "../../context/DarkModeContext";

const ReviewManagement = () => {
    const { token, isAuthenticated } = useAuth();
    const { darkMode } = useContext(DarkModeContext);
    const backend_url = process.env.REACT_APP_API_URL;
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [filterActive, setFilterActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch all products with reviews
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${backend_url}/api/products`);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch products: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Filter products that have reviews
                const productsWithReviews = data.filter(product => 
                    product.reviews && product.reviews.length > 0
                );
                
                setProducts(productsWithReviews);
                setError(null);
            } catch (err) {
                setError(`Error fetching products: ${err.message}`);
                toast.error(`Error fetching products: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProducts();
    }, [backend_url]);

    // Handle review deletion
    const handleDeleteReview = async () => {
        if (!selectedReview) return;
        
        // Check if user is authenticated
        if (!isAuthenticated || !token) {
            toast.error("You must be logged in as admin to delete reviews");
            closeModal();
            return;
        }
        
        setDeleteLoading(true);
        try {
            const response = await fetch(
                `${backend_url}/api/products/${selectedReview.productId}/reviews/${selectedReview.reviewId}`, 
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete review');
            }
            
            const data = await response.json();
            
            // Update the products state after deletion
            setProducts(prevProducts => {
                return prevProducts.map(product => {
                    if (product.id === selectedReview.productId) {
                        return {
                            ...product,
                            reviews: product.reviews.filter(
                                review => review._id !== selectedReview.reviewId
                            ),
                            averageRating: data.product.averageRating,
                            numReviews: data.product.numReviews
                        };
                    }
                    return product;
                }).filter(product => product.reviews.length > 0); // Remove products with no reviews
            });
            
            toast.success('Review deleted successfully');
            closeModal();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    // Open confirmation modal
    const openModal = (productId, reviewId, username, comment) => {
        // Check if user is authenticated before allowing deletion
        if (!isAuthenticated || !token) {
            toast.error("You must be logged in as admin to delete reviews");
            return;
        }
        
        setSelectedReview({ productId, reviewId, username, comment });
        setModalOpen(true);
    };

    // Close confirmation modal
    const closeModal = () => {
        setModalOpen(false);
        setSelectedReview(null);
    };

    // Render stars based on rating
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span 
                    key={i} 
                    className={`star ${i <= rating ? 'star-filled' : 'star-empty'}`}
                    aria-label={`star ${i}`}
                >
                    {i <= rating ? '★' : '☆'}
                </span>
            );
        }
        return stars;
    };
    
    // Filter products based on search term
    const filteredProducts = searchTerm.trim() 
        ? products.filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.reviews.some(review => 
                review.comment.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        : products;
    
    // Count total reviews
    const totalReviews = products.reduce(
        (total, product) => total + product.reviews.length, 0
    );

    return (
        <div className={`review-management-container ${darkMode ? 'dark-mode' : ''}`}>
            <h1>Review Management</h1>
            
            <div className="review-management-header">
                <div className="review-stats">
                    <p><strong>Total Products with Reviews:</strong> {products.length}</p>
                    <p><strong>Total Reviews:</strong> {totalReviews}</p>
                </div>
                
                <div className="review-search">
                    <input 
                        type="text" 
                        placeholder="Search by product name or review content..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button 
                        className={`filter-toggle ${filterActive ? 'active' : ''}`}
                        onClick={() => setFilterActive(!filterActive)}
                    >
                        {filterActive ? 'Show All' : 'Show With 🔴 Reviews'}
                    </button>
                </div>
            </div>
            
            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading reviews...</p>
                </div>
            ) : error ? (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="no-reviews">
                    <p>No reviews matching your criteria were found.</p>
                </div>
            ) : (
                <div className="products-list">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="product-card">
                            <div className="product-header">
                                <div className="product-info">
                                    <img src={product.image} alt={product.name} />
                                    <div>
                                        <h2>{product.name}</h2>
                                        <p className="product-category">{product.category}</p>
                                        <div className="product-rating">
                                            {renderStars(Math.round(product.averageRating || 0))}
                                            <span>({product.reviews.length} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="reviews-container">
                                {product.reviews
                                    .filter(review => !filterActive || review.rating <= 2)
                                    .map((review, index) => (
                                        <div key={review._id} className={`review-item ${review.rating <= 2 ? 'negative-review' : ''}`}>
                                            <div className="review-header">
                                                <div className="review-rating">
                                                    {renderStars(review.rating)}
                                                </div>
                                                <div className="review-date">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            
                                            <div className="review-content">
                                                <p>{review.comment}</p>
                                                <div className="review-user">
                                                    <span>User ID: {review.userId}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="review-actions">
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => openModal(
                                                        product.id, 
                                                        review._id, 
                                                        review.userId,
                                                        review.comment
                                                    )}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Confirmation Modal */}
            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Deletion</h2>
                        <p>Are you sure you want to delete this review?</p>
                        
                        {selectedReview && (
                            <div className="modal-review-preview">
                                <p><strong>User:</strong> {selectedReview.username}</p>
                                <p><strong>Comment:</strong> {selectedReview.comment}</p>
                            </div>
                        )}
                        
                        <div className="modal-actions">
                            <button 
                                className="cancel-btn" 
                                onClick={closeModal}
                                disabled={deleteLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                className="delete-btn"
                                onClick={handleDeleteReview}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewManagement;

