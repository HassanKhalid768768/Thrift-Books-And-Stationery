import React, { useState, useContext } from 'react';
import './CloudinaryManagement.css';
import { toast } from 'react-toastify';
import { DarkModeContext } from "../../context/DarkModeContext";
import { api } from '../../utils/api';

const CloudinaryManagement = () => {
    const { darkMode } = useContext(DarkModeContext);

    // Storage cleanup state
    const [orphans, setOrphans] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [cleaning, setCleaning] = useState(false);
    const [showCleanupResult, setShowCleanupResult] = useState(false);

    // Password protection state
    const [passwordInput, setPasswordInput] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);

    // Scan for orphaned images
    const handleScanOrphans = async () => {
        setScanning(true);
        setShowCleanupResult(false);
        try {
            const response = await api.getOrphanedImages();
            if (!response.ok) throw new Error("Failed to scan for orphans");
            const data = await response.json();
            setOrphans(data.orphans || []);
            toast.info(`Found ${data.count} unused images.`);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setScanning(false);
        }
    };

    // Cleanup orphaned images
    const handleCleanupCloudinary = async () => {
        if (!isUnlocked) {
            toast.error("Security lock active. Please enter the password.");
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${orphans.length} unused images from Cloudinary? This action cannot be undone.`)) {
            return;
        }

        setCleaning(true);
        try {
            const response = await api.cleanupCloudinary();
            if (!response.ok) throw new Error("Cleanup failed");
            const data = await response.json();
            toast.success(data.message);
            setOrphans([]);
            setShowCleanupResult(true);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCleaning(false);
        }
    };

    return (
        <div className={`cloudinary-management-container ${darkMode ? 'dark-mode' : ''}`}>
            <h1>Cloudinary Storage Management</h1>

            <section className="storage-management-section">
                <div className="storage-header">
                    <h2>Storage Sync & Cleanup</h2>
                    <p className="storage-description">
                        Scan Cloudinary for images that are no longer linked to any products or reviews in the database.
                        This helps keep your storage clean and organized.
                    </p>
                </div>

                <div className="storage-actions">
                    {!isUnlocked ? (
                        <div className="storage-unlock-form">
                            <input
                                type="password"
                                placeholder="Enter Access Password..."
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className="storage-password-input"
                            />
                            <button
                                className="unlock-btn"
                                onClick={() => {
                                    if (passwordInput === 'ASKHASSAN') {
                                        setIsUnlocked(true);
                                        toast.success("Storage Tools Unlocked");
                                    } else {
                                        toast.error("Incorrect Password");
                                    }
                                }}
                            >
                                Unlock Storage Tools
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                className="scan-btn"
                                onClick={handleScanOrphans}
                                disabled={scanning || cleaning}
                            >
                                {scanning ? 'Scanning...' : 'Scan for Unused Images'}
                            </button>

                            {orphans.length > 0 && (
                                <div className="orphan-result-container">
                                    <div className="orphan-result-header">
                                        <span className="orphan-count">Found <strong>{orphans.length}</strong> unused images.</span>
                                        <div className="orphan-btn-group">
                                            <button
                                                className="cleanup-btn"
                                                onClick={handleCleanupCloudinary}
                                                disabled={cleaning}
                                            >
                                                {cleaning ? 'Cleaning...' : 'Delete All Unused Images'}
                                            </button>
                                            <button
                                                className="clear-results-btn"
                                                onClick={() => {
                                                    setOrphans([]);
                                                    setIsUnlocked(false);
                                                    setPasswordInput('');
                                                }}
                                                disabled={cleaning}
                                            >
                                                Clear & Lock
                                            </button>
                                        </div>
                                    </div>

                                    <div className="orphan-gallery">
                                        {orphans.map((orphan, idx) => (
                                            <div key={idx} className="orphan-card">
                                                <img
                                                    src={orphan.url}
                                                    alt={`Orphan ${idx}`}
                                                    onClick={() => window.open(orphan.url, '_blank')}
                                                />
                                                <div className="orphan-id-tooltip" title={orphan.public_id}>
                                                    {orphan.public_id}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {showCleanupResult && orphans.length === 0 && !scanning && (
                                <p className="cleanup-success-msg">✅ Storage is currently clean and synced with Database.</p>
                            )}
                        </>
                    )}
                </div>
            </section>

            <div className="cloudinary-info-cards">
                <div className="info-card">
                    <h3>Why Cleanup?</h3>
                    <p>Over time, deleted products or reviews might leave behind "orphaned" images in your Cloudinary storage, taking up unnecessary space.</p>
                </div>
                <div className="info-card">
                    <h3>Automated Sync</h3>
                    <p>Regular deletions within the app are already automated. This tool is for manual deep-cleaning and resolving any discrepancies.</p>
                </div>
                <div className="info-card security-card">
                    <h3>Security First</h3>
                    <p>Bulk deletion is a destructive action. Always preview images before confirming the cleanup process.</p>
                </div>
            </div>
        </div>
    );
};

export default CloudinaryManagement;
