import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// Use App.js (full admin with Sidebar, Categories, etc.). App.jsx is an alternate minimal version.
import App from "./App.js";
import { BrowserRouter } from "react-router-dom";
import DarkModeContextProvider from "./context/DarkModeContext";
import { AuthProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <DarkModeContextProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </DarkModeContextProvider>
  </BrowserRouter>
);
