import React, { useEffect, useRef } from 'react';
import { ArrowRight, ArrowRightCircle, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";

const Hero = () => {
  const imageRef = useRef(null);

  // Mouse move effect (keep yours)
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;

      const x = (e.clientX / innerWidth - 0.5) * 30;
      const y = (e.clientY / innerHeight - 0.5) * 30;

      if (imageRef.current) {
        imageRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.section
      id="home"
      className="hero-section position-relative"
      
      //  DOOR OPEN EFFECT
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container">
        <div className="row align-items-center">

          {/* LEFT CONTENT */}

          <motion.div className="col-md-6 text-start text-white z-index-1">

            {/* H1 */}
            <motion.h1
              className="mb-4"
              initial={{ x: -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: .75, duration: 0.6 }}
            >
              We Offer <span className="">30,000+</span> <br />
              Job Vacancies Right Now
            </motion.h1>

            <motion.div 
             initial={{ x: -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
             >
            <h6>Explore thousands of verified opportunities tailored to your skills and preferences.Start your journey today and connect with employers hiring right now.</h6>
            <Link to='/signup'>
            <button className='btn-search'>Explore Jobs <ArrowRight size={18} className=''  /> </button>
            </Link>
             </motion.div>

             {/* <motion.div 
             initial={{ x: -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
             >
              <div className="row align-items-center justify-content-center">
                <div className="col-sm-9">
                  <div className="search-box d-flex mt-4">
                    <input
                      type="text"
                      placeholder="Search by role or skills.."
                      className="form-control"
                    />

                    <input
                      type="text"
                      placeholder="Enter suburb or region.. "
                      className="form-control"
                    />

                  </div>
                </div>

                <div className="col-sm-3 text-start px-sm-0">
                  <div className="mt-3 mt-sm-4">
                    <button className="btn-search">Search Now</button>
                  </div>
                </div>
              </div>
            </motion.div> */}

          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div
            className="col-md-6 d-none d-md-flex justify-content-center"

            //  IMAGE FROM RIGHT
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="illustration-wrapper">
              <img 
                ref={imageRef}
                src="/images/hero13.png"
                alt="Hero"
                className="hero-img w-100"
              />
            </div>
          </motion.div>

        </div>
      </div>

      <div className="hero-bg-overlay"></div>
    </motion.section>
  );
};

export default Hero;