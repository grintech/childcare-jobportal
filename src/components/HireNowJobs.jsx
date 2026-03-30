import React, { useEffect, useState } from "react";
import { MapPin, Heart, BriefcaseBusinessIcon, Tag, Search, Filter, Briefcase, LayoutGrid, List } from "lucide-react";
import { motion } from "framer-motion";

const jobsData = [
  // Childcare Centre Manager
  {
    id: 1,
    title: "Childcare Centre Manager",
    company: "Bright Kids School",
    salary: "$60k - $75k",
    location: "Sydney, NSW",
    suburb: "Parramatta",
    role: "Childcare Centre Manager",
    tags: ["leadership", "management"],
  },
  {
    id: 2,
    title: "Senior Centre Manager",
    company: "Little Explorers",
    salary: "$65k - $80k",
    location: "Melbourne, VIC",
    suburb: "Southbank",
    role: "Childcare Centre Manager",
    tags: ["management", "operations"],
  },

  // Assistant Centre Manager
  {
    id: 3,
    title: "Assistant Centre Manager",
    company: "Happy Kids Care",
    salary: "$50k - $60k",
    location: "Melbourne, VIC",
    suburb: "Richmond",
    role: "Childcare Assistant Centre Manager",
    tags: ["assistant", "operations"],
  },
  {
    id: 4,
    title: "Deputy Centre Manager",
    company: "Growing Minds",
    salary: "$52k - $62k",
    location: "Brisbane, QLD",
    suburb: "Fortitude Valley",
    role: "Childcare Assistant Centre Manager",
    tags: ["support", "team"],
  },

  // Early Childhood Teacher
  {
    id: 5,
    title: "Early Childhood Teacher",
    company: "Little Stars",
    salary: "$55k - $70k",
    location: "Brisbane, QLD",
    suburb: "South Brisbane",
    role: "Early Childhood Teacher",
    tags: ["teaching", "ECE"],
  },
  {
    id: 6,
    title: "Kindergarten Teacher",
    company: "Happy Learners",
    salary: "$58k - $72k",
    location: "Sydney, NSW",
    suburb: "Bondi",
    role: "Early Childhood Teacher",
    tags: ["kids", "learning"],
  },

  // Lead Educator
  {
    id: 7,
    title: "Lead Educator",
    company: "Tiny Tots",
    salary: "$45k - $55k",
    location: "Perth, WA",
    suburb: "Fremantle",
    role: "Childcare Lead Educator",
    tags: ["lead", "kids"],
  },
  {
    id: 8,
    title: "Senior Lead Educator",
    company: "Bright Futures",
    salary: "$48k - $58k",
    location: "Adelaide, SA",
    suburb: "Glenelg",
    role: "Childcare Lead Educator",
    tags: ["mentor", "education"],
  },

  // Assistant Educator
  {
    id: 9,
    title: "Assistant Educator",
    company: "Care Kids",
    salary: "$40k - $48k",
    location: "Adelaide, SA",
    suburb: "Norwood",
    role: "Childcare Assistant Educator",
    tags: ["assistant", "support"],
  },
  {
    id: 10,
    title: "Junior Educator",
    company: "Little Steps",
    salary: "$38k - $46k",
    location: "Perth, WA",
    suburb: "Subiaco",
    role: "Childcare Assistant Educator",
    tags: ["entry-level", "kids"],
  },

  // Childcare Cook
  {
    id: 11,
    title: "Childcare Cook",
    company: "Healthy Kids Centre",
    salary: "$38k - $45k",
    location: "Gold Coast, QLD",
    suburb: "Surfers Paradise",
    role: "Childcare Cook",
    tags: ["cook", "nutrition"],
  },
  {
    id: 12,
    title: "Centre Kitchen Assistant",
    company: "Happy Meals Childcare",
    salary: "$36k - $42k",
    location: "Sydney, NSW",
    suburb: "Chatswood",
    role: "Childcare Cook",
    tags: ["kitchen", "food"],
  },
];

const HireNowJobs = () => {

  const [filters, setFilters] = useState({
  role: "",
  location: "",
  suburb: "",
  company: "",
});

  const [showFilters, setShowFilters] = useState(false);

const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

//  detect resize
useEffect(() => {
  const handleResize = () => {
    const mobile = window.innerWidth < 992;
    setIsMobile(mobile);

  };

  window.addEventListener("resize", handleResize);
  handleResize(); // run on load

  return () => window.removeEventListener("resize", handleResize);
}, []);

  //  Handle Input Change
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  //  Filtering Logic
 const filteredJobs = jobsData.filter((job) => {
  const roleSearch = filters.role.toLowerCase();
  const locationSearch = filters.location.toLowerCase();
  const suburbSearch = filters.suburb.toLowerCase();
  const companySearch = filters.company.toLowerCase();

  const matchRole =
    job.role.toLowerCase().includes(roleSearch) ||
    job.title.toLowerCase().includes(roleSearch) ||
    job.tags.join(" ").toLowerCase().includes(roleSearch);

  const matchLocation =
    job.location.toLowerCase().includes(locationSearch);

  const matchSuburb =
    job.suburb?.toLowerCase().includes(suburbSearch);

  const matchCompany =
    job.company.toLowerCase().includes(companySearch);

  return matchRole && matchLocation && matchSuburb && matchCompany;
});

const handleReset = () => {
  setFilters({
    role: "",
    location: "",
    suburb: "",
    company: "",
  });
};




  return (
    <>
   <motion.div
  className="jobs_section"
  initial={{ y: 80, opacity: 0 }}   // start from bottom
  animate={{ y: 0, opacity: 1 }}    // move to normal
  transition={{
    delay: 1.15,          // more delay (increase if needed)
    duration: 1,       // smoother animation
    ease: "easeOut"    // nice smooth ending
  }}
>
        <div className="row">

          {/* ================= LEFT FILTER PANEL ================= */}
         { !isMobile &&  (
          <div className="col-lg-3 mb-4">
            <div className="filter_card p-4  rounded-3 ">

              <h5 className="fw-bold mb-3">Filters</h5>

              {/* Role Search */}
              <div className="mb-3">
                <label className="form-label">Role</label>
                <div className="input-group">
                  
                  <input
                    type="text"
                    name="role"
                    className="form-control"
                    placeholder="Search role..."
                    value={filters.role}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Location Search */}
              <div className="mb-3">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  placeholder="Search location..."
                  value={filters.location}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Suburb</label>
                <input
                  type="text"
                  name="suburb"
                  className="form-control"
                  placeholder="Search suburb..."
                  value={filters.suburb}
                  onChange={handleChange}
                />
              </div>

              {/* Institution Search */}
              <div className="mb-3">
                <label className="form-label">Institution</label>
                <input
                  type="text"
                  name="company"
                  className="form-control"
                  placeholder="Search institution..."
                  value={filters.company} 
                  onChange={handleChange}
                />
              </div>

              {/* Reset Button */}
              <button
                className="btn  w-100 mt-2"
                onClick={handleReset}
              >
                Reset  <Filter size={16} />
              </button>
            </div>
          </div>
         )}

          {/* ================= RIGHT JOB LIST ================= */}
          <div className="col-lg-9">

            {isMobile && (
            <button
                className="btn btn-primary d-flex align-items-center gap-2 mb-3"
                onClick={() => setShowFilters(true)}
            >
                <Filter size={18} />
                Filters
            </button>
            )}


          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="mb-0 text-muted">
                Showing {filteredJobs.length} jobs
            </p>

            
            </div>

            <div className="row">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  //  <div
                //     className={`${ isMobile ? "col-12" : view === "grid" ? "col-lg-6" : "col-12" } mb-4`}
                //     key={job.id}
                //     >
                  <div className="col-12 mb-4" key={job.id}>
                    <div className="job_card">

                      {/* <div className={`job_card_body ${view === "list" ? "list_view" : ""}`}> */}
                        <div className="job_card_body list_view">

                        <div className="job_logo">
                          <BriefcaseBusinessIcon />
                        </div>

                        <div className="job_info">
                          <h5>{job.title}</h5>
                          <p className="company">{job.company}</p>
                          <p className="salary">{job.salary}</p>

                          <p className="location">
                            <MapPin size={14} /> {job.suburb}, {job.location}
                          </p>
                        </div>

                        <div className="job_actions">
                          <Heart size={29} className="wishlist" />
                          <button className="apply_btn">APPLY</button>
                        </div>

                      </div>

                      <div className="job_tags d-flex">
                        <div className="d-flex gap-2">
                          <Tag size={16} />
                          <strong>Tagged as:</strong>
                        </div>

                        {job.tags.map((tag, i) => (
                          <span key={i}>{tag}</span>
                        ))}
                      </div>

                    </div>
                  </div>
                ))
              ) : (
                <h5 className="text-center"><Briefcase size={20} /> No jobs found!</h5>
              )}
            </div>

          </div>
        </div>
    </motion.div>

    {showFilters && (
        <div className="filter_modal">
            <div className="filter_overlay" onClick={() => setShowFilters(false)}></div>

            <div className="filter_content">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold">Filters</h5>
                <button className="btn-close" onClick={() => setShowFilters(false)}> </button>
            </div>

            {/* Role */}
            <div className="mb-3">
                <label>Role</label>
                <input
                type="text"
                name="role"
                className="form-control"
                placeholder="Search role..."
                value={filters.role}
                onChange={handleChange}
                />
            </div>

            {/* Location */}
            <div className="mb-3">
                <label>Location</label>
                <input
                type="text"
                name="location"
                className="form-control"
                placeholder="Search location..."
                value={filters.location}
                onChange={handleChange}
                />
            </div>

            <div className="mb-3">
              <label>Suburb</label>
              <input
                type="text"
                name="suburb"
                className="form-control"
                placeholder="Search suburb..."
                value={filters.suburb}
                onChange={handleChange}
              />
            </div>
            {/* Company */}
            <div className="mb-3">
                <label>Institution</label>
                <input
                type="text"
                name="company"
                className="form-control"
                placeholder="Search institution..."
                value={filters.company}
                onChange={handleChange}
                />
            </div>

            {/* Buttons */}
            <div className="d-flex gap-2 mt-4">
                <button className="btn btn-secondary w-50" onClick={handleReset}>
                Clear All
                </button>

                <button
                className="btn btn-primary w-50"
                onClick={() => setShowFilters(false)}
                >
                Apply Filters
                </button>
            </div>

            </div>
        </div>
    )}
    
    </>
  );
};

export default HireNowJobs;