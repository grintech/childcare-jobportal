import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  Building2,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../services/api";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
  let value = e.target.value;

  // Allow only numbers and +
  if (!/^\+?\d*$/.test(value)) return;

  // Ensure + is only at first position
  if (value.includes("+") && value.indexOf("+") !== 0) return;

  // Max length 15
  if (value.length > 15) return;

  setForm({ ...form, phone: value });
};


const handleSubmit = async (e) => {
  e.preventDefault();

  setSuccessMsg("");
  setErrorMsg("");

  // Phone validation
  if (!/^\+?\d{7,15}$/.test(form.phone)) {
    setErrorMsg("Please enter a valid phone number");
    
    setTimeout(() => {
      setErrorMsg("");
    }, 2000);

    return;
  }

  if (form.password !== form.password_confirmation) {
    setErrorMsg("Passwords do not match");
    return;
  }

  setLoading(true);


  try {
    const payload = {
      ...form,
      role: "teacher",
    };

    const res = await api.post("/register", payload);

    // 🔥 handle custom API response
    if (res.status) {
      setSuccessMsg(res.message || "Account created successfully!");

      // reset form
    setForm({
  name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
});

      setTimeout(() => {
        navigate('/login')
      }, 2000);
      
    } else {
      setErrorMsg(res.message || "Something went wrong");
    }
  } catch (err) {
    setErrorMsg(
      err?.message || "Server error, please try again later"
    );
  } finally {
    setLoading(false);

    // auto hide after 2 sec
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  }
};

  return (
    <>
      <div className="auth-wrapper">
        <Navbar />
        <div className="auth-page d-flex align-items-center justify-content-center">
          <div className="auth-card">
            <div className="text-center mb-4">
              <Link to="/">
                <img src="/images/logo.png" className="logo mb-4" alt="" />
              </Link>
              <h1 className="mb-1">Create Account</h1>
              <p className="text-muted mb-3">Register as a Jobseeker</p>
            </div>

          

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="mb-3">
                <label>
                  Full Name <span className="text-danger">*</span>
                </label>
                <div className="input-icon">
                  <User size={18} />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>


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
                    placeholder="yourmail@123.com"
                    className="form-control"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="mb-3">
                <label>
                  Phone <span className="text-danger">*</span>
                </label>
                <div className="input-icon">
                  <Phone size={18} />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    className="form-control"
                    placeholder="+61 123 123 123"
                    maxLength={15}
                    required
                  />
                </div>
                  <small className="text-muted pt-2">
                    Only numbers and + (at the beginning) allowed
                  </small>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label>
                  Password <span className="text-danger">*</span>
                </label>
                <div className="input-icon password-field">
                  <Lock size={18} />
                  <input
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    className="form-control"
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
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    type={showPassword2 ? "text" : "password"}
                    className="form-control"
                  />
                  <span
                    className="eye"
                    onClick={() => setShowPassword2(!showPassword2)}
                  >
                    {showPassword2 ? <Eye size={18} /> : <EyeOff size={18} />}
                  </span>
                </div>
              </div>

              {/*  Messages */}
              {errorMsg && (
                <p className="text-danger text-center">{errorMsg}</p>
              )}
              {successMsg && (
                <p className="text-success text-center">{successMsg}</p>
              )}

              <button
                type="submit"
                className="btn-post w-100"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>

            <div className="text-center mt-3">
              Already have an account?{" "}
              <Link to="/login" className="text_blue fw-semibold">
                Login
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
    </>
  );
};

export default Signup;