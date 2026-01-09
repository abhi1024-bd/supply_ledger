import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  LogOut,
  User,
  Settings,
  BarChart3,
  List,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

function Navigation() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);

  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + "/");

  const go = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* TOP NAVBAR */}
      <nav className="navbar bg-light shadow-sm ">
        <div className="container-fluid">
          <div
            className="mx-auto d-flex align-items-center w-100"
            style={{ maxWidth: "1440px" }}
          >
            {/* BRAND */}
            <div
              className="d-flex align-items-center gap-2"
              style={{ cursor: "pointer" }}
              onClick={() => go("/dashboard")}
            >
              <div className="bg-primary p-2 rounded text-white">
                <Package size={22} />
              </div>
              <span className="fw-bold fs-5">Supply Ledger</span>
            </div>

            {/* MENU BUTTON */}
            <button
              className="btn btn-outline-secondary ms-auto"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* BACKDROP */}
      {open && (
        <div
          className="menu-backdrop"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDE DRAWER */}
      <div className={`side-menu ${open ? "open" : ""}`}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0">Menu</h5>
          <button className="btn btn-light" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <NavItem active={isActive("/dashboard")} onClick={() => go("/dashboard")}>
          Dashboard
        </NavItem>

        <NavItem active={isActive("/create-order")} onClick={() => go("/create-order")}>
          <Plus size={16} className="me-2" />
          Create Order
        </NavItem>

        <NavItem active={isActive("/orders")} onClick={() => go("/orders")}>
          <List size={16} className="me-2" />
          Orders
        </NavItem>

        <NavItem active={isActive("/analytics")} onClick={() => go("/analytics")}>
          <BarChart3 size={16} className="me-2" />
          Analytics
        </NavItem>

        <hr />

        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-light" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn btn-light" onClick={() => go("/settings")}>
            <Settings size={18} />
          </button>
          <button className="btn btn-light" onClick={() => go("/profile")}>
            <User size={18} />
          </button>
        </div>

        <div className="mb-3">
          <div className="fw-semibold">{user?.name}</div>
          <small className="text-muted">{user?.email}</small>
        </div>

        <button
          className="btn btn-outline-danger w-100"
          onClick={handleLogout}
        >
          <LogOut size={16} className="me-2" />
          Logout
        </button>
      </div>
    </>
  );
}

function NavItem({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`btn w-100 text-start mb-2 ${
        active ? "btn-primary" : "btn-outline-secondary"
      }`}
    >
      {children}
    </button>
  );
}

export default Navigation;
