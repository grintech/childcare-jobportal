import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { MapPin, Heart, HeartIcon, ArrowRightFromLineIcon, ArrowRight } from "lucide-react";

const JobDetailPage = () => {
  const { slug } = useParams();

  const formatSlug = (slug) => {
    if (!slug) return "";
    return slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="single_page blue_nav">
      <Navbar />
    <div className=" top_padding">
      <div className="container my-4">
        
        <div className="row">
          
          {/* LEFT SIDE */}
        <div className="col-lg-8">

        <div className="job_detail_card mb-3">
            <div className="job_banner mb-3">
                <img
                src="/images/job_detail.png"
                alt="job"
                />
            </div>

            {/* Company + Logo */}
            <div className="d-flex align-items-center gap-3 mb-3">
            <div className="job_logo_big"><img src="/images/job_logo.png" className="" alt="" /></div>

            <div>
                <p className="company_name mb-0">Canberra Grammar School</p>
                <h4 className="mb-1 fw-semibold">
                {formatSlug(slug)}
                </h4>

                <div className="d-flex align-items-center gap-2 small text-muted">
                ⭐ 4.4 <span>7 reviews</span>
                <span className="dot"></span>
                <span className="view_jobs">View all jobs</span>
                </div>
            </div>
            </div>

            {/* Meta Info */}
            <div className="job_meta mb-3">
            <p><MapPin size={14} /> Canberra ACT</p>
            <p>Teaching - Primary (Education & Training)</p>
            <p><span className="badge bg-secondary">Full Time</span></p>
            </div>

            {/* Posted */}
            <p className="posted small text-muted">Posted 25d ago</p>

            {/* Buttons */}
            <div className="d-flex gap-2 mt-3">
            <button className=" btn-post">Apply <ArrowRight size={18} className="mb-1" /> </button>
            <button className="btn-login">Save <HeartIcon size={18} className="mb-1"/></button>
            </div>
        </div>

        {/*  DESCRIPTION */}
        <div className="job_detail_card">

            <h5 className="fw-semibold" >Job Description</h5>
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Autem enim, quae sunt vel, recusandae quo itaque ullam natus vero ipsam odio accusamus eaque, perferendis quod? Maiores in tenetur officia praesentium mollitia itaque ipsum numquam, quos placeat quo modi. Similique beatae ea dolore praesentium rerum, incidunt aliquam cumque dicta molestiae eos? <br />
                  <ul className="job_highlights">
                <li>Fixed-term full-time contract starting Term 2, 2026</li>
                <li>Supportive and collaborative school environment</li>
                <li>Focus on student growth and development</li>
                </ul>
            </p>
        </div>

        </div>


          {/* RIGHT SIDE */}
          <div className="col-lg-4">

            <h5 className="fw-bold mb-3">Similar Jobs</h5>

            {[1, 2, 3].map((item) => (
              <div className="similar_job_card mb-3" key={item}>
                <div className="d-flex justify-content-between">
                  
                  <div>
                    <h6 className="mb-1">
                      Remote Software Engineer
                    </h6>
                    <p className="small text-muted mb-1">
                      Remote • 5+ yrs
                    </p>
                    <span className="badge bg-light text-dark">
                      USD 40/hr
                    </span>
                  </div>

                  <Heart size={18} />
                </div>
              </div>
            ))}

          </div>

        </div>
      </div>

    </div>

      <Footer />
    </div>
  );
};

export default JobDetailPage;