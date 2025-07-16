import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter} from "react-router-dom";
import "./index.css";
import App from "./App";
import StoreContextProvider from "./context/StoreContext";
import DarkModeContextProvider from "./context/DarkModeContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <DarkModeContextProvider>
      <StoreContextProvider>
        <App />
      </StoreContextProvider>
    </DarkModeContextProvider>
  </BrowserRouter>
);

