import React, { useState, useEffect } from "react";
import { MapPin, Heart, Filter, Briefcase, Star, CheckCircle } from "lucide-react";

const avatar1 = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80";
const avatar2 = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80";
const avatar3 = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80";
const avatar5 = "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=100&h=100&q=80";

const teachersData = [
  {
    id: 1,
    name: "Emily Carter",
    jobRole: "Assistant Educator",
    description:
      "Passionate about early childhood education with a strong focus on creating a safe, engaging, and nurturing environment for children. Skilled in supporting learning through play-based activities and positive communication.",
    location: "Sydney, NSW",
    suburb: "Parramatta",
    image: avatar1,
    rating: 4.5,
    verified: true,
    badges: ["WWCC", "Police Check", "First Aid"]
  },
  {
    id: 2,
    name: "Jack Anderson",
    jobRole: "Childcare Assistant",
    description:
      "Dedicated childcare assistant experienced in supporting daily routines, ensuring child safety, and assisting educators in classroom activities. Known for patience, teamwork, and building strong connections with children.",
    location: "Gold Coast, QLD",
    suburb: "Surfers Paradise",
    image: avatar2,
    rating: 4.2,
    verified: true,
    badges: ["WWCC", "First Aid", "CPR"]
  },
  {
    id: 3,
    name: "Liam Wilson",
    jobRole: "Lead Educator",
    description:
      "Experienced lead educator with expertise in curriculum planning, classroom management, and child development strategies. Focused on fostering creativity, independence, and a positive learning atmosphere.",
    location: "Melbourne, VIC",
    suburb: "Southbank",
    image: avatar3,
    rating: 4.8,
    verified: false,
    badges: ["WWCC", "Police Check", "First Aid", "CPR"]
  },
  {
    id: 4,
    name: "Sophia Evans",
    jobRole: "Director",
    description:
      "Strategic and results-driven director with years of experience managing childcare centers and leading educational teams. Strong background in operations, compliance, and delivering high-quality learning programs.",
    location: "Sydney, NSW",
    suburb: "Chatswood",
    image: avatar5,
    rating: 4.9,
    verified: true,
    badges: ["Police Check", "First Aid", "CPR"]
  }
];

const TeacherProfiles = () => {
  const [filters, setFilters] = useState({
    name: "",
    location: "",
    suburb: "",
    role: "",
    badges: []
  });

  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const filteredTeachers = teachersData.filter((teacher) => {
    return (
      teacher.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      teacher.location.toLowerCase().includes(filters.location.toLowerCase()) &&
      teacher.suburb.toLowerCase().includes(filters.suburb.toLowerCase()) &&
      teacher.jobRole.toLowerCase().includes(filters.role.toLowerCase()) &&
      (filters.badges.length === 0 ||
        filters.badges.every((b) => teacher.badges.includes(b)))
    );
  });

  const handleReset = () => {
    setFilters({
      name: "",
      location: "",
      suburb: "",
      role: "",
      badges: []
    });
  };

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

  return (
    <>
      <section className="jobs_section">
        <div className="row">

          {/* FILTER */}
          {!isMobile && (
            <div className="col-lg-3 mb-4">
              <div className="filter_card p-4 rounded-3">
                <h5 className="fw-bold mb-3">Filters</h5>

                <input name="name" placeholder="Search name..." className="form-control mb-3" onChange={handleChange} />
                <input name="location" placeholder="Location..." className="form-control mb-3" onChange={handleChange} />
                <input name="suburb" placeholder="Suburb..." className="form-control mb-3" onChange={handleChange} />
                <input name="role" placeholder="Role..." className="form-control mb-3" onChange={handleChange} />

                <button className="btn w-100" onClick={handleReset}>
                  Reset <Filter size={16} />
                </button>
              </div>
            </div>
          )}

          {/* CONTENT */}
          <div className="col-lg-9">

            <p className="mb-3 text-muted">
              Showing {filteredTeachers.length} profiles
            </p>

            <div className="row">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <div key={teacher.id} className="col-12 mb-4">

                    <div className="job_card p-3">

                      <div className="d-flex gap-4">

                        {/* IMAGE */}
                        <div className="profile_logo">
                        <img src={teacher.image} className="rounded-circle"  />

                        </div>

                        {/* INFO */}
                        <div className="flex-grow-1">

                          <h5 className="mb-1 d-flex align-items-center gap-2">
                            {teacher.name}

                            {teacher.verified && (
                              <span className="verified_badge">
                                <CheckCircle size={16} /> Verified
                              </span>
                            )}
                          </h5>

                          <p className="mb-1 text-muted">{teacher.jobRole}</p>

                          <p className="mb-2 small">
                            <MapPin size={14} /> {teacher.suburb}, {teacher.location}
                          </p>

                          {/* RATING */}
                          <div className="d-flex align-items-center gap-1 mb-2">
                            {renderStars(teacher.rating)}
                            <span className="ms-1 small">{teacher.rating}</span>
                          </div>

                          {/* DESCRIPTION */}
                          <p className="small text-muted mb-2">
                            {teacher.description}
                          </p>

                          {/* BADGES */}
                          <div className="badges_row mb-2">
                            {teacher.badges.map((b, i) => (
                              <span key={i} className="badge_item">{b}</span>
                            ))}
                          </div>

                          {/* ACTIONS */}
                          <div className="d-flex align-items-center gap-2 mt-2">
                            <button className="btn btn-blue btn-sm">
                              View Profile
                            </button>
                            <button className="btn btn-primary btn-sm">
                              Hire Now
                            </button>
                            <Heart size={26} className="wishlist" />
                          </div>

                        </div>
                      </div>
                    </div>

                  </div>
                ))
              ) : (
                <h5 className="text-center">
                  <Briefcase size={18} /> No profile found!
                </h5>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default TeacherProfiles;