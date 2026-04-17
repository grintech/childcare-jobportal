import { useRef, useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import toast from "react-hot-toast";
import "react-phone-input-2/lib/style.css";
import ReactPhoneInput from "react-phone-input-2";
import api from "../../services/api";
import { File, FileIcon } from "lucide-react";
import ProfileSkeleton from "../../components/skeletons/ProfileSkeleton";
import { UploadCloud, Trash2 } from "lucide-react";

import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { object } from "framer-motion/client";

const LIBRARIES = ["places"];

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
const CURRENT_YEAR = new Date().getFullYear();

const validateYears = (start, end, isCurrentlyWorking = false) => {
  const s = parseInt(start, 10);
  const e = parseInt(end, 10);

  if (!start && !end) return null;

  if (start) {
    if (isNaN(s) || s === 0) return "Start year cannot be zero.";
    if (s < 1900 || s > CURRENT_YEAR) return `Start year must be between 1900 and ${CURRENT_YEAR}.`;
  }

  if (!isCurrentlyWorking && end) {
    if (isNaN(e) || e === 0) return "End year cannot be zero.";
    if (e < 1900 || e > CURRENT_YEAR + 10) return `End year must be between 1900 and ${CURRENT_YEAR + 10}.`;
    if (start && e < s) return "End year cannot be less than start year.";
  }

  return null;
};


// ─── EducationRow ─────────────────────────────────────────────────────────────
const EducationRow = ({ row, onChange, onRemove, showRemove }) => {
  const yearError = validateYears(row.start_year, row.end_year);

  const handleNumberOnly = (field) => (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    onChange(row.id, field, val);
  };

  // Validate on blur — clear invalid value
  const handleYearBlur = (field) => (e) => {
    const val = e.target.value;
    if (val.length > 0 && val.length < 4) {
      onChange(row.id, field, ""); // clear incomplete
    }
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
          <i className="fa fa-trash"></i>
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
            className={`form-control ${yearError && row.start_year ? "is-invalid" : ""}`}
            placeholder="i.e 2020"
            maxLength={4}
            value={row.start_year}
            onChange={handleNumberOnly("start_year")}
            onBlur={handleYearBlur("start_year")}
          />
        </div>
        <div className="col-md-4 mb-4">
          <label className="mb-2">End Year</label>
          <input
            type="text"
            className={`form-control ${yearError && row.end_year ? "is-invalid" : ""}`}
            placeholder="i.e 2023"
            maxLength={4}
            value={row.end_year}
            onChange={handleNumberOnly("end_year")}
            onBlur={handleYearBlur("end_year")}
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

    // Guard: start_date must be a real date (not 0000-00-00)
    const start = new Date(row.start_date);
    if (isNaN(start.getTime()) || start.getFullYear() < 1900)
      return "Please enter a valid start date.";

    if (!row.currently_working && row.end_date) {
      const end = new Date(row.end_date);
      if (isNaN(end.getTime()) || end.getFullYear() < 1900)
        return "Please enter a valid end date.";
      if (end < start)
        return "End date cannot be before start date.";
    }

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
          <i className="fa fa-trash"></i>
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
            className={`form-control ${dateError && row.start_date ? "is-invalid" : ""}`}
            value={row.start_date}
            min="1900-01-01"
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => onChange(row.id, "start_date", e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-4">
          <label className="mb-2">End Date</label>
          <input
            type="date"
            className={`form-control ${dateError && row.end_date && !row.currently_working ? "is-invalid" : ""}`}
            disabled={row.currently_working}
            value={row.currently_working ? "" : row.end_date}
            min={row.start_date || "1900-01-01"}
            max={new Date(new Date().setFullYear(new Date().getFullYear() + 10))
              .toISOString().split("T")[0]}
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
  // const [state, setState] = useState("");
  const [suburb, setSuburb] = useState("");
  const [country, setCountry] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [autocomplete, setAutocomplete] = useState(null);

  const [profileCompletion, setProfileCompletion] = useState(0);

  // Professional Details
  const [qualification, setQualification] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [currentSchool, setCurrentSchool] = useState("");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
  });
  const [existingResume, setExistingResume] = useState(null);
  const [removeResume, setRemoveResume] = useState(false);

  const [removeProfileImage, setRemoveProfileImage] = useState(false);

  // Education & Experience
  const [educationRows, setEducationRows] = useState([emptyEducation()]);
  const [experienceRows, setExperienceRows] = useState([emptyExperience()]);

  const [certificates, setCertificates] = useState({
    wwcc: null,
    cpr: null,
    first_aid: null,
    police_check: null,
  });

  // const [certificateFiles, setCertificateFiles] = useState({
  //   wwcc: null,
  //   cpr: null,
  //   first_aid: null,
  //   police_check: null,
  // });

  const [certUploading, setCertUploading] = useState({});
  const [certDeleting, setCertDeleting] = useState({});

  // Password
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

const onPlaceChanged = () => {
  if (!autocomplete) return;
  const place = autocomplete.getPlace();
  if (!place || !place.address_components) return;

  let suburb = "", city = "", country = "";
  let lat = "", lng = "";

  if (place.geometry?.location) {
    lat = place.geometry.location.lat();
    lng = place.geometry.location.lng();
  }

  place.address_components.forEach((comp) => {
    const types = comp.types;

    // Suburb — try multiple fallbacks in priority order
    if (types.includes("sublocality_level_1")) {
      suburb = comp.long_name;
    } else if (types.includes("sublocality")) {
      if (!suburb) suburb = comp.long_name;
    } else if (types.includes("neighborhood")) {
      if (!suburb) suburb = comp.long_name;
    } else if (types.includes("administrative_area_level_2")) {
      if (!suburb) suburb = comp.long_name;  // ← catches "Melbourne City" etc
    }

    if (types.includes("locality")) city = comp.long_name;
    if (types.includes("country")) country = comp.long_name;
  });

  // ← Final fallback: if still empty, use city as suburb
  // (common for Melbourne CBD addresses like St Kilda Rd)
  if (!suburb && city) suburb = city;

  setAddress(place.formatted_address || "");
  setSuburb(suburb);
  setCity(city);
  setCountry(country);
  setLatitude(lat);
  setLongitude(lng);
};


// Inside component:
const { isLoaded } = useJsApiLoader({
  googleMapsApiKey: GOOGLE_API_KEY, // you already have this constant
  libraries: LIBRARIES,
});




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
  setRemoveProfileImage(false); //  reset delete flag
};

const handleRemoveImage = () => {
  setProfileImage("/images/default_img.png");
  setProfileFile(null);
  setRemoveProfileImage(true); //  important for API
  if (fileInputRef.current) {
    fileInputRef.current.value = null;
  }
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
    setExistingResume(null); //  remove old when new uploaded
    setRemoveResume(false);
  };

  const handleRemoveResume = () => {
    setExistingResume(null);
    setResumeFile(null);
    setRemoveResume(true);
  };

  const handleExperienceYearsChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    setExperienceYears(val);
  };

  const handleEducationChange = (id, field, value) =>
    setEducationRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  const addEducationRow = () =>
    setEducationRows((prev) => [...prev, emptyEducation()]);
  const removeEducationRow = (id) =>
    setEducationRows((prev) => prev.filter((r) => r.id !== id));

  const handleExperienceChange = (id, field, value) =>
    setExperienceRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  const addExperienceRow = () =>
    setExperienceRows((prev) => [...prev, emptyExperience()]);
  const removeExperienceRow = (id) =>
    setExperienceRows((prev) => prev.filter((r) => r.id !== id));

  const validateAllYears = () => {
  // DOB check
  if (dateOfBirth) {
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime()) || dob.getFullYear() < 1900 || dob > new Date()) {
      toast.error("Please enter a valid date of birth.");
      return false;
    }
  }

  for (const row of educationRows) {
    const err = validateYears(row.start_year, row.end_year);
    if (err) {
      toast.error(`Education: ${err}`);
      return false;
    }
  }

  for (const row of experienceRows) {
    if (row.start_date) {
      const start = new Date(row.start_date);
      if (isNaN(start.getTime()) || start.getFullYear() < 1900) {
        toast.error("Experience: Please enter a valid start date.");
        return false;
      }
    }
    if (!row.currently_working && row.start_date && row.end_date) {
      const start = new Date(row.start_date);
      const end = new Date(row.end_date);
      if (isNaN(end.getTime()) || end.getFullYear() < 1900) {
        toast.error("Experience: Please enter a valid end date.");
        return false;
      }
      if (end < start) {
        toast.error("Experience: End date cannot be before start date.");
        return false;
      }
    }
  }

  return true;
};

  /*----- Fetch Profile -------*/

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);

      const data = await api.get("/get/profile");

      if (data?.status) {
        const p = data?.data?.profile;

        console.log("PROFILE:", p); //  add this once

        setPhone(p?.phone || "");
        setDateOfBirth(p?.date_of_birth?.split("T")[0] || "");
        setGender(p?.gender || "");
        setAddress(p?.address || "");
        // ← add this to sync the uncontrolled input after data loads
        if (addressInputRef.current) {
          addressInputRef.current.value = p?.address || "";
        }
        setCity(p?.city || "");
        // setState(p?.state || "");
        setSuburb(p?.suburb || "");
        setCountry(p?.country || "");

        setQualification(p?.qualification || "");
        setSpecialization(p?.specialization || "");
        setExperienceYears(p?.experience_years || "");
        setCurrentSchool(p?.current_school || "");
        setBio(p?.bio || "");

        setProfileCompletion(p?.profile_completion || 0);

        // if (p?.resume) {
        //   setExistingResume(p.resume); 
        // }

        if (p?.resume) {
          setExistingResume(p.resume);
          localStorage.setItem("user_resume", p.resume); // ← keep in sync
        } else {
          localStorage.removeItem("user_resume"); // ← clear if no resume
        }


        // Education
        if (p?.educations?.length) {
          setEducationRows(
            p.educations.map((edu) => ({
              id: edu.id,
              degree_name: edu.degree,
              institution_name: edu.institution,
              start_year: edu.start_year,
              end_year: edu.end_year,
              grade: edu.grade,
            })),
          );
        }

        // Experience
        if (p?.experiences?.length) {
          setExperienceRows(
            p.experiences.map((exp) => ({
              id: exp.id,
              institution_name: exp.school_name,
              role: exp.job_title,
              start_date: exp.start_date,
              end_date: exp.end_date,
              currently_working: exp.is_current === 1,
              description: exp.description || "",
            })),
          );
        }

        if (p?.profile_image) {
          setProfileImage(p.profile_image);
        }


        if (p?.certificate?.length) {
          const certMap = {};
          p.certificate.forEach((cert) => {
            const key = cert.certificate_name.toLowerCase().replace(" ", "_");
            certMap[key] = cert;
          });
          setCertificates(certMap);
        }



      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  /* ----- Update Profile -----*/

  const handleUpdateProfile = async () => {
    if (!validateAllYears()) return;

    try {
      setIsUpdating(true);

      const formData = new FormData();

      //  Profile Image logic
      if (removeProfileImage) {
        formData.append("delete_profile", 1);
        formData.append("profile_image", ""); // optional (depends on backend)
      } else if (profileFile) {
        formData.append("profile_image", profileFile);
      }

      //  Resume logic (FIXED)
      if (removeResume) {
        formData.append("delete_resume", 1); // or null depending backend
        formData.append("resume", ""); // or null depending backend
      } else if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("phone", phone);
      formData.append("date_of_birth", dateOfBirth);
      formData.append("gender", gender);
      formData.append("address", address);
      formData.append("city", city);
      // formData.append("state", state);
      formData.append("suburb", suburb);
      formData.append("country", country);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);

      formData.append("qualification", qualification);
      formData.append("specialization", specialization);
      formData.append("experience_years", experienceYears);
      formData.append("current_school", currentSchool);
      formData.append("bio", bio);

      formData.append("social_links", JSON.stringify(socialLinks));

      // Education
      educationRows.forEach((edu, index) => {
        formData.append(`educations[${index}][degree]`, edu.degree_name);
        formData.append(
          `educations[${index}][institution]`,
          edu.institution_name,
        );
        formData.append(`educations[${index}][start_year]`, edu.start_year);
        formData.append(`educations[${index}][end_year]`, edu.end_year);
        formData.append(`educations[${index}][grade]`, edu.grade);
      });

      // Experience
      experienceRows.forEach((exp, index) => {
        formData.append(`experiences[${index}][job_title]`, exp.role);
        formData.append(
          `experiences[${index}][school_name]`,
          exp.institution_name,
        );
        formData.append(`experiences[${index}][start_date]`, exp.start_date);
        formData.append(
          `experiences[${index}][end_date]`,
          exp.currently_working ? "" : exp.end_date,
        );
        formData.append(
          `experiences[${index}][is_current]`,
          exp.currently_working ? 1 : 0,
        );
        formData.append(`experiences[${index}][description]`, exp.description);
      });

      const data = await api.post("/update/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data?.status) {
        toast.success("Profile updated successfully!");

         // ── Save resume link to localStorage ──
          const resumeLink = data?.data?.resume || data?.data?.profile?.resume;
          if (resumeLink) {
            localStorage.setItem("user_resume", resumeLink);
          } else if (removeResume) {
            localStorage.removeItem("user_resume");
          }
  
        fetchProfile();
      } else {
        toast.error(data?.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false); //  IMPORTANT
    }
  };


  /*--- Update & Delete Certificates ----*/

  const handleCertificateChange = async (certName, key, file) => {
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, JPG, PNG files are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File must be less than 2 MB.");
      return;
    }

    try {
      setCertUploading((prev) => ({ ...prev, [key]: true }));

      const formData = new FormData();
      formData.append("certificate_file[]", file);
      formData.append("certificate_name[]", certName);

      const data = await api.post("/update/certificate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data?.status) {
        toast.success(data.message || `${certName} uploaded successfully!`);
        // toast.success(`${certName} uploaded successfully!`);

        // ✅ Auto update state without page refresh
        const newCert = data?.data?.[0]; // adjust based on your API response shape
        if (newCert) {
          setCertificates((prev) => ({ ...prev, [key]: newCert }));
        } else {
          fetchProfile(); // fallback
        }
      } else {
        toast.error(data?.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setCertUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleCertificateDelete = async (certId, key) => {
    try {
      setCertDeleting((prev) => ({ ...prev, [key]: true }));

      const data = await api.delete(`/delete/certificate/${certId}`);

      if (data?.status) {
        toast.success("Certificate deleted successfully!");

        // ✅ Auto remove from state without page refresh
        setCertificates((prev) => ({ ...prev, [key]: null }));
      } else {
        toast.error(data?.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setCertDeleting((prev) => ({ ...prev, [key]: false }));
    }
  };



  /* ----- Update Password -----*/

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    try {
      setIsPasswordUpdating(true);

      const formData = new FormData();
      formData.append("old_password", oldPassword);
      formData.append("new_password", newPassword);
      formData.append("new_password_confirmation", confirmPassword);

      const data = await api.post("/update/password", formData);

      if (data?.status) {
        toast.success("Password updated successfully");

        // clear fields
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        //  HANDLE MULTIPLE ERRORS CLEANLY
        if (data?.errors) {
          const allErrors = Object.values(data.errors).flat().join("\n");
          toast.error(allErrors); // single toast
        } else {
          toast.error(data?.message || "Update failed");
        }
      }
    } catch (err) {
      console.error(err);

      //  SAME FOR CATCH
      if (err?.errors) {
        const allErrors = Object.values(err.errors).flat().join("\n");
        toast.error(allErrors);
      } else {
        toast.error(err?.message || "Something went wrong");
      }
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  return (
    <>
      <div className="my_account blue_nav">
        <Navbar />
        <div className="profile_page top_padding">
          <div className="container py-4">
            <div className="row">
              {/* <h1 className="mb-3 sec-title ">My Profile</h1> */}

              <div className="cover_image">
                <img src="/images/profile_cover2.jpg" className="w-100 rounded-4" style={{height:"200px", objectFit:"cover"}} alt="" />
              </div>

              <div className="col-11 mx-auto" style={{marginTop:"-50px"}}>
                {isLoading ? (
                  <ProfileSkeleton />
                ) : (
                  <div className="row">
                    <div className="col-lg-8">
                       {/* PERSONAL DETAILS */}
                      <div className=" mb-4">
                        <div className="card rounded-4 border-0 h-100">
                          <h5 className="fw-semibold text_theme">
                            Personal Details
                          </h5>


                        <div className="d-flex align-items-sm-end mt-3 profile_image_wrapper border-bottom pb-4">
  
                          <div className="position-relative me-4" >
                            {/* PROFILE IMAGE ONLY */}
                            <div
                              className="profile_image"  >
                              <img
                                src={profileImage}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                alt="Profile Preview"
                              />
                            </div>

                            {/* DELETE BUTTON */}
                            {profileImage !== "/images/default_img.png" && (
                              <div
                                onClick={handleRemoveImage}
                                style={{
                                  position: "absolute",
                                  top: -6,
                                  right: -6,
                                  background: "#ef5350",
                                  borderRadius: "50%",
                                  width: 22,
                                  height: 22,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                                }}
                              >
                                <i
                                  className="fa-solid fa-trash"
                                  style={{ color: "#fff", fontSize: 11 }}
                                ></i>
                              </div>
                            )}
                          </div>

                          {/* UPLOAD BUTTON */}
                          <div className=" mt-2">
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

                            <p className="mb-0 small">
                              Image must be JPEG or PNG format and less than 2 MB.
                            </p>
                          </div>

                        </div>

                          <div className="row mt-3 mb-3">
                            <div className="col-md-6 mb-4">
                              <label className="mb-2">Full Name</label>
                              <input
                                type="text"
                                className="form-control"
                                value={user?.name || ""}
                                readOnly
                              />
                            </div>

                            <div className="col-md-6 mb-4">
                              <label className="mb-2">Email</label>
                              <input
                                type="email"
                                className="form-control"
                                value={user?.email || ""}
                                readOnly
                              />
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
                              <select
                                className="form-select"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                              >
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
                                className={`form-control ${
                                  dateOfBirth &&
                                  (new Date(dateOfBirth).getFullYear() < 1900 || new Date(dateOfBirth) > new Date())
                                    ? "is-invalid"
                                    : ""
                                }`}
                                value={dateOfBirth}
                                min="1900-01-01"
                                max={new Date().toISOString().split("T")[0]}   // today's date dynamically
                                onChange={(e) => setDateOfBirth(e.target.value)}
                              />
                              {dateOfBirth &&
                                new Date(dateOfBirth).getFullYear() < 1900 && (
                                  <small className="text-danger">Year cannot be 0000 or before 1900.</small>
                              )}
                              {dateOfBirth &&
                                new Date(dateOfBirth) > new Date() && (
                                  <small className="text-danger">Date of birth cannot be in the future.</small>
                              )}
                            </div>


                              <div className="col-12 mb-4">
                              <label className="mb-2">Address</label>
                              {isLoaded ? (
                                <Autocomplete
                                  onLoad={(auto) => setAutocomplete(auto)}
                                  onPlaceChanged={onPlaceChanged}
                                  options={{
                                    componentRestrictions: { country: "au" },
                                    types: ["address"],
                                  }}
                                >
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Start typing your address..."
                                    defaultValue={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                  />
                                </Autocomplete>
                              ) : (
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Loading..."
                                  disabled
                                />
                              )}
                              <small className="text-muted">
                                Select from suggestions to auto-fill city, suburb & country.
                              </small>
                            </div>

                            <div className="col-md-4 mb-4">
                              <label className="mb-2">City</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="i.e Sydney"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                              />
                            </div>

                            <div className="col-md-4 mb-4">
                              <label className="mb-2">Suburb</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="i.e Bondi"
                                value={suburb}
                                onChange={(e) => setSuburb(e.target.value)} 
                              />
                            </div>

                            <div className="col-md-4 mb-4">
                              <label className="mb-2">Country</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="i.e Australia"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                              />
                            </div>
                          </div>

                          {/* PROFESSIONAL DETAILS */}
                          <h5 className="fw-semibold text_theme">
                            Professional Details
                          </h5>
                          <div className="row mt-3 mb-3">
                            <div className="col-md-6 mb-4">
                              <label className="mb-2">Qualification</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="i.e Bachelor of Arts"
                                value={qualification}
                                onChange={(e) => setQualification(e.target.value)}
                              />
                            </div>

                            <div className="col-md-6 mb-4">
                              <label className="mb-2">Specialization</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="i.e Painting"
                                value={specialization}
                                onChange={(e) =>
                                  setSpecialization(e.target.value)
                                }
                              />
                            </div>

                            <div className="col-md-6 mb-4">
                              <label className="mb-2">
                                Experience (In Years)
                              </label>
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
                              <label className="mb-2">
                                Current Company / Institution
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="i.e XYZ Institution Ltd."
                                value={currentSchool}
                                onChange={(e) => setCurrentSchool(e.target.value)}
                              />
                            </div>

                            <div className="col-12 mb-4">
                              <label className="mb-2">About Me</label>
                              <textarea
                                rows={5}
                                className="form-control"
                                placeholder="Write about yourself..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                              />
                            </div>
                          </div>

                          {/* EDUCATION */}
                          <h5 className="fw-semibold text_theme">Education</h5>
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
                            <button
                              type="button"
                              className="btn btn-blue w-auto "
                              onClick={addEducationRow}
                            >
                              Add Education <i className="fa fa-plus ms-1"></i>
                            </button>
                          </div>

                          {/* WORK EXPERIENCE */}
                          <h5 className="fw-semibold text_theme mt-3">
                            Work Experience
                          </h5>
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
                            <button
                              type="button"
                              className="btn btn-blue w-auto "
                              onClick={addExperienceRow}
                            >
                              Add Experience <i className="fa fa-plus ms-1"></i>
                            </button>
                          </div>

                          {/* <div className="d-flex justify-content-end mt-4">
                            <button
                              type="button"
                              className="btn-post px-3"
                              onClick={handleUpdateProfile}
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <>
                                  Updating...
                                  <i className="fas fa-spinner fa-spin ms-2"></i>
                                </>
                              ) : (
                                <>
                                  Update Profile
                                  <i className="fas fa-arrow-right-long ms-2"></i>
                                </>
                              )}
                            </button>
                          </div> */}
                        </div>
                      </div>


                      {/* CERTIFICATES UPLOAD */}
                      <div className="d-flex flex-column mb-4">
                        <div className="card border-0 card_height password_card">
                          <h5 className="fw-semibold text_theme">Certificates</h5>

                          <div className="row mt-3">
                            {[
                              { label: "WWCC", key: "wwcc" },
                              { label: "CPR", key: "cpr" },
                              { label: "First Aid", key: "first_aid" },
                              { label: "Police Check", key: "police_check" },
                            ].map(({ label, key }) => {
                              const existing = certificates[key];
                              const isPdf = existing?.certificate_file?.endsWith(".pdf");
                              const isUploading = certUploading[key];
                              const isDeleting = certDeleting[key];

                              return (
                                <div className="col-lg-6 mb-4" key={key}>
                                  <div className="certificate_box p-3 rounded h-100">

                                    {/* Header */}
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                      <h6 className="fw-semibold mb-0">{label}</h6>
                                      {existing?.status && (
                                        <span
                                          className={`badge ${
                                            existing.status === "verified" || existing.status === "approved"
                                              ? "bg-success"
                                              : existing.status === "rejected"
                                                ? "bg-danger"
                                                : "bg-warning text-dark"
                                          }`}
                                        >
                                          {existing.status.charAt(0).toUpperCase() + existing.status.slice(1)}
                                        </span>
                                      )}
                                    </div>

                                    {/* Upload Area — show if no existing cert */}
                                    {!existing && (
                                      <label
                                        htmlFor={`cert_${key}`}
                                        className="upload_area text-center p-4 rounded d-block"
                                        style={{ cursor: isUploading ? "not-allowed" : "pointer" }}
                                      >
                                        {isUploading ? (
                                          <>
                                            <i className="fas fa-spinner fa-spin fa-2x mb-2 text-muted"></i>
                                            <p className="mb-1 fw-medium">Uploading...</p>
                                          </>
                                        ) : (
                                          <>
                                            <UploadCloud size={32} className="mb-2 text-muted" />
                                            <p className="mb-1 fw-medium">Upload Certificate</p>
                                            <small className="text-muted">PDF, JPG, PNG (Max 2MB)</small>
                                          </>
                                        )}
                                        <input
                                          type="file"
                                          id={`cert_${key}`}
                                          accept="application/pdf,image/jpeg,image/png"
                                          style={{ display: "none" }}
                                          disabled={isUploading}
                                          onChange={(e) =>
                                            handleCertificateChange(label, key, e.target.files[0])
                                          }
                                        />
                                      </label>
                                    )}

                                    {/* Existing File Preview */}
                                    {existing && (
                                      <div className="uploaded_file d-flex align-items-center justify-content-between mt-2 p-2 rounded">
                                        <a
                                          href={existing.certificate_file}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="file_name text-decoration-none d-flex align-items-center gap-2"
                                        >
                                          {isPdf ? (
                                            <File size={16} />
                                          ) : (
                                            <img
                                              src={existing.certificate_file}
                                              alt={label}
                                              style={{ width: 24, height: 24, objectFit: "cover", borderRadius: 4 }}
                                            />
                                          )}
                                          <small>{existing.certificate_file.split("/").pop()}</small>
                                        </a>

                                        {/* Delete button with spinner */}
                                        {isDeleting ? (
                                          <i className="fas fa-spinner fa-spin text-danger"></i>
                                        ) : (
                                          <Trash2
                                            size={18}
                                            className="text-danger"
                                            style={{ cursor: "pointer", flexShrink: 0 }}
                                            onClick={() => handleCertificateDelete(existing.id, key)}
                                          />
                                        )}
                                      </div>
                                    )}

                                    {/* Replace button */}
                                    {existing && !isUploading && (
                                      <label
                                        htmlFor={`cert_reupload_${key}`}
                                        className="btn-post btn-sm mt-2 d-inline-flex align-items-center gap-1"
                                        style={{ cursor: "pointer", fontSize: 13 }}
                                      >
                                        <UploadCloud size={14} /> Replace
                                        <input
                                          type="file"
                                          id={`cert_reupload_${key}`}
                                          accept="application/pdf,image/jpeg,image/png"
                                          style={{ display: "none" }}
                                          onChange={(e) =>
                                            handleCertificateChange(label, key, e.target.files[0])
                                          }
                                        />
                                      </label>
                                    )}

                                    {/* Replace uploading state */}
                                    {existing && isUploading && (
                                      <div className="mt-2 d-flex align-items-center gap-2 text-muted" style={{ fontSize: 13 }}>
                                        <i className="fas fa-spinner fa-spin"></i> Uploading...
                                      </div>
                                    )}

                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* CHANGE PASSWORD */}
                      <div className="d-flex flex-column mb-4 mb-xl-0">
                        <div className="card border-0 card_height password_card">
                          <h5 className="fw-semibold text_theme">
                            Change Password
                          </h5>
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
                                onChange={(e) =>
                                  setConfirmPassword(e.target.value)
                                }
                              />
                              <i
                                className={`fa ${showConfirm ? "fa-eye" : "fa-eye-slash"} position-absolute`}
                                onClick={() => setShowConfirm(!showConfirm)}
                              />
                            </div>

                            <div className="d-flex justify-content-end">
                              <button
                                type="button"
                                className="btn-login px-3"
                                onClick={handleUpdatePassword}
                                disabled={isPasswordUpdating}
                              >
                                {isPasswordUpdating ? (
                                  <>
                                    Updating...
                                    <i className="fas fa-spinner fa-spin ms-2"></i>
                                  </>
                                ) : (
                                  <>
                                    Update Password{" "}
                                    <i className="fas fa-arrow-right-long"></i>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                   <div className="col-lg-4">
                    <div className="profile_right">

                     {/* RESUME CARD */}
                      <div className="card p-3 mb-4 border-0 rounded-4">
                        <h5 className="fw-semibold text_theme mb-2">Resume</h5>

                        <p className="">
                          Upload your resume to apply quickly.
                        </p>

                        <input
                          type="file"
                          id="resumeUpload"
                          accept="application/pdf"
                          style={{ display: "none" }}
                          onChange={handleResumeChange}
                        />

                        {!resumeFile && !existingResume && (
                          <button
                            className="btn-blue btn w-100"
                            onClick={() => document.getElementById("resumeUpload").click()}
                          >
                            <UploadCloud size={16} className="me-2" />
                            Upload Resume
                          </button>
                        )}

                        {/* NEW FILE */}
                        {resumeFile && (
                          <div className="resume_file_box mt-2 d-flex justify-content-between align-items-center">
                            <span className="small">
                              <FileIcon size={15} /> {resumeFile.name}
                            </span>

                            <Trash2
                              size={16}
                              className="text-danger"
                              style={{ cursor: "pointer" }}
                              onClick={handleRemoveResume}
                            />
                          </div>
                        )}

                        {/* EXISTING FILE */}
                        {existingResume && (
                          <div className="resume_file_box mt-2 d-flex flex-column justify-content-between ">
                            <a
                              href={existingResume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="small text-decoration-none"
                            >
                              <FileIcon size={15} /> {existingResume.split("/").pop()}
                            </a>

                            <div className="d-flex gap-2 mt-2">
                              <a href={existingResume} target="_blank" className="btn btn-sm btn-primary">
                                <i className="fa fa-download text-white"></i>
                              </a>

                              <button className="btn btn-sm btn-primary"  onClick={handleRemoveResume}>
                                <Trash2
                                size={16}
                                className="text-white"
                                style={{ cursor: "pointer" }}
                               
                              />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>



                      {/* PROFILE STRENGTH */}
                      <div className="card p-3 mb-4 border-0 rounded-4">
                        <h5 className="fw-semibold text_theme mb-2">Profile Strength</h5>

                        <div className="progress" style={{ height: 11 }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${profileCompletion}%`,
                              background:
                                profileCompletion === 100
                                  ? "#43a047"
                                  : profileCompletion >= 60
                                  ? "#f9a825"
                                  : "#ef5350",
                            }}
                          ></div>
                        </div>

                        <p className="mt-2 d-block ">
                          {profileCompletion}% completed
                        </p>
                      </div>

                     
                      {/* UPDATE BUTTON */}
                        <button
                          className="btn-post w-100"
                          onClick={handleUpdateProfile}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <>
                              Updating...
                              <i className="fas fa-spinner fa-spin ms-2"></i>
                            </>
                          ) : (
                            <>
                              Update Profile
                              <i className="fas fa-arrow-right-long ms-2"></i>
                            </>
                          )}
                        </button>

                    </div>
                  </div>
                   

                  </div>
                )}
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
