import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { auth as authAPI } from "../services/api";
import toast from "react-hot-toast";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      
      // Store token and user in localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      // Update auth context
      login(response.user);
      
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow-lg border-0 rounded-3">
              <div className="card-body p-5">
                
                {/* Header */}
                <div className="text-center mb-5">
                  <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                    <div className="bg-primary p-2 rounded" style={{ color: "white" }}>
                      <Package size={28} />
                    </div>
                    <div>
                      <h2 className="mb-0 fw-bold">Supply Ledger</h2>
                      <small className="text-muted">Smart Logistics</small>
                    </div>
                  </div>
                </div>

                <h4 className="text-center mb-2 fw-semibold">Welcome Back</h4>
                <p className="text-center text-muted mb-4">
                  Sign in to manage your shipments
                </p>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-medium">Email Address</label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    disabled={loading}
                  />
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="form-label fw-medium">Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    disabled={loading}
                  />
                </div>

                {/* Button */}
                <button
                  className="btn btn-primary btn-lg w-100 mb-3"
                  disabled={loading || !email || !password}
                  onClick={handleLogin}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>

                {/* Demo Info */}
                <div className="alert alert-info small mb-0" role="alert">
                  <strong>Demo Mode:</strong> Use any email and password to sign in
                </div>
              </div>
            </div>

            <p className="text-center text-muted mt-3 small">
              Don't have an account? <a href="#" className="link-primary" onClick={(e) => { e.preventDefault(); navigate("/signup"); }}>Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
