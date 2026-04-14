import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  BriefcaseBusinessIcon,
  CheckCircle,
  Heart,
  MapPin,
  Send,
  Star,
  Tag,
  Globe,
  Building2,
  PenLine,
  UserPlus,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  Briefcase,
  MessageSquare,
  ThumbsUp,
  Loader,
  User2,
  Phone,
  Mail,
  Pencil,
} from "lucide-react";

const galleryImages = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600",
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600",
  "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600",
];


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
    visible = "*".repeat(name.length); 
  } else if (name.length <= 5) {
    visible = name.slice(0, 1) + "*".repeat(name.length - 1);
  } else {
    visible = name.slice(0, 3) + "*".repeat(name.length - 3);
  }

  return `${visible}@${domain}`;
};

const formatBioToHtml = (text) => {
  if (!text) return "";

  return text
    .replace(/\n\n/g, "</p><p>")   // double line → new paragraph
    .replace(/\n/g, "<br/>")       // single line → line break
    .replace(/✔️/g, "&#10004;")    // fix tick symbol (optional)
    .replace(/^/, "<p>")           // start with <p>
    .replace(/$/, "</p>");         // end with </p>
};


const EmployerDetail = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const currency = import.meta.env.VITE_CURRENCY;

  // ── Data state ──
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [loading, setLoading] = useState(true);

  // ── Review state ──
  const [myReview, setMyReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [helpfulMap, setHelpfulMap] = useState({});

  // ── UI state ──
  const [activeTab, setActiveTab] = useState("about");
  const [isFollowing, setIsFollowing] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const reviewFormRef = useRef(null);

  // Only teachers can review employers (principals)
  const isOwnProfile = user && employer && user.id === employer.id;
  const canReview =
    isAuthenticated &&
    user?.role === "teacher" &&
    !isOwnProfile;

  // ── Fetch employer ──
  const fetchEmployer = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/employer/${slug}`);
      const d = res.data;
      const u = d.user;
      const dp = u.director_profile;

      setEmployer({
        id: u.id,
        name: u.name,
        email: u.email,
        institutionName: dp?.institution_name || "",
        designation: dp?.designation || "Director",
        phone: dp?.phone_no || "",
        image: dp?.profile_image_url || null,
        bio: dp?.bio || "",
        website: dp?.website || "",
        address: dp?.address || "",
        city: dp?.city || "",
        state: dp?.state || "",
        country: dp?.country || "",
        suburb: dp?.suburb || "",
        rating: Number(u.average_rating) || 0,
        profileCompletion: dp?.profile_completion || 0,
        profileStatus: dp?.profile_status || "",
        linkedin: dp?.linkedin_url || "",
        facebook: dp?.facebook_url || "",
        twitter: dp?.twitter_url || "",
        instagram: dp?.instagram_url || "",
      });

      setJobs(u.jobs || []);
      setTotalApplications(d.total_applications || 0);

      const allReviews = u.received_reviews || [];
      setReviews(allReviews);

      // Find logged-in user's existing review
      if (user) {
        const existing = allReviews.find((r) => r.reviewer_id === user.id);
        if (existing) setMyReview(existing);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employer profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployer();
  }, [slug]);

  // ── Submit / Update Review ──
  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first");
      return;
    }
    if (!userRating) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setReviewLoading(true);

      const payload = {
        reviewed_id: employer.id,
        reviewed_role: "principal",
        rating: userRating,
        comment: feedback,
        job_id: null,
      };

      let res;
      if (myReview && isEditing) {
        res = await api.post(`/review/update/${myReview.id}`, payload);
      } else {
        res = await api.post(`/review/save`, payload);
      }

      toast.success(res.message || "Review submitted");
      setUserRating(0);
      setFeedback("");
      setIsEditing(false);
      fetchEmployer();
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setReviewLoading(false);
    }
  };

  // ── Edit Review ──
  const handleEditReview = (review) => {
    setUserRating(review.rating);
    setFeedback(review.comment);
    setMyReview(review);
    setIsEditing(true);
    setActiveTab("reviews");
    setTimeout(() => {
      reviewFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // ── Switch to Reviews tab + scroll to form ──
  const goToReviewForm = () => {
    setActiveTab("reviews");
    setTimeout(() => {
      reviewFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // ── Lightbox ──
  const openLightbox = (index) => { setLightboxIndex(index); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const prevImage = () => setLightboxIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
  const nextImage = () => setLightboxIndex((i) => (i + 1) % galleryImages.length);

  // ── Helpers ──
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const renderStars = (rating, size = 16) => {
    if (!rating || rating <= 0) return null;
    const rounded = Math.round(rating * 10) / 10;
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        fill={i < Math.floor(rounded) ? "#ffc107" : "none"}
        stroke="#ffc107"
      />
    ));
  };

  const timeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now - past) / 1000);
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : employer?.rating?.toFixed(1) || "0.0";

  const publishedJobs = jobs.filter((j) => j.status === "published");

  const tabs = [
    { key: "about",   label: "About",   icon: <Info size={15} /> },
    { key: "jobs",    label: "Jobs",    icon: <Briefcase size={15} />, badge: publishedJobs.length },
    { key: "reviews", label: "Reviews", icon: <MessageSquare size={15} />, badge: reviews.length },
  ];

  // ── Render ──
  return (
    <div className="teacher_detail_page blue_nav">
      <Navbar />

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <div
          onClick={closeLightbox}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <button onClick={closeLightbox} style={{ position: "absolute", top: 18, right: 22, background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
            <X size={32} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            style={{ position: "absolute", left: 18, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}
          >
            <ChevronLeft size={24} />
          </button>
          <img
            src={galleryImages[lightboxIndex]}
            alt={`Gallery ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: "85vh", maxWidth: "90vw", borderRadius: 10, objectFit: "contain", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
          />
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            style={{ position: "absolute", right: 18, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}
          >
            <ChevronRight size={24} />
          </button>
          <div style={{ position: "absolute", bottom: 18, color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
            {lightboxIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}

      <div className="container my-4">
        <div className="top_padding">

          {/* ── LOADING ── */}
          {loading && (
            <div className="d-flex flex-column justify-content-center align-items-center min_height">
              <Loader size={40} className="spin" />
              <p>Loading Profile...</p>
            </div>
          )}

          {/* ── MAIN CONTENT ── */}
          {!loading && employer && (
            <>
              {/* ── COVER IMAGE ── */}
              <div className="company_cover position-relative mb-4">
                <img
                  src="/images/company_cover.png"
                  alt="cover"
                  className="w-100 rounded-3"
                  style={{ height: 220, objectFit: "cover" }}
                />
                <div
                  className="position-absolute top-0 start-0 w-100 h-100 rounded-3"
                  style={{ background: "linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.1))" }}
                />
                <div className="position-absolute top-50 start-0 translate-middle-y text-white px-4">
                  <h3 className="fw-bold">Come build with us</h3>
                </div>
              </div>

              {/* ── COMPANY HEADER ── */}
              <div className="td-card mt-4">
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-3">
                  <div className="d-flex flex-wrap align-items-center gap-3">
                    <div
                      className=" shadow-sm rounded-3 d-flex align-items-center justify-content-center"
                      style={{ width: 80, height: 80, flexShrink: 0, background: "var(--light)"}}
                    >
                      {employer.image ? (
                        <img
                          src={employer.image}
                          alt={employer.institutionName}
                          style={{ maxWidth: "80%", height: "80%", objectFit: "cover" }}
                          className="rounded-3"
                        />
                      ) : (
                        <BriefcaseBusinessIcon size={32} className="text-muted" />
                      )}
                    </div>
                    <div>
                      <div className="d-flex flex-wrap column-gap-2">
                        <h1 className="mb-0 fw-bold mb-1 employer_name">{employer.institutionName || employer.name}</h1>
                        {employer?.profileStatus?.toLowerCase() === "approved" && (
                          <span className="d-flex align-items-center gap-1 text-capitalize verified_badge">
                            <CheckCircle size={14} className="text-success" /> Verified
                          </span>
                        )}
                      </div>
                      {/* <p className="mb-1 text-muted" style={{ fontSize: 15 }}>{employer.designation}</p> */}
                      <div className="d-flex column-gap-3 row-gap-2 text-muted flex-wrap mt-2">
                        {employer.rating > 0 && (
                          <span className="d-flex align-items-center gap-1">
                            <Star size={14} fill="#ffc107" stroke="#ffc107" /> {Number(employer.rating).toFixed(1)} Rating
                          </span>
                        )}
                        {employer.city && (
                          <span className="d-flex align-items-center gap-1">
                            <MapPin size={14} /> {employer.city}{employer.state ? `, ${employer.state}` : ""}
                          </span>
                        )}
                      
                        {/* {employer.is_verified === true && (
                          <span className="verified_badge ms-1"><CheckCircle size={16} /> Verified</span> 
                        )} */}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFollowing((f) => !f)}
                    className={`btn d-flex align-items-center gap-1 ${isFollowing ? "btn-primary" : "btn-blue"}`}
                    style={{ borderRadius: 20, fontSize: 14, padding: "6px 20px" }}
                  >
                    <UserPlus size={15} />
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              {/* ── TABS ── */}
              <div className="" style={{ borderBottom: "2px solid #e9ecef" }}>
                <div className="d-flex flex-wrap gap-1 emp_tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className="btn d-flex align-items-center gap-1 gap-md-2 ps-0 pe-3 pe-md-4 py-2"
                      style={{
                        borderRadius: 0,
                        borderBottom: activeTab === tab.key ? "2px solid var(--primary)" : "2px solid transparent",
                        marginBottom: -2,
                        color: activeTab === tab.key ? "var(--primary)" : "#6c757d",
                        fontWeight: activeTab === tab.key ? 600 : 400,
                        background: "none",
                        fontSize: 15,
                        transition: "color 0.2s",
                      }}
                    >
                      {tab.icon}
                      {tab.label}
                      {tab.badge !== undefined && (
                        <span className="badge bg-primary ms-1" style={{ fontSize: 11 }}>{tab.badge}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              </div>


              {/* ── LAYOUT ── */}
              <div className="row">

                {/* LEFT */}
                <div className="col-lg-8">

                  {/* ── ABOUT TAB ── */}
                  {activeTab === "about" && (
                    <>
                      <div className="td-card p-4 mb-4 rounded-3">
                        <h5 className="fw-bold mb-3">Company Overview</h5>
                        {employer.bio ? (
                          <>
                            <div className="job_description_wrapper">
                              <div
                                className={`job_description ${!descExpanded ? "clamped" : ""}`}
                                dangerouslySetInnerHTML={{
                                  __html: formatBioToHtml(employer.bio),
                                }}
                              />

                              {employer.bio && employer.bio.length > 200 && (
                                <span
                                  className="read_more"
                                  onClick={() => setDescExpanded((prev) => !prev)}
                                >
                                  {descExpanded ? "Read less" : "Read more..."}
                                </span>
                              )}
                            </div>

                          </>
                        ) : (
                          <p className="text-muted">No description available.</p>
                        )}

                        <div className="row mt-3">
                          {employer.institutionName && (
                            <div className="col-6 mb-2">
                              <strong>Institution:</strong> {employer.institutionName}
                            </div>
                          )}
                          {employer.designation && (
                            <div className="col-6 mb-2">
                              <strong>Designation:</strong> {employer.designation}
                            </div>
                          )}
                          {/* {employer.city && (
                            <div className="col-6 mb-2">
                              <strong>Location:</strong> {employer.city}{employer.state ? `, ${employer.state}` : ""}
                            </div>
                          )}
                          {employer.country && (
                            <div className="col-6 mb-2">
                              <strong>Country:</strong> {employer.country}
                            </div>
                          )} */}
                          {/* {totalApplications > 0 && (
                            <div className="col-6 mb-2">
                              <strong>Total Applications:</strong> {totalApplications}
                            </div>
                          )} */}
                        </div>
                      </div>

                      <div className="td-card p-4 mb-4 rounded-3">
                        <h5 className="fw-bold mb-3">Gallery</h5>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                          {galleryImages.map((img, i) => (
                            <div
                              key={i}
                              onClick={() => openLightbox(i)}
                              style={{ aspectRatio: "1/1", overflow: "hidden", borderRadius: 8, cursor: "pointer" }}
                            >
                              <img
                                src={img}
                                alt={`Gallery ${i + 1}`}
                                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.25s" }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.07)")}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── JOBS TAB ── */}
                  {activeTab === "jobs" && (
                    <div className="td-card p-4 rounded-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">
                          Jobs ({publishedJobs.length})
                        </h5>
                        <button className="btn btn-blue">View all jobs</button>
                      </div>

                      {publishedJobs.length === 0 ? (
                        <p className="text-muted">No published jobs at the moment.</p>
                      ) : (
                        <div className="row">
                          {publishedJobs.map((job) => {
                            const skillsParsed = (() => {
                              try { return JSON.parse(job.skills); } catch { return []; }
                            })();

                            return (
                              <div className="col-12 mb-4" key={job.id}>
                                <div className="job_card">
                                  <div className="job_card_body list_view">
                                    <div className="job_logo">
                                      <BriefcaseBusinessIcon />
                                    </div>
                                    <div className="job_info">
                                      <h5 className="text-capitalize">
                                        <Link to={`/job/${job.slug}`}>{job.title}</Link>
                                        {job.is_urgent && (
                                          <span className="badge bg-danger ms-1" style={{ fontSize: 11 }}>Urgent</span>
                                        )}
                                        {job.is_featured && (
                                          <span className="badge bg-warning text-dark ms-1" style={{ fontSize: 11 }}>Featured</span>
                                        )}
                                      </h5>
                                      <p className="company mb-2">{employer.institutionName}</p>
                                      <Link to={`/job/${job.slug}`}>
                                        <p className="description small">{stripHtml(job.description)}</p>
                                      </Link>
                                      <p className="salary">
                                        {currency}{job.salary_min} - {currency}{job.salary_max}
                                        {" "}({job.salary_type})
                                        {job.salary_negotiable && (
                                          <span className="text-muted ms-1" style={{ fontSize: 12 }}>(Negotiable)</span>
                                        )}
                                      </p>
                                      <div className="d-flex gap-2 mb-2">
                                        <span
                                          className="badge bg-light text-dark text-capitalize"
                                          style={{ fontSize: 11, border: "1px solid #dee2e6" }}
                                        >
                                          {job.job_type?.replace("_", " ")}
                                        </span>
                                        <span
                                          className="badge bg-light text-dark text-capitalize"
                                          style={{ fontSize: 11, border: "1px solid #dee2e6" }}
                                        >
                                          {job.work_mode}
                                        </span>
                                      </div>
                                      <p className="location m-0">
                                        <MapPin size={14} className="mb-1" />
                                        {job.city}{job.state ? `, ${job.state}` : ""}, {job.country}
                                      </p>
                                    </div>
                                    {/* <div className="job_actions">
                                      <div style={{ cursor: "pointer" }}>
                                        <Heart className="wishlist" size={26} />
                                      </div>
                                      <Link to={`/jobs/${job.slug}`}>
                                        <button className="apply_btn">APPLY</button>
                                      </Link>
                                    </div> */}
                                  </div>
                                  {skillsParsed.length > 0 && (
                                    <div className="job_tags d-flex flex-wrap">
                                      <div className="d-flex gap-1">
                                        <Tag size={16} /><strong>Tagged as:</strong>
                                      </div>
                                      {skillsParsed.slice(0,3).map((tag, i) => (
                                        <span key={i} className="text-capitalize">{tag}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── REVIEWS TAB ── */}
                  {activeTab === "reviews" && (
                    <>
                      {/* Rating Summary */}
                      {reviews.length > 0 && (
                        <div className="td-card p-4 mb-4 rounded-3">
                          <div className="d-flex align-items-center gap-4 flex-wrap">
                            <div className="text-center">
                              <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1, color: "#1a1a1a" }}>
                                {avgRating}
                              </div>
                              <div className="d-flex gap-1 justify-content-center my-1">
                                {renderStars(parseFloat(avgRating), 18)}
                              </div>
                              <div className="text-muted" style={{ fontSize: 13 }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</div>
                            </div>
                            <div style={{ flex: 1, minWidth: 180 }}>
                              {[5, 4, 3, 2, 1].map((star) => {
                                const count = reviews.filter((r) => r.rating === star).length;
                                const pct = Math.round((count / reviews.length) * 100);
                                return (
                                  <div key={star} className="d-flex align-items-center gap-2 mb-1">
                                    <span style={{ fontSize: 12, width: 10, color: "#6c757d" }}>{star}</span>
                                    <Star size={12} fill="#ffc107" stroke="#ffc107" />
                                    <div style={{ flex: 1, height: 8, background: "#e9ecef", borderRadius: 4, overflow: "hidden" }}>
                                      <div style={{ width: `${pct}%`, height: "100%", background: "#ffc107", borderRadius: 4 }} />
                                    </div>
                                    <span style={{ fontSize: 12, color: "#6c757d", width: 28 }}>{pct}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Review List */}
                      {reviews.length === 0 ? (
                        <div className="td-card p-4 mb-4 rounded-3">
                          <p className="text-muted mb-0">No reviews yet. Be the first to review!</p>
                        </div>
                      ) : (
                        reviews.map((review) => {
                          const isMyReview = user && review.reviewer_id === user.id;
                          const reviewer = review.reviewer;
                          const reviewerImage = reviewer?.teacher?.profile_image || null;

                          return (
                            <div className="td-card p-4 mb-3 rounded-3" key={review.id}>
                              <div className="d-flex align-items-start gap-3">
                                {/* Avatar */}
                                {reviewerImage ? (
                                  <img
                                    src={reviewerImage}
                                    alt={reviewer?.name}
                                    style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: 44, height: 44, borderRadius: "50%",
                                      background: "#4f46e5", color: "#fff",
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      fontWeight: 600, fontSize: 14, flexShrink: 0,
                                    }}
                                  >
                                    {reviewer?.name?.slice(0, 2).toUpperCase() || "??"}
                                  </div>
                                )}

                                <div style={{ flex: 1 }}>
                                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                                    <div className="d-flex align-items-center gap-2">
                                      <span className="fw-semibold text-capitalize">{reviewer?.name || "User"}</span>
                                      <span className="text-muted" style={{ fontSize: 12 }}>{timeAgo(review.created_at)}</span>
                                      {isMyReview && (
                                        <Pencil
                                          size={14}
                                          className="cursor-pointer text_theme"
                                          style={{ cursor: "pointer" }}
                                          onClick={() => handleEditReview(review)}
                                          title="Edit your review"
                                        />
                                      )}
                                    </div>
                                    <div className="d-flex gap-1">
                                      {renderStars(review.rating, 14)}
                                    </div>
                                  </div>

                                  <p className="mb-2 text-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
                                    {review.comment || <em>No comment provided.</em>}
                                  </p>

                                  {/* <button
                                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                    style={{ fontSize: 12, borderRadius: 20 }}
                                    onClick={() => setHelpfulMap((m) => ({ ...m, [review.id]: true }))}
                                    disabled={helpfulMap[review.id]}
                                  >
                                    <ThumbsUp size={13} />
                                    {helpfulMap[review.id] ? "Marked helpful" : "Helpful"}
                                  </button> */}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}

                      {/* Leave / Edit a Review Form — only teachers */}
                      {canReview && (
                        <div className="td-card p-4 rounded-3" ref={reviewFormRef}>
                          <h5 className="fw-bold mb-1">
                            {isEditing ? "Edit Your Review" : "Leave a Review"}
                          </h5>
                          <p className="text-muted mb-3" style={{ fontSize: 14 }}>
                            Share your experience working with {employer.institutionName || employer.name}.
                          </p>

                          <p className="mb-1" style={{ fontSize: 14, fontWeight: 500 }}>Your Rating</p>
                          <div className="stars_row big mb-3">
                            {[1, 2, 3, 4, 5].map((r) => (
                              <Star
                                key={r}
                                size={28}
                                style={{ cursor: "pointer" }}
                                onClick={() => setUserRating(r)}
                                onMouseEnter={() => setHoverRating(r)}
                                onMouseLeave={() => setHoverRating(0)}
                                fill={r <= (hoverRating || userRating) ? "#ffc107" : "none"}
                                stroke="#ffc107"
                              />
                            ))}
                          </div>

                          <textarea
                            rows={4}
                            placeholder="Share your experience with this employer..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="mb-3"
                          />

                          <div className="d-flex gap-2">
                            <button
                              className="btn-post d-flex align-items-center gap-2"
                              onClick={handleSubmitReview}
                              disabled={reviewLoading}
                            >
                              <Send size={13} className="" />
                              {reviewLoading ? "Please wait..." : isEditing ? "Update Review" : "Submit Review"}
                            </button>
                            {isEditing && (
                              <button
                                className="btn btn-dark"
                                onClick={() => { setIsEditing(false); setUserRating(0); setFeedback(""); }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Not logged in or not a teacher — prompt */}
                      {!canReview && !isOwnProfile && (
                        <div className="td-card p-4 rounded-3 text-center">
                          <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                            {!isAuthenticated
                              ? "Please login as a jobseeker to leave a review."
                              : user?.role !== "teacher"
                              ? "Only jobseekers can review employers."
                              : ""}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* RIGHT SIDEBAR — always visible */}
                <div className="col-lg-4">

                  <div className="td-card p-4 rounded-3 mb-4">
                    <h5 className="fw-bold mb-3">Quick Info</h5>
                    <ul className="list-unstyled">
                      {employer.website && (
                        <li className="mb-2 d-flex align-items-center gap-2">
                          <Globe size={16} className="text_theme" />
                          <a href={employer.website} className="text_blue" target="_blank" rel="noreferrer">{employer.website}</a>
                        </li>
                      )}
                      {employer.email && (
                        <li className="mb-2 d-flex align-items-center gap-2">
                          <Mail size={16} className="text_theme" />
                          {isAuthenticated ? employer.email : maskEmail(employer.email)}
                        </li>
                      )}
                      {employer.phone && (
                        <li className="mb-2 d-flex align-items-center gap-2">
                          <Phone size={16} className="text_theme" />
                          {isAuthenticated ? employer.phone : maskPhone(employer.phone)}
                        </li>
                      )}
                      {employer.suburb && (
                        <li className="mb-2 d-flex align-items-center gap-2">
                          <MapPin size={16} className="text_theme" />
                          {/* {[employer.suburb, employer.city, employer.state, employer.country].filter(Boolean).join(", ")} */}
                          {employer.suburb}
                        </li>
                      )}
                      {/* {employer.address && (
                        <li className="mb-2 d-flex align-items-start gap-2">
                          <Building2 size={16} style={{ flexShrink: 0, marginTop: 2 }} /> {employer.address}
                        </li>
                      )} */}
                    </ul>
                    {employer.website && (
                      <a href={employer.website} target="_blank" rel="noreferrer">
                        <button className="btn-post w-100 mt-2">Visit Website</button>
                      </a>
                    )}
                  </div>

                  {/* Leave a Review — only for teachers */}
                  {canReview && (
                    <div className="td-card p-4 rounded-3 mb-4">
                      <h5 className="fw-bold">Leave a Review</h5>
                      <p className="text-muted">Share your experience working here.</p>
                      <button
                        className="btn btn-dark py-2 w-100 d-flex align-items-center justify-content-center gap-2"
                        onClick={goToReviewForm}
                      >
                        <PenLine size={15} />
                        Leave Review
                      </button>
                    </div>
                  )}


                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EmployerDetail;