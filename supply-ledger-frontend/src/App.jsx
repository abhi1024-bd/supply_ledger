// src/App.jsx
import { useContext } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { ThemeContext } from "./context/ThemeContext";
import Login from "./pages/login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateOrder from "./pages/Createorder";
import UserProfile from "./pages/UserProfile";
import OrdersList from "./pages/OrdersList";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import OrderDetails from "./pages/OrderDetails";

export default function App() {
  const { isAuthenticated } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-order" element={<CreateOrder />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      )}
    </div>
  );
}
