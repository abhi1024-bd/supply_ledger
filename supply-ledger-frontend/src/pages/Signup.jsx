// src/pages/Signup.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { users as usersAPI } from "../services/api";
import toast from "react-hot-toast";

function Signup() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSignup = async () => {
    setError("");

    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!formData.acceptTerms) {
      setError("Please accept the terms and conditions");
      toast.error("Please accept the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      const newUser = await usersAPI.register({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        company_name: formData.company,
      });

      // Store user and login
      localStorage.setItem("user", JSON.stringify(newUser));
      login(newUser);
      
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Signup failed");
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
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

                <h4 className="text-center mb-2 fw-semibold">Create Account</h4>
                <p className="text-center text-muted mb-4">
                  Join us to manage your supply chain efficiently
                </p>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError("")}
                    ></button>
                  </div>
                )}

                {/* Full Name */}
                <div className="mb-3">
                  <label className="form-label fw-medium">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-medium">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>

                {/* Company */}
                <div className="mb-3">
                  <label className="form-label fw-medium">Company (Optional)</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    placeholder="Your Company Name"
                    disabled={loading}
                  />
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label fw-medium">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <small className="text-muted">At least 6 characters</small>
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className="form-label fw-medium">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>

                {/* Terms Checkbox */}
                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className="form-check-input"
                    id="terms"
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor="terms">
                    I agree to the{" "}
                    <a href="#" className="link-primary">
                      Terms and Conditions
                    </a>
                  </label>
                </div>

                {/* Button */}
                <button
                  className="btn btn-primary btn-lg w-100 mb-3"
                  disabled={loading}
                  onClick={handleSignup}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Creating Account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </button>

                {/* Sign In Link */}
                <p className="text-center text-muted small">
                  Already have an account?{" "}
                  <a
                    href="#"
                    className="link-primary fw-semibold"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/login");
                    }}
                  >
                    Sign in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
