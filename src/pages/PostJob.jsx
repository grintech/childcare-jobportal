import React, { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { UploadCloud, X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext"; // adjust path if needed
import { useNavigate } from "react-router-dom";

// const BASE_URL = "https://childcrm.grincloudhost.com/public/api";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const INITIAL_FORM = {
  title: "",
  category: "",
  description: "",
  skills: [],
  note: "",
  jobType: "",
  workMode: "",
  duration: "",
  durationType: "",
  expMin: "",
  expMax: "",
  address: "",
  city: "",
  state: "",
  country: "",
  latitude: "",
  longitude: "",
  minSalary: "",
  maxSalary: "",
  negotiable: false,
  videoUrl: "",
  images: [],
  applyUrl: "",
  deadline: "",
};

const INITIAL_EMPLOYER = {
  name: "",
  role: "principal",
  designation: "",
  institution_name: "",
  tax_avin_number: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
};

const PasswordInput = ({ placeholder, value, onChange, showState, toggleShow, hasError }) => {
  return (
    <div style={{ position: "relative" }}>
      <input
        type={showState ? "text" : "password"}
        className={`form-control ${hasError ? "is-invalid" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ paddingRight: "2.75rem" }}
      />
      <button
        type="button"
        onClick={toggleShow}
        tabIndex={-1}
        style={{
          position: "absolute",
          top: "50%",
          right: "10px",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          color: "#9ca3af",
          display: "flex",
          alignItems: "center",
        }}
      >
        {showState ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
};

const PostJob = () => {
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [skillInput, setSkillInput] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
  const [isAddressSelected, setIsAddressSelected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [errors, setErrors] = useState({});
  const [authErrors, setAuthErrors] = useState({});
  const [apiMessage, setApiMessage] = useState({ text: "", success: null });
  const [loading, setLoading] = useState(false);

  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [employerData, setEmployerData] = useState(INITIAL_EMPLOYER);

  const categories = [
    "Childcare Centre Manager",
    "Childcare Assistant Centre Manager",
    "Early Childhood Teacher",
    "Childcare Lead Educator",
    "Childcare Assistant Educator",
    "Childcare Cook",
  ];

  // ── Google Places ────────────────────────────────────────────────────────────
  const onPlaceChanged = () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place || !place.address_components) return;

    let city = "", state = "", country = "";
    place.address_components.forEach((comp) => {
      const types = comp.types;
      if (types.includes("locality")) city = comp.long_name;
      if (!city && types.includes("administrative_area_level_2")) city = comp.long_name;
      if (types.includes("administrative_area_level_1")) state = comp.long_name;
      if (types.includes("country")) country = comp.long_name;
    });

    const lat = place.geometry?.location?.lat() ?? "";
    const lng = place.geometry?.location?.lng() ?? "";

    setFormData(prev => ({
      ...prev,
      address: place.formatted_address || "",
      city, state, country, latitude: lat, longitude: lng,
    }));
    setIsAddressSelected(true);
    if (errors.address) setErrors(prev => ({ ...prev, address: "" }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleEmployerChange = (field, value) => {
    setEmployerData(prev => ({ ...prev, [field]: value }));
    if (authErrors[field]) setAuthErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      address: value,
      ...(!value && { city: "", state: "", country: "", latitude: "", longitude: "" }),
    }));
    setIsAddressSelected(false);
    if (errors.address) setErrors(prev => ({ ...prev, address: "" }));
  };

  // ── Step Validation ──────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!formData.title.trim()) e.title = "Job title is required.";
    if (!formData.category) e.category = "Category is required.";
    if (!formData.description || formData.description === "<p><br></p>") e.description = "Description is required.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateStep2 = () => {
  const e = {};

  const minExp = Number(formData.expMin);
  const maxExp = Number(formData.expMax);

  if (!formData.jobType) e.jobType = "Job type is required.";
  if (!formData.workMode) e.workMode = "Work mode is required.";

  if (!formData.durationType)
  e.durationType = "Please select a duration type.";

if (formData.durationType && !formData.duration)
  e.duration = "Duration is required.";

  if (formData.expMin && minExp <= 0)
    e.expMin = "Min experience must be greater than 0.";

  if (formData.expMax && maxExp <= 0)
    e.expMax = "Max experience must be greater than 0.";

  if (minExp && maxExp && maxExp < minExp)
    e.expMax = "Max experience cannot be less than min.";

  if (!formData.address.trim() || !isAddressSelected)
    e.address = "Please select a valid address from suggestions.";

  setErrors(e);
  return !Object.keys(e).length;
};

  const validateStep3 = () => {
  const e = {};

  const min = Number(formData.minSalary);
  const max = Number(formData.maxSalary);

  if (!formData.minSalary || min <= 0)
    e.minSalary = "Min salary must be greater than 0.";

  if (!formData.maxSalary || max <= 0)
    e.maxSalary = "Max salary must be greater than 0.";

  if (min && max && max < min)
    e.maxSalary = "Max salary cannot be less than min salary.";

  setErrors(e);
  return !Object.keys(e).length;
};

  const next = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(prev => prev + 1);
  };

  const back = () => { setErrors({}); setStep(prev => prev - 1); };

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      handleChange("skills", [...formData.skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (i) => handleChange("skills", formData.skills.filter((_, idx) => idx !== i));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    handleChange("images", [...formData.images, ...files].slice(0, 5));
  };

  // ── Reset all state & redirect ───────────────────────────────────────────────
  const resetAndRedirect = (token) => {
    setFormData(INITIAL_FORM);
    setEmployerData(INITIAL_EMPLOYER);
    setStep(1);
    setSkillInput("");
    setIsAddressSelected(false);
    setErrors({});
    setAuthErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowModal(false);
    // window.location.href = `https://childcrm.grincloudhost.com/public/session-login?token=${token}`;

    setIsRedirecting(true);

    setTimeout(() => {
        window.location.href = `https://childcrm.grincloudhost.com/public/session-login?token=${token}`;
    }, 1000);
  };

  // ── Build job FormData payload ───────────────────────────────────────────────
  const buildJobPayload = () => {
    const jobTypeMap = {
      "Full Time": "full_time", "Part Time": "part_time",
      "Contract": "contract", "Internship": "internship", "Freelance": "freelance",
    };
    const workModeMap = { "Remote": "remote", "Hybrid": "hybrid", "Onsite": "onsite" };

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("job_category", formData.category);
    payload.append("job_type", jobTypeMap[formData.jobType] || formData.jobType.toLowerCase());
    payload.append("work_mode", workModeMap[formData.workMode] || formData.workMode.toLowerCase());
    payload.append("duration_type", formData.durationType);
    payload.append("duration", formData.duration);
    payload.append("additional_note", formData.note);
    payload.append("experience_min", formData.expMin);
    payload.append("experience_max", formData.expMax);
    payload.append("salary_min", formData.minSalary);
    payload.append("salary_max", formData.maxSalary);
    payload.append("salary_negotiable", formData.negotiable ? 1 : 0);
    payload.append("address", formData.address);
    payload.append("country", formData.country);
    payload.append("state", formData.state);
    payload.append("city", formData.city);
    payload.append("latitude", formData.latitude);
    payload.append("longitude", formData.longitude);
    payload.append("skills", JSON.stringify(formData.skills));
    payload.append("apply_type", formData.applyUrl.trim() ? "external" : "internal");
    payload.append("apply_url", formData.applyUrl);
    payload.append("expires_at", formData.deadline);
    formData.images.forEach((file) => payload.append("images[]", file));
    if (formData.videoUrl.trim()) payload.append("videos", formData.videoUrl);
    return payload;
  };

  const postJob = async (token) => {
    const res = await fetch(`${BASE_URL}/post-a-job`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: buildJobPayload(),
    });
    return res.json();
  };

  // ── Login → Post Job ─────────────────────────────────────────────────────────
  const handleLogin = async () => {
    const e = {};
    if (!employerData.email.trim()) e.email = "Email is required.";
    if (!employerData.password.trim()) e.password = "Password is required.";
    if (Object.keys(e).length) { setAuthErrors(e); return; }

    setLoading(true);
    setApiMessage({ text: "", success: null });

    try {
      const loginRes = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: employerData.email, password: employerData.password, type: "principal" }),
      });
      const loginData = await loginRes.json();

      if (!loginData.status) {
        setApiMessage({ text: loginData.message || "Login failed.", success: false });
        setLoading(false);
        return;
      }

      // Save to context + localStorage
      login({ user: loginData.user, token: loginData.token });

      const jobData = await postJob(loginData.token);
      setApiMessage({
        text: jobData.message || (jobData.status ? "Job posted successfully!" : "Failed to post job."),
        success: jobData.status,
      });

      if (jobData.status) {
        setTimeout(() => resetAndRedirect(loginData.token), 1500);
      }
    } catch {
      setApiMessage({ text: "Network error. Please try again.", success: false });
    }

    setLoading(false);
  };

  // ── Signup → Post Job ────────────────────────────────────────────────────────
const handleSignup = async () => {
  const e = {};
  if (!employerData.name.trim()) e.name = "Full name is required.";
  if (!employerData.designation.trim()) e.designation = "Designation is required.";
  if (!employerData.institution_name.trim()) e.institution_name = "Institution name is required.";
  if (!employerData.tax_avin_number.trim()) e.tax_avin_number = "Tax / ABN number is required.";
  if (!employerData.email.trim()) e.email = "Email is required.";
  if (!employerData.phone.trim()) e.phone = "Phone is required.";
  if (!employerData.password.trim()) e.password = "Password is required.";
  if (!employerData.password_confirmation.trim()) e.password_confirmation = "Please confirm your password.";
  else if (employerData.password !== employerData.password_confirmation)
    e.password_confirmation = "Passwords do not match.";
  if (Object.keys(e).length) { setAuthErrors(e); return; }

  setLoading(true);
  setApiMessage({ text: "", success: null });

  try {
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: employerData.name,
        role: employerData.role,
        email: employerData.email,
        password: employerData.password,
        password_confirmation: employerData.password_confirmation,
        designation: employerData.designation,
        institution_name: employerData.institution_name,
        phone: employerData.phone,
        tax_avin_number: employerData.tax_avin_number,
      }),
    });
    const regData = await regRes.json();

    if (!regData.status) {
      setApiMessage({ text: regData.message || "Registration failed.", success: false });
      setLoading(false);
      return;
    }

    // ✅ Do NOT save to context/localStorage
    const jobData = await postJob(regData.token);
    setApiMessage({
      text: jobData.message || (jobData.status ? "Job posted successfully!" : "Failed to post job."),
      success: jobData.status,
    });

    if (jobData.status) {
      // Clear all form state
      setFormData(INITIAL_FORM);
      setEmployerData(INITIAL_EMPLOYER);
      setStep(1);
      setSkillInput("");
      setIsAddressSelected(false);
      setErrors({});
      setAuthErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);

      // Redirect to /login after 2 seconds
      setTimeout(() => {
        setShowModal(false);
        navigate("/login")
      }, 2000);
    }
  } catch {
    setApiMessage({ text: "Network error. Please try again.", success: false });
  }

  setLoading(false);
};


  const handleSubmitClick = () => {
    if (!validateStep3()) return;
    setApiMessage({ text: "", success: null });
    setAuthErrors({});
    setShowModal(true);
  };

  const switchTab = (mode) => {
    setAuthMode(mode);
    setApiMessage({ text: "", success: null });
    setAuthErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const Err = ({ field, map = errors }) =>
    map[field] ? <div className="text-danger small mt-1">{map[field]}</div> : null;

  // ── Reusable password field with Eye toggle ──────────────────────────────────


//   const PasswordInput = ({ placeholder, value, onChange, showState, toggleShow, hasError }) => (
//     <div style={{ position: "relative" }}>
//       <input
//         type={showState ? "text" : "password"}
//         className={`form-control ${hasError ? "is-invalid" : ""}`}
//         placeholder={placeholder}
//         value={value}
//         onChange={onChange}
//         style={{ paddingRight: "2.75rem" }}
//       />
//       <button
//         type="button"
//         onClick={toggleShow}
//         tabIndex={-1}
//         style={{
//           position: "absolute", top: "50%", right: "10px",
//           transform: "translateY(-50%)",
//           background: "none", border: "none", cursor: "pointer",
//           padding: 0, color: "#9ca3af", display: "flex", alignItems: "center",
//           lineHeight: 1,
//         }}
//       >
//         {showState ? <EyeOff size={17} /> : <Eye size={17} />}
//       </button>
//     </div>
//   );



  //  Only numbers + max 2 digits
const handleTwoDigitNumber = (field, value) => {
  let cleaned = value.replace(/\D/g, "").slice(0, 2);

  // prevent 0
  if (cleaned === "0") cleaned = "";

  handleChange(field, cleaned);
};

const handleOnlyNumbers = (field, value) => {
  let cleaned = value.replace(/\D/g, "").slice(0, 6);

  if (cleaned === "0") cleaned = "";

  handleChange(field, cleaned);
};

//  Phone validation (+ only at start, max 15 chars)
const handlePhoneChange = (value) => {
  let cleaned = value.replace(/[^0-9+]/g, "");

  // allow + only at start
  if (cleaned.includes("+")) {
    cleaned = "+" + cleaned.replace(/\+/g, "");
  }

  cleaned = cleaned.slice(0, 15);

  handleEmployerChange("phone", cleaned);
};

  return (
    <>
      <div className="job_post_page blue_nav">
        <Navbar />
        <div className="top_padding">
          <div className="postjob_container">
            <h2 className="mb-3">Create A Job</h2>

            {/* Stepper */}
            <div className="stepper mb-4">
              {[1, 2, 3].map((s, index) => (
                <div key={s} className="step_wrapper">
                  <div className={`step_circle ${step >= s ? "active" : ""}`}>{s}</div>
                  <div className="step_title">{["Basic", "Details", "Salary & Media"][index]}</div>
                  {index !== 2 && <div className={`step_line ${step > s ? "active" : ""}`} />}
                </div>
              ))}
            </div>

            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
              <form>

                {/* ===== STEP 1 ===== */}
                {step === 1 && (
                  <div className="card p-4">
                    <h5 className="mb-3">Basic Info</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label>Job Title <span className="text-danger">*</span></label>
                        <input
                          className={`form-control ${errors.title ? "is-invalid" : ""}`}
                          value={formData.title}
                          onChange={(e) => handleChange("title", e.target.value)}
                        />
                        <Err field="title" />
                      </div>

                      <div className="col-md-6">
                        <label>Category <span className="text-danger">*</span></label>
                        <select
                          className={`form-select ${errors.category ? "is-invalid" : ""}`}
                          value={formData.category}
                          onChange={(e) => handleChange("category", e.target.value)}
                        >
                          <option value="">Select</option>
                          {categories.map((c, i) => <option key={i}>{c}</option>)}
                        </select>
                        <Err field="category" />
                      </div>

                      <div className="col-12">
                        <label>Description <span className="text-danger">*</span></label>
                        <ReactQuill
                          theme="snow"
                          value={formData.description}
                          onChange={(val) => handleChange("description", val)}
                          placeholder="Write job description here..."
                        />
                        <Err field="description" />
                      </div>

                      <div className="col-12">
                        <label>Skills</label>
                        <input
                          className="form-control"
                          placeholder="Type & press Enter"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={addSkill}
                        />
                        <div className="mt-2">
                          {formData.skills.map((s, i) => (
                            <span key={i} className="badge me-2" onClick={() => removeSkill(i)} style={{ cursor: "pointer" }}>
                              {s} ✕
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="col-12">
                        <label>Additional Note</label>
                        <textarea className="form-control" value={formData.note} onChange={(e) => handleChange("note", e.target.value)} />
                      </div>
                    </div>
                    <div className="mt-3 text-end">
                      <button type="button" className="btn btn-primary" onClick={next}>Next</button>
                    </div>
                  </div>
                )}

                {/* ===== STEP 2 ===== */}
                {step === 2 && (
                  <div className="card p-4">
                    <h5>Job Details</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label>Job Type <span className="text-danger">*</span></label>
                        <select
                          className={`form-select ${errors.jobType ? "is-invalid" : ""}`}
                          value={formData.jobType}
                          onChange={(e) => handleChange("jobType", e.target.value)}
                        >
                          <option value="">Select</option>
                          <option>Full Time</option>
                          <option>Part Time</option>
                          <option>Contract</option>
                          <option>Internship</option>
                          <option>Freelance</option>
                        </select>
                        <Err field="jobType" />
                      </div>

                      <div className="col-md-6">
                        <label>Work Mode <span className="text-danger">*</span></label>
                        <select
                          className={`form-select ${errors.workMode ? "is-invalid" : ""}`}
                          value={formData.workMode}
                          onChange={(e) => handleChange("workMode", e.target.value)}
                        >
                          <option value="">Select</option>
                          <option>Remote</option>
                          <option>Hybrid</option>
                          <option>Onsite</option>
                        </select>
                        <Err field="workMode" />
                      </div>

                      <div className="col-12">
                        <label>Job Duration <span className="text-danger">*</span></label>

                        <div className="mt-2">
                            {["days", "months", "years"].map((type) => (
                            <label key={type} className="me-3">
                                <input
                                type="radio"
                                name="durationType"
                                checked={formData.durationType === type}
                                onChange={() => handleChange("durationType", type)}
                                />{" "}
                                <span className="text-capitalize">{type}</span>
                            </label>
                            ))}
                        </div>

                        {errors.durationType && (
                          <div className="text-danger small mt-1">{errors.durationType}</div>
                        )}

                        {/* Show input ONLY when selected */}
                        {formData.durationType && (
                            <div className="col-md-6 mt-2">
                            <input
                                type="text"
                                className={`form-control ${errors.duration ? "is-invalid" : ""}`}
                                placeholder={`Enter duration in ${formData.durationType}`}
                                value={formData.duration}
                                onChange={(e) => handleTwoDigitNumber("duration", e.target.value)}
                            />
                            <Err field="duration" />
                            </div>
                        )}
                        </div>

                      <div className="col-md-6">
                        <label>Experience Min</label>
                        <input className="form-control" value={formData.expMin}
                        //  onChange={(e) => handleChange("expMin", e.target.value)} 
                        onChange={(e) => handleTwoDigitNumber("expMin", e.target.value)}
                         />
                         <Err field="expMin" />
                      </div>
                      <div className="col-md-6">
                        <label>Experience Max</label>
                        <input className="form-control" value={formData.expMax}
                        //  onChange={(e) => handleChange("expMax", e.target.value)}
                        onChange={(e) => handleTwoDigitNumber("expMax", e.target.value)}
                          />
                          <Err field="expMax" />
                      </div>

                      <div className="col-12">
                        <label>Enter address <span className="text-danger">*</span></label>
                        <Autocomplete onLoad={(auto) => setAutocomplete(auto)} onPlaceChanged={onPlaceChanged}>
                          <input
                            type="text"
                            className={`form-control ${errors.address ? "is-invalid" : ""}`}
                            placeholder="Type your address..."
                            value={formData.address}
                            onChange={handleAddressChange}
                          />
                        </Autocomplete>
                        <Err field="address" />
                      </div>

                      <div className="col-md-4">
                        <label>City</label>
                        <input className="form-control" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} />
                      </div>
                      <div className="col-md-4">
                        <label>State</label>
                        <input className="form-control" value={formData.state} onChange={(e) => handleChange("state", e.target.value)} />
                      </div>
                      <div className="col-md-4">
                        <label>Country</label>
                        <input className="form-control" value={formData.country} onChange={(e) => handleChange("country", e.target.value)} />
                      </div>

                      {/* {formData.latitude && (
                        <div className="col-12">
                          <small className="text-muted">📍 Lat: {formData.latitude}, Lng: {formData.longitude}</small>
                        </div>
                      )} */}
                    </div>
                    <div className="mt-3 d-flex justify-content-between">
                      <button type="button" className="btn btn-light" onClick={back}>Back</button>
                      <button type="button" className="btn btn-primary" onClick={next}>Next</button>
                    </div>
                  </div>
                )}

                {/* ===== STEP 3 ===== */}
                {step === 3 && (
                  <div className="card p-4">
                    <h5>Salary & Media</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label>Min Salary (per hour) <span className="text-danger">*</span></label>
                        <input
                          className={`form-control ${errors.minSalary ? "is-invalid" : ""}`}
                          value={formData.minSalary}
                        //   onChange={(e) => handleChange("minSalary", e.target.value)}
                        onChange={(e) => handleOnlyNumbers("minSalary", e.target.value)}
                        />
                        <Err field="minSalary" />
                      </div>
                      <div className="col-md-6">
                        <label>Max Salary (per hour) <span className="text-danger">*</span></label>
                        <input
                          className={`form-control ${errors.maxSalary ? "is-invalid" : ""}`}
                          value={formData.maxSalary}
                        //   onChange={(e) => handleChange("maxSalary", e.target.value)}
                          onChange={(e) => handleOnlyNumbers("maxSalary", e.target.value)}
                        />
                        <Err field="maxSalary" />
                      </div>

                      <div className="col-12">
                        <input type="checkbox" checked={formData.negotiable} onChange={(e) => handleChange("negotiable", e.target.checked)} />
                        {" "}Salary is negotiable
                      </div>

                      <div className="col-12">
                        <label>Video URL (optional)</label>
                        <input className="form-control" value={formData.videoUrl} onChange={(e) => handleChange("videoUrl", e.target.value)} />
                      </div>

                      <div className="col-12">
                        <label>Upload Images (optional)</label>
                        <label htmlFor="upload_input" className="upload_wrapper mt-2">
                          <UploadCloud className="text_theme" size={60} />
                        </label>
                        <small className="text-muted">(Max 5 images)</small>
                        <input id="upload_input" type="file" multiple className="form-control d-none" onChange={handleImages} />
                        <div className="d-flex flex-wrap gap-2 mt-3">
                          {formData.images.map((file, i) => (
                            <div key={i} style={{ position: "relative" }}>
                              <img src={URL.createObjectURL(file)} width="80" height="80" style={{ objectFit: "cover", borderRadius: "6px" }} alt="uploaded" />
                              <span
                                onClick={() => handleChange("images", formData.images.filter((_, idx) => idx !== i))}
                                style={{ position: "absolute", top: "-6px", right: "-6px", background: "red", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                              >✕</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="col-12">
                        <label>
                          External Apply URL{" "}
                          <small className="text-muted">(leave empty for internal applications)</small>
                        </label>
                        <input className="form-control" value={formData.applyUrl} onChange={(e) => handleChange("applyUrl", e.target.value)} />
                        {/* <small className="text-muted">
                          apply_type → <strong>{formData.applyUrl.trim() ? "external" : "internal"}</strong>
                        </small> */}
                      </div>

                      <div className="col-12">
                        <label>Deadline</label>
                        <input type="date" className="form-control" value={formData.deadline} onChange={(e) => handleChange("deadline", e.target.value)} />
                      </div>
                    </div>
                    <div className="mt-3 d-flex justify-content-between">
                      <button type="button" className="btn btn-light" onClick={back}>Back</button>
                      <button type="button" className="btn btn-primary" onClick={handleSubmitClick}>Submit Job</button>
                    </div>
                  </div>
                )}
              </form>
            </LoadScript>
          </div>
        </div>
        <Footer />

        {/* ===== AUTH MODAL ===== */}
        {showModal && (
        //   <div className="modal-overlay" onClick={() => !loading && setShowModal(false)}>
            <div className="modal-overlay">
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{authMode === "login" ? "Login to Continue" : "Create an Account"}</h3>
                <button className="modal-close" onClick={() => !loading && setShowModal(false)} disabled={loading}>
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body">
                {/* Tabs */}
                <div className="auth-tabs">
                  <button className={`auth-tab ${authMode === "login" ? "active" : ""}`} onClick={() => switchTab("login")} disabled={loading}>
                    Login
                  </button>
                  <button className={`auth-tab ${authMode === "signup" ? "active" : ""}`} onClick={() => switchTab("signup")} disabled={loading}>
                    Sign Up
                  </button>
                </div>

                {/* API Response Message */}
                {apiMessage.text && (
                  <div className={`alert ${apiMessage.success ? "alert-success" : "alert-danger"} py-2 mb-3`}>
                    {apiMessage.text}
                  </div>
                )}

                {/* ── LOGIN FORM ── */}
                {authMode === "login" && (
                  <div className="login-form">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        className={`form-control ${authErrors.email ? "is-invalid" : ""}`}
                        placeholder="Enter your email"
                        value={employerData.email}
                        onChange={(e) => handleEmployerChange("email", e.target.value)}
                      />
                      {authErrors.email && <div className="text-danger small mt-1">{authErrors.email}</div>}
                    </div>

                    <div className="form-group">
                      <label>Password</label>
                      <PasswordInput
                        placeholder="Enter your password"
                        value={employerData.password}
                        onChange={(e) => handleEmployerChange("password", e.target.value)}
                        showState={showPassword}
                        toggleShow={() => setShowPassword(p => !p)}
                        hasError={!!authErrors.password}
                      />
                      {authErrors.password && <div className="text-danger small mt-1">{authErrors.password}</div>}
                    </div>

                    <button className="btn-post w-100 mt-3" onClick={handleLogin} disabled={loading}>
                      {loading ? "Please wait..." : "Login & Submit Job"}
                    </button>
                  </div>
                )}

                {/* ── SIGNUP FORM ── */}
                {authMode === "signup" && (
                  <div className="signup-form">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label>Full Name <span className="text-danger">*</span></label>
                        <input
                          className={`form-control ${authErrors.name ? "is-invalid" : ""}`}
                          placeholder="Enter your full name"
                          value={employerData.name}
                          onChange={(e) => handleEmployerChange("name", e.target.value)}
                        />
                        {authErrors.name && <div className="text-danger small mt-1">{authErrors.name}</div>}
                      </div>

                      <div className="col-md-6">
                       <label>Designation <span className="text-danger">*</span></label>
                    <input
                      className={`form-control ${authErrors.designation ? "is-invalid" : ""}`}
                      placeholder="Your designation"
                      value={employerData.designation}
                      onChange={(e) => handleEmployerChange("designation", e.target.value)}
                    />
                    {authErrors.designation && <div className="text-danger small mt-1">{authErrors.designation}</div>}
                      </div>

                      <div className="col-12">
                        <label>Institution Name <span className="text-danger">*</span></label>
<input
  className={`form-control ${authErrors.institution_name ? "is-invalid" : ""}`}
  placeholder="Institution/Company name"
  value={employerData.institution_name}
  onChange={(e) => handleEmployerChange("institution_name", e.target.value)}
/>
{authErrors.institution_name && <div className="text-danger small mt-1">{authErrors.institution_name}</div>}
                      </div>

                      <div className="col-12">
                        <label>Tax / ABN Number <span className="text-danger">*</span></label>
<input
  className={`form-control ${authErrors.tax_avin_number ? "is-invalid" : ""}`}
  placeholder="Tax or ABN number"
  value={employerData.tax_avin_number}
  onChange={(e) => handleEmployerChange("tax_avin_number", e.target.value)}
/>
{authErrors.tax_avin_number && <div className="text-danger small mt-1">{authErrors.tax_avin_number}</div>}
                      </div>

                      <div className="col-md-6">
                        <label>Email <span className="text-danger">*</span></label>
                        <input
                          type="email"
                          className={`form-control ${authErrors.email ? "is-invalid" : ""}`}
                          placeholder="Email address"
                          value={employerData.email}
                          onChange={(e) => handleEmployerChange("email", e.target.value)}
                        />
                        {authErrors.email && <div className="text-danger small mt-1">{authErrors.email}</div>}
                      </div>

                      <div className="col-md-6">
                        <label>Phone <span className="text-danger">*</span></label>
                        <input
                          className={`form-control ${authErrors.phone ? "is-invalid" : ""}`}
                          placeholder="Phone number"
                          value={employerData.phone}
                        //   onChange={(e) => handleEmployerChange("phone", e.target.value)}
                           onChange={(e) => handlePhoneChange(e.target.value)}
                        />
                        {authErrors.phone && <div className="text-danger small mt-1">{authErrors.phone}</div>}
                      </div>

                      <div className="col-md-6">
                        <label>Password <span className="text-danger">*</span></label>
                        <PasswordInput
                          placeholder="Create password"
                          value={employerData.password}
                          onChange={(e) => handleEmployerChange("password", e.target.value)}
                          showState={showPassword}
                          toggleShow={() => setShowPassword(p => !p)}
                          hasError={!!authErrors.password}
                        />
                        {authErrors.password && <div className="text-danger small mt-1">{authErrors.password}</div>}
                      </div>

                      <div className="col-md-6">
                        <label>Confirm Password <span className="text-danger">*</span></label>
                        <PasswordInput
                          placeholder="Confirm password"
                          value={employerData.password_confirmation}
                          onChange={(e) => handleEmployerChange("password_confirmation", e.target.value)}
                          showState={showConfirmPassword}
                          toggleShow={() => setShowConfirmPassword(p => !p)}
                          hasError={!!authErrors.password_confirmation}
                        />
                        {authErrors.password_confirmation && <div className="text-danger small mt-1">{authErrors.password_confirmation}</div>}
                      </div>
                    </div>

                    <button className="btn-post w-100 mt-4" onClick={handleSignup} disabled={loading}>
                      {loading ? "Please wait..." : "Sign Up & Submit Job"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <style>{`
          .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex; align-items: center; justify-content: center;
            z-index: 1000;
          }
          .modal-container {
            background: white; border-radius: 12px;
            width: 90%; max-width: 550px; max-height: 90vh;
            overflow-y: auto; animation: slideIn 0.3s ease;
          }
          @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to   { transform: translateY(0);     opacity: 1; }
          }
          .modal-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 1.5rem; border-bottom: 1px solid #e5e7eb;
          }
          .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 600; }
          .modal-close {
            background: none; border: none; cursor: pointer;
            padding: 0; display: flex; align-items: center;
            color: #6b7280; transition: color 0.2s;
          }
          .modal-close:hover { color: #1f2937; }
          .modal-body { padding: 1rem 1.5rem 1.5rem; }
          .auth-tabs {
            display: flex; gap: 1rem; margin-bottom: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
          }
          .auth-tab {
            background: none; border: none; padding: 0.5rem 1rem;
            font-size: 1rem; cursor: pointer; color: #6b7280;
            transition: all 0.2s; position: relative; text-transform: uppercase;
          }
          .auth-tab.active { color: var(--secondary); font-weight: 500; }
          .auth-tab.active::after {
            content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
            height: 2px; background: var(--secondary);
          }
          .form-group { margin-bottom: 1rem; }
          .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
          .w-100 { width: 100%; }
        `}</style>
      </div>

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

export default PostJob;