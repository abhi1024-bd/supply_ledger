import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { OrderProvider } from "./context/OrderContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";

// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

// Bootstrap JS (FOR INTERACTIVE COMPONENTS LIKE NAVBAR TOGGLE)
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <OrderProvider>
          <App />
          <Toaster position="top-right" />
        </OrderProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
