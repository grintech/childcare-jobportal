import React, { useState, useEffect } from "react";
import { MapPin, Heart, Filter, Briefcase, Star, CheckCircle, Phone, Mail, ChevronUp, ChevronDown } from "lucide-react";

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
      "Passionate about early childhood education with a strong focus on creating a safe, engaging, and nurturing environment for children. Skilled in supporting learning through play-based activities and positive communication.Passionate about early childhood education with a strong focus on creating a safe, engaging, and nurturing environment for children. Skilled in supporting learning through play-based activities and positive communication.Passionate about early childhood education with a strong focus on creating a safe, engaging, and nurturing environment for children. Skilled in supporting learning through play-based activities and positive communication.",
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

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
  setExpanded(false);
}, [selectedTeacher]);

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
    setFilters({
      name: "",
      location: "",
      suburb: "",
      role: "",
      badges: []
    });
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

  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0].toUpperCase();

  return `${firstName} ${lastInitial}.`;
};


  return (
    <>
      <section className="jobs_section">
        <div className="row">

          <div className="col-12 mb-4 home_filter_wrapper">
              <div className="filter_card p-4 rounded-3">

                <div className="row g-3">

                  <div className="col-sm-6 col-md-4 col-xl-4">
                    <label className="form-label">Name</label>
                    <input name="name" className="form-control " placeholder="Search name..." onChange={handleChange} />
                  </div>

                  <div className="col-sm-6 col-md-4 col-xl-4">
                    <label className="form-label">Location</label>
                    <input name="location" className="form-control" placeholder="Search location..." onChange={handleChange} />
                  </div>
                  <div className="col-sm-6 col-md-4 col-xl-4">
                     <label className="form-label">Suburb</label>
                     <input name="suburb" className="form-control " placeholder="Search suburb..." onChange={handleChange} />
                  </div>
                  <div className="col-sm-6 col-md-4 col-xl-4">
                     <label className="form-label">Role</label>
                    <input name="role" className="form-control" placeholder="Search role..." onChange={handleChange} />
                  </div>
                  <div className="col-12 col-md-8 col-xl-4 ">
                     <label className="form-label" >Certificates</label>
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

          {/* CONTENT */}
          <div className="col-12">

            <p className="mb-3 text-muted">
              Showing {filteredTeachers.length} profiles
            </p>

            <div className="row teacher_profiles">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <div key={teacher.id} className="col-12 mb-4">
                    <div className="job_card p-3">

                      <div className="d-flex profile_wrap gap-4">

                        <div className="profile_logo">
                          <img src={teacher.image} className="rounded-circle" />
                        </div>

                        <div className="flex-grow-1">

                          <h5 className="d-flex align-items-center gap-2">
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
                            <span className="small text_theme"><Phone size={14} className="mb-1"/> +61 xxx xxx xxx</span>
                            <span className="small text_theme"><Mail size={14}/> abcd@xxxxx.com</span>
                          </div>

                          <div className="d-flex gap-1 mb-2">
                            {renderStars(teacher.rating)}
                          </div>

                          <p className="description">{teacher.description}</p>

                          <div className="badges_row">
                            {teacher.badges.map((b, i) => (
                              <span key={i} className="badge_item">{b} <CheckCircle size={14} className="mb-1 ms-1" /> </span>
                            ))}
                          </div>

                          <div className="d-flex gap-2 mt-3">
                            <button
                              className="btn btn-blue btn-sm"
                              onClick={() => {
                                setSelectedTeacher(teacher);
                                setShowProfileModal(true);
                              }}
                            >
                              View Profile
                            </button>
                            <button className="btn btn-primary btn-sm">Hire Now</button>
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

      {showProfileModal && selectedTeacher && (
  <div className="custom_modal">
    <div
      className="modal_overlay"
      onClick={() => setShowProfileModal(false)}
    ></div>

    <div className="modal_content">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-semibold">Profile</h5>
        <button
          className="btn-close"
          onClick={() => setShowProfileModal(false)}
        ></button>
      </div>

      {/* PROFILE */}
      <div className="text-center mb-2">
        <img
          src={selectedTeacher.image}
          className="rounded-circle mb-2"
          width="80"
          height="80"
        />

        <h5 className="mb-1">
          {formatName(selectedTeacher.name)}
        </h5>

        <p className="text-muted gap-1 d-flex justify-content-center mb-2">
          {selectedTeacher.jobRole} 
           {selectedTeacher.verified && (
          <span className="verified_badge">
            <CheckCircle size={16} /> Verified
          </span>
        )}
        </p>
        
         
         {/* RATING */}
      <div className="d-flex gap-1  justify-content-center">
       
        {renderStars(selectedTeacher.rating)}
      </div>
      </div>

      <div className="modal_inside">
          {/* CONTACT */}
          <div className="d-flex gap-3 justify-content-center mb-2 text_theme">
            <p className="mb-1">
              <Phone size={14} /> +61 xxx xxx xxx
            </p>
            <p className="mb-0">
              <Mail size={14} /> abcd@xxxxx.com
            </p>
          </div>

            {/* BADGES */}
          <div className="badges_row justify-content-center mb-3">
            {selectedTeacher.badges.map((b, i) => (
              <span key={i} className="badge_item">{b} <CheckCircle size={14} className="mb-1" /> </span>
            ))}
          </div>
        

          {/* DESCRIPTION */}
         <div className="text-center mb-3">
          <p
            className={`inside_description mb-0 ${!expanded ? "clamp" : ""}`}
          >
            {selectedTeacher.description}
          </p>

          {selectedTeacher.description?.length > 120 && (
           <span
            className="read_more d-inline-flex align-items-center gap-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                Read less <ChevronUp size={16} className="mt-1" />
              </>
            ) : (
              <>
                Read more <ChevronDown size={16} className="mt-1" />
              </>
            )}
          </span>
          )}
        </div>

      </div>


     

    </div>
  </div>
)}

    </>
  );
};

export default TeacherProfiles;
