// CourseSlider.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useState, useRef } from "react";

import "swiper/css";
import "swiper/css/navigation";

// Icons
import { Play, BookOpen, Users, Clock, Bookmark, Award } from 'lucide-react';
import { Link } from "react-router-dom";

const courses = [
  {
    id: 1,
    title: "Design Thinking in the Age of AI",
    school: "Stanford Online",
    instructor: "Justin Ahrens",
    date: "Nov 22, 2024",
    duration: "36m",
    level: "Intermediate",
    description: "Learn how to leverage the power of cutting-edge AI tools to optimize the design thinking process.",
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&auto=format",
    videoUrl: "/videos/video.mp4", // Office work video
    learners: 15989,
    saved: true,
    tags: ["AI", "Design", "Innovation"]
  },
  {
    id: 2,
    title: "Using AI in the UX Design Process",
    school: "Interaction Design Foundation",
    instructor: "Tetiana Gulei",
     date: "Nov 22, 2024",
    duration: "1h 7m",
    level: "Beginner",
    description: "Discover practical ways to integrate AI tools into your UX design workflow for better outcomes.",
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&auto=format",
    videoUrl: "/videos/video.mp4", // Design work video
    learners: 8743,
    saved: false,
    tags: ["UX", "AI", "Design"]
  },
  {
    id: 3,
    title: "Software Testing Foundations: Keeping QA Skills Current",
    school: "MIT OpenCourseWare",
    instructor: "Mike Fine",
     date: "Nov 22, 2024",
    duration: "50m",
    level: "Advanced",
    description: "Stay ahead with modern QA practices and AI-powered testing methodologies.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format",
    videoUrl: "/videos/video.mp4",
    learners: 12345,
    saved: false,
    tags: ["Testing", "QA", "AI"]
  },
  {
    id: 4,
    title: "Build Your Career in Artificial Intelligence",
    school: "Harvard Extension School",
    instructor: "Jim St",
     date: "Nov 22, 2024",
    duration: "50m",
    level: "Beginner",
    description: "Navigate your career path in the rapidly evolving field of artificial intelligence.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&auto=format",
    videoUrl: "/videos/video.mp4",
    learners: 5678,
    saved: false,
    tags: ["Career", "AI", "Development"]
  },
  {
    id: 5,
    title: "Machine Learning for Designers",
    school: "Google Design",
    instructor: "Sarah Chen",
     date: "Nov 22, 2024",
    duration: "2h 15m",
    level: "Intermediate",
    description: "Understand machine learning concepts and how to apply them in design projects.",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&auto=format",
    videoUrl: "/videos/video.mp4", // Data science video
    learners: 21034,
    saved: true,
    tags: ["ML", "Design", "Technology"]
  },
  {
    id: 6,
    title: "Human-Centered AI Design",
    school: "Microsoft Learn",
    instructor: "David Park",
     date: "Nov 22, 2024",
    duration: "1h 45m",
    level: "Advanced",
    description: "Create AI experiences that prioritize human needs and ethical considerations.",
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&auto=format",
    videoUrl: "/videos/video.mp4", // Collaboration video
    learners: 9876,
    saved: false,
    tags: ["HCI", "AI", "Ethics"]
  }
];

const CourseSlider = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const videoRefs = useRef({});

  const handleMouseEnter = (id) => {
    setHoveredCard(id);
    // Play video on hover
    if (videoRefs.current[id]) {
      videoRefs.current[id].play().catch(e => console.log("Video play failed:", e));
    }
  };

  const handleMouseLeave = (id) => {
    setHoveredCard(null);
    // Pause video when not hovering
    if (videoRefs.current[id]) {
      videoRefs.current[id].pause();
      videoRefs.current[id].currentTime = 0;
    }
  };

  const formatLearners = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <section id="upskill" className="course-slider-section">
      <div className="container position-relative">

        {/* Header with title and arrows */}
        <div className="section-header">
          <div>
            <h4 className="section_title">UPSKILL FOR YOUR FUTURE</h4>
              </div>

          <div className="slider-arrows">
            <div className="swiper-button-prev custom-prev">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </div>
            <div className="swiper-button-next custom-next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Slider */}
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={{
            nextEl: ".custom-next",
            prevEl: ".custom-prev",
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          breakpoints={{
            576: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
          }}
          className="course-swiper px-2"
        >
          {courses.map((course) => (
            <SwiperSlide key={course.id}>
              <div 
                className={`course-card ${hoveredCard === course.id ? 'hovered' : ''}`}
                onMouseEnter={() => handleMouseEnter(course.id)}
                onMouseLeave={() => handleMouseLeave(course.id)}
              >
                {/* Image/Video Container */}
                <div className="card-media">
                  {/* Video element (hidden by default) */}
                  <video
                    ref={el => videoRefs.current[course.id] = el}
                    src={course.videoUrl}
                    muted
                    loop
                    playsInline
                    className="card-video"
                  />
                  
                  {/* Fallback image (shown when video not playing) */}
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className={`card-image ${hoveredCard === course.id ? 'hidden' : ''}`}
                  />
                  
                  {/* Play icon overlay */}
                  {/* <div className="media-overlay">
                    <Play size={48} className="play-icon" />
                  </div> */}
                  
                  {/* Duration Badge */}
                  <span className="duration-badge">
                    <Clock size={14} />
                    {course.duration}
                  </span>

                  {/* Level Badge */}
                  <span className={`level-badge ${course.level.toLowerCase()}`}>
                    <Award size={12} />
                    {course.level}
                  </span>
                </div>

                {/* Card Content */}
                <div className="card-content">
                  {/* School Info */}
                  <div className="school-info">
                    <BookOpen size={14} />
                    <span>{course.school}</span>
                  </div>

                  {/* Title */}
                  <Link>
                    <h5 className="course-title text-truncate">{course.title}</h5>
                  </Link>

                  {/* Instructor & Date */}
                  <div className="course-meta">
                    {course.date && (
                      <>
                        <span>{course.date}</span>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <p className="course-description">{course.description}</p>

                  {/* Tags */}
                  <div className="course-tags">
                    {course.tags.map((tag, idx) => (
                      <span key={idx} className="tag">{tag}</span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="card-footer">
                    <div className="learners">
                      <Users size={16} />
                      <span>{formatLearners(course.learners)} learners</span>
                    </div>
                    
                    <button className={`save-btn ${course.saved ? 'saved' : ''}`}>
                      <Bookmark size={18} fill={course.saved ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default CourseSlider;