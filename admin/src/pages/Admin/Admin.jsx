/* This file has been removed as its functionality is now handled by App.js and ProtectedRoute component.
All routes have been moved to App.js and wrapped with ProtectedRoute for authentication.

import React from "react";
import './Admin.css';
import Sidebar from "../../components/Sidebar/Sidebar";
import {Routes,Route} from 'react-router-dom';
import AddProduct from "../../components/AddProduct/AddProduct";
import ListProduct from "../../components/ListProduct/ListProduct";
import ListOrder from "../../components/ListOrder/ListOrder";
import ManageCoupons from "../../components/ManageCoupons/ManageCoupons";
import ReviewManagement from "../../components/ReviewManagement/ReviewManagement";
import Login from "./../../components/Login/Login";
import AdminMessages from "../../components/AdminMessages/AdminMessages";

const Admin = () => {
    return ( 
        <div className="admin">
            <Sidebar/>
            <Routes>
                <Route path='/' element={<Login/>}/>
                <Route path='/addproduct' element={<AddProduct/>}/>
                <Route path='/listproduct' element={<ListProduct/>}/>
                <Route path="/listorder" element={<ListOrder/>}/>
                <Route path="/managecoupons" element={<ManageCoupons/>}/>
                <Route path="/reviews" element={<ReviewManagement/>}/>
                <Route path="/messages" element={<AdminMessages/>}/>
            </Routes>
        </div>
    );
}
 
export default Admin;
*/
