import React, { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  //  SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await api.post("/forgot-password", { email });

      //  Success response (comes in try)
      if (res.status == true) {
        setSuccessMsg(res.message);
        setEmail('')
      }

    } catch (err) {
      //  Error response (comes in catch because of interceptor)
      setErrorMsg(err.message || "Something went wrong");
    } finally {
      setLoading(false);

      setTimeout(() => {
        setErrorMsg("");
        setSuccessMsg("");
      }, 3000);
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
              <h1 className="mb-1">Forgot Password</h1>
              <small className="text-muted">
                Enter your email and we’ll send you a reset link
              </small>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-3">
                <label>
                  Email <span className="text-danger">*</span>
                </label>
                <div  className="input-icon">
                  <Mail size={18} />
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Messages */}
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
                {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;