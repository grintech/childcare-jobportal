import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MapPin, Phone, Mail, Star, CheckCircle, User2,
  Briefcase, GraduationCap, Award, UserCheck, Send,
  Loader, MessageSquare, Calendar,
  Pencil
} from "lucide-react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import ScheduleInterview from "../components/Scheduleinterview";

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

const TeacherDetail = () => {
  const {slug } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTeacher, setScheduleTeacher] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const reviewRef = useRef(null);

  const canViewContact = isAuthenticated && user?.role === "principal" && user?.has_subscription;

 const isOwnProfile = user && teacher && user.id === teacher.id;

  const canReview =
    isAuthenticated &&
    user?.role === "principal" &&   // only principal can review teacher
    !isOwnProfile;

  useEffect(() => { fetchTeacher(); }, [slug]);


  const scrollToReview = () => {
  if (!reviewRef.current) return;

  const yOffset = -110; // 👈 your top spacing
  const y =
    reviewRef.current.getBoundingClientRect().top +
    window.pageYOffset +
    yOffset;

  window.scrollTo({ top: y, behavior: "smooth" });
};

// Fetch Teacher API

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/teacher-details/${slug}`);
      const d = res.data;
      setTeacher({
        id: d.id,
        name: d.name,
        email: d.email,
        phone: d.teacher?.phone,
        image: d.teacher?.profile_image,
        jobRole: d.teacher?.experiences?.[0]?.job_title || d.teacher?.specialization || "Educator",
        description: d.teacher?.bio,
        location: d.teacher?.city,
        suburb: d.teacher?.suburb,
        verified: d.teacher?.is_verified,
        badges: d.certificates || [],
        educations: d.teacher?.educations || [],
        experiences: d.teacher?.experiences || [],
        profileCompletion: d.teacher?.profile_completion || 0,
        // rating: 4.5,
        rating: Number(d.average_rating) || 0,
      });

      const allReviews = d.received_reviews || [];

      setReviews(allReviews);
      // find logged-in user review
      if (user) {
        const existing = allReviews.find(
          (r) => r.reviewer_id === user.id
        );

        if (existing) {
          setMyReview(existing);
        }
      }

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };


// Submit Review API
  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first");
      return;
    }

    if (!userRating) {
      toast.error("Please select rating");
      return;
    }

    try {
      setReviewLoading(true);

      const payload = {
        reviewed_id: teacher.id,
        reviewed_role: "teacher", // static here
        rating: userRating,
        comment: feedback,
        job_id: null,
      };

      let res;

      if (myReview && isEditing) {
        // UPDATE
        res = await api.post(`/review/update/${myReview.id}`, payload);
      } else {
        // CREATE
        res = await api.post(`/review/save`, payload);
      }

      toast.success(res.message || "Review submitted");
      // ✅ clear form after submit/update
      setUserRating(0);
      setFeedback("");
      setIsEditing(false);

      // setMyReview(null);

      // 🔄 refresh
      fetchTeacher();

    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setReviewLoading(false);
    }
  };

// Edit Review API
  const handleEditReview = (review) => {
  setUserRating(review.rating);
  setFeedback(review.comment);
  setMyReview(review);
  setIsEditing(true);

  scrollToReview(); 
};


 const renderStars = (rating) => {
  if (!rating || rating <= 0) return null;

  const rounded = Math.round(rating * 10) / 10; //  fixes 3.299999 → 3.3

  return [...Array(5)].map((_, i) => (
    <Star
      key={i}
      size={16}
      fill={i < Math.floor(rounded) ? "#ffc107" : "none"}
      stroke="#ffc107"
    />
  ));
};

  const timeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now - past) / 1000); // seconds

    if (diff < 60) return `${diff} sec${diff !== 1 ? "s" : ""} ago`;

    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr${hours !== 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;

    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? "s" : ""} ago`;
  };


  return (
    <>
      <div className="teacher_detail_page blue_nav">
        <Navbar />

        <div className="top_padding">
          <div className="container my-4">

            {loading && (
              <div className="d-flex flex-column justify-content-center align-items-center min_height">
                <Loader size={40} className="spin" />
                <p>Loading Profile...</p>
              </div>
            )}

            {!loading && teacher && (
              <div className="td-layout">

                {/* ===== LEFT COLUMN ===== */}
                <div>

                  {/* PROFILE */}
                  <div className="td-card profile_card">
                    <div className="profile_inner">
                      {teacher.image ? (
                        <img src={teacher.image} className="avatar" alt={teacher.name} />
                      ) : (
                        <div className="avatar_fallback">
                          <User2 size={30} />
                        </div>
                      )}

                      <div className="profile_meta">
                        <h1 className="text-capitalize">
                          {teacher.name}
                          {teacher.verified && (
                            <span className="verified_badge ms-1">
                              <CheckCircle size={11} /> Verified
                            </span>
                          )}
                        </h1>

                        <p className="role">{teacher.jobRole}</p>

                        <p className="location">
                          <MapPin size={12} />
                          {teacher.suburb}, {teacher.location}
                        </p>

                          {teacher.rating > 0 && (
                            <div className="stars_row">
                              {renderStars(teacher.rating)}
                            </div>
                          )}

                        <div className="progress_wrap">
                          <span className="progress_label">Profile Completion</span>
                          <div className="progress_bar">
                            <div style={{ width: `${teacher.profileCompletion}%` }} />
                          </div>
                          <span className="progress_pct">{teacher.profileCompletion}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ABOUT */}
                  <div className="td-card">
                    <h6> About</h6>
                    <p className="about_text">{teacher.description}</p>
                  </div>

                  {/* EXPERIENCE */}
                  <div className="td-card">
                    <h6> Experience</h6>
                    {teacher.experiences.map((exp, i) => (
                      <div key={i} className="timeline_item">
                        <div className="tl_icon">
                          <Briefcase size={15} />
                        </div>
                        <div className="tl_content">
                          <strong>{exp.job_title}</strong>
                          <p>{exp.school_name}</p>
                          <small>
                            <Calendar size={10} />
                            {exp.start_date} – {exp.is_current ? "Present" : exp.end_date}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* EDUCATION */}
                  <div className="td-card">
                    <h6> Education</h6>
                    {teacher.educations.map((edu, i) => (
                      <div key={i} className="timeline_item">
                        <div className="tl_icon edu">
                          <GraduationCap size={15} />
                        </div>
                        <div className="tl_content">
                          <strong>{edu.degree}</strong>
                          <p>{edu.institution}</p>
                          <small>
                            <Calendar size={10} />
                            {edu.start_year} – {edu.end_year}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CERTIFICATIONS */}
                  <div className="td-card">
                    <h6>Certifications</h6>
                    <div className="cert_grid">
                      {teacher.badges.map((cert, i) => (
                        <div key={i} className="cert_item bg-light">
                          <p>{cert.certificate_name}</p>
                          <a href={cert.certificate_file} target="_blank" rel="noreferrer">
                            View Certificate
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* REVIEW */}
                  {canReview && (
                    <div className="td-card" ref={reviewRef} >
                      <h6>Leave a Review</h6>

                      <p style={{ fontSize: 14, marginBottom: 8 }}>
                        Your Rating
                      </p>

                      <div className="stars_row big">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <Star
                            key={r}
                            onClick={() => setUserRating(r)}
                            onMouseEnter={() => setHoverRating(r)}
                            onMouseLeave={() => setHoverRating(0)}
                            fill={r <= (hoverRating || userRating) ? "#ffc107" : "none"}
                            stroke="#ffc107"
                          />
                        ))}
                      </div>

                      <textarea
                        rows={3}
                        placeholder="Share your experience with this teacher..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="mb-3"
                      />

                    <button className="btn-post" onClick={handleSubmitReview} disabled={reviewLoading}>
                        {reviewLoading ? "Please wait..." : (
                          <>
                            <Send size={13} className="me-1" />
                            {isEditing ? "Update Review" : "Submit Review"}
                          </>
                        )}
                      </button>
                    </div>
                  )}


                  <div className="td-card">
                    <h6 className="mb-3">Reviews ({reviews.length})</h6>

                    {reviews.length === 0 ? (
                      <p className="text-muted">No reviews yet</p>
                    ) : (
                      reviews.map((r) => {
                      const isMyReview = user && r.reviewer_id === user.id;

                      return (
                        <div key={r.id} className="review_item mb-3">

                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center gap-2">

                              {r.reviewer?.director_profile?.profile_image_url ? (
                                <img
                                  src={r.reviewer.director_profile.profile_image_url}
                                  alt={r.reviewer?.name}
                                  className="review_avatar"
                                />
                              ) : (
                                <div className="review_avatar_fallback">
                                  <User2 size={15} />
                                </div>
                              )}

                              {/* Name + time */}
                              <div className="d-flex align-items-center">
                                <strong className="text-capitalize">
                                  {r.reviewer?.name || "User"}
                                </strong>

                                <span className="small ms-2 text-muted">
                                  {timeAgo(r.created_at)}
                                </span>

                                {isMyReview && (
                                  <Pencil
                                    size={14}
                                    className="cursor-pointer text_theme ms-2"
                                    onClick={() => handleEditReview(r)}
                                    title="Edit"
                                  />
                                )}
                              </div>

                            </div>

                            <div className="d-flex">
                              {renderStars(r.rating, 15)}
                            </div>
                          </div>

                          <small className="mb-1 small text-muted">
                           
                          </small>

                          <p className="mb-0 review_comment">{r.comment}</p>
                        </div>
                      );
                    })
                    )}
                  </div>

                </div>

                {/* ===== RIGHT SIDEBAR ===== */}
                <div className="sidebar">
                  <div className="sidebar_card">

                    {/* Featured strip */}
                    <div className="sidebar_featured">
                      <p className="sidebar_featured_label">Available for hire</p>
                      <p className="sidebar_featured_name m-0">
                        {teacher.name}
                        {teacher.verified && <CheckCircle size={15} className="" />}
                      </p>
                     
                    </div>

                    {/* Stats */}
                    {/* <div className="sidebar_stats">
                      <div className="stat_item">
                        <strong>{teacher.jobs}</strong>
                        <span>Jobs</span>
                      </div>
                      <div className="stat_item">
                        <strong>{teacher.degrees}</strong>
                        <span>Degree</span>
                      </div>
                      <div className="stat_item">
                        <strong>{teacher.zones}</strong>
                        <span>Zone</span>
                      </div>
                    </div> */}

                    {/* Actions + Contact */}
                    <div className="sidebar_body">

                      <p className="contact_section_label">Contact Info</p>

                      <div className="contact_box">
                        {/* Phone */}
                        {canViewContact ? (
                          <div className="contact_row">
                            <div className="contact_icon">
                              <Phone size={13} />
                            </div>
                            <div>
                              <p className="contact_info_label">Phone</p>
                              <p className="contact_info_value">{teacher.phone}</p>
                            </div>
                          </div>
                        ) : (
                            <div className="contact_row">
                            <div className="contact_icon">
                              <Phone size={13} />
                            </div>
                            <div>
                              <p className="contact_info_label">Phone</p>
                              <p className="contact_info_value">{maskPhone(teacher.phone)}</p>
                            </div>
                          </div>
                        )}

                        {/* Email */}
                        {canViewContact ? (
                          <div className="contact_row">
                            <div className="contact_icon">
                              <Mail size={13} />
                            </div>
                            <div>
                              <p className="contact_info_label">Email</p>
                              <p className="contact_info_value">{teacher.email}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="contact_row">
                            <div className="contact_icon">
                              <Mail size={13} />
                            </div>
                            <div>
                              <p className="contact_info_label">Email</p>
                              <p className="contact_info_value">{maskEmail(teacher.email)}</p>
                            </div>
                          </div>
                        )}

                        {/* Location — always visible */}
                        <div className="contact_row">
                          <div className="contact_icon">
                            <MapPin size={13} />
                          </div>
                          <div>
                            <p className="contact_info_label">Location</p>
                            <p className="contact_info_value">
                              {teacher.suburb}, {teacher.location}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="sidebar_actions">
                        <button
                        className="hire_btn"
                        onClick={() => {
                            if (!isAuthenticated) {
                            toast.error("Please login to continue!");
                            return;
                            }

                            if (user?.role !== "principal") {
                            toast.error("Only employer can hire teachers!");
                            return;
                            }

                            setScheduleTeacher(teacher);
                            setShowScheduleModal(true);
                        }}
                        >
                         <UserCheck size={17} /> Schedule Interview
                        </button>

                      </div>

                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <Footer />

        {showScheduleModal && scheduleTeacher && (
        <ScheduleInterview
            teacher={scheduleTeacher}
            onClose={() => {
            setShowScheduleModal(false);
            setScheduleTeacher(null);
            }}
        />
        )}

      </div>
    </>
  );
};

export default TeacherDetail;