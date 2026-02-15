import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../../utils/api';
import './ManageCategories.css';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        displayOrder: 0,
        isActive: true
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await api.getCategoriesAdmin();
            const data = await response.json();

            if (response.ok) {
                setCategories(Array.isArray(data) ? data : []);
            } else {
                toast.error(data.error || 'Failed to fetch categories');
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error fetching categories');
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        try {
            let response;
            if (editingCategory) {
                response = await api.updateCategory(editingCategory._id, formData);
            } else {
                response = await api.createCategory(formData);
            }

            const data = await response.json();

            if (response.ok) {
                toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
                setIsModalOpen(false);
                resetForm();
                fetchCategories();
            } else {
                toast.error(data.error || 'Failed to save category');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Error saving category');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            image: category.image || '',
            displayOrder: category.displayOrder || 0,
            isActive: category.isActive !== undefined ? category.isActive : true
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone if products are using it.')) {
            return;
        }

        try {
            const response = await api.deleteCategory(id);
            const data = await response.json();

            if (response.ok) {
                toast.success('Category deleted successfully');
                fetchCategories();
            } else {
                toast.error(data.error || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Error deleting category');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            image: '',
            displayOrder: 0,
            isActive: true
        });
        setEditingCategory(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    if (isLoading) {
        return <div className="manage-categories-loading">Loading categories...</div>;
    }

    return (
        <div className="manage-categories">
            <div className="manage-categories-header">
                <h1>Manage Categories</h1>
                <button
                    className="add-category-btn"
                    onClick={() => {
                        resetForm();
                        setFormData(prev => ({
                            ...prev,
                            displayOrder: categories.length + 1
                        }));
                        setIsModalOpen(true);
                    }}
                >
                    + Add New Category
                </button>
            </div>

            <div className="categories-table-container">
                <table className="categories-table">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Name</th>
                            <th>Slug</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>
                                    <p style={{ marginBottom: '8px' }}>No categories found. Add your first category using the button above, or seed default categories by running:</p>
                                    <code style={{ background: '#f4f4f4', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>node backend/scripts/seedCategories.js</code>
                                    <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>(From project root; ensure backend .env or config.env has MONGODB_URI/DATABASE)</p>
                                </td>
                            </tr>
                        ) : (
                            categories.map((category) => (
                                <tr key={category._id}>
                                    <td>{category.displayOrder}</td>
                                    <td><strong>{category.name}</strong></td>
                                    <td><code>{category.slug}</code></td>
                                    <td>{category.description || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                                            {category.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEdit(category)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(category._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal for Add/Edit Category */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                            <button className="close-btn" onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="category-form">
                            <div className="form-group">
                                <label>Category Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Novels, Course Books"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Category description (optional)"
                                />
                            </div>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/image.jpg (optional)"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Display Order</label>
                                    <input
                                        type="number"
                                        name="displayOrder"
                                        value={formData.displayOrder}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                        />
                                        Active
                                    </label>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    {editingCategory ? 'Update' : 'Create'} Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCategories;
