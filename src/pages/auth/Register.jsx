import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  Building2,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  CloudUpload,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../services/api";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPreselected = !!location.state?.role;

  const getInitialForm = () => ({
  name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
  designation: "",
  institution_name: "",
  tax_avin_number: "",
  profile_image: null,
});


  //  role states
  const [selectedRole, setSelectedRole] = useState(null); // UI select
  const [role, setRole] = useState(null); // actual form

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

 const [form, setForm] = useState(getInitialForm());

  //  Handle URL role
  useEffect(() => {
  if (location.state?.role) {
    setSelectedRole(location.state.role);
    setRole(location.state.role);
  }
}, [location.state]);

useEffect(() => {
  if (role) {
    setForm(getInitialForm());
  }
}, [role]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;

    if (!/^\+?\d*$/.test(value)) return;
    if (value.includes("+") && value.indexOf("+") !== 0) return;
    if (value.length > 15) return;

    setForm({ ...form, phone: value });
  };

  const handleTaxChange = (e) => {
  const value = e.target.value;
  if (value.length > 15) return;
  setForm({ ...form, tax_avin_number: value });
};

const handleFileChange = (e) => {
  const file = e.target.files[0] || null;
  setForm({ ...form, profile_image: file });
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMsg("");
    setErrorMsg("");

    if (!role) {
      setErrorMsg("Please select a role");
      return;
    }

    if (!/^\+?\d{7,15}$/.test(form.phone)) {
      setErrorMsg("Please enter a valid phone number");
      return;
    }

    if (form.password !== form.password_confirmation) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (role === "principal" && form.tax_avin_number.trim().length > 15) {
      setErrorMsg("Tax/ ABN number must be 15 characters or less.");
      return;
    }

    if (role === "principal" && !form.profile_image) {
      setErrorMsg("Please upload your company logo");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries({
        name: form.name, email: form.email, phone: form.phone,
        password: form.password, password_confirmation: form.password_confirmation,
        role,
        ...(role === "principal" && {
          designation: form.designation,
          institution_name: form.institution_name,
          tax_avin_number: form.tax_avin_number,
        }),
      }).forEach(([k, v]) => formData.append(k, v));

      if (role === "principal" && form.profile_image) {
        formData.append("profile_image", form.profile_image);
      }

      const res = await api.post("/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status) {
        setSuccessMsg(res.message || "Account created successfully!");

        setForm({
          name: "",
          email: "",
          phone: "",
          password: "",
          password_confirmation: "",
          designation: "",
          institution_name: "",
          tax_avin_number: "",
        });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setErrorMsg(res.message || "Something went wrong");
      }
    } catch (err) {
      setErrorMsg(err?.message || "Server error, please try again later");
    } finally {
      setLoading(false);

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

            {/* ================= ROLE SELECTION ================= */}
            {!role && (
              <>
                <div className="text-center mb-4">
                  <h1 className="mb-1">Join as a employer or jobseeker</h1>
                </div>

                <div className="d-flex gap-3 mb-4">

                  {/* Employer */}
                  <div
                    className={`role-card ${selectedRole === "principal" ? "active" : ""}`}
                    onClick={() => setSelectedRole("principal")}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <Building2 size={28} />
                      <input
                        type="radio"
                        checked={selectedRole === "principal"}
                        readOnly
                      />
                    </div>
                    <h5 className="mt-3 text-start mb-0">
                      I'm a employer, hiring for a project
                    </h5>
                  </div>


                  {/* Teacher */}
                  <div
                    className={`role-card ${selectedRole === "teacher" ? "active" : ""}`}
                    onClick={() => setSelectedRole("teacher")}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <GraduationCap size={28} />
                      <input
                        type="radio"
                        checked={selectedRole === "teacher"}
                        readOnly
                      />
                    </div>
                    <h5 className="mt-3 text-start mb-0">
                      I'm a jobseeker, looking for work
                    </h5>
                  </div>

                  
                </div>

                <div className="d-flex justify-content-center">
                    <button
                      className="btn-post "
                      disabled={!selectedRole}
                      onClick={() => setRole(selectedRole)}
                    >
                      {
                        !selectedRole
                          ? "Create Account"
                          : selectedRole === "principal"
                          ? "Join as a Employer"
                          : "Apply as a Jobseeker"
                      }
                    </button>
                </div>

                <div className="text-center mt-3">
                  Already have an account?{" "}
                  <Link to="/login" className="text_blue fw-semibold">
                    Log In
                  </Link>
                </div>
              </>
            )}

            {/* ================= FORM ================= */}
            {role && (
              <>
                <div className="text-center mb-4">
                  <h1 className="mb-1">Create Account</h1>
                  <p className="text-muted mb-3">
                    Register as a {role === "teacher" ? "Jobseeker" : "Employer"}
                  </p>

                  {!isPreselected && (
                    <Link
                      type="button"
                      className=" text_theme p-0 mb-2"
                      onClick={() => {
                        setRole(null);
                        setSelectedRole(null);
                        setForm(getInitialForm()); // reset form
                      }}
                    >
                      <ArrowLeft size={17} /> Change Role
                    </Link>
                  )}
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

                  {/* Employer Extra Fields */}
                  {role === "principal" && (
                    <>
                      <div className="mb-3">
                        <label>
                          Designation <span className="text-danger">*</span>
                        </label>
                        <input
                          name="designation"
                          value={form.designation}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Director"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label>
                          Institution Name <span className="text-danger">*</span>
                        </label>
                        <input
                          name="institution_name"
                          value={form.institution_name}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="XYZ Institution"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label>
                          Tax ABN Number <span className="text-danger">*</span>
                        </label>
                        <input
                          name="tax_avin_number"
                          value={form.tax_avin_number}
                          onChange={handleTaxChange}         
                          className="form-control"
                          placeholder="e.g. 12 345 678 901"
                          maxLength={15}               
                          required
                        />
                        <small className="text-muted pt-2">
                          Maximum 15 characters allowed
                        </small>
                      </div>


                      <div className="mb-3">
                        <label>
                          Upload Logo <span className="text-danger">*</span>
                          
                        </label>

                        {!form.profile_image ? (
                          <div
                            className="  rounded-3 p-4 text-center text_theme"
                            style={{ cursor: "pointer", border: "2px dashed #ccc" }}
                            onClick={() => document.getElementById("logoInput").click()}
                          >
                            <input
                              id="logoInput"
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={handleFileChange}
                            />
                            <CloudUpload size={30} />
                          </div>
                        ) : (
                          <div className="d-flex align-items-center gap-2 mt-1 p-2 border rounded">
                            <img
                              src={URL.createObjectURL(form.profile_image)}
                              alt="logo preview"
                              style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
                            />
                            <span className="small flex-grow-1">{form.profile_image.name}</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-danger p-0"
                              onClick={() => setForm({ ...form, profile_image: null })}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                        <small className="text-muted mt-2">PNG, JPG, JPEG: Max 2 MB</small>
                      </div>
                    </>
                  )}

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
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Signup;