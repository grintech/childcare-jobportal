import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Heart,
  BriefcaseBusinessIcon,
  Tag,
  Search,
  Filter,
  Briefcase,
  CheckCircle,
  Star,
  Loader2,
  Loader
} from "lucide-react";
import { motion } from "framer-motion";
import ApplyModal from "./ApplyModal";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import api from "../services/api";
import JobCardSkeleton from "./skeletons/JobCardSkeleton";
import { Link } from "react-router-dom";

const HireNowJobs = () => {
  const { user, isAuthenticated } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [savingId, setSavingId] = useState(null); // loading per card
  const [savedItems, setSavedItems] = useState({}); // track saved state

  const desktopSliderRef = useRef(null);
  // const mobileSliderRef = useRef(null);

  const [filters, setFilters] = useState({
    role: "",
    location: "",
    suburb: "",
    company: "",
    // salary_max: 50,
  });

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);


  //  Handle Input Change
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

 // Priceslider color 
useEffect(() => {
  const percent = (filters.salary_max / 50) * 100;
  const style = `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percent}%, #e5e7eb ${percent}%, #e5e7eb 100%)`;

  if (desktopSliderRef.current) {
    desktopSliderRef.current.style.background = style;
  }
}, [filters.salary_max]);



  const handleApplyClick = (job) => {
    // Not logged in
    if (!isAuthenticated) {
      toast.error("Please login to apply the job!");
      return;
    }

    // Wrong role
    if (user?.role !== "teacher") {
      toast.error("Only jobseeker can the apply!");
      return;
    }

    // Allowed
    setSelectedJob(job);
    setShowApplyModal(true);
  };


  const stripHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < Math.floor(rating) ? "#ffc107" : "none"}
        stroke="#ffc107"
      />
    ));
  };


  // Fetch Jobs list

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const params = {
        title: filters.role,
        location: filters.location,
        suburb: filters.suburb,
        institution_name: filters.company, 
        // salary_max: filters.salary_max,
      };

      const res = await api.get("/job-list", { params });

      if (res.status) {
        setJobs(res.data);
      }
    } catch (err) {
      console.log(err);
      // toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchJobs();
    }, 500); // debounce

    return () => clearTimeout(delay);
  }, [filters]);

  //  Filtering Logic
  const filteredJobs = jobs;

  const handleReset = () => {
    setFilters({
      role: "",
      location: "",
      suburb: "",
      company: "",
      // salary_max: 50,
    });
  };

   useEffect(() => {
  if (jobs.length) {
    const initialSaved = {};
    jobs.forEach((job) => {
      initialSaved[job.id] = job.is_saved; //  from API
    });
    setSavedItems(initialSaved);
  }
}, [jobs]);


const handleAppliedUpdate = (jobId) => {
  setJobs((prevJobs) =>
    prevJobs.map((job) =>
      job.id === jobId
        ? { ...job, is_applied: true }
        : job
    )
  );
};




const handleSaveToggle = async (job) => {
  //  Not logged in
  if (!isAuthenticated) {
    toast.error("Please login to save a job!");
    return;
  }
  // Wrong role
    if (user?.role !== "teacher") {
      toast.error("Only jobseeker can save the job!");
      return;
    }

  try {
    setSavingId(job.id);

    const payload = {
      slug: job.slug, 
    };

    const res = await api.post("/save/unsave", payload);

    setSavedItems((prev) => ({
      ...prev,
      [job.id]: res?.is_saved ?? !prev[job.id],
    }));

    toast.success(res.message || "Updated successfully");
  } catch (err) {
    toast.error(err?.response?.data?.message || "Something went wrong");
  } finally {
    setSavingId(null);
  }
};


  return (
    <>
      <div className="jobs_section" >
        <div className="row">

          {/* ================= LEFT FILTER PANEL ================= */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}   // start smaller
              animate={{ scale: 1, opacity: 1 }}     // zoom to normal
              transition={{
                delay: 1,
                duration: 0.6,
                ease: "easeOut",
              }}
             className="col-12 mb-4 ">
              <div className="filter_card p-4  rounded-3 ">
              <div className="row g-3  justify-content-end">
                {/* Role Search */}
                <div className="col-sm-6 col-xl ">
                  <label className="form-label">Job Role</label>
                  <div className="input-group">
                    <input
                      type="text"
                      name="role"
                      className="form-control"
                      placeholder="Enter role..."
                      value={filters.role}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Salary Range */}
                {/* <div className="col-sm-6 col-xl ">
                 <label className="form-label">
                  Max Salary
                  </label>
                   <div className="text-end small">
                   <span> <strong>${filters.salary_max}/hr</strong></span>
                   </div>
                  <input
                     ref={desktopSliderRef}
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={filters.salary_max}
                    onChange={(e) => {
                      setFilters({
                        ...filters,
                        salary_max: Number(e.target.value),
                      });
                    }}
                    className="custom-slider"
                  />
                
                </div> */}

                {/* Location Search */}
                <div className="col-sm-6 col-xl ">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    placeholder="Enter location..."
                    value={filters.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-sm-6 col-xl ">
                  <label className="form-label">Suburb</label>
                  <input
                    type="text"
                    name="suburb"
                    className="form-control"
                    placeholder="Enter suburb..."
                    value={filters.suburb}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-sm-6 col-xl-2 d-flex flex-column align-items-end justify-content-end">
                  {/* Reset Button */}
                <button className="btn w-100 " onClick={handleReset}>
                  Reset <Filter size={16} className="mb-1" />
                </button>
                </div>

              </div>
              </div>
            </motion.div>
          
          {/* ================= RIGHT JOB LIST ================= */}
          <motion.div className="col-12"
            initial={{ y: 80, opacity: 0 }} // start from bottom
          animate={{ y: 0, opacity: 1 }} // move to normal
          transition={{
            delay: 1.15, // more delay (increase if needed)
            duration: 1, // smoother animation
            ease: "easeOut", // nice smooth ending
          }}     
          >
            

            <div className="d-flex justify-content-center align-items-center mb-3">
             {filteredJobs.length > 0 &&  <h6 className="mb-0 text_theme text-center fw-bold">
                Showing {filteredJobs.length} {filteredJobs.length == 1 ? "job" : "jobs"}
              </h6>}
            </div>

            <div className="row">
              {loading ? (
                [...Array(3)].map((_, i) => <JobCardSkeleton key={i} />)
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div className="col-12 mb-4" key={job.id}>
                    <div className="job_card">
                      <div className="job_card_body list_view">
                        <div className="job_logo">
                          {job.image ? (
                            <img
                              src={job.image}
                              alt={job.title}
                              style={{
                                width: "55px",
                                height: "55px",
                                objectFit: "cover",
                                borderRadius: "50px",
                              }}
                            />
                          ) : (
                            <BriefcaseBusinessIcon />
                          )}
                        </div>

                        <div className="job_info">
                        
                           <h5>
                             <Link to={`/job/${job.slug}`}>{job.title} </Link>
                             <span className="verified_badge ms-1">
                                <CheckCircle size={16} /> Verified
                              </span>
                              </h5>
                        
                          <p className="company mb-2">{job.institution_name}</p>
                          <Link to={`/job/${job.slug}`}>
                            <p className="description small">
                              {stripHtml(job.description)}
                            </p>
                          </Link>

                          <p className="salary">
                            ${job.salary_min} - ${job.salary_max} (
                            {job.salary_type})
                          </p>

                           <div className="d-flex gap-1 mb-2">
                            {renderStars(4.5)}
                          </div>

                          <p className="location m-0">
                            <MapPin size={14} className="mb-1" /> {job.city}, {job.state},{" "}
                            {job.country}
                          </p>
                        </div>

                        <div className="job_actions">
                          {/* <Heart size={29} className="wishlist" /> */}
                          <div
                          
                          onClick={() => handleSaveToggle(job)}
                          style={{ cursor: "pointer" }}
                        >
                          {savingId === job.id ? (
                            <Loader size={26} className="wishlist spin" />
                          ) : (
                            <Heart
                              className="wishlist"
                              size={26}
                              fill={savedItems[job.id] ? "red" : "none"}
                              stroke={savedItems[job.id] ? "red" : "currentColor"}
                            />
                          )}
                        </div>
                        
                          <button
                            className="apply_btn"
                            onClick={() => handleApplyClick(job)}
                            disabled={job.is_applied}
                          >
                            {job.is_applied ? "APPLIED" : "APPLY"}
                          </button>
                        </div>
                      </div>

                      <div className="job_tags d-flex">
                        <div className="d-flex gap-2">
                          <Tag size={16} />
                          <strong>Tagged as:</strong>
                        </div>

                        {job.skills?.map((tag, i) => (
                          <span key={i} className="text-capitalize" >{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
              <div className="col-12">
                 <div className="d-flex flex-column align-items-center justify-content-center bg-white py-4 px-3 ">
                <Briefcase size={25} className="mb-2" /> 
                 <h5 className="text-center">  No jobs found! </h5>
               </div>
              </div>
              )}
            </div>
          </motion.div>

        </div>

      </div>


      <ApplyModal
        show={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        jobData={selectedJob}
        onApplied={handleAppliedUpdate}
      />
    </>
  );
};

export default HireNowJobs;
