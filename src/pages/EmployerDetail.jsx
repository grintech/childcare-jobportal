import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
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
} from "lucide-react";

const jobs = [
  {
    id: 1,
    title: "Data Centre Technician",
    slug: "data-centre-technician",
    institution_name: "Amazon Web Services",
    description: "Maintain infrastructure and ensure uptime of systems.",
    salary_min: 5000,
    salary_max: 8000,
    salary_type: "Monthly",
    city: "Sydney",
    state: "NSW",
    country: "Australia",
    image: "",
    skills: ["cloud", "network", "hardware"],
    is_applied: false,
  },
  {
    id: 2,
    title: "Cloud Engineer",
    slug: "cloud-engineer",
    institution_name: "AWS",
    description: "Build scalable cloud solutions and optimize performance.",
    salary_min: 7000,
    salary_max: 12000,
    salary_type: "Monthly",
    city: "Melbourne",
    state: "VIC",
    country: "Australia",
    image: "",
    skills: ["aws", "devops", "kubernetes"],
    is_applied: false,
  },
  {
    id: 3,
    title: "Frontend Developer",
    slug: "frontend-developer",
    institution_name: "AWS",
    description: "Develop modern UI using React and improve UX.",
    salary_min: 6000,
    salary_max: 10000,
    salary_type: "Monthly",
    city: "Remote",
    state: "",
    country: "Australia",
    image: "",
    skills: ["react", "javascript", "css"],
    is_applied: false,
  },
];

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

const dummyReviews = [
  {
    id: 1,
    name: "James Thornton",
    avatar: "JT",
    avatarColor: "#4f46e5",
    role: "Software Engineer",
    date: "March 2025",
    rating: 5,
    title: "Amazing place to grow your career",
    body: "AWS has an incredible culture of innovation and learning. The benefits are top-notch, and the team I worked with was collaborative and supportive. Management genuinely cares about your career trajectory.",
    helpful: 14,
  },
  {
    id: 2,
    name: "Priya Sharma",
    avatar: "PS",
    avatarColor: "#0891b2",
    role: "Data Analyst",
    date: "January 2025",
    rating: 4,
    title: "Great culture, fast-paced environment",
    body: "Very impressive team and technology stack. The pace can be intense at times, but the learning opportunities are unmatched. Work-life balance depends heavily on your team.",
    helpful: 9,
  },
  {
    id: 3,
    name: "Marcus Lee",
    avatar: "ML",
    avatarColor: "#059669",
    role: "DevOps Lead",
    date: "November 2024",
    rating: 4,
    title: "Solid employer with competitive pay",
    body: "The compensation and stock benefits are excellent. Processes can sometimes be slow due to company size, but the engineering standards are world-class and you'll work with some brilliant people.",
    helpful: 21,
  },
  {
    id: 4,
    name: "Sophie Williams",
    avatar: "SW",
    avatarColor: "#dc2626",
    role: "Product Manager",
    date: "October 2024",
    rating: 3,
    title: "Good opportunities but high pressure",
    body: "There's no shortage of interesting problems to solve. The leadership principles are central to everything you do. Some teams have a tough workload, so make sure you ask about team culture before joining.",
    helpful: 6,
  },
];

const EmployerDetail = () => {
  const { user, isAuthenticated } = useAuth();
  const currency = import.meta.env.VITE_CURRENCY;

  const [activeTab, setActiveTab] = useState("about");
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [helpfulMap, setHelpfulMap] = useState({});

  const reviewFormRef = useRef(null);

  // Switch to Reviews tab and scroll to form
  const goToReviewForm = () => {
    setActiveTab("reviews");
    setTimeout(() => {
      reviewFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const openLightbox = (index) => { setLightboxIndex(index); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const prevImage = () => setLightboxIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
  const nextImage = () => setLightboxIndex((i) => (i + 1) % galleryImages.length);

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const renderStars = (rating, size = 16) =>
    [...Array(5)].map((_, i) => (
      <Star key={i} size={size} fill={i < Math.floor(rating) ? "#ffc107" : "none"} stroke="#ffc107" />
    ));

  const avgRating = (dummyReviews.reduce((acc, r) => acc + r.rating, 0) / dummyReviews.length).toFixed(1);

  const fullDescription = `Amazon Web Services (AWS) is the world's most comprehensive and broadly adopted cloud platform. 
It offers over 200 fully featured services from data centers globally. Millions of customers — including 
the fastest-growing startups, largest enterprises, and leading government agencies — are using AWS to 
lower costs, become more agile, and innovate faster. AWS continuously innovates on behalf of its customers, 
inventing new technologies to enable new capabilities and deliver more value.`;

  const tabs = [
    { key: "about",   label: "About",   icon: <Info size={15} /> },
    { key: "jobs",    label: "Jobs",    icon: <Briefcase size={15} />, badge: jobs.length },
    { key: "reviews", label: "Reviews", icon: <MessageSquare size={15} />, badge: dummyReviews.length },
  ];

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
          <button onClick={(e) => { e.stopPropagation(); prevImage(); }} style={{ position: "absolute", left: 18, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>
            <ChevronLeft size={24} />
          </button>
          <img src={galleryImages[lightboxIndex]} alt={`Gallery ${lightboxIndex + 1}`} onClick={(e) => e.stopPropagation()} style={{ maxHeight: "85vh", maxWidth: "90vw", borderRadius: 10, objectFit: "contain", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }} />
          <button onClick={(e) => { e.stopPropagation(); nextImage(); }} style={{ position: "absolute", right: 18, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>
            <ChevronRight size={24} />
          </button>
          <div style={{ position: "absolute", bottom: 18, color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
            {lightboxIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}

      <div className="container my-4">
        <div className="top_padding">

          {/* ── COVER IMAGE ── */}
          <div className="company_cover position-relative mb-4">
            <img src="/images/company_cover.png" alt="cover" className="w-100 rounded-3" style={{ height: 220, objectFit: "cover" }} />
            <div className="position-absolute top-0 start-0 w-100 h-100 rounded-3" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.1))" }} />
            <div className="position-absolute top-50 start-0 translate-middle-y text-white px-4">
              <h3 className="fw-bold">Come build with us</h3>
            </div>
          </div>

          {/* ── COMPANY HEADER ── */}
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-white shadow-sm rounded-3 d-flex align-items-center justify-content-center" style={{ width: 80, height: 80, flexShrink: 0 }}>
                <img src="/images/job_logo.png" alt="logo" style={{ maxWidth: "80%", height: "80%", objectFit: "cover" }} className="rounded-3" />
              </div>
              <div>
                <h3 className="mb-0 fw-bold mb-1">AWS</h3>
                <p className="mb-1 text-muted" style={{ fontSize: 15 }}>Amazon Web Services</p>
                <div className="d-flex gap-3 text-muted flex-wrap">
                  <span className="d-flex align-items-center gap-1">
                    <Star size={14} fill="#ffc107" stroke="#ffc107" /> {avgRating} Rating
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <Building2 size={14} /> IT Services
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <MapPin size={14} /> Sydney, NSW
                  </span>
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
          <div className="mb-4" style={{ borderBottom: "2px solid #e9ecef" }}>
            <div className="d-flex gap-1 emp_tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="btn d-flex align-items-center gap-2 px-4 py-2"
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

          {/* ── MAIN CONTENT ── */}
          <div className="row">

            {/* LEFT SIDE */}
            <div className="col-lg-8">

              {/* ── ABOUT TAB ── */}
              {activeTab === "about" && (
                <>
                  <div className="td-card p-4 mb-4 rounded-3">
                    <h5 className="fw-bold mb-3">Company Overview</h5>
                    <div style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: descExpanded ? "unset" : 4, WebkitBoxOrient: "vertical", whiteSpace: "pre-line", color: "#6c757d" }}>
                      {fullDescription}
                    </div>
                    <button className="btn-link btn p-0 mt-1" style={{ fontSize: 13 }} onClick={() => setDescExpanded((e) => !e)}>
                      {descExpanded ? "Show less" : "Show more"}
                    </button>
                    <div className="row mt-3">
                      <div className="col-6 mb-2"><strong>Industry:</strong> IT Services</div>
                      <div className="col-6 mb-2"><strong>Company size:</strong> 10,000+</div>
                      <div className="col-6 mb-2"><strong>Location:</strong> Sydney, NSW</div>
                    </div>
                  </div>

                  <div className="td-card p-4 mb-4 rounded-3">
                    <h5 className="fw-bold mb-3">Gallery</h5>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                      {galleryImages.map((img, i) => (
                        <div key={i} onClick={() => openLightbox(i)} style={{ aspectRatio: "1/1", overflow: "hidden", borderRadius: 8, cursor: "pointer" }}>
                          <img src={img} alt={`Gallery ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.25s" }}
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
                    <h5 className="fw-bold mb-0">Jobs ({jobs.length})</h5>
                    <button className="btn btn-blue">View all jobs</button>
                  </div>
                  <div className="row">
                    {jobs.map((job) => (
                      <div className="col-12 mb-4" key={job.id}>
                        <div className="job_card">
                          <div className="job_card_body list_view">
                            <div className="job_logo">
                              {job.image ? (
                                <img src={job.image} alt={job.title} style={{ width: "55px", height: "55px", objectFit: "cover", borderRadius: "50px" }} />
                              ) : (
                                <BriefcaseBusinessIcon />
                              )}
                            </div>
                            <div className="job_info">
                              <h5>
                                <Link >{job.title}</Link>
                                <span className="verified_badge ms-1"><CheckCircle size={16} /> Verified</span>
                              </h5>
                              <p className="company mb-2">{job.institution_name}</p>
                              <Link >
                                <p className="description small">{stripHtml(job.description)}</p>
                              </Link>
                              <p className="salary">{currency}{job.salary_min} - {currency}{job.salary_max} ({job.salary_type})</p>
                              <div className="d-flex gap-1 mb-2">{renderStars(4.5)}</div>
                              <p className="location m-0">
                                <MapPin size={14} className="mb-1" /> {job.city}{job.state ? `, ${job.state}` : ""}, {job.country}
                              </p>
                            </div>
                            <div className="job_actions">
                              <div style={{ cursor: "pointer" }}><Heart className="wishlist" size={26} /></div>
                              <button className="apply_btn">APPLY</button>
                            </div>
                          </div>
                          <div className="job_tags d-flex">
                            <div className="d-flex gap-2"><Tag size={16} /><strong>Tagged as:</strong></div>
                            {job.skills?.map((tag, i) => <span key={i} className="text-capitalize">{tag}</span>)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── REVIEWS TAB ── */}
              {activeTab === "reviews" && (
                <>
                  {/* Rating Summary */}
                  <div className="td-card p-4 mb-4 rounded-3">
                    <div className="d-flex align-items-center gap-4 flex-wrap">
                      <div className="text-center">
                        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1, color: "#1a1a1a" }}>{avgRating}</div>
                        <div className="d-flex gap-1 justify-content-center my-1">{renderStars(parseFloat(avgRating), 18)}</div>
                        <div className="text-muted" style={{ fontSize: 13 }}>{dummyReviews.length} reviews</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = dummyReviews.filter((r) => r.rating === star).length;
                          const pct = Math.round((count / dummyReviews.length) * 100);
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

                  {/* Review List */}
                  {dummyReviews.map((review) => (
                    <div className="td-card p-4 mb-3 rounded-3" key={review.id}>
                      <div className="d-flex align-items-start gap-3">
                        {/* Avatar */}
                        <div
                          style={{
                            width: 44, height: 44, borderRadius: "50%", background: review.avatarColor,
                            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 600, fontSize: 14, flexShrink: 0,
                          }}
                        >
                          {review.avatar}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                            <div>
                              <span className="fw-semibold">{review.name}</span>
                              <span className="text-muted ms-2" style={{ fontSize: 13 }}>{review.role}</span>
                            </div>
                            <span className="text-muted" style={{ fontSize: 12 }}>{review.date}</span>
                          </div>

                          <div className="d-flex gap-1 mb-2">{renderStars(review.rating, 14)}</div>

                          <p className="fw-semibold mb-1" style={{ fontSize: 15 }}>{review.title}</p>
                          <p className="text-muted mb-3" style={{ fontSize: 14, lineHeight: 1.6 }}>{review.body}</p>

                          <button
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                            style={{ fontSize: 12, borderRadius: 20 }}
                            onClick={() => setHelpfulMap((m) => ({ ...m, [review.id]: true }))}
                            disabled={helpfulMap[review.id]}
                          >
                            <ThumbsUp size={13} />
                            {helpfulMap[review.id] ? "Marked helpful" : `Helpful (${review.helpful})`}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Leave a Review Form */}
                  <div className="td-card p-4 rounded-3" ref={reviewFormRef}>
                    <h5 className="fw-bold mb-1">Leave a Review</h5>
                    <p className="text-muted mb-3" style={{ fontSize: 14 }}>Share your experience working at AWS.</p>

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
                      placeholder="Share your experience with this company..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="mb-3 "
                    />

                    <button className="btn-post d-flex align-items-center gap-2">
                      <Send size={14} /> Submit Review
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* RIGHT SIDE — always visible */}
            <div className="col-lg-4">

              <div className="td-card p-4 rounded-3 mb-4">
                <h5 className="fw-bold mb-3">Quick Info</h5>
                <ul className="list-unstyled">
                  <li className="mb-2 d-flex align-items-center gap-2"><Globe size={16} /> www.aws.com</li>
                  <li className="mb-2 d-flex align-items-center gap-2"><Building2 size={16} /> IT &amp; Cloud</li>
                  <li className="mb-2 d-flex align-items-center gap-2"><MapPin size={16} /> Sydney, NSW</li>
                </ul>
                <button className="btn-post w-100 mt-2">Visit Website</button>
              </div>

              <div className="td-card p-4 rounded-3">
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

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EmployerDetail;