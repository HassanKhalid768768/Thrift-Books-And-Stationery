import React, {useState, useContext} from "react";
import {toast} from "react-toastify";
import './CSS/LoginSignup.css'
import { DarkModeContext } from "../context/DarkModeContext";
import { api } from '../utils/api';

const LoginSignup = () => {
    const { darkMode } = useContext(DarkModeContext);
    
    const [state, setState] = useState("Login");
    const [formData, setFormData] = useState({
        name:"",
        email:"",
        password:"",
    });
    
    const login = async () =>{
        const response = await api.login(formData);
        const json = await response.json();
        if(response.ok){
            localStorage.setItem("token", json.token);
            toast.success("You're logged in.");
            window.location.replace("/");
        }
        else{
            toast.error(json.error);
        }
    }

    const signup = async () =>{
        const response = await api.signup(formData);
        const json = await response.json();
        if(response.ok){
            localStorage.setItem('token',json.token);
            toast.success("Account created.")
            window.location.replace("/");
        }
        else{
            toast.error(json.error);
        }
    }

    const changeHandler = (e)=>{
        setFormData({...formData,[e.target.name]:e.target.value});
    }

    return (
            <div className={`loginsignup-container ${darkMode ? 'dark-mode' : ''}`}>
                <h1>{state}</h1>
                <div className="loginsignup-fields">
                    {state==='Sign Up'?<input name="name" value={formData.name} onChange={changeHandler} type="text" placeholder="Your Name"/>:<></>}
                    <input name="email" value={formData.email} onChange={changeHandler} type="email" placeholder="Email Address" />
                    <input name="password" value={formData.password} onChange={changeHandler} type="password" placeholder="Password"/>
                </div>
                <button onClick={()=>{state==='Login'?login():signup()}}>{state}</button>
                {state==='Sign Up'?
                <p className="loginsignup-login">
                    Already have an account? <span onClick={()=>{setState("Login")}}>Login</span>
                </p>:
                <p className="loginsignup-login">
                    Create an account? <span onClick={()=>{setState("Sign Up")}}>Click Here</span><br></br>
                </p>}
            </div>
     );
}
 
export default LoginSignup;