import { useState, createContext, useEffect } from "react";

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };