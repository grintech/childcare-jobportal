import { BriefcaseBusiness, BriefcaseBusinessIcon, Loader, MapPin } from "lucide-react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import DashSidebar from "./DashSidebar";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import JobCardSkeleton from "../../components/skeletons/JobCardSkeleton";
import api from "../../services/api";

const AppliedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
   const [selectedJob, setSelectedJob] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

 const fetchAppliedJobs = async (page = 1) => {
  try {
    setLoading(true);

    const res = await api.get(`/applied/job-list?page=${page}`);

    console.log("SUCCESS:", res);

    if (res?.status) {
      setJobs(res.data);
      setCurrentPage(res.pagination?.current_page || 1);
      setLastPage(res.pagination?.last_page || 1);
    }
  } catch (err) {
    console.log("ERROR FULL:", err);
    toast.error(err?.message || "Failed to fetch applied jobs");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAppliedJobs(currentPage);
  }, [currentPage]);



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

  // FORMAT Status

 const normalizeStatus = (status) => {
    if (status === "new") return "applied";
    return status.replace("_", "-");
  };


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
  const handleCancel = async () => {
  if (!selectedJob) return;

  try {
    setDeletingId(selectedJob.application_id);

    const res = await api.delete(
      `/applied/delete/${selectedJob.application_id}`
    );

    setJobs((prev) =>
      prev.filter(
        (item) => item.application_id !== selectedJob.application_id
      )
    );

    toast.success(res.message || "Application withdrawn");
  } catch (err) {
    toast.error("Failed to cancel application");
  } finally {
    setDeletingId(null);
    setShowConfirmModal(false);
    setSelectedJob(null);
  }
};

  return (
    <>
      <div className="my_acount blue_nav">
        <Navbar />

        <div className="saved_jobs top_padding">
          <div className="container py-4">
            <div className="row">
              <h1 className="mb-3 sec-title text-center">Applied Jobs</h1>

              <div className="col-lg-4 col-xl-3 mb-4 mb-lg-0">
                <DashSidebar />
              </div>

              <div className="col-lg-8 col-xl-9 mb-4 mb-lg-0">
                <div className="row">
                  {loading ? (
                    [...Array(2)].map((_, i) => <JobCardSkeleton key={i} />)
                  ) : jobs.length > 0 ? (
                    jobs.map((job) => {
                      const status = normalizeStatus(job.application_status);

                      return (
                        <div className="col-12 mb-4" key={job.application_id}>
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
                                <h5>{job.title}</h5>
                                <p className="company">{job.job_category}</p>

                                <p className="salary">
                                  ${job.salary_min} - ${job.salary_max} (
                                  {job.salary_type})
                                </p>

                                <p className="location">
                                  <MapPin size={14} /> {job.city}, {job.state}
                                </p>
                              </div>

                              {/* STATUS */}
                              <div className="job_actions text-end flex-column">
                                <div className="d-flex align-items-center gap-2 justify-content-end">
                                  <span
                                    className={`status_badge ${getStatusClass(status)}`}
                                  >
                                    {status.replace("-", " ")}
                                  </span>

                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => {
                                      setSelectedJob(job);
                                      setShowConfirmModal(true);
                                    }}
                                    disabled={deletingId === job.application_id}
                                  >
                                    Cancel
                                  </button>
                                </div>

                                <small className="applied_date mt-1 mb-0">
                                  Applied on: {formatDate(job.applied_at)}
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="card border-0 shadow-sm py-4 d-flex flex-column justify-content-center align-items-center">
                      <BriefcaseBusiness className="mb-2" size={25} />
                      <h6>No applied jobs found!</h6>
                    </div>
                  )}
                </div>

                {lastPage > 1 && (
                  <div className="d-flex justify-content-center gap-2 mt-4">
                    <button
                      className="btn btn-sm btn-secondary"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      Prev
                    </button>

                    {[...Array(lastPage)].map((_, i) => (
                      <button
                        key={i}
                        className={`btn btn-sm ${
                          currentPage === i + 1
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}

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
      </div>
      {showConfirmModal && (
  <>
    <div className="modal-backdrop fade show"></div>

    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title fw-bold">Cancel Application</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowConfirmModal(false)}
            ></button>
          </div>

          <div className="modal-body text-center">
            <h6 className="fw-bold my-2">
              Are you sure you want to cancel this application?
            </h6>
          </div>

          <div className="modal-footer d-flex justify-content-center">
            <button
              className="btn btn-secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              No
            </button>

            <button
              className="btn btn-danger"
              onClick={handleCancel}
              disabled={deletingId === selectedJob?.application_id}
            >
              {deletingId === selectedJob?.application_id ? (
                <>
                  <Loader size={16} className="spin me-1" />
                  Deleting...
                </>
              ) : (
                "Yes, Cancel"
              )}
            </button>
            
          </div>

        </div>
      </div>
    </div>
  </>
)}
    </>
  );
};

export default AppliedJobs;
