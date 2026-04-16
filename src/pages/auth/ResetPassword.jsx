import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../services/api";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    password: "",
    password_confirmation: "",
  });

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");

  const location = useLocation();

  //  GET PARAMS FROM URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const tokenParam = params.get("token");
    const emailParam = params.get("email");

      //  If missing → redirect
      if (!tokenParam || !emailParam) {
        toast.error("Invalid or expired reset link");
        navigate("/forgot-password", { replace: true });
        return;
      }

      //  If present → set state
      setToken(tokenParam);
      setEmail(emailParam);

  }, [location.search, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  setErrorMsg("");
  setSuccessMsg("");

  if (form.password !== form.password_confirmation) {
    setErrorMsg("Passwords do not match");
    return;
  }

  setLoading(true);

  try {
   const response = await api.post("/reset-password", {
    email,
    token,
    password: form.password,
    password_confirmation: form.password_confirmation,
  });

  const res = response;

    if (res?.status == true) {
  setSuccessMsg(res.message);

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  } else {
    setErrorMsg(res?.message || "Something went wrong");
  }
  } catch (err) {
    console.log("FULL ERROR:", err);

    const apiMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Something went wrong";

    setErrorMsg(apiMessage);
  } finally {
    setLoading(false);
  }
};
  return (
    <>
      <div className="auth-wrapper wrapper-width blue_nav">
        <Navbar />

        <div className="auth-page d-flex align-items-center justify-content-center">
          <div className="auth-card">
            {/* Header */}
            <div className="text-center mb-4">
              {/* <Link to="/">
                <img src="/images/logo_new.png" className="logo mb-4" alt="logo" />
              </Link> */}
              <h1 className="mb-1">Reset Password</h1>
              <small className="text-muted">
                Create a new password for your account
              </small>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Password */}
              <div className="mb-3">
                <label>
                  New Password <span className="text-danger">*</span>
                </label>
                <div className="input-icon password-field">
                  <Lock size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter password"
                    required
                  />
                  <span
                    className="eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label>
                  Confirm Password <span className="text-danger">*</span>
                </label>
                <div className="input-icon password-field">
                  <Lock size={18} />
                  <input
                    type={showPassword1 ? "text" : "password"}
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter password"
                    required
                  />
                  <span
                    className="eye"
                    onClick={() => setShowPassword1(!showPassword1)}
                  >
                    {showPassword1 ? <Eye size={18} /> : <EyeOff size={18} />}
                  </span>
                </div>
              </div>

              {/* ✅ Messages */}
              {errorMsg && (
                <p className="text-danger text-center">{errorMsg}</p>
              )}
              {successMsg && (
                <p className="text-success text-center">{successMsg}</p>
              )}

              {/* Button */}
              <button
                type="submit"
                className="btn-post w-100"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            {/* Back */}
            <div className="text-center mt-3">
              <Link to="/login" className="text_blue fw-semibold">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>

            {/* Footer */}
            <p className="terms text-center mt-4 small mb-0">
              By continuing, you agree to our{" "}
              <Link to="/terms-and-conditions">Terms of Service</Link> and{" "}
              <Link to="/privacy-policy">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ResetPassword;