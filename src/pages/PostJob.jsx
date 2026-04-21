import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
// import { LoadScript, Autocomplete } from "@react-google-maps/api";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { UploadCloud, X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext"; // adjust path if needed
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LIBRARIES = ["places"];

const INITIAL_FORM = {
  title: "",
  job_category_id: "", 
  other: "",         
  description: "",
  short_description: "",
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
  suburb: "",
  country: "",
  suburb: "",
  latitude: "",
  longitude: "",
  minSalary: "",
  maxSalary: "",
  negotiable: false,
  is_salary_hidden: false,
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
  const { user, login } = useAuth();
  const navigate = useNavigate();

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

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [employerData, setEmployerData] = useState(INITIAL_EMPLOYER);

  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);


  const [applyType, setApplyType] = useState(""); // "internal" | "external"
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionSelections, setQuestionSelections] = useState({}); 

  const { isLoaded } = useJsApiLoader({
   googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
   libraries: LIBRARIES,
 });

  // const categories = [
  //   "Childcare Centre Manager",
  //   "Childcare Assistant Centre Manager",
  //   "Early Childhood Teacher",
  //   "Childcare Lead Educator",
  //   "Childcare Assistant Educator",
  //   "Childcare Cook",
  // ];

  const [categorySearch, setCategorySearch] = useState("");
  const [categoryResults, setCategoryResults] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState("");

  const searchDebounceRef = useRef(null);

  const searchCategories = (query) => {
    // Clear previous debounce timer
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!query.trim()) {
      setCategoryResults([]);
      setShowCategoryDropdown(false);
      setCategoryLoading(false);
      return;
    }

    setCategoryLoading(true);
    setShowCategoryDropdown(true); // show dropdown with spinner while waiting

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/jobs-categories?search=${encodeURIComponent(query)}`,
          { headers: { Accept: "application/json" } }
        );
        const data = await res.json();
        const results = data?.data || [];

        if (!data.status || results.length === 0) {
          // API returned no results — show the "not found" message + Other option
          setCategoryResults([{ id: "__no_results__", name: data.message || "No job categories found." }, { id: "other", name: "Other" }]);
        } else {
          // Normal results + always append Other at end
          setCategoryResults([...results, { id: "other", name: "Other" }]);
        }

        setShowCategoryDropdown(true);
      } catch {
        setCategoryResults([
          { id: "__no_results__", name: "Failed to fetch categories." },
          { id: "other", name: "Other" },
        ]);
        setShowCategoryDropdown(true);
      } finally {
        setCategoryLoading(false);
      }
    }, 400); // 400ms debounce — feels snappy but doesn't hammer the API
  };


const handleCategorySelect = (item) => {
  if (item.id === "other") {
    setFormData(prev => ({ ...prev, job_category_id: "other", title: "none", other: "" }));
    setSelectedCategoryLabel("Other");
  } else {
    setFormData(prev => ({ ...prev, job_category_id: item.id, title: item.name, other: "" }));
    setSelectedCategoryLabel(item.name);
  }
  setCategorySearch(item.id === "other" ? "Other" : item.name);
  setShowCategoryDropdown(false);
  if (errors.title) setErrors(prev => ({ ...prev, title: "" }));
};

const fetchQuestions = async () => {
  setQuestionsLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/jobs-categories`, {
      headers: { Accept: "application/json" },
    });
    const data = await res.json();
    const qs = data?.questions || [];
    setQuestions(qs);
    // Only initialize NEW questions, preserve existing selections
    setQuestionSelections(prev => {
      const init = { ...prev };
      qs.forEach(q => {
        if (!init[q.id]) {
          init[q.id] = { selected: false, required: false };
        }
      });
      return init;
    });
  } catch {
    setQuestions([]);
  } finally {
    setQuestionsLoading(false);
  }
};


useEffect(() => {
  //  Only redirect if user came directly (not via modal flow)
  if (user && !showModal && !isRedirecting) {
    navigate("/");
  }
}, [user]);


  // ── Google Places ────────────────────────────────────────────────────────────

const onPlaceChanged = () => {
  if (!autocomplete) return;
  const place = autocomplete.getPlace();
  if (!place || !place.address_components) return;

  let city = "", suburb = "", country = "";
  let lat = "", lng = "";

  if (place.geometry?.location) {
    lat = place.geometry.location.lat();
    lng = place.geometry.location.lng();
  }

  place.address_components.forEach((comp) => {
    const types = comp.types;

    if (types.includes("sublocality_level_1")) {
      suburb = comp.long_name;
    } else if (types.includes("sublocality") || types.includes("neighborhood")) {
      if (!suburb) suburb = comp.long_name;
    } else if (types.includes("administrative_area_level_2")) {
      if (!suburb) suburb = comp.long_name;
    }

    if (types.includes("locality")) city = comp.long_name;
    if (types.includes("country")) country = comp.long_name;
  });

  // Fallback: use city as suburb for CBD addresses
  if (!suburb && city) suburb = city;

  setFormData(prev => ({
    ...prev,
    address: place.formatted_address || "",
    city,
    suburb,
    country,
    latitude: lat,
    longitude: lng,
  }));

  setIsAddressSelected(true);
  if (errors.address) setErrors(prev => ({ ...prev, address: "" }));
};


/*---- HandleChange ------*/

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
      ...(!value && { city: "", suburb: "", country: "", latitude: "", longitude: "" }),
    }));
    setIsAddressSelected(false);
    if (errors.address) setErrors(prev => ({ ...prev, address: "" }));
  };

const validateDeadline = (value) => {
  if (!value) return "";

  const selected = new Date(value);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 45);
  maxDate.setHours(0, 0, 0, 0);

  const year = selected.getFullYear();

  if (year < 1000 || year > 9999) return "Please enter a valid 4-digit year.";
  if (selected < tomorrow) return "Deadline must be a future date (from tomorrow onwards).";
  if (selected > maxDate) return "Maximum application deadline is 45 days from today.";

  return "";
};

const validateUrl = (value) => {
  if (!value.trim()) return "External application URL is required.";
  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol)) return "URL must start with http:// or https://";
    return "";
  } catch {
    return "Please enter a valid URL (e.g. https://yourcompany.com/apply).";
  }
};

  // ── Step Validation ──────────────────────────────────────────────────────────
 const validateStep1 = () => {
  const e = {};
  if (!formData.job_category_id) e.title = "Please select a job category.";
  if (formData.job_category_id === "other" && !formData.other.trim())
    e.other = "Please enter your custom job title.";
  if (!formData.description || formData.description === "<p><br></p>")
    e.description = "Description is required.";
  setErrors(e);
  return !Object.keys(e).length;
};

const validateStep2 = () => {
  const e = {};

  const minExp = Number(formData.expMin);
  const maxExp = Number(formData.expMax);

  if (!formData.jobType) e.jobType = "Job type is required.";
  if (!formData.workMode) e.workMode = "Work mode is required.";

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
  if (!formData.salary_type)
    e.salary_type = "Please select a salary type.";

  const deadlineError = validateDeadline(formData.deadline);
  if (deadlineError) e.deadline = deadlineError;

  setErrors(e);
  return !Object.keys(e).length;
};



const next = () => {
  if (step === 1 && !validateStep1()) return;
  if (step === 2 && !validateStep2()) return;
  if (step === 3 && !validateStep3()) return;
  // removed fetchQuestions() from here
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

  // const handleImages = (e) => {
  //   const files = Array.from(e.target.files);
  //   handleChange("images", [...formData.images, ...files].slice(0, 5));
  // };

  const handleImages = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setErrors(prev => ({ ...prev, images: "" }));
    handleChange("images", [file]);
    e.target.value = "";
  };

  const handleLogoUpload = (file) => {
  handleEmployerChange("profile_image", file);

  if (file) {
    setLogoPreview(URL.createObjectURL(file));
  }
};

  // ── Reset all state & redirect ───────────────────────────────────────────────
  const resetAndRedirect = (token, jobId) => {
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
        window.location.href = `https://childcrm.grincloudhost.com/public/session-login?token=${token}&job_id=${jobId}`;
      }, 1000);
  };

  // ── Build job FormData payload ───────────────────────────────────────────────
const buildJobPayload = (currentApplyType, currentQuestionSelections) => {
  const jobTypeMap = {
    "Full Time": "full_time", "Part Time": "part_time",
    "Contract": "contract", "Internship": "internship", "Trainee": "trainee","Placement": "placement",
  };
  const workModeMap = { "Remote": "remote", "Onsite": "onsite" , "Hybrid": "hybrid" };

  const payload = new FormData();

  // Title & category
  if (formData.job_category_id === "other") {
    payload.append("title", "none");
    payload.append("other", formData.other);
    payload.append("job_category", "other");
  } else {
    payload.append("title", formData.title);
    payload.append("other", "");
    payload.append("job_category", formData.job_category_id);
  }

  payload.append("description", formData.description);
  payload.append("short_description", formData.short_description);
  payload.append("job_type", jobTypeMap[formData.jobType] || formData.jobType.toLowerCase());
  payload.append("work_mode", workModeMap[formData.workMode] || formData.workMode.toLowerCase());
  payload.append("additional_note", formData.note);
  payload.append("experience_min", formData.expMin);
  payload.append("experience_max", formData.expMax);
  payload.append("salary_min", formData.minSalary);
  payload.append("salary_max", formData.maxSalary);
  payload.append("salary_type", formData.salary_type);
  payload.append("salary_negotiable", formData.negotiable ? 1 : 0);
  payload.append("is_salary_hidden", formData.is_salary_hidden ? 1 : 0);
  payload.append("address", formData.address);
  payload.append("country", formData.country);
  payload.append("city", formData.city);
  payload.append("suburb", formData.suburb);
  payload.append("latitude", formData.latitude);
  payload.append("longitude", formData.longitude);
  payload.append("skills", JSON.stringify(formData.skills));
  // payload.append("apply_type", formData.applyUrl.trim() ? "external" : "internal");
  // payload.append("apply_url", formData.applyUrl);
  payload.append("apply_type", currentApplyType);
  if (applyType === "external") {
    payload.append("apply_url", formData.applyUrl);
  }

  // Add question selections:
  Object.entries(currentQuestionSelections).forEach(([id, val]) => {
    if (val.selected) {
      payload.append(`questions[${id}][selected]`, 1);
      payload.append(`questions[${id}][required]`, val.required ? 1 : 0);
    }
  });

  payload.append("expires_at", formData.deadline);
  formData.images.forEach((file) => payload.append("images[]", file));
  if (formData.videoUrl.trim()) payload.append("videos", formData.videoUrl);

  // ── Console log full payload for debugging ──
  console.log("=== Job Payload ===");
  for (let [key, value] of payload.entries()) {
    console.log(`${key}:`, value);
  }

  return payload;

};


  const postJob = async (token) => {
  const res = await fetch(`${BASE_URL}/post-a-job`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    body: buildJobPayload(applyType, questionSelections),
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
      body: JSON.stringify({
        email: employerData.email,
        password: employerData.password,
        type: "principal"
      }),
    });

    const loginData = await loginRes.json();

    if (!loginData.status) {
      setApiMessage({ text: loginData.message || "Login failed.", success: false });

      if (loginData.type === "notVerified") {
        setShowResend(true);
      } else {
        setShowResend(false);
      }

      setLoading(false);
      return;
    }

    // Save login
    login({ user: loginData.user, token: loginData.token });

    const jobData = await postJob(loginData.token);

    // SINGLE source of truth
    setApiMessage({
      text: jobData.message || (jobData.status ? "Job posted successfully!" : "Failed to post job."),
      success: jobData.status,
    });

    // Only handle redirect here
    if (jobData.status) {
      setTimeout(() => {
        resetAndRedirect(loginData.token, jobData.data.id);
      }, 3000);
    }

  } catch {
    setApiMessage({ text: "Network error. Please try again.", success: false });
  }

  setLoading(false);
};


   // ── Resend Verification Link ─────────────────────────────────────────────────────────

  const handleResend = async () => {
  setResendLoading(true);
  setApiMessage({ text: "", success: null });

  try {
    const res = await fetch(`${BASE_URL}/email/resend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: employerData.email }),
    });

    const data = await res.json();

    setApiMessage({
      text: data.message || "Verification link sent",
      success: data.status,
    });

  } catch {
    setApiMessage({ text: "Failed to resend email", success: false });
  } finally {
    setResendLoading(false);
  }
};

  // ── Signup → Post Job ────────────────────────────────────────────────────────
const handleSignup = async () => {
  const e = {};
  if (!employerData.name.trim()) e.name = "Full name is required.";
  if (!employerData.designation.trim()) e.designation = "Designation is required.";
  if (!employerData.institution_name.trim()) e.institution_name = "Institution name is required.";
  if (!employerData.tax_avin_number.trim()) {
    e.tax_avin_number = "Tax / ABN number is required.";
  } else if (employerData.tax_avin_number.trim().length > 15) {
    e.tax_avin_number = "Tax / ABN number must be 15 characters or less.";
  }

  if (employerData.profile_image) {
  const file = employerData.profile_image;

  if (!file.type.startsWith("image/")) {
    setApiMessage({ text: "Only image files allowed", success: false });
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    setApiMessage({ text: "Max file size is 2MB", success: false });
    return;
  }
}

  if (!employerData.email.trim()) e.email = "Email is required.";
  if (!employerData.phone.trim()) e.phone = "Phone is required.";
  if (!employerData.password.trim()) e.password = "Password is required.";
  if (!employerData.password_confirmation.trim()) e.password_confirmation = "Please confirm your password.";
  else if (employerData.password !== employerData.password_confirmation)
    e.password_confirmation = "Passwords do not match.";

  if (Object.keys(e).length) {
    setAuthErrors(e);
    return;
  }

  setLoading(true);
  setApiMessage({ text: "", success: null });

  try {
    // ✅ CREATE FORMDATA
    const form = new FormData();

    form.append("name", employerData.name);
    form.append("role", employerData.role);
    form.append("email", employerData.email);
    form.append("password", employerData.password);
    form.append("password_confirmation", employerData.password_confirmation);
    form.append("designation", employerData.designation);
    form.append("institution_name", employerData.institution_name);
    form.append("phone", employerData.phone);
    form.append("tax_avin_number", employerData.tax_avin_number);

    // ✅ ADD LOGO HERE
    if (employerData.profile_image) {
      form.append("profile_image", employerData.profile_image);
    }

    const regRes = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: form,
    });

    const regData = await regRes.json();

    if (!regData.status) {
      setApiMessage({ text: regData.message || "Registration failed.", success: false });
      setLoading(false);
      return;
    }

    // ✅ Continue same flow
    const jobData = await postJob(regData.token);

    setApiMessage({
      text: jobData.message || (jobData.status ? "Job posted successfully!" : "Failed to post job."),
      success: jobData.status,
    });

    if (jobData.status) {
      setFormData(INITIAL_FORM);
      setEmployerData(INITIAL_EMPLOYER);
      setStep(1);
      setSkillInput("");
      setIsAddressSelected(false);
      setErrors({});
      setAuthErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);

      setTimeout(() => {
        setShowModal(false);
        navigate("/login");
      }, 3000);
    }
  } catch {
    setApiMessage({ text: "Network error. Please try again.", success: false });
  }

  setLoading(false);
};



const handleSubmitClick = () => {
  console.log("=== Form Data ===");
  Object.entries(formData).forEach(([key, value]) => {
    console.log(`${key}:`, value);
  });
  console.log("apply_type:", applyType);
  console.log("questionSelections:", questionSelections);

  // Also log the actual payload that will be sent
  console.log("=== Payload Preview ===");
  const previewPayload = buildJobPayload(applyType, questionSelections);
  for (let [key, value] of previewPayload.entries()) {
    console.log(`${key}:`, value);
  }

  if (!applyType) {
    setErrors(prev => ({ ...prev, applyType: "Please select how candidates should apply." }));
    return;
  }
 if (applyType === "external") {
  const urlError = validateUrl(formData.applyUrl);
  if (urlError) {
    setErrors(prev => ({ ...prev, applyUrl: urlError }));
    return;
  }
}
  setErrors({});
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

 

//  Only numbers + max 2 digits
const handleTwoDigitNumber = (field, value) => {
  let cleaned = value.replace(/\D/g, "").slice(0, 2);

  // prevent 0
  if (cleaned === "0") cleaned = "";

  handleChange(field, cleaned);
};

const handleOnlyNumbers = (field, value) => {
  let cleaned = value.replace(/\D/g, "").slice(0, 4);

  if (cleaned === "0") cleaned = "";

  handleChange(field, cleaned);
};

//  Phone validation (+ only at start, max 12 chars)
const handlePhoneChange = (value) => {
  let cleaned = value.replace(/[^0-9+]/g, "");

  // allow + only at start
  if (cleaned.includes("+")) {
    cleaned = "+" + cleaned.replace(/\+/g, "");
  }

  cleaned = cleaned.slice(0, 12);

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
             {[1, 2, 3, 4].map((s, index) => (
            <div key={s} className="step_wrapper">
              <div className={`step_circle ${step >= s ? "active" : ""}`}>{s}</div>
              <div className="step_title">{["Basic", "Details", "Salary ", "Application Type"][index]}</div>
              {index !== 3 && <div className={`step_line ${step > s ? "active" : ""}`} />}
            </div>
          ))}
            </div>

              <form>

                {/* ===== STEP 1 ===== */}
                {step === 1 && (
                  <div className="card p-4">
                    <h5 className="mb-3">Basic Info</h5>
                    <div className="row g-3">

                      {/* Job Title with live search */}
                      <div className="col-12">
                        <label>Job Title / Category <span className="text-danger">*</span></label>
                        <div style={{ position: "relative" }}>
                          <input
                            className={`form-control ${errors.title ? "is-invalid" : ""}`}
                            placeholder="Type to search job category..."
                            value={categorySearch}
                            autoComplete="off"
                            onChange={(e) => {
                              const val = e.target.value;
                              setCategorySearch(val);
                              setSelectedCategoryLabel("");
                              setFormData(prev => ({ ...prev, job_category_id: "", title: "", other: "" }));
                              searchCategories(val);
                            }}
                            onFocus={() => {
                              if (categoryResults.length > 0) setShowCategoryDropdown(true);
                            }}
                            onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 150)}
                          />

                          {showCategoryDropdown && (
                            <ul style={{
                              position: "absolute", top: "100%", left: 0, right: 0,
                              background: "#fff", border: "1px solid #dee2e6",
                              borderRadius: "0 0 8px 8px", zIndex: 999,
                              maxHeight: "220px", overflowY: "auto",
                              listStyle: "none", margin: 0, padding: 0,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}>
                              {categoryLoading && (
                                <li style={{ padding: "10px 14px", color: "#888", fontSize: 14 }}>
                                  <i className="fas fa-spinner fa-spin me-2"></i>Searching...
                                </li>
                              )}

                              {!categoryLoading && categoryResults.map((item) => {
                                // Non-clickable "no results" info row
                                if (item.id === "__no_results__") {
                                  return (
                                    <li key="no_results" style={{
                                      padding: "10px 14px", fontSize: 13,
                                      color: "#ef5350", // red-ish to signal no match
                                      borderBottom: "1px solid #f3f4f6",
                                      cursor: "default",
                                      display: "flex", alignItems: "center", gap: 6,
                                    }}>
                                      <i className="fas fa-info-circle"></i> {item.name}
                                    </li>
                                  );
                                }

                                // "Other" option
                                if (item.id === "other") {
                                  return (
                                    <li
                                      key="other"
                                      onMouseDown={() => handleCategorySelect(item)}
                                      style={{
                                        padding: "10px 14px", cursor: "pointer", fontSize: 14,
                                        fontWeight: 600,
                                        color: "var(--secondary, #0d6efd)",
                                        background: "#fff",
                                      }}
                                      onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
                                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                                    >
                                      Other (enter manually)
                                    </li>
                                  );
                                }

                                // Normal category row
                                return (
                                  <li
                                    key={item.id}
                                    onMouseDown={() => handleCategorySelect(item)}
                                    style={{
                                      padding: "10px 14px", cursor: "pointer", fontSize: 14,
                                      borderBottom: "1px solid #f3f4f6",
                                      color: "#1f2937", background: "#fff",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#f8f9fa"}
                                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                                  >
                                    {item.name}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                        <Err field="title" />
                      </div>

                      {/* Custom title input shown only when "Other" is selected */}
                      {formData.job_category_id === "other" && (
                        <div className="col-12">
                          <label>Enter Your Job Title <span className="text-danger">*</span></label>
                          <input
                            className={`form-control ${errors.other ? "is-invalid" : ""}`}
                            placeholder="Enter your custom job title..."
                            value={formData.other}
                            onChange={(e) => {
                              handleChange("other", e.target.value);
                              if (errors.other) setErrors(prev => ({ ...prev, other: "" }));
                            }}
                          />
                          <Err field="other" />
                        </div>
                      )}

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
                        <label>Short Description</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          maxLength={150}
                          placeholder="Brief summary of the job (shown in listings)..."
                          value={formData.short_description}
                          onChange={(e) => handleChange("short_description", e.target.value)}
                        />
                        <small className={`d-block mt-1 ${
                          formData.short_description.length >= 150 ? "text-danger" : "text-muted"
                        }`}>
                          {formData.short_description.length} / 150 characters
                        </small>
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
                          <option>Trainee</option>
                          <option>Placement</option>
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
                          <option>Onsite</option>
                          <option>Hybrid</option>
                        </select>
                        <Err field="workMode" />
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
                        <label>Enter Location <span className="text-danger">*</span></label>
                        {isLoaded ? (
                          <Autocomplete
                            onLoad={(auto) => setAutocomplete(auto)}
                            onPlaceChanged={onPlaceChanged}
                            options={{
                              componentRestrictions: { country: "au" }, // ← Australia only
                              types: ["address"],
                            }}
                          >
                            <input
                              type="text"
                              className={`form-control ${errors.address ? "is-invalid" : ""}`}
                              placeholder="Type your location..."
                              value={formData.address}
                              onChange={handleAddressChange}
                            />
                          </Autocomplete>
                        ) : (
                          <input type="text" className="form-control" placeholder="Loading..." disabled />
                        )}
                        <Err field="address" />
                      </div>

                      {/* Replace City/State/Country fields with City/Suburb/Country: */}
                      {/* <div className="col-md-4">
                        <label>City</label>
                        <input className="form-control" value={formData.city}
                          onChange={(e) => handleChange("city", e.target.value)} />
                      </div> */}
                      <div className="col-md-6">
                        <label>Suburb</label>  {/* ← was State */}
                        <input className="form-control" value={formData.suburb}
                          onChange={(e) => handleChange("suburb", e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label>Country</label>
                        <input className="form-control" value={formData.country}
                          onChange={(e) => handleChange("country", e.target.value)} />
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
                    <h5>Salary </h5>
                    <div className="row g-3">

                      <div className="col-md-4">
                      <label>Salary Type <span className="text-danger">*</span></label>
                      <select
                        className={`form-select ${errors.salary_type ? "is-invalid" : ""}`}
                        value={formData.salary_type}
                        onChange={(e) => {
                          handleChange("salary_type", e.target.value);
                          if (errors.salary_type) setErrors(prev => ({ ...prev, salary_type: "" }));
                        }}
                      >
                        <option value="">Select type</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="fortnightly">Fortnightly</option>
                        <option value="monthly">Monthly</option>
                        <option value="annually">Annually</option>
                      </select>
                      <Err field="salary_type" />
                    </div>

                      <div className="col-md-4">
                        <label>Min Salary  <span className="text-danger">*</span></label>
                        <div className="input-group">
                          <span className="input-group-text">AU$</span>
                          <input
                            className={`form-control ${errors.minSalary ? "is-invalid" : ""}`}
                            value={formData.minSalary}
                            onChange={(e) => handleOnlyNumbers("minSalary", e.target.value)}
                          />
                        </div>
                        <Err field="minSalary" />
                      </div>

                      <div className="col-md-4">
                        <label>Max Salary  <span className="text-danger">*</span></label>
                        <div className="input-group">
                          <span className="input-group-text">AU$</span>
                          <input
                            className={`form-control ${errors.maxSalary ? "is-invalid" : ""}`}
                            value={formData.maxSalary}
                            onChange={(e) => handleOnlyNumbers("maxSalary", e.target.value)}
                          />
                        </div>
                        <Err field="maxSalary" />
                      </div>

                      <div className="col-12">
                        <label className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={formData.is_salary_hidden}
                            onChange={(e) => handleChange("is_salary_hidden", e.target.checked)}
                          />
                          Do you want to hide salary?
                        </label>
                      </div>

                      {/* <div className="col-12">
                      <label className="d-flex align-items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.negotiable}
                          onChange={(e) => handleChange("negotiable", e.target.checked)}
                          className="m-0"
                        />
                        Salary is negotiable
                      </label>
                    </div> */}

                      

                     <div className="col-12">
                        <label>Upload Cover Image (optional)</label>
                        <label htmlFor="upload_input" className="upload_wrapper mt-2">
                          <UploadCloud className="text_theme" size={60} />
                        </label>
                        <small className="text-muted d-block">Recommended size: 1200 × 400 px</small>
                        {errors.images && (
                          <div className="text-danger small mt-1">{errors.images}</div>
                        )}
                        <input
                          id="upload_input"
                          type="file"
                          accept="image/*"
                          className="form-control d-none"
                          onChange={handleImages}
                        />
                        <div className="d-flex flex-wrap gap-2 mt-3">
                          {formData.images.map((file, i) => (
                            <div key={i} style={{ position: "relative" }}>
                              <img
                                src={URL.createObjectURL(file)}
                                width="210"
                                height="70"
                                style={{ objectFit: "cover", borderRadius: "6px" }}
                                alt="cover"
                              />
                              <span
                                onClick={() => handleChange("images", [])}
                                style={{
                                  position: "absolute", top: "-6px", right: "-6px",
                                  background: "red", color: "#fff", borderRadius: "50%",
                                  width: "18px", height: "18px", fontSize: "12px",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  cursor: "pointer",
                                }}
                              >✕</span>
                            </div>
                          ))}
                        </div>
                      </div>


                      <div className="col-12">
                        <label>Video URL (optional)</label>
                        <input className="form-control" value={formData.videoUrl} onChange={(e) => handleChange("videoUrl", e.target.value)} />
                      </div>


                      <div className="col-12">
                        <label>Application Deadline (Maximum application deadline is 45 days)</label>
                        <input
                          type="date"
                          className={`form-control ${errors.deadline ? "is-invalid" : ""}`}
                          value={formData.deadline}
                          min={(() => {
                              const tomorrow = new Date();
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              return tomorrow.toISOString().split("T")[0];
                            })()}
                          max={(() => {
                            const maxDate = new Date();
                            maxDate.setDate(maxDate.getDate() + 45);
                            return maxDate.toISOString().split("T")[0];
                          })()}
                          onChange={(e) => {
                            const value = e.target.value;
                            const error = validateDeadline(value);
                            handleChange("deadline", value);
                            setErrors((prev) => ({ ...prev, deadline: error }));
                          }}
                        />
                        <Err field="deadline" />
                      </div>

                    </div>
                    <div className="mt-3 d-flex justify-content-between">
                      <button type="button" className="btn btn-light" onClick={back}>Back</button>
                      <button type="button" className="btn btn-primary" onClick={next}>Next</button>
                    </div>
                  </div>
                )}

                {/* ===== STEP 4 ===== */}
                {step === 4 && (
                  <div className="card p-4">
                    <h5 className="mb-3">Apply Type</h5>

                    <div className="mb-4">
                      <label className="fw-semibold mb-3 d-block">
                        How should candidates apply? <span className="text-danger">*</span>
                      </label>

                      <div className="d-flex gap-4">
                        {/* Easy Apply */}
                        <label
                          className="d-flex align-items-center gap-2"
                          style={{ cursor: "pointer", fontWeight: applyType === "internal" ? 600 : 400 }}
                        >
                          <input
                            type="radio"
                            name="applyType"
                            value="internal"
                            checked={applyType === "internal"}
                            onChange={() => {
                              setApplyType("internal");
                              setErrors(prev => ({ ...prev, applyType: "", applyUrl: "" }));

                              // CLEAR external field
                              setFormData(prev => ({ ...prev, applyUrl: "" }));

                              // Only fetch if questions not yet loaded
                              if (questions.length === 0) fetchQuestions();
                            }}
                          />
                          Easy Apply
                        </label>

                        {/* External Apply */}
                        <label
                          className="d-flex align-items-center gap-2"
                          style={{ cursor: "pointer", fontWeight: applyType === "external" ? 600 : 400 }}
                        >
                          <input
                            type="radio"
                            name="applyType"
                            value="external"
                            checked={applyType === "external"}
                            onChange={() => {
                              setApplyType("external");
                              setErrors(prev => ({ ...prev, applyType: "" }));

                              // CLEAR all Easy Apply selections
                              setQuestionSelections(prev => {
                                const reset = {};
                                Object.keys(prev).forEach(id => {
                                  reset[id] = { selected: false, required: false };
                                });
                                return reset;
                              });
                            }}
                          />
                          Apply
                        </label>
                      </div>

                      {errors.applyType && (
                        <div className="text-danger small mt-2">{errors.applyType}</div>
                      )}
                    </div>

                    {/* Easy Apply: Show Questions */}
                    {applyType === "internal" && (
                      <div>
                        <label className="fw-semibold mb-3 d-block">Screening Questions</label>
                        {questionsLoading ? (
                          <p className="text-muted">
                            <i className="fas fa-spinner fa-spin me-2"></i>Loading questions...
                          </p>
                        ) : questions.length === 0 ? (
                          <p className="text-muted">No questions available.</p>
                        ) : (
                          <div className="d-flex flex-column gap-3">
                            {questions.map((q) => {
                              const sel = questionSelections[q.id] || { selected: false, required: false };
                              return (
                                <div
                                  key={q.id}
                                  className="p-3"
                                  style={{
                                    border: `1px solid ${sel.selected ? "var(--secondary, #0d6efd)" : "#dee2e6"}`,
                                    borderRadius: "8px",
                                    background: sel.selected ? "#f0f4ff" : "#fff",
                                    transition: "all 0.2s",
                                  }}
                                >
                                  <div className="d-flex align-items-start gap-3">
                                    {/* Select checkbox */}
                                    <input
                                      type="checkbox"
                                      id={`q_sel_${q.id}`}
                                      checked={sel.selected}
                                      onChange={(e) => {
                                        setQuestionSelections(prev => ({
                                          ...prev,
                                          [q.id]: {
                                            ...prev[q.id],
                                            selected: e.target.checked,
                                            required: e.target.checked ? prev[q.id]?.required : false,
                                          },
                                        }));
                                      }}
                                      style={{ marginTop: "3px", cursor: "pointer", width: "16px", height: "16px" }}
                                    />
                                    <div className="flex-grow-1">
                                      <label
                                        htmlFor={`q_sel_${q.id}`}
                                        style={{ cursor: "pointer", fontWeight: 500, marginBottom: "4px", display: "block" }}
                                      >
                                        {q.question}
                                      </label>

                                      {/* Ans type badge */}
                                      <span
                                        style={{
                                          fontSize: "12px",
                                          background: "#e9ecef",
                                          color: "#495057",
                                          padding: "2px 8px",
                                          borderRadius: "12px",
                                          display: "inline-block",
                                        }}
                                      >
                                        Ans type:{" "}
                                        <strong>
                                          {Array.isArray(q.options)
                                            ? q.options.join(" / ")
                                            : q.type === "radio"
                                            ? "Yes / No"
                                            : q.type}
                                        </strong>
                                      </span>

                                      {/* Required toggle — only show if selected */}
                                      {sel.selected && (
                                        <div className="mt-2">
                                          <label
                                            className="d-flex align-items-center gap-2"
                                            style={{ cursor: "pointer", fontSize: "13px", color: "#374151" }}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={sel.required}
                                              onChange={(e) => {
                                                setQuestionSelections(prev => ({
                                                  ...prev,
                                                  [q.id]: { ...prev[q.id], required: e.target.checked },
                                                }));
                                              }}
                                            />
                                            Mark as required
                                          </label>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* External Apply: URL input */}
                    {applyType === "external" && (
                      <div className="mt-2">
                        <label className="fw-semibold mb-2 d-block">
                          External Application URL <span className="text-danger">*</span>
                        </label>
                        <input
                          className={`form-control ${errors.applyUrl ? "is-invalid" : ""}`}
                          placeholder="https://yourcompany.com/apply"
                          value={formData.applyUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleChange("applyUrl", val);
                            setErrors(prev => ({ ...prev, applyUrl: val.trim() ? validateUrl(val) : "" }));
                          }}
                        />
                        {errors.applyUrl && (
                          <div className="text-danger small mt-1">{errors.applyUrl}</div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 d-flex justify-content-between">
                      <button type="button" className="btn btn-light" onClick={back}>Back</button>
                      <button type="button" className="btn btn-primary" onClick={handleSubmitClick}>
                        Submit Job
                      </button>
                    </div>
                  </div>
                )}


              </form>
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

                    {showResend && (
                      <div className="text-end my-2">
                        <button
                          type="button"
                          className="text_blue"
                          style={{
                            textDecoration: "underline",
                            border: "none",
                            background: "none",
                            cursor: "pointer"
                          }}
                          onClick={handleResend}
                          disabled={resendLoading}
                        >
                          {resendLoading ? "Sending..." : "Resend Verification Link"}
                        </button>
                      </div>
                    )}

                    {/* <button className="btn-post w-100 mt-3" onClick={handleLogin} disabled={loading}>
                      {loading ? "Please wait..." : "Login & Submit Job"}
                    </button> */}
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
                          placeholder="John Doe"
                          value={employerData.name}
                          onChange={(e) => handleEmployerChange("name", e.target.value)}
                        />
                        {authErrors.name && <div className="text-danger small mt-1">{authErrors.name}</div>}
                      </div>

                      <div className="col-md-6">
                       <label>Designation <span className="text-danger">*</span></label>
                    <input
                      className={`form-control ${authErrors.designation ? "is-invalid" : ""}`}
                      placeholder="e.g. Director"
                      value={employerData.designation}
                      onChange={(e) => handleEmployerChange("designation", e.target.value)}
                    />
                    {authErrors.designation && <div className="text-danger small mt-1">{authErrors.designation}</div>}
                      </div>

                      <div className="col-12">
                        <label>Institution Name <span className="text-danger">*</span></label>
                        <input
                          className={`form-control ${authErrors.institution_name ? "is-invalid" : ""}`}
                          placeholder="e.g. ABC Institution"
                          value={employerData.institution_name}
                          onChange={(e) => handleEmployerChange("institution_name", e.target.value)}
                        />
                        {authErrors.institution_name && <div className="text-danger small mt-1">{authErrors.institution_name}</div>}
                      </div>

                      <div className="col-12">
                        <label>Tax / ABN Number <span className="text-danger">*</span></label>
                        <input
                          className={`form-control ${authErrors.tax_avin_number ? "is-invalid" : ""}`}
                          placeholder="e.g. 12 345 678 901"
                          value={employerData.tax_avin_number}
                          maxLength={15}
                          onChange={(e) => handleEmployerChange("tax_avin_number", e.target.value)}
                        />
                        {authErrors.tax_avin_number && <div className="text-danger small mt-1">{authErrors.tax_avin_number}</div>}
                     </div>

                     <div className="col-12">
                      <label>Upload Company Logo</label>

                      <label htmlFor="logo_upload" className="upload_wrapper mt-2">
                        <UploadCloud size={50} className="text_theme" />
                      </label>

                      <input
                        id="logo_upload"
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={(e) => handleLogoUpload(e.target.files[0])}
                      />

                      {logoPreview && (
                        <div className="mt-2 position-relative" style={{ width: "80px" }}>
                          <img
                            src={logoPreview}
                            alt="logo"
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "6px",
                            }}
                          />
                          <span
                            onClick={() => {
                              handleEmployerChange("profile_image", null);
                              setLogoPreview(null);
                            }}
                            style={{
                              position: "absolute",
                              top: "-6px",
                              right: "-6px",
                              background: "red",
                              color: "#fff",
                              borderRadius: "50%",
                              width: "18px",
                              height: "18px",
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </span>
                        </div>
                      )}
                    </div>

                      <div className="col-md-6">
                        <label>Email <span className="text-danger">*</span></label>
                        <input
                          type="email"
                          className={`form-control ${authErrors.email ? "is-invalid" : ""}`}
                          placeholder="yourmail@123.com"
                          value={employerData.email}
                          onChange={(e) => handleEmployerChange("email", e.target.value)}
                        />
                        {authErrors.email && <div className="text-danger small mt-1">{authErrors.email}</div>}
                      </div>

                      <div className="col-md-6">
                        <label>Phone <span className="text-danger">*</span></label>
                        <input
                          className={`form-control ${authErrors.phone ? "is-invalid" : ""}`}
                          placeholder="+61 123 123 123"
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

                    {/* <button className="btn-post w-100 mt-4" onClick={handleSignup} disabled={loading}>
                      {loading ? "Please wait..." : "Sign Up & Submit Job"}
                    </button> */}
                  </div>
                )}
              </div>

              <div className="modal-footer p-3">
                 {/* API Response Message */}
                {apiMessage.text && (
                  <div className={`text-center fw-semibold ${apiMessage.success ? "text-success" : "text-danger"}  mb-2 w-100`}>
                    {apiMessage.text}
                  </div>
                )}

                {authMode === "login" ? (
                  <button
                    className="btn-post w-100"
                    onClick={handleLogin}
                    disabled={loading}
                  >
                    {loading ? "Please wait..." : "Login & Submit Job"}
                  </button>
                ) : (
                  <button
                    className="btn-post w-100"
                    onClick={handleSignup}
                    disabled={loading}
                  >
                    {loading ? "Please wait..." : "Sign Up & Submit Job"}
                  </button>
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
            z-index: 10000;
          }
          .modal-container {
            background: white; border-radius: 12px;
            width: 90%; max-width: 550px; 
             animation: slideIn 0.3s ease;
             overflow:hidden;
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
          .modal-body { padding: 1rem 1.5rem 1.5rem; max-height: 80vh;
            overflow-y: auto; }

           .modal-footer { box-shadow: 0 -4px 10px rgba(0,0,0,0.05); }
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