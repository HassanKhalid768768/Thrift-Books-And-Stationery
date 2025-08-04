import React, { useState, useEffect } from 'react';
import { api } from "../../utils/api";
import { toast } from 'react-toastify';
import "./Subscribers.css";

const Subscribers = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        testAuthentication();
    }, []);

    const testAuthentication = async () => {
        console.log("Testing authentication...");
        
        // Test basic auth first
        try {
            const authResponse = await api.testAuth();
            console.log("Auth test response:", authResponse.status);
            
            if (authResponse.ok) {
                const authData = await authResponse.json();
                console.log("Auth test data:", authData);
                
                // If auth works, test admin
                try {
                    const adminResponse = await api.testAdmin();
                    console.log("Admin test response:", adminResponse.status);
                    
                    if (adminResponse.ok) {
                        const adminData = await adminResponse.json();
                        console.log("Admin test data:", adminData);
                        // If admin works, fetch subscribers
                        fetchSubscribers();
                    } else {
                        const adminError = await adminResponse.json();
                        console.error("Admin test failed:", adminError);
                        toast.error(`Admin access failed: ${adminError.error}`);
                        setLoading(false);
                    }
                } catch (adminErr) {
                    console.error("Admin test error:", adminErr);
                    toast.error(`Admin test error: ${adminErr.message}`);
                    setLoading(false);
                }
            } else {
                const authError = await authResponse.json();
                console.error("Auth test failed:", authError);
                toast.error(`Authentication failed: ${authError.error}`);
                setLoading(false);
            }
        } catch (authErr) {
            console.error("Auth test error:", authErr);
            toast.error(`Authentication test error: ${authErr.message}`);
            setLoading(false);
        }
    };

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            console.log("Fetching subscribers...");
            const response = await api.getSubscribers();
            console.log("Response status:", response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log("Subscribers data:", data);
                setSubscribers(data.data || []);
            } else {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                toast.error(errorData.error || `Failed to fetch subscribers (${response.status})`);
            }
        } catch (error) {
            console.error("Error fetching subscribers:", error);
            toast.error(`Network error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, email) => {
        if (!window.confirm(`Are you sure you want to delete subscriber "${email}"?`)) {
            return;
        }

        try {
            setDeleting(id);
            const response = await api.deleteSubscriber(id);
            
            if (response.ok) {
                setSubscribers(subscribers.filter(sub => sub._id !== id));
                toast.success("Subscriber deleted successfully");
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to delete subscriber");
            }
        } catch (error) {
            console.error("Error deleting subscriber", error);
            toast.error("Failed to delete subscriber");
        } finally {
            setDeleting(null);
        }
    };

    const exportToCSV = () => {
        if (subscribers.length === 0) {
            toast.error("No subscribers to export");
            return;
        }

        const csvContent = [
            ['Email', 'Date Subscribed'],
            ...subscribers.map(sub => [
                sub.email,
                new Date(sub.date).toLocaleDateString()
            ])
        ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Subscribers exported successfully");
    };

    if (loading) {
        return (
            <div className="subscribers">
                <div className="loading">Loading subscribers...</div>
            </div>
        );
    }

    return (
        <div className="subscribers">
            <div className="subscribers-header">
                <h2>Newsletter Subscribers ({subscribers.length})</h2>
                <button className="export-btn" onClick={exportToCSV} disabled={subscribers.length === 0}>
                    Export to CSV
                </button>
            </div>
            
            {subscribers.length === 0 ? (
                <div className="no-subscribers">
                    <p>No newsletter subscribers found.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Date Subscribed</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((subscriber) => (
                                <tr key={subscriber._id}>
                                    <td data-label="Email">{subscriber.email}</td>
                                    <td data-label="Date Subscribed">
                                        {new Date(subscriber.date).toLocaleDateString()}
                                    </td>
                                    <td data-label="Actions">
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(subscriber._id, subscriber.email)}
                                            disabled={deleting === subscriber._id}
                                        >
                                            {deleting === subscriber._id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Subscribers;
