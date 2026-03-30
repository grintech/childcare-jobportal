import { BriefcaseBusiness, BriefcaseBusinessIcon, Heart, MapPin } from "lucide-react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import DashSidebar from "./DashSidebar";
import { useState } from "react";
import toast from "react-hot-toast";
import ApplyModal from "../../components/ApplyModal";

const jobsData = [
  {
    id: 1,
    title: "Childcare Centre Manager",
    company: "Bright Kids School",
    salary: "$60k - $75k",
    location: "Sydney, NSW",
    suburb: "Parramatta",
  },
  {
    id: 2,
    title: "Senior Centre Manager",
    company: "Little Explorers",
    salary: "$65k - $80k",
    location: "Melbourne, VIC",
    suburb: "Southbank",
  },
  {
    id: 3,
    title: "Assistant Centre Manager",
    company: "Happy Kids Care",
    salary: "$50k - $60k",
    location: "Melbourne, VIC",
    suburb: "Richmond",
  },
];

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState(jobsData);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  //  REMOVE JOB
  const handleUnsave = (id) => {
    setSavedJobs((prev) => prev.filter((job) => job.id !== id));

    toast.success("Job unsaved successfully!");
  };

  return (
    <>
      <div className="my_acount blue_nav">
        <Navbar />

        <div className="saved_jobs top_padding">
          <div className="container py-4">
            <div className="row">
              <h1 className="mb-3 sec-title text-center">Saved Jobs</h1>

              <div className="col-lg-4 col-xl-3 mb-4 mb-lg-0">
                <DashSidebar />
              </div>

              <div className="col-lg-8 col-xl-9 mb-4 mb-lg-0">
                <div className="row">
                  {savedJobs.length > 0 ? (
                    savedJobs.map((job) => (
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
                                <MapPin size={14} /> {job.suburb},{" "}
                                {job.location}
                              </p>
                            </div>

                            <div className="job_actions">
                              {/*  FILLED HEART */}
                              <Heart
                                size={27}
                                className="wishlist"
                                fill="red"
                                color="red"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleUnsave(job.id)}
                              />

                              <button className="apply_btn" 
                                onClick={() => {
                                setSelectedJob(job);  
                                setShowApplyModal(true);
                                }}
                              >APPLY</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="card border-0 shadow-sm py-4 d-flex flex -column justify-content-center align-items-center">
                        <BriefcaseBusiness  className="mb-2" size={25} />
                        <h6> No saved jobs found!</h6>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />

         <ApplyModal
            show={showApplyModal}
            onClose={() => setShowApplyModal(false)}
            jobId={selectedJob?.id}
            />

      </div>
    </>
  );
};

export default SavedJobs;