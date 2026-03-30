import React, { useState } from "react";
import { MapPin, Heart, BriefcaseBusinessIcon, Tag } from "lucide-react";

const jobsData = [
  // Childcare Centre Manager
  {
    id: 1,
    title: "Childcare Centre Manager",
    company: "Bright Kids School",
    salary: "$60k - $75k",
    location: "Sydney, Australia",
    role: "Childcare Centre Manager",
    tags: ["leadership", "management"],
  },
  {
    id: 2,
    title: "Senior Centre Manager",
    company: "Little Explorers",
    salary: "$65k - $80k",
    location: "Melbourne, Australia",
    role: "Childcare Centre Manager",
    tags: ["management", "operations"],
  },

  // Assistant Centre Manager
  {
    id: 3,
    title: "Assistant Centre Manager",
    company: "Happy Kids Care",
    salary: "$50k - $60k",
    location: "Melbourne, Australia",
    role: "Childcare Assistant Centre Manager",
    tags: ["assistant", "operations"],
  },
  {
    id: 4,
    title: "Deputy Centre Manager",
    company: "Growing Minds",
    salary: "$52k - $62k",
    location: "Brisbane, Australia",
    role: "Childcare Assistant Centre Manager",
    tags: ["support", "team"],
  },

  // Early Childhood Teacher
  {
    id: 5,
    title: "Early Childhood Teacher",
    company: "Little Stars",
    salary: "$55k - $70k",
    location: "Brisbane, Australia",
    role: "Early Childhood Teacher",
    tags: ["teaching", "ECE"],
  },
  {
    id: 6,
    title: "Kindergarten Teacher",
    company: "Happy Learners",
    salary: "$58k - $72k",
    location: "Sydney, Australia",
    role: "Early Childhood Teacher",
    tags: ["kids", "learning"],
  },

  // Lead Educator
  {
    id: 7,
    title: "Lead Educator",
    company: "Tiny Tots",
    salary: "$45k - $55k",
    location: "Perth, Australia",
    role: "Childcare Lead Educator",
    tags: ["lead", "kids"],
  },
  {
    id: 8,
    title: "Senior Lead Educator",
    company: "Bright Futures",
    salary: "$48k - $58k",
    location: "Adelaide, Australia",
    role: "Childcare Lead Educator",
    tags: ["mentor", "education"],
  },

  // Assistant Educator
  {
    id: 9,
    title: "Assistant Educator",
    company: "Care Kids",
    salary: "$40k - $48k",
    location: "Adelaide, Australia",
    role: "Childcare Assistant Educator",
    tags: ["assistant", "support"],
  },
  {
    id: 10,
    title: "Junior Educator",
    company: "Little Steps",
    salary: "$38k - $46k",
    location: "Perth, Australia",
    role: "Childcare Assistant Educator",
    tags: ["entry-level", "kids"],
  },

  // Childcare Cook
  {
    id: 11,
    title: "Childcare Cook",
    company: "Healthy Kids Centre",
    salary: "$38k - $45k",
    location: "Gold Coast, Australia",
    role: "Childcare Cook",
    tags: ["cook", "nutrition"],
  },
  {
    id: 12,
    title: "Centre Kitchen Assistant",
    company: "Happy Meals Childcare",
    salary: "$36k - $42k",
    location: "Sydney, Australia",
    role: "Childcare Cook",
    tags: ["kitchen", "food"],
  },
];

const TeacherJobs = () => {
  const [activeTab, setActiveTab] = useState("All");

  const roles = [
  "All",
  "Childcare Centre Manager",
  "Childcare Assistant Centre Manager",
  "Early Childhood Teacher",
  "Childcare Lead Educator",
  "Childcare Assistant Educator",
  "Childcare Cook",
];


const filteredJobs = activeTab === "All" ? jobsData : jobsData.filter((job) => job.role === activeTab);

  return (
    <section id="jobs" className="jobs_section ">
      <div className="container">

        {/* Header */}
        <div className="d-flex flex-column  justify-content-center align-items-center mb-4 flex-wrap">

          <h4 className="fw-bold section_title">
             Explore  Jobs
          </h4>

         <div className="job_tabs text-center mt-3">

   {roles.map((role, index) => (
      <button
        key={index}
        className={activeTab === role ? "active" : ""}
        onClick={() => setActiveTab(role)}
      >
        {role}
      </button>
    ))}

</div>
        </div>

        {/* Jobs */}

        <div className="row">
          {filteredJobs.map((job) => (
            <div className="col-lg-6 mb-4" key={job.id}>
              <div className="job_card">

                <div className="job_card_body">

                  <div className="job_logo"> <BriefcaseBusinessIcon /> </div>

                  <div className="job_info">
                    <h5>{job.title}</h5>

                    <p className="company">{job.company}</p>

                    <p className="salary">{job.salary}</p>

                    <p className="location">
                      <MapPin size={14} /> {job.location}
                    </p>
                  </div>

                  <div className="job_actions">

                   <Heart size={29} className="wishlist" />
                    <button className="apply_btn">
                      APPLY
                    </button>

                  </div>

                </div>

                <div className="job_tags d-flex ">
                 <div className="d-flex gap-2">
                    <Tag className="text_theme" size={16} />
                     <strong>Tagged as:</strong>
                 </div>

                  {job.tags.map((tag, i) => (
                    <span key={i}>{tag}</span>
                  ))}
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TeacherJobs;