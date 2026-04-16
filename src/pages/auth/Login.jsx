import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showResend, setShowResend] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);


  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setErrorMsg("");
  setSuccessMsg("");
  setShowResend(false);

  try {
    const res = await api.post("/login", form);

    if (res.status) {
      setSuccessMsg(res.message || "Login successful!");

      login({
        user: res.user,
        token: res.token,
      });


      const role = res.user?.role;

      setTimeout(() => {
        //  Show redirect message
        setIsRedirecting(true);
      }, 1000);

      setTimeout(() => {
        if (role === "teacher") {
          navigate("/profile", { replace: true });
        } else if (role === "principal" || role === "super_admin") {
          const redirectUrl = `${import.meta.env.VITE_WEBSITE_URL}/session-login?token=${res.token}`;
          window.location.replace(redirectUrl); //  no flicker
        } else {
          navigate("/", { replace: true });
        }
      }, 1500); 
    }
  } catch (err) {
    console.log("ERROR DATA:", err);

    setErrorMsg(err.message || "Login failed");

    if (err.type === "notVerified") {
      setShowResend(true);
    }
  } finally {
    setLoading(false);
  }
};


  //  RESEND EMAIL
  const handleResend = async () => {
    setResendLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await api.post("/email/resend", {
        email: form.email,
      });

      if (res.status) {
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg(err?.message || "Failed to resend email");
    } finally {
      setResendLoading(false);

      setTimeout(() => {
        setErrorMsg("");
        setSuccessMsg("");
      }, 2000);
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
                <img src="/images/logo3.png" className="logo mb-4" alt="logo" />
              </Link> */}
              <h1 className="mb-1">Login here!</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-3">
                <label>
                  Email <span className="text-danger">*</span>
                </label>
                <div className="input-icon">
                  <Mail size={18} />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label>
                  Password <span className="text-danger">*</span>
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

              {/*  Messages */}
              {errorMsg && (
                <p className="text-danger text-center ">{errorMsg}</p>
              )}
              {successMsg && (
                <p className="text-success text-center ">{successMsg}</p>
              )}


              {/*  Resend Link (only when not verified) */}
              {showResend && (
                <div className="text-end my-2">
                  <button
                    type="button"
                    className="text_blue"
                    style={{ textDecoration: "underline", border: "none", background: "none" }}
                    onClick={handleResend}
                    disabled={resendLoading}
                  >
                    {resendLoading
                      ? "Sending..."
                      : "Resend Verification Link"}
                  </button>
                </div>
              )}

              {/* Button */}
              <button
                type="submit"
                className="btn-post w-100"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="text-center mt-3">
              <Link to="/forgot-password" className="text_theme">
                Forgot Password ?
              </Link>
            </div>

            <div className="text-center mt-3">
              Don’t have an account?{" "}
              <Link to="/signup" className="text_blue fw-semibold">
                Sign up
              </Link>
            </div>

            <p className="terms text-center mt-4 small mb-0">
              By continuing, you agree to our{" "}
              <Link to="/terms-and-conditions">Terms of Service</Link> and{" "}
              <Link to="/privacy-policy">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />

      {isRedirecting && (
      <div className="redirect-overlay">
        <div class="spinner-border text_theme" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Redirecting Please wait...</p>
      </div>
    )}
    </>
  );
};

export default Login;