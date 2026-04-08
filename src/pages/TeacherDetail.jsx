import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MapPin, Phone, Mail, Star, CheckCircle, User2,
  Briefcase, GraduationCap, Award, UserCheck, Send,
  Loader, MessageSquare, Calendar
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
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTeacher, setScheduleTeacher] = useState(null);

  const canViewContact =
    isAuthenticated && user?.role === "principal" && user?.has_subscription;

  useEffect(() => { fetchTeacher(); }, [id]);

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/teacher-details/${id}`);
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
        jobs: d.teacher?.jobs_count || 1,
        degrees: d.teacher?.degrees_count || 3,
        zones: d.teacher?.zones_count || 4,
        rating: 4.5,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, size = 14) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        fill={i < Math.floor(rating) ? "#ffc107" : "none"}
        stroke="#ffc107"
      />
    ));

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

                        <div className="stars_row">
                          {renderStars(teacher.rating)}
                          <span>{teacher.rating}</span>
                        </div>

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
                  <div className="td-card">
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

                    <button className="btn-post">
                      <Send size={13} /> Submit Review
                    </button>
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
                    <div className="sidebar_stats">
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
                    </div>

                    {/* Actions + Contact */}
                    <div className="sidebar_body">
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