import { ToastContainer } from "react-toastify";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login/Login";
import AddProduct from "./components/AddProduct/AddProduct";
import ListProduct from "./components/ListProduct/ListProduct";
import ListOrder from "./components/ListOrder/ListOrder";
import ManageCoupons from "./components/ManageCoupons/ManageCoupons";
import ReviewManagement from "./components/ReviewManagement/ReviewManagement";
import AdminMessages from "./components/AdminMessages/AdminMessages";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { useContext } from 'react';
import { DarkModeContext } from './context/DarkModeContext';

function App() {
  // Get the dark mode state from context
  const { darkMode } = useContext(DarkModeContext);
  
  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={darkMode ? "dark" : "light"}
          toastClassName={darkMode ? 'Toastify__toast--dark' : 'Toastify__toast--light'}
          limit={3}
        />
        <Navbar />
        <Routes>
          {/* Public route - Login */}
          <Route path="/" element={<Login />} />

          {/* Protected admin routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/addproduct" element={<AddProduct />} />
            <Route path="/listproduct" element={<ListProduct />} />
            <Route path="/listorder" element={<ListOrder />} />
            <Route path="/managecoupons" element={<ManageCoupons />} />
            <Route path="/reviews" element={<ReviewManagement />} />
            <Route path="/messages" element={<AdminMessages />} />
          </Route>

          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
}

export default App;
