import { useRef, useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import DashSidebar from "./DashSidebar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import toast from "react-hot-toast";
import "react-phone-input-2/lib/style.css";
import ReactPhoneInput from "react-phone-input-2";

// Fix for CJS/ESM interop — some bundlers expose .default, some don't
const PhoneInput = ReactPhoneInput?.default ?? ReactPhoneInput;

// ─── Constants ───────────────────────────────────────────────────────────────
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// ─── Small helpers ────────────────────────────────────────────────────────────
const emptyEducation = () => ({
  id: Date.now(),
  degree_name: "",
  institution_name: "",
  start_year: "",
  end_year: "",
  grade: "",
});

const emptyExperience = () => ({
  id: Date.now() + 1,
  institution_name: "",
  role: "",
  start_date: "",
  end_date: "",
  currently_working: false,
  description: "",
});

// ─── Year validation helper ───────────────────────────────────────────────────
const validateYears = (start, end, isCurrentlyWorking = false) => {
  const s = parseInt(start, 10);
  const e = parseInt(end, 10);

  if (!start && !end) return null;
  if (start && (isNaN(s) || s === 0)) return "Start year cannot be zero.";
  if (!isCurrentlyWorking) {
    if (end && (isNaN(e) || e === 0)) return "End year cannot be zero.";
    if (start && end && e < s) return "End year cannot be less than start year.";
  }
  return null;
};

// ─── Google Places Autocomplete hook ─────────────────────────────────────────
// ─── Load Google Maps script — returns a Promise so we wait for it ───────────
const loadGoogleMapsScript = (() => {
  let promise = null;
  return () => {
    if (promise) return promise;
    promise = new Promise((resolve) => {
      if (window.google?.maps?.places) { resolve(); return; }
      const existing = document.getElementById("google-maps-script");
      if (existing) { existing.addEventListener("load", resolve); return; }
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      document.head.appendChild(script);
    });
    return promise;
  };
})();

// ─── Google Places Autocomplete hook ─────────────────────────────────────────
const useGooglePlaces = (inputRef, onSelect) => {
  useEffect(() => {
    let autocomplete;
    loadGoogleMapsScript().then(() => {
      if (!inputRef.current) return;
      autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["geocode"],
        fields: ["address_components", "formatted_address"],
      });
      // Stop Enter key from submitting any parent form
      inputRef.current.addEventListener("keydown", (e) => {
        if (e.key === "Enter") e.preventDefault();
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.address_components) return;
        let city = "", state = "", country = "";
        place.address_components.forEach((comp) => {
          if (comp.types.includes("locality")) city = comp.long_name;
          if (comp.types.includes("administrative_area_level_1")) state = comp.long_name;
          if (comp.types.includes("country")) country = comp.long_name;
        });
        onSelect({ address: place.formatted_address, city, state, country });
      });
    });
    return () => {
      if (autocomplete) window.google?.maps?.event?.clearInstanceListeners(autocomplete);
    };
  }, [inputRef, onSelect]);
};

// ─── EducationRow ─────────────────────────────────────────────────────────────
const EducationRow = ({ row, onChange, onRemove, showRemove }) => {
  const yearError = validateYears(row.start_year, row.end_year);

  const handleNumberOnly = (field) => (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    onChange(row.id, field, val);
  };

  return (
    <div className="education_entry border rounded p-3 mb-3 position-relative">
      {showRemove && (
        <button
          type="button"
          className="btn btn-sm btn-danger position-absolute"
          style={{ top: 10, right: 10 }}
          onClick={() => onRemove(row.id)}
        >
          <i className="fa fa-trash"></i> Remove
        </button>
      )}
      <div className="row">
        <div className="col-md-6 mb-4">
          <label className="mb-2">Class / Degree Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="i.e Class 10th / Bachelor of Arts"
            value={row.degree_name}
            onChange={(e) => onChange(row.id, "degree_name", e.target.value)}
          />
        </div>
        <div className="col-md-6 mb-4">
          <label className="mb-2">University / Institution Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="i.e Harvard University"
            value={row.institution_name}
            onChange={(e) => onChange(row.id, "institution_name", e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-4">
          <label className="mb-2">Start Year</label>
          <input
            type="text"
            className="form-control"
            placeholder="i.e 2020"
            maxLength={4}
            value={row.start_year}
            onChange={handleNumberOnly("start_year")}
          />
        </div>
        <div className="col-md-4 mb-4">
          <label className="mb-2">End Year</label>
          <input
            type="text"
            className="form-control"
            placeholder="i.e 2023"
            maxLength={4}
            value={row.end_year}
            onChange={handleNumberOnly("end_year")}
          />
        </div>
        <div className="col-md-4 mb-4">
          <label className="mb-2">Grade / CGPA</label>
          <input
            type="text"
            className="form-control"
            placeholder="i.e A / 8.5"
            value={row.grade}
            onChange={(e) => onChange(row.id, "grade", e.target.value)}
          />
        </div>
        {yearError && (
          <div className="col-12 mb-2">
            <small className="text-danger">{yearError}</small>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ExperienceRow ────────────────────────────────────────────────────────────
const ExperienceRow = ({ row, onChange, onRemove, showRemove }) => {
  const dateError = (() => {
    if (!row.start_date) return null;
    if (!row.currently_working && row.end_date && row.end_date < row.start_date)
      return "End date cannot be before start date.";
    return null;
  })();

  return (
    <div className="experience_entry border rounded p-3 mb-3 position-relative">
      {showRemove && (
        <button
          type="button"
          className="btn btn-sm btn-danger position-absolute"
          style={{ top: 10, right: 10 }}
          onClick={() => onRemove(row.id)}
        >
          <i className="fa fa-trash"></i> Remove
        </button>
      )}
      <div className="row align-items-end">
        <div className="col-md-6 mb-4">
          <label className="mb-2">University / Institution Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="i.e Harvard University"
            value={row.institution_name}
            onChange={(e) => onChange(row.id, "institution_name", e.target.value)}
          />
        </div>
        <div className="col-md-6 mb-4">
          <label className="mb-2">Role / Position</label>
          <input
            type="text"
            className="form-control"
            placeholder="i.e Team Leader"
            value={row.role}
            onChange={(e) => onChange(row.id, "role", e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-4">
          <label className="mb-2">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={row.start_date}
            onChange={(e) => onChange(row.id, "start_date", e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-4">
          <label className="mb-2">End Date</label>
          <input
            type="date"
            className="form-control"
            disabled={row.currently_working}
            value={row.currently_working ? "" : row.end_date}
            onChange={(e) => onChange(row.id, "end_date", e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-4">
          <div className="form-check mt-4 pt-2">
            <input
              className="form-check-input"
              type="checkbox"
              id={`currently_working_${row.id}`}
              checked={row.currently_working}
              onChange={(e) => onChange(row.id, "currently_working", e.target.checked)}
            />
            <label className="form-check-label" htmlFor={`currently_working_${row.id}`}>
              Currently Working Here
            </label>
          </div>
        </div>
        {dateError && (
          <div className="col-12 mb-2">
            <small className="text-danger">{dateError}</small>
          </div>
        )}
        <div className="col-12 mb-4">
          <label className="mb-2">Description</label>
          <textarea
            className="form-control"
            placeholder="Description of your responsibilities..."
            value={row.description}
            onChange={(e) => onChange(row.id, "description", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Main Profile Component ───────────────────────────────────────────────────
const Profile = () => {
  const fileInputRef = useRef(null);
  const addressInputRef = useRef(null);
  const { user } = useAuth();

  // Personal Details
  const [profileImage, setProfileImage] = useState("/images/default_img.png");
  const [profileFile, setProfileFile] = useState(null);
  const [phone, setPhone] = useState(user?.phone || "");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Professional Details
  const [qualification, setQualification] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [currentSchool, setCurrentSchool] = useState("");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    facebook: "", instagram: "", linkedin: "", twitter: "",
  });

  // Education & Experience
  const [educationRows, setEducationRows] = useState([emptyEducation()]);
  const [experienceRows, setExperienceRows] = useState([emptyExperience()]);

  // Password
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  const handleAddressSelect = useCallback(({ address, city, state, country }) => {
    setAddress(address);
    setCity(city);
    setState(state);
    setCountry(country);
  }, []);

  useGooglePlaces(addressInputRef, handleAddressSelect);

  const handleUploadClick = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPEG or PNG).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2 MB.");
      return;
    }
    setProfileFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setProfileImage("/images/default_img.png");
    setProfileFile(null);
    fileInputRef.current.value = null;
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed for resume.");
      e.target.value = null;
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Resume must be less than 2 MB.");
      e.target.value = null;
      return;
    }
    setResumeFile(file);
  };

  const handleExperienceYearsChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    setExperienceYears(val);
  };

  const handleEducationChange = (id, field, value) =>
    setEducationRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const addEducationRow = () => setEducationRows((prev) => [...prev, emptyEducation()]);
  const removeEducationRow = (id) => setEducationRows((prev) => prev.filter((r) => r.id !== id));

  const handleExperienceChange = (id, field, value) =>
    setExperienceRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const addExperienceRow = () => setExperienceRows((prev) => [...prev, emptyExperience()]);
  const removeExperienceRow = (id) => setExperienceRows((prev) => prev.filter((r) => r.id !== id));

  const validateAllYears = () => {
    for (const row of educationRows) {
      const err = validateYears(row.start_year, row.end_year);
      if (err) { toast.error(`Education: ${err}`); return false; }
    }
    for (const row of experienceRows) {
      if (row.start_date && !row.currently_working && row.end_date && row.end_date < row.start_date) {
        toast.error("Experience: End date cannot be before start date.");
        return false;
      }
    }
    return true;
  };

  const handleUpdateProfile = () => {
    if (!validateAllYears()) return;
    const formData = new FormData();
    if (profileFile) formData.append("profile_image", profileFile);
    if (resumeFile) formData.append("resume", resumeFile);
    formData.append("phone", phone);
    formData.append("date_of_birth", dateOfBirth);
    formData.append("gender", gender);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("state", state);
    formData.append("country", country);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("qualification", qualification);
    formData.append("specialization", specialization);
    formData.append("experience_years", experienceYears);
    formData.append("current_school", currentSchool);
    formData.append("bio", bio);
    formData.append("social_links", JSON.stringify(socialLinks));
    formData.append("education", JSON.stringify(educationRows));
    formData.append("experience", JSON.stringify(experienceRows));
    console.log("Submitting profile...", Object.fromEntries(formData));
    // toast.success("Profile updated successfully!");
  };

  const handleUpdatePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    toast.success("Password updated successfully!");
  };

  return (
    <>
      <div className="my_account blue_nav">
        <Navbar />
        <div className="profile_page top_padding">
          <div className="container py-4">
            <div className="row">
              <h1 className="mb-3 sec-title text-center">My Profile</h1>

              <div className="col-lg-4 col-xl-3 mb-4 mb-lg-0">
                <DashSidebar />
              </div>

              <div className="col-lg-8 col-xl-9 mb-4 mb-lg-0">
                <div className="row">
                  {/* PERSONAL DETAILS */}
                  <div className="col-12 mb-4">
                    <div className="card border-0 h-100">
                      <h5 className="fw-semibold text_blue">Personal Details</h5>

                      <div className="d-flex align-items-sm-end mt-3 profile_image_wrapper border-bottom pb-3">
                        <div className="profile_image position-relative me-4">
                          <img src={profileImage} className="w-100 h-100" alt="Profile Preview" />
                          {profileImage !== "/images/default_img.png" && (
                            <div
                              className="remove_profile"
                              onClick={handleRemoveImage}
                              style={{ cursor: "pointer" }}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            id="upload_image"
                            ref={fileInputRef}
                            accept="image/jpeg,image/png"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                          />
                          <button className="btn-post mb-2" onClick={handleUploadClick}>
                            Upload Image <i className="fas fa-upload"></i>
                          </button>
                          <p className="mb-0">Image must be JPEG or PNG format and less than 2 MB.</p>
                        </div>
                      </div>

                      <div className="row mt-3 mb-3">
                        <div className="col-md-6 mb-4">
                          <label className="mb-2">Full Name</label>
                          <input type="text" className="form-control" value={user?.name || ""} readOnly />
                        </div>

                        <div className="col-md-6 mb-4">
                          <label className="mb-2">Email</label>
                          <input type="email" className="form-control" value={user?.email || ""} readOnly />
                        </div>

                        <div className="col-md-6 mb-4">
                          <label className="mb-2">Phone Number</label>
                          <PhoneInput
                            country={"au"}
                            value={phone}
                            onChange={(val) => setPhone(val)}
                            inputClass="form-control w-100"
                            containerClass="phone-input-container"
                            enableSearch
                            searchPlaceholder="Search country..."
                          />
                        </div>

                        <div className="col-md-6 mb-4">
                          <label className="mb-2">Gender</label>
                          <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Others</option>
                          </select>
                        </div>

                        <div className="col-md-6 mb-4">
                          <label className="mb-2">Date of Birth</label>
                          <input
                            type="date"
                            className="form-control"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                          />
                        </div>

                        <div className="col-md-6 mb-4">
                          <label className="mb-2">Upload Resume</label>
                          <input
                            type="file"
                            className="form-control upload_resume_input"
                            accept="application/pdf"
                            onChange={handleResumeChange}
                          />
                          <small className="text-muted">(PDF only, max size 2 MB)</small>
                        </div>

                        <div className="col-12 mb-4">
                          <label className="mb-2">Address</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Start typing your address..."
                            ref={addressInputRef}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />
                          <small className="text-muted">
                            Select from suggestions to auto-fill city, state & country.
                          </small>
                        </div>

                        <div className="col-md-4 mb-4">
                          <label className="mb-2">City</label>
                          <input type="text" className="form-control" placeholder="i.e Sydney" value={city} onChange={(e) => setCity(e.target.value)} />
                        </div>

                        <div className="col-md-4 mb-4">
                          <label className="mb-2">State</label>
                          <input type="text" className="form-control" placeholder="i.e New South Wales" value={state} onChange={(e) => setState(e.target.value)} />
                        </div>

                        <div className="col-md-4 mb-4">
                          <label className="mb-2">Country</label>
                          <input type="text" className="form-control" placeholder="i.e Australia" value={country} onChange={(e) => setCountry(e.target.value)} />
                        </div>
                      </div>

                      {/* PROFESSIONAL DETAILS */}
                      <h5 className="fw-semibold text_blue">Professional Details</h5>
                      <div className="row mt-3 mb-3">
                        <div className="col-md-6 mb-4">
                          <label className="mb-2">Qualification</label>
                          <input type="text" className="form-control" placeholder="i.e Bachelor of Arts" value={qualification} onChange={(e) => setQualification(e.target.value)} />
                        </div>

                        <div className="col-md-6 mb-4">
                          <label className="mb-2">Specialization</label>
                          <input type="text" className="form-control" placeholder="i.e Painting" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                        </div>

                        <div className="col-md-6 mb-4">
                          <label className="mb-2">Experience (In Years)</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="i.e 10"
                            maxLength={2}
                            value={experienceYears}
                            onChange={handleExperienceYearsChange}
                          />
                        </div>

                        <div className="col-md-6 mb-4">
                          <label className="mb-2">Current Company / Institution</label>
                          <input type="text" className="form-control" placeholder="i.e XYZ Institution Ltd." value={currentSchool} onChange={(e) => setCurrentSchool(e.target.value)} />
                        </div>

                        <div className="col-12 mb-4">
                          <label className="mb-2">About Me</label>
                          <textarea rows={5} className="form-control" placeholder="Write about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} />
                        </div>

                        {["Facebook", "Instagram", "LinkedIn", "Twitter"].map((item) => (
                          <div className="col-lg-6 mb-4" key={item}>
                            <label className="mb-2">{item} URL</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder={`https://${item.toLowerCase()}.com`}
                              value={socialLinks[item.toLowerCase()]}
                              onChange={(e) =>
                                setSocialLinks((prev) => ({ ...prev, [item.toLowerCase()]: e.target.value }))
                              }
                            />
                          </div>
                        ))}
                      </div>

                      {/* EDUCATION */}
                      <h5 className="fw-semibold text_blue">Education</h5>
                      <div className="mt-3 mb-3">
                        {educationRows.map((row) => (
                          <EducationRow
                            key={row.id}
                            row={row}
                            onChange={handleEducationChange}
                            onRemove={removeEducationRow}
                            showRemove={educationRows.length > 1}
                          />
                        ))}
                        <button type="button" className="btn-post w-auto btn-sm px-3" onClick={addEducationRow}>
                           Add Education <i className="fa fa-plus ms-1"></i>
                        </button>
                      </div>

                      {/* WORK EXPERIENCE */}
                      <h5 className="fw-semibold text_blue">Work Experience</h5>
                      <div className="mt-3 mb-3">
                        {experienceRows.map((row) => (
                          <ExperienceRow
                            key={row.id}
                            row={row}
                            onChange={handleExperienceChange}
                            onRemove={removeExperienceRow}
                            showRemove={experienceRows.length > 1}
                          />
                        ))}
                        <button type="button" className="btn-post w-auto btn-sm px-3" onClick={addExperienceRow}>
                           Add Experience <i className="fa fa-plus ms-1"></i>
                        </button>
                      </div>

                      <div className="d-flex justify-content-end mt-4">
                        <button type="button" className="btn-login px-3" onClick={handleUpdateProfile}>
                          Update Profile <i className="fas fa-arrow-right-long"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                
                
                  {/* CHANGE PASSWORD */}
                  <div className="col-xl-12 d-flex flex-column mb-4 mb-xl-0">
                    <div className="card border-0 card_height password_card">
                      <h5 className="fw-semibold text_blue">Change Password</h5>
                      <div className="row mt-3">
                        <div className="col-lg-6 mb-4 position-relative">
                          <label className="mb-2">Old Password</label>
                          <input
                            type={showOld ? "text" : "password"}
                            className="form-control"
                            autoComplete="current-password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                          />
                          <i
                            className={`fa ${showOld ? "fa-eye" : "fa-eye-slash"} position-absolute`}
                            onClick={() => setShowOld(!showOld)}
                          />
                        </div>

                        <div className="col-lg-6 mb-4 position-relative">
                          <label className="mb-2">New Password</label>
                          <input
                            type={showNew ? "text" : "password"}
                            className="form-control"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <i
                            className={`fa ${showNew ? "fa-eye" : "fa-eye-slash"} position-absolute`}
                            onClick={() => setShowNew(!showNew)}
                          />
                        </div>

                        <div className="col-12 mb-4 position-relative">
                          <label className="mb-2">Confirm Password</label>
                          <input
                            type={showConfirm ? "text" : "password"}
                            className="form-control"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <i
                            className={`fa ${showConfirm ? "fa-eye" : "fa-eye-slash"} position-absolute`}
                            onClick={() => setShowConfirm(!showConfirm)}
                          />
                        </div>

                        <div className="d-flex justify-content-end">
                          <button type="button" className="btn-login px-3" onClick={handleUpdatePassword}>
                            Update Password <i className="fas fa-arrow-right-long"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Profile;
