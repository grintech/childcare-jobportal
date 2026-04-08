import { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Filter,
  Briefcase,
  Star,
  CheckCircle,
  Phone,
  Mail,
  ChevronUp,
  ChevronDown,
  User2,
  Loader,
} from "lucide-react";
import api from "../services/api";
import TeacherCardSkeleton from "./skeletons/TeacherCardSkeleton";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import ScheduleInterview from "./Scheduleinterview";
import { useNavigate } from "react-router-dom";

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


const TeacherProfiles = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const canViewContact =
  isAuthenticated &&
  user?.role === "principal" &&
  user?.has_subscription;


  const [filters, setFilters] = useState({
    name: "",
    location: "",
    suburb: "",
    role: "",
    badges: [],
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const descRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef(null);
  const isFetchingRef = useRef(false);
 

  const [showScheduleModal, setShowScheduleModal] = useState(false);
const [scheduleTeacher, setScheduleTeacher]     = useState(null);

  // ================= DEBOUNCE =================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);


  useEffect(() => {
  if (descRef.current) {
    setIsOverflowing(descRef.current.scrollHeight > descRef.current.clientHeight);
  }
}, [selectedTeacher, expanded]);

  // ================= FETCH API =================

const fetchTeachers = async (pageNum = 1, isNewSearch = false) => {
  if (isFetchingRef.current) return;
  isFetchingRef.current = true;

  try {
    isNewSearch ? setLoading(true) : setLoadingMore(true);

    const params = {
      name: debouncedFilters.name,
      location: debouncedFilters.location,
      suburb: debouncedFilters.suburb,
      role: debouncedFilters.role,
      page: pageNum,
      // per_page: 1, // for testing
    };

    debouncedFilters.badges.forEach((badge) => {
      if (badge === "WWCC") params.wwcc = 1;
      if (badge === "CPR") params.cpr = 1;
      if (badge === "First Aid") params.first_aid = 1;
      if (badge === "Police Check") params.police_check = 1;
    });

    const res = await api.get("/teacher-list", { params });

    const formattedData = res?.data?.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      jobRole:
        item.teacher?.experiences?.[0]?.job_title ||
        item.teacher?.specialization ||
        "Educator",
      description: item.teacher?.bio || "",
      location: item.teacher?.city || "",
      suburb: item.teacher?.suburb || "",
      image: item.teacher?.profile_image ? `${item.teacher.profile_image}` : null,
      rating: 4.5,
      verified: item.teacher?.is_verified || false,
      badges: item.certificates?.map((c) => c.certificate_name) || [],
      phone: item.teacher?.phone || "",
    }));

    const { last_page, current_page } = res.pagination;

    setTeachers((prev) => isNewSearch ? (formattedData || []) : [...prev, ...(formattedData || [])]);
    setHasMore(current_page < last_page);
    setPage(current_page);

  } catch (err) {
    console.log(err);
    if (isNewSearch) setTeachers([]);
  } finally {
    setLoading(false);
    setLoadingMore(false);
    isFetchingRef.current = false;
  }
};


useEffect(() => {
  isFetchingRef.current = false;
  setLoading(true);
  setPage(1);
  setTeachers([]);
  setHasMore(true);
  fetchTeachers(1, true);
}, [debouncedFilters]);


useEffect(() => {
  if (!hasMore || loadingMore) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        fetchTeachers(page + 1, false);
      }
    },
    { threshold: 1.0 }
  );

  if (observerRef.current) observer.observe(observerRef.current);
  return () => observer.disconnect();
}, [hasMore, loadingMore, page]);


  // ================= HANDLERS =================
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleBadgeChange = (e) => {
    const { value, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      badges: checked
        ? [...prev.badges, value]
        : prev.badges.filter((b) => b !== value),
    }));
  };

  const handleReset = () => {
    isFetchingRef.current = false;
    setFilters({ name: "", location: "", suburb: "", role: "", badges: [] });
    setPage(1);
    setHasMore(true);
  };


  useEffect(() => {
    setExpanded(false);
  }, [selectedTeacher]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < Math.floor(rating) ? "#ffc107" : "none"}
        stroke="#ffc107"
      />
    ));
  };

  const formatName = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  // ================= UI =================
  return (
    <>
      <section className="jobs_section">
        <div className="row">

          {/* FILTERS */}
          <div className="col-12 mb-4 home_filter_wrapper">
            <div className="filter_card p-4 rounded-3">
              <div className="row g-3">

                <div className="col-sm-6 col-md-4 col-xl-4">
                  <label className="form-label">Name</label>
                  <input
                    name="name"
                    className="form-control"
                    placeholder="Search name..."
                    value={filters.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-sm-6 col-md-4 col-xl-4">
                  <label className="form-label">Location</label>
                  <input
                    name="location"
                    className="form-control"
                    placeholder="Search location..."
                    value={filters.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-sm-6 col-md-4 col-xl-4">
                  <label className="form-label">Suburb</label>
                  <input
                    name="suburb"
                    className="form-control"
                    placeholder="Search suburb..."
                    value={filters.suburb}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-sm-6 col-md-4 col-xl-4">
                  <label className="form-label">Role</label>
                  <input
                    name="role"
                    className="form-control"
                    placeholder="Search role..."
                    value={filters.role}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 col-md-8 col-xl-4">
                  <label className="form-label">Certificates</label>

                  <div className="d-flex gap-3 flex-wrap filter_checks">
                    {["WWCC", "CPR", "First Aid", "Police Check"].map((cert, i) => (
                      <div className="form-check" key={i}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value={cert}
                          onChange={handleBadgeChange}
                          checked={filters.badges.includes(cert)}
                        />
                        <label className="form-check-label">{cert}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-xl-4 d-flex align-items-end justify-content-end">
                  <button className="btn w-100" onClick={handleReset}>
                    Reset <Filter size={16} />
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* LIST */}
          <div className="col-12">

          {teachers.length > 0 && (
             <p className="mb-3 text_theme text-center fw-bold">
              Showing {teachers.length} profiles
            </p>
          )} 

            <div className="row">

              {loading ? (
                [...Array(3)].map((_, i) => <TeacherCardSkeleton key={i} />)
              ) : teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <div key={teacher.id} className="col-12 mb-4">
                   <div className="job_card p-3">
                      <div className="d-flex profile_wrap gap-4">

                        <div className="profile_logo">
                         {teacher.image ? (
                          <img
                            src={teacher.image}
                            className="rounded-circle"
                          />
                        ) : (
                          <div className="profile_logo_fallback">
                            <User2 size={35} />
                          </div>
                        )}
                        </div>

                        <div className="flex-grow-1">

                          <h5 className="d-flex align-items-center gap-2 text-capitalize">
                            {formatName(teacher.name)}

                            {teacher.verified && (
                              <span className="verified_badge">
                                <CheckCircle size={16} /> Verified
                              </span>
                            )}
                          </h5>

                          <p className="mb-1">{teacher.jobRole}</p>

                          <p className="mb-2">
                            <MapPin size={14} /> {teacher.suburb}, {teacher.location}
                          </p>

                          <div className="d-flex gap-3 mb-2 contact_info">
                            <span className="small text_theme">
                              <Phone size={14} className="mb-1 me-1" /> 
                              {canViewContact ? teacher.phone : maskPhone(teacher.phone)}
                            </span>
                            <span className="small text_theme">
                              <Mail size={14} className="mb-1 me-1" /> {canViewContact ? teacher.email : maskEmail(teacher.email)}
                            </span>
                          </div>

                          <div className="d-flex gap-1 mb-2">
                            {renderStars(teacher.rating)}
                          </div>

                          <p className="description">{teacher.description}</p>

                          <div className="badges_row">
                            {teacher.badges.map((b, i) => (
                              <span key={i} className="badge_item text-uppercase">
                                {b} <CheckCircle size={14} className="mb-1 ms-1" />
                              </span>
                            ))}
                          </div>

                          <div className="d-flex gap-2 mt-3">
                                <button
                                  className="btn btn-blue btn-sm"
                                  onClick={() => {
                                    if (!isAuthenticated) {
                                      toast.error("Please login to view profile!");
                                      return;
                                    }
                                    navigate(`/profile/${teacher.id}`);
                                  }}
                                >
                                  View Profile
                                </button>

                               {isAuthenticated && user?.role === "principal" && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => {
                                    setScheduleTeacher(teacher);
                                    setShowScheduleModal(true);
                                  }}
                                >
                                  Schedule Interview
                                </button>
                              )}
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 mt-3">
                  <div className="d-flex flex-column align-items-center justify-content-center bg-white py-4 px-3 ">
                <Briefcase size={25} className="mb-2" /> 
                  <h5 className="text-center">  No profile found! </h5>
                </div>
              </div>
              )}

              {/* Infinite scroll sentinel */}
              {hasMore && (
                <div ref={observerRef} className="col-12 text-center py-3">
                  {loadingMore && <Loader size={28} className="spin text_theme" />}
                </div>
              )}

              {!hasMore && teachers.length > 0 && (
                <div className="col-12 text-center py-3 text-muted fw-semibold">
                  You've reached the end!
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* MODAL */}
       {showProfileModal && selectedTeacher && (
        <div className="custom_modal">
          <div className="modal_overlay" onClick={() => setShowProfileModal(false)}></div>

          <div className="modal_content">

            <div className="d-flex flex-column justify-content-center align-items-center text-center">
             <div className="profile_logo">
                {selectedTeacher.image ? (
                <img
                  src={selectedTeacher.image}
                  className="rounded-circle"
                />
              ) : (
                <div className="profile_logo_fallback">
                  <User2 size={35} />
                </div>
              )}
              </div>

              <h5 className="text-capitalize mt-2" >{formatName(selectedTeacher.name)}</h5>
              <p>{selectedTeacher.jobRole}  <span className="verified_badge">
              <CheckCircle size={16} /> Verified
            </span> </p>

              <div className="d-flex justify-content-center gap-1 mb-2">
                {renderStars(selectedTeacher.rating)}
              </div>

              <div className="modal_inside">

                {/* CONTACT */}
                <div className="d-flex gap-3 justify-content-center mb-2 text_theme">
                  <p className="mb-1">
                    <Phone size={14} /> {maskPhone(selectedTeacher.phone)}
                  </p>
                  <p className="mb-0">
                    <Mail size={14} /> {maskEmail(selectedTeacher.email)}
                  </p>
                </div>

                {/* BADGES */}
                <div className="badges_row justify-content-center mb-3">
                  {selectedTeacher.badges.map((b, i) => (
                    <span key={i} className="badge_item">
                      {b} <CheckCircle size={14} className="mb-1" />
                    </span>
                  ))}
                </div>

                {/* DESCRIPTION */}
                <div className="text-center mb-3">
                  <p
                    ref={descRef}
                    className={`inside_description mb-0 ${!expanded ? "clamp" : ""}`}
                  >
                    {selectedTeacher.description}
                  </p>

                  {isOverflowing || expanded ? (  // ✅ only show if actually overflowing
                    <span
                      className="read_more d-inline-flex align-items-center gap-1"
                      onClick={() => setExpanded(!expanded)}
                    >
                      {expanded ? (
                        <>Read less <ChevronUp size={16} className="mt-1" /></>
                      ) : (
                        <>Read more <ChevronDown size={16} className="mt-1" /></>
                      )}
                    </span>
                  ) : null}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {showScheduleModal && scheduleTeacher && (
      <ScheduleInterview
        teacher={scheduleTeacher}
        onClose={() => {
          setShowScheduleModal(false);
          setScheduleTeacher(null);
        }}
      />
    )}
    </>
  );
};

export default TeacherProfiles;