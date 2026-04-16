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
  Star,
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

  const renderStars = (rating) => {
   if (!rating || rating === 0) return null; 
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < Math.floor(rating) ? "#2EC4B6" : "none"}
        stroke="#2EC4B6"
        // fill={i < Math.floor(rating) ? "#ffc107" : "none"}
        // stroke="#ffc107"
      />
    ));
  };

  const formatText = (value) => {
    if (!value) return "";
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return "";

    const regExp =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regExp);

    return match ? `https://www.youtube.com/embed/${match[1]}` : "";
  };

  const timeAgo = (dateString) => {
  if (!dateString) return "";

  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  const months = Math.floor(days / 30);

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  }

  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }

  if (days < 30) {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }

  return `${months} month${months !== 1 ? "s" : ""} ago`;
};


  //  FETCH JOB
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

    if (job.apply_type === "external" && job.apply_url) {
      window.open(job.apply_url, "_blank");
      return;
    }

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
              {job.image.length > 0 && (
               <div className="company_cover position-relative mb-4">
                <img
                  src={job.image}
                  alt="cover"
                  className="w-100 rounded-3"
                  style={{ height: 220, objectFit: "cover" }}
                />
                <div
                  className="position-absolute top-0 start-0 w-100 h-100 rounded-3"
                  style={{ background: "linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.1))" }}
                />
                {/* <div className="position-absolute top-50 start-0 translate-middle-y text-white px-4">
                  <h3 className="fw-bold">Come build with us</h3>
                </div> */}
              </div>

              )}
              
                <div className="row">
                  {/* LEFT SIDE */}
                  <div className="col-lg-8 mb-5 mb-lg-0">
                    <div className="job_detail_card shadow-sm mb-3">
                      {/* {Array.isArray(job.image) && job.image.length > 0 && (
                        <div className="job_banner mb-3">
                          {job.image.length === 1 && (
                            <img src={job.image[0]} alt="job-banner" />
                          )}

                          {job.image.length > 1 && (
                            <Swiper
                              modules={[Pagination, Autoplay]}
                              pagination={{ clickable: true }}
                              autoplay={{
                                delay: 2500, // 2.5 sec
                                disableOnInteraction: false, 
                                pauseOnMouseEnter: true,
                              }}
                              loop={true} 
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
                      )} */}

                      {/* HEADER */}
                      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                        <Link to={`/company/${job.institution_slug}`} className="job_logo_big">
                          {job.profile_image ? (
                            <img src={job.profile_image} alt="" />
                          ) : (
                            <div className="fallback_icon">
                              <BriefcaseBusiness size={25} />
                            </div>
                          )}
                        </Link>

                        <div>
                          {/* <Link to={`/company/${job.institution_slug}`}>
                            <p className="company_name mb-0">
                              {job.institution_name}
                            </p>
                          </Link> */}

                          <h1 className="mb-1 fw-semibold job_title">{job.title}</h1>

                          {/* <div className="small text-muted">
                            ⭐ 4.4 • {job.applications_count} applicants
                          </div> */}
                        </div>
                      </div>

                      {/* META */}
                      <div className="job_meta mb-3">
                       
                       <p className="mb-0">
                        {job?.job_type && (
                          <span>
                            <b>Job Type:</b> {formatText(job.job_type)}
                          </span>
                        )}

                        {job?.work_mode && (
                          <>
                            {job?.job_type && " , "}
                            <span>
                              <b>Work Mode:</b> {formatText(job.work_mode)}
                            </span>
                          </>
                        )}

                        {job?.experience_min && job?.experience_max && (
                          <>
                            {(job?.job_type || job?.work_mode) && " , "}
                            <span>
                              <b>Experience:</b> {job.experience_min} - {job.experience_max} yrs
                            </span>
                          </>
                        )}

                        {job?.is_salary_hidden != 1 && job?.salary_min && job?.salary_max && (
                          <>
                            {(job?.job_type || job?.work_mode || (job?.experience_min && job?.experience_max)) && " , "}
                            <span>
                              <b> {job?.salary_type && ` ${formatText(job.salary_type)}`} :</b> {currency}{job.salary_min} - {currency}{job.salary_max}
                             
                            </span>
                          </>
                        )}
                      </p>

                        {Array.isArray(job?.skills) && job.skills.length > 0 && (
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
                        )}  

                        {job?.created_at && (
                          <p className="mb-0">
                            <b>Posted:</b> <span className="small">{timeAgo(job.created_at)}</span>
                          </p>
                        )}

                      </div>


                     
                    </div>

                    {/* DESCRIPTION */}
                    <div className="job_detail_card shadow-sm">
                      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
                      <h5 className="fw-semibold mb-0">Job Description</h5>
                      <div className="d-flex">
                         {/* BUTTONS */}
                        <div className="d-flex gap-2">
                          {/* APPLY */}
                          <button
                            className="btn-post"
                            onClick={() => handleApplyClick(job)}
                            disabled={job.is_applied}
                          >
                            {job.is_applied
                              ? "APPLIED"
                              : job.apply_type === "external"
                              ? "Apply Now"
                              : <>
                              Easy Apply  <ArrowRight size={18} />
                              </>}
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

                      </div>

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

                        
                      
                      {job.additional_note && (
                      <div className="mt-3 ">
                        <b>Additional Note:</b> <span>{job.additional_note}</span>
                      </div>

                      )}
                    </div>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="col-lg-4">
                   
                    <div className="card_right">
                      <div className="sidebar_card mb-4">

                        {/* Header Strip */}
                        <div className="sidebar_featured">
                          <p className="sidebar_featured_label">Client Details</p>
                          <Link className="text_blue" to={`/company/${job.institution_slug}`}>
                            <p className="sidebar_featured_name m-0 d-flex align-items-center gap-2">
                            <BriefcaseBusinessIcon size={16} />
                            {job.institution_name || "Information"}
                          </p>
                          </Link>
                        </div>

                        {/* Body */}
                        <div className="sidebar_body">

                          {/* <p className="contact_section_label">Job Information</p> */}

                          <div className="contact_box">
                            {job.suburb && job.country && (
                            <div className="contact_row">
                              <div className="contact_icon">
                                <MapPin size={16} />
                              </div>
                              <div>
                                <p className="contact_info_label">Location</p>
                                <p className="contact_info_value">
                                  {job.suburb} , {job.country}
                                </p>
                              </div>
                            </div>
                            )}

                          </div>

                          {/* <p className="contact_section_label mt-3">Contact Info</p> */}

                          <div className="contact_box">
                            <div className="contact_row">
                              <div className="contact_icon">
                                <Phone size={13} />
                              </div>
                              <div>
                                <p className="contact_info_label">Phone</p>
                               <p className="contact_info_value">
                                {isAuthenticated && user?.role == "teacher"
                                  ? job.phone_no
                                  : maskPhone(job.phone_no)}
                              </p>
                              </div>
                            </div>

                            {/* Email */}
                            <div className="contact_row">
                              <div className="contact_icon">
                                <Mail size={13} />
                              </div>
                              <div>
                                <p className="contact_info_label">Email</p>
                                 <p className="contact_info_value">
                                  {isAuthenticated && user?.role == "teacher"
                                    ? job.user_email
                                    : maskEmail(job.user_email)}
                                </p>
                              </div>
                            </div>

                            {/* Rating */}
                            {job?.average_rating > 0 && (
                            <div className="contact_row mb-3">
                              <div className="contact_icon">
                                <Award size={16} />
                              </div>
                              <div>
                                <p className="contact_info_label">Rating</p>
                                <div className="d-flex gap-1 align-items-center">
                                  {renderStars(job.average_rating)}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Applications */}
                          {job?.applications_count > 0 && (
                            <div className="contact_row">
                              <div className="contact_icon">
                                <Briefcase size={16} />
                              </div>
                              <div>
                                <p className="contact_info_label">Applications</p>
                                <p className="contact_info_value ">
                                  {job.applications_count} Applicant{job.applications_count > 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                          )}

                          </div>

                        </div>
                      </div>

                      {Array.isArray(job?.video) && job.video.length > 0 && (
                      <div className="video_wrapper ">
                        <iframe
                          width="100%"
                          height="250"
                          src={getYoutubeEmbedUrl(job.video[0].video_url)}
                          title="Job Video"
                          style={{ border: "none" }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-3"
                        />
                      </div>
                    )}


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
                                    width: "65px",
                                    height: "65px",
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
                              <h5 className="text-capitalize">
                                <Link to={`/job/${item.slug}`}>
                                  {item.title}
                                </Link>
                                {item?.profileStatus?.toLowerCase() === "approved" && (
                                  <span className="verified_badge ms-1">
                                    <CheckCircle size={16} /> Verified
                                  </span>
                                ) }
                              </h5>

                              <Link to={`/company/${item.institution_slug}`}>
                                  <p className="company mb-2"> {item.institution_name} </p>
                              </Link>

                              <Link to={`/job/${item.slug}`}>
                                <p className="description small">
                                  {stripHtml(item.short_description || item.description)}
                                </p>
                              </Link>

                           {item?.is_salary_hidden != 1 && (
                              <p className="salary">
                                {currency}{item.salary_min} - {currency}{item.salary_max} ({item.salary_type})
                              </p>
                            )}
                            {item?.average_rating > 0 && (
                              <div className="d-flex gap-1 mb-2">
                                {renderStars(item.average_rating)}
                              </div>
                            )}

                              <p className="location m-0">
                                <MapPin size={14} className="" />{" "}
                                {item.suburb}, {item.country}
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
                               {item.is_applied
                            ? "APPLIED"
                            : item.apply_type === "external"
                            ? "Apply Now"
                            : "Easy Apply"}
                              </button>
                            </div>
                          </div>

                          {/* TAGS */}
                          {item.skills?.length > 0 && (
                            <div className="job_tags d-flex">
                              <div className="d-flex gap-2">
                                <Tag size={16} />
                                <strong>Tagged as:</strong>
                              </div>

                              {item.skills.map((tag, i) => (
                                <span key={i} className="text-capitalize">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

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
