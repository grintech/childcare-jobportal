import { BriefcaseBusiness, BriefcaseBusinessIcon, MapPin } from "lucide-react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import DashSidebar from "./DashSidebar";
import { useState } from "react";
import toast from "react-hot-toast";

const appliedJobsData = [
  {
    id: 1,
    title: "Childcare Centre Manager",
    company: "Bright Kids School",
    salary: "$60k - $75k",
    location: "Sydney, NSW",
    suburb: "Parramatta",
    status: "applied",
    applied_on: "2026-03-15",
  },
  {
    id: 2,
    title: "Senior Centre Manager",
    company: "Little Explorers",
    salary: "$65k - $80k",
    location: "Melbourne, VIC",
    suburb: "Southbank",
    status: "in-review",
    applied_on: "2026-03-10",
  },
  {
    id: 3,
    title: "Assistant Centre Manager",
    company: "Happy Kids Care",
    salary: "$50k - $60k",
    location: "Melbourne, VIC",
    suburb: "Richmond",
    status: "shortlisted",
    applied_on: "2026-03-05",
  },
  {
    id: 4,
    title: "Deputy Manager",
    company: "Growing Minds",
    salary: "$52k - $62k",
    location: "Brisbane, QLD",
    suburb: "Fortitude Valley",
    status: "interviewed",
    applied_on: "2026-03-15",
  },
  {
    id: 5,
    title: "Teacher",
    company: "ABC School",
    salary: "$45k - $55k",
    location: "Perth, WA",
    suburb: "Subiaco",
    status: "hired",
    applied_on: "2026-03-10",
  },
  {
    id: 6,
    title: "Assistant Teacher",
    company: "Kids World",
    salary: "$40k - $50k",
    location: "Adelaide, SA",
    suburb: "Glenelg",
    status: "rejected",
    applied_on: "2026-03-05",
  },
];

const AppliedJobs = () => {
  const [jobs, setJobs] = useState(appliedJobsData);

  // STATUS COLORS
  const getStatusClass = (status) => {
    switch (status) {
      case "applied":
        return "status_applied";
      case "in-review":
        return "status_review";
      case "shortlisted":
        return "status_shortlisted";
      case "interviewed":
        return "status_interviewed";
      case "hired":
        return "status_hired";
      case "rejected":
        return "status_rejected";
      default:
        return "";
    }
  };

  // FORMAT STATUS
  const formatStatus = (status) => status.replace("-", " ");

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "NA"; //  null / undefined / empty

    const d = new Date(date);

    //  Invalid date check
    if (isNaN(d.getTime())) return "NA";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);

    return `${day}-${month}-${year}`;
  };

  // CANCEL APPLICATION
  const handleCancel = (id) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
    toast.success("Application cancelled successfully!");
  };

  return (
    <>
      <div className="my_acount blue_nav">
        <Navbar />

        <div className="saved_jobs top_padding">
          <div className="container py-4">
            <div className="row">
              <h1 className="mb-3 sec-title text-center">
                Applied Jobs
              </h1>

              <div className="col-lg-4 col-xl-3 mb-4 mb-lg-0">
                <DashSidebar />
              </div>

              <div className="col-lg-8 col-xl-9 mb-4 mb-lg-0">
                <div className="row">
                  {jobs.length > 0 ? (
                    jobs.map((job) => (
                      <div className="col-12 mb-4" key={job.id}>
                        <div className="job_card">
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

                            {/*  STATUS + CANCEL */}
                            <div className="job_actions text-end flex-column">
                              <div className="d-flex align-items-center gap-2 justify-content-end">
                                <span
                                  className={`status_badge ${getStatusClass(
                                    job.status
                                  )}`}
                                >
                                  {formatStatus(job.status)}
                                </span>

                                {/*  CANCEL BUTTON */}
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleCancel(job.id)}
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title="Cancel Application"
                                >
                                  Cancel
                                </button>
                              </div>

                              {/*  APPLIED DATE */}
                              <small className="applied_date mt-1 mb-0">
                                Applied on: {formatDate(job.applied_on)}
                              </small>
                            </div>

                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                     <div className="card border-0 shadow-sm py-4 d-flex flex -column justify-content-center align-items-center">
                        <BriefcaseBusiness  className="mb-2" size={25} />
                        <h6> No applied jobs found!</h6>
                    </div>
                  )}
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

export default AppliedJobs;