import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Heart,
  HeartIcon,
  ArrowRight,
  Loader2,
  Loader,
  BriefcaseBusiness,
  BriefcaseBusinessIcon,
  CheckCircle,
  Tag,
  Briefcase,
  Award,
  Clock,
  Phone,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ApplyModal from "../components/ApplyModal";
import JobCardSkeleton from "../components/skeletons/JobCardSkeleton";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const JobDetailPage = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const currency = import.meta.env.VITE_CURRENCY;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [expandedDesc, setExpandedDesc] = useState(false);

  const [similarJobs, setSimilarJobs] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  // ✅ FETCH JOB
  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs/${slug}`);

      if (res.status) {
        setJob(res.data);
      }
    } catch (err) {
      toast.error("Failed to fetch job");
    } finally {
      setLoading(false);
    }
  };

  // ✅ APPLY
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

  // ✅ SAVE / UNSAVE
  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save a job!");
      return;
    }

    try {
      setSaving(true);

      const res = await api.post("/save/unsave", {
        slug: job.slug,
      });

      setJob((prev) => ({
        ...prev,
        is_saved: res?.is_saved ?? !prev.is_saved,
      }));

      toast.success(res.message || "Updated");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Similar Jobs

  const fetchSimilarJobs = async () => {
    try {
      setSimilarLoading(true);

      const res = await api.get(`/jobs/${slug}/similar`);

      if (res.status) {
        setSimilarJobs(res.data.slice(0, 4));
      }
    } catch (err) {
      console.log(err);
    } finally {
      setSimilarLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchJob();
      fetchSimilarJobs();
    }
  }, [slug, isAuthenticated]);

  // ✅ SAVE / UNSAVE SIMILAR
  const handleSaveToggle = async (item) => {
    if (!isAuthenticated) {
      toast.error("Please login to save a job!");
      return;
    }

    try {
      setSavingId(item.id);

      const res = await api.post("/save/unsave", {
        slug: item.slug,
      });

      setSimilarJobs((prev) =>
        prev.map((j) =>
          j.id === item.id
            ? { ...j, is_saved: res?.is_saved ?? !j.is_saved }
            : j,
        ),
      );

      toast.success(res.message || "Updated");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setSavingId(null);
    }
  };

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const maskPhone = (phone, type = "full") => {
    if (!phone) return "";

    const hasPlus = phone.trim().startsWith("+");
    const clean = phone.replace(/\D/g, "");

    if (clean.length < 6) return phone;

    let countryCode = "";
    let number = clean;

    // Extract country code only if '+' prefix was present
    if (hasPlus && clean.length > 10) {
      const ccLength = clean.length - 10; // e.g. 12 digits total → 2-digit CC
      countryCode = `+${clean.slice(0, ccLength)}`;
      number = clean.slice(ccLength);
    }

    const first3 = number.slice(0, 3);
    const last3 = number.slice(-3);
    const prefix = countryCode ? `${countryCode} ` : "";

    switch (type) {
      case "hideAll":
        return `${prefix}*** *** ${last3}`;

      case "showFirst":
        return `${prefix}${first3} *** ${last3}`;

      case "hideMiddle":
        return `${prefix}*** *** ${last3}`;

      case "default":
      default:
        return `${prefix}${first3} *** *** ${last3}`;
    }
  };

  const maskEmail = (email) => {
    if (!email) return "";

    const [name, domain] = email.split("@");

    if (!name || !domain) return email;

    let visible;

    if (name.length <= 2) {
      visible = "*".repeat(name.length); // fully hide short names
    } else if (name.length <= 5) {
      visible = name.slice(0, 1) + "*".repeat(name.length - 1); // show only 1 char
    } else {
      visible = name.slice(0, 3) + "*".repeat(name.length - 3); // show 3 chars
    }

    return `${visible}@${domain}`;
  };

  return (
    <>
      <div className="single_page blue_nav">
        <Navbar />

        <div className="top_padding">
          <div className="container my-4">
            {loading || !job ? (
              <div className="d-flex flex-column justify-content-center align-items-center min_height">
                <Loader size={40} className="spin" />
                <p>Please wait....</p>
              </div>
            ) : (
              <>
                <div className="row">
                  {/* LEFT SIDE */}
                  <div className="col-lg-8 mb-5 mb-lg-0">
                    <div className="job_detail_card shadow-sm mb-3">
                      {Array.isArray(job.image) && job.image.length > 0 && (
                        <div className="job_banner mb-3">
                          {/* ✅ SINGLE IMAGE */}
                          {job.image.length === 1 && (
                            <img src={job.image[0]} alt="job-banner" />
                          )}

                          {/* ✅ MULTIPLE IMAGES → SWIPER */}
                          {job.image.length > 1 && (
                            <Swiper
                              modules={[Pagination, Autoplay]}
                              pagination={{ clickable: true }}
                              autoplay={{
                                delay: 2500, // 2.5 sec
                                disableOnInteraction: false, // keep autoplay after swipe
                                pauseOnMouseEnter: true, // pause on hover (desktop)
                              }}
                              loop={true} // infinite loop
                              spaceBetween={10}
                              slidesPerView={1}
                              className="job_swiper"
                            >
                              {job.image.map((img, i) => (
                                <SwiperSlide key={i}>
                                  <img src={img} alt={`job-${i}`} />
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          )}
                        </div>
                      )}

                      {/* HEADER */}
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <Link to="/company" className="job_logo_big">
                          {job.profile_image ? (
                            <img src={job.profile_image} alt="" />
                          ) : (
                            <div className="fallback_icon">
                              <BriefcaseBusiness size={25} />
                            </div>
                          )}
                        </Link>

                        <div>
                          <p className="company_name mb-0">
                            {job.institution_name}
                          </p>

                          <h4 className="mb-1 fw-semibold">{job.title}</h4>

                          <div className="small text-muted">
                            ⭐ 4.4 • {job.applications_count} applicants
                          </div>
                        </div>
                      </div>

                      {/* META */}
                      <div className="job_meta mb-3">
                        <p className="mb-3">
                          <MapPin size={14} /> {job.city}, {job.state}
                        </p>
                        <p className="d-flex flex-wrap gap-2">
                          <span className="badge bg-secondary text-capitalize">
                            {job.job_type}
                          </span>
                          <span className="badge bg-secondary text-capitalize">
                            {job.work_mode}
                          </span>
                        </p>
                      </div>

                      {/* SALARY */}
                      {/* <p className="posted small text_theme">
                              <b>Salary:</b> ${job.salary_min} - ${job.salary_max} ({job.salary_type})
                            </p> */}

                      {/* BUTTONS */}
                      <div className="d-flex gap-2 mt-3">
                        {/* APPLY */}
                        <button
                          className="btn-post"
                          onClick={() => handleApplyClick(job)}
                          disabled={job.is_applied}
                        >
                          {job.is_applied ? (
                            "APPLIED"
                          ) : (
                            <>
                              APPLY <ArrowRight size={18} />
                            </>
                          )}
                        </button>

                        {/* SAVE */}
                        <button className="btn2" onClick={handleSave}>
                          {saving ? (
                            <span className="d-inline-flex align-items-center gap-1">
                              Saving... <Loader size={18} className="spin" />
                            </span>
                          ) : (
                            <>
                              {job.is_saved ? "Saved" : "Save"}{" "}
                              <HeartIcon
                                size={18}
                                fill={job.is_saved ? "red" : "none"}
                                className="mb-1"
                              />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="job_detail_card shadow-sm">
                      <h5 className="fw-semibold">Job Description</h5>

                      <div className="job_description_wrapper">
                        <div
                          className={`job_description ${!expandedDesc ? "clamped" : ""}`}
                          dangerouslySetInnerHTML={{
                            __html: job.description,
                          }}
                        />

                        {job.description?.length > 200 && (
                          <span
                            className="read_more"
                            onClick={() => setExpandedDesc(!expandedDesc)}
                          >
                            {expandedDesc ? "Read less" : "Read more..."}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 ">
                        <b>Skills:</b>{" "}
                        {job.skills?.map((s, i) => (
                          <span
                            key={i}
                            className="me-2 text-capitalize badge p-2 bg-light text-dark"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 ">
                        <b>Role:</b> <span>{job.job_category}</span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="col-lg-4">
                    <div className="job_detail_card card_right shadow-sm">
                      <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                        <BriefcaseBusinessIcon size={22} /> Job Info
                      </h5>

                      <p className="d-flex align-items-start gap-2">
                        <Award size={16} className="mt-1 text_theme" />
                        <span>
                          <b>Experience:</b> {job.experience_min} -{" "}
                          {job.experience_max} yrs
                        </span>
                      </p>

                      <p className="d-flex align-items-start gap-2">
                        <MapPin size={16} className="mt-1 text_theme" />
                        <span>
                          <b>Location:</b> {job.address}
                        </span>
                      </p>

                      <p className="d-flex align-items-start gap-2">
                        <MapPin size={16} className="mt-1 text_theme" />
                        <span>
                          <b>Salary:</b>{" "}
                          <span className="text_theme">
                            {currency}
                            {job.salary_min} - {currency}
                            {job.salary_max} ({job.salary_type})
                          </span>
                        </span>
                      </p>

                      <p className="d-flex align-items-start gap-2">
                        <Clock size={16} className="mt-1 text_theme" />
                        <span>
                          <b>Duration:</b> {job.duration} {job.duration_type}
                        </span>
                      </p>

                      <p className="d-flex align-items-start gap-2">
                        <Phone size={16} className="mt-1 text_theme" />
                        <span>
                          <b>Phone:</b>{" "}
                          <span className="">{maskPhone(job.phone_no)}</span>
                        </span>
                      </p>

                      <p className="d-flex align-items-start gap-2">
                        <Mail size={16} className="mt-1 text_theme" />
                        <span>
                          <b>Email:</b>{" "}
                          <span className="">{maskEmail(job.user_email)}</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="row mt-5">
                  <h4 className="fw-bold">Similar Jobs</h4>

                  {similarLoading ? (
                    <JobCardSkeleton />
                  ) : similarJobs.length > 0 ? (
                    similarJobs.map((item) => (
                      <div className="col-12 mb-4" key={item.id}>
                        <div className="job_card">
                          <div className="job_card_body list_view">
                            {/* LOGO */}
                            <div className="job_logo">
                              {item.profile_image ? (
                                <img
                                  src={item.profile_image}
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
                              <h5>
                                <Link to={`/job/${item.slug}`}>
                                  {item.title}
                                </Link>
                                <span className="verified_badge ms-1">
                                  <CheckCircle size={16} /> Verified
                                </span>
                              </h5>

                              <p className="company mb-2">
                                {item.institution_name}
                              </p>

                              <Link to={`/job/${item.slug}`}>
                                <p className="description small">
                                  {stripHtml(item.description).slice(0, 120)}...
                                </p>
                              </Link>

                              <p className="salary">
                                {currency}
                                {item.salary_min} - {currency}
                                {item.salary_max} ({item.salary_type})
                              </p>

                              <p className="location m-0">
                                <MapPin size={14} className="mb-1" />{" "}
                                {item.city}, {item.state}
                              </p>
                            </div>

                            {/* ACTIONS */}
                            <div className="job_actions">
                              <div
                                onClick={() => handleSaveToggle(item)}
                                style={{ cursor: "pointer" }}
                              >
                                {savingId === item.id ? (
                                  <Loader size={26} className="spin wishlist" />
                                ) : (
                                  <Heart
                                    className="wishlist"
                                    size={26}
                                    fill={item.is_saved ? "red" : "none"}
                                    stroke={
                                      item.is_saved ? "red" : "currentColor"
                                    }
                                  />
                                )}
                              </div>

                              <button
                                className="apply_btn"
                                onClick={() => handleApplyClick(item)}
                                disabled={item.is_applied}
                              >
                                {item.is_applied ? "APPLIED" : "APPLY"}
                              </button>
                            </div>
                          </div>

                          {/* TAGS */}
                          <div className="job_tags d-flex">
                            <div className="d-flex gap-2">
                              <Tag size={16} />
                              <strong>Tagged as:</strong>
                            </div>

                            {item.skills?.map((tag, i) => (
                              <span key={i} className="text-capitalize">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <div className="d-flex flex-column align-items-center justify-content-center bg-white py-4 px-3 ">
                        <Briefcase size={25} className="mb-2" />
                        <h5 className="text-center">
                          {" "}
                          No similar jobs found!{" "}
                        </h5>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <Footer />
      </div>

      <ApplyModal
        show={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        jobData={selectedJob}
        onApplied={(jobId) => {
          // Update main job
          if (job?.id === jobId) {
            setJob((prev) => ({ ...prev, is_applied: true }));
          }
          // Update similar jobs
          setSimilarJobs((prev) =>
            prev.map((j) => (j.id === jobId ? { ...j, is_applied: true } : j)),
          );
        }}
      />
    </>
  );
};

export default JobDetailPage;
