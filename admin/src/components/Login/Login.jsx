import React, { useState, useEffect, useContext } from 'react';
import './Login.css';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { DarkModeContext } from "../../context/DarkModeContext";

const Login = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin, login } = useAuth();
    const { darkMode } = useContext(DarkModeContext);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const onChangeHandler = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const success = await login(formData.email, formData.password);
            if (success) {
                setFormData({ email: "", password: "" });
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            navigate("/addproduct");
        }
    }, [isAuthenticated, isAdmin, navigate]);

    return (
        <div className={`login-popup ${darkMode ? 'dark-mode' : ''}`}>
            <form onSubmit={onLogin} className="login-popup-container">
                <h2 className="login-popup-title">Admin Login</h2>
                <div className="login-popup-inputs">
                    <input
                        name="email"
                        onChange={onChangeHandler}
                        value={formData.email}
                        type="email"
                        placeholder="Your email"
                        required
                        disabled={isLoading}
                    />
                    <input
                        name="password"
                        onChange={onChangeHandler}
                        value={formData.password}
                        type="password"
                        placeholder="Your password"
                        required
                        disabled={isLoading}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className={isLoading ? "loading" : ""}
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;
