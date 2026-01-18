import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './CloudinaryImageSelector.css';

const CloudinaryImageSelector = ({ isOpen, onClose, onSelect, multiple = false }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [nextCursor, setNextCursor] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);

    useEffect(() => {
        if (isOpen && images.length === 0) {
            fetchImages();
        }
    }, [isOpen]);

    const fetchImages = async (cursor = null) => {
        setLoading(true);
        try {
            const response = await api.getCloudinaryImages(cursor);
            const data = await response.json();

            if (response.ok) {
                if (cursor) {
                    setImages(prev => {
                        const newIds = new Set(prev.map(p => p.public_id));
                        const uniqueNewImages = data.resources.filter(img => !newIds.has(img.public_id));
                        return [...prev, ...uniqueNewImages];
                    });
                } else {
                    setImages(data.resources);
                }
                setNextCursor(data.next_cursor);
            } else {
                console.error("Failed to fetch images:", data);
            }
        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageClick = (imageUrl) => {
        if (multiple) {
            if (selectedImages.includes(imageUrl)) {
                setSelectedImages(prev => prev.filter(url => url !== imageUrl));
            } else {
                setSelectedImages(prev => [...prev, imageUrl]);
            }
        } else {
            setSelectedImages([imageUrl]);
        }
    };

    const confirmSelection = () => {
        if (multiple) {
            onSelect(selectedImages);
        } else {
            onSelect(selectedImages[0]);
        }
        onClose();
        setSelectedImages([]);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="cloudinary-selector-modal" onClick={e => e.stopPropagation()}>
                <div className="cloudinary-selector-header">
                    <h3>Select from Library</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="cloudinary-selector-grid">
                    {images.map(img => (
                        <div
                            key={img.public_id}
                            className={`cloudinary-image-item ${selectedImages.includes(img.secure_url) ? 'selected' : ''}`}
                            onClick={() => handleImageClick(img.secure_url)}
                        >
                            <img src={img.secure_url} alt="Cloudinary Resource" />
                            {selectedImages.includes(img.secure_url) && <div className="selection-overlay">✓</div>}
                        </div>
                    ))}
                </div>

                <div className="cloudinary-selector-footer">
                    {nextCursor && (
                        <button
                            className="load-more-btn"
                            onClick={() => fetchImages(nextCursor)}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Load More'}
                        </button>
                    )}
                    <div className="action-buttons">
                        <button className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button
                            className="confirm-btn"
                            onClick={confirmSelection}
                            disabled={selectedImages.length === 0}
                        >
                            Select {selectedImages.length > 0 ? `(${selectedImages.length})` : ''}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CloudinaryImageSelector;
