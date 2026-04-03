import {
  BriefcaseBusiness,
  BriefcaseBusinessIcon,
  Heart,
  MapPin,
  Loader,
} from "lucide-react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import DashSidebar from "./DashSidebar";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ApplyModal from "../../components/ApplyModal";
import api from "../../services/api";
import JobCardSkeleton from "../../components/skeletons/JobCardSkeleton";
import { Link } from "react-router-dom";

const SavedJobs = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  //  FETCH SAVED JOBS
 const fetchSavedJobs = async (page = 1) => {
  try {
    setLoading(true);

    const res = await api.get(`/saved/job-list?page=${page}`);

    if (res.status) {
      setSavedJobs(res.data);
      setCurrentPage(res.pagination.current_page);
      setLastPage(res.pagination.last_page);
    }
  } catch (err) {
    toast.error("Failed to fetch saved jobs");
  } finally {
    setLoading(false);
  }
};

 useEffect(() => {
  fetchSavedJobs(currentPage);
}, [currentPage]);

  //  UNSAVE JOB
  const handleUnsave = async (job) => {
    try {
      setSavingId(job.id);

      const res = await api.post("/save/unsave", {
        slug: job.slug,
      });

      // remove from UI instantly
      setSavedJobs((prev) =>
        prev.filter((item) => item.id !== job.id)
      );

      toast.success(res.message || "Job removed from saved");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setSavingId(null);
    }
  };

  const handleAppliedUpdate = (jobId) => {
  setSavedJobs((prev) =>
    prev.map((job) =>
      job.id === jobId
        ? { ...job, is_applied: true }
        : job
    )
  );
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

                  {/* LOADING */}
                  {loading ? (
                   [...Array(2)].map((_, i) => <JobCardSkeleton key={i} />)
                  ) : savedJobs.length > 0 ? (

                    savedJobs.map((job) => (
                      <div className="col-12 mb-4" key={job.saved_id}>
                        <div className="job_card">
                          <div className="job_card_body list_view">

                            {/* LOGO */}
                            <div className="job_logo">
                              {job.featured_image ? (
                                <img
                                  src={job.featured_image}
                                  alt=""
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

                            {/* INFO */}
                            <div className="job_info">
                              <h5><Link to={`/job/${job.slug}`}>{job.title}</Link></h5>
                              <p className="company">
                                {job.institution_name}
                              </p>

                              <p className="salary">
                                {currency}{job.salary_min} - {currency}{job.salary_max} (
                                {job.salary_type})
                              </p>

                              <p className="location">
                                <MapPin size={14} /> {job.city}, {job.state}
                              </p>
                            </div>

                            {/* ACTIONS */}
                            <div className="job_actions">

                              {/*  UNSAVE */}
                              <div
                                onClick={() => handleUnsave(job)}
                                style={{ cursor: "pointer" }}
                              >
                                {savingId === job.id ? (
                                  <Loader size={26} className="spin wishlist" />
                                ) : (
                                  <Heart
                                    size={27}
                                    className="wishlist"
                                    fill="red"
                                    color="red"
                                  />
                                )}
                              </div>

                              {/* APPLY */}
                               <button
                                className="apply_btn"
                                onClick={() => {
                                  setSelectedJob(job);
                                  setShowApplyModal(true);
                                }}
                                disabled={job.is_applied}
                              >
                                {job?.is_applied ? "APPLIED" : "APPLY"}
                              </button>

                            </div>
                          </div>
                        </div>
                      </div>
                    ))

                  ) : (
                    //  EMPTY STATE
                    <div className="card border-0 shadow-sm py-4 d-flex flex-column justify-content-center align-items-center">
                      <BriefcaseBusiness className="mb-2" size={25} />
                      <h6>No saved jobs found!</h6>
                    </div>
                  )}
                </div>
                
              {/* PAGINATION */}
              {lastPage > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-2 mt-4">

                  {/* PREV */}
                  <button
                    className="btn btn-sm btn-secondary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Prev
                  </button>

                  {/* PAGE NUMBERS */}
                  {[...Array(lastPage)].map((_, i) => (
                    <button
                      key={i}
                      className={`btn btn-sm ${
                        currentPage === i + 1 ? "btn-primary" : "btn-outline-secondary"
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  {/* NEXT */}
                  <button
                    className="btn btn-sm btn-secondary"
                    disabled={currentPage === lastPage}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Next
                  </button>

                </div>
              )}
              </div>


            </div>
          </div>
        </div>

        <Footer />

        <ApplyModal
          show={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          jobData={selectedJob}
          onApplied={handleAppliedUpdate}
        />
      </div>
    </>
  );
};

export default SavedJobs;