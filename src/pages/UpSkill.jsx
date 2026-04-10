import { useEffect } from "react";
import Navbar from '../components/Navbar'
import CourseSlider from '../components/CourseSlider'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { motion } from "framer-motion";
import { useAuth } from '../context/AuthContext'
import UpskillAuthPopup from '../components/UpskillAuthPopup'

const UpSkill = () => {
  const { user } = useAuth();

  // useEffect(() => {
  //   if (!user) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "auto";
  //   }
  // }, [user]);

  const leftVariant = {
    hidden: { x: -80, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const rightVariant = {
    hidden: { x: 80, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { delay: 0.5, duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <>
        <div className="upskill_page blue_nav">
            <Navbar />

            {!user && <UpskillAuthPopup />}


            <div className="job_hero">
                <div className="container">
                    <div className="row align-items-center">

                    {/* LEFT CONTENT */}
                    <motion.div
                        className="col-lg-7 mb-lg-0"
                        variants={leftVariant}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <h1 className="text-white">
                        Upgrade Your Skills. Grow Your Career
                        </h1>

                        <motion.p
                        initial={{ x: -40, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        viewport={{ once: true }}
                        >
                        Explore courses designed to help you grow faster in your career.
                        </motion.p>

                        <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        viewport={{ once: true }}
                        >
                        <Link
                            to="/login"
                            className="btn-search d-inline-flex align-items-center"
                        >
                            Upload your course
                        </Link>
                        </motion.div>
                    </motion.div>

                    {/* RIGHT VIDEO */}
                    <motion.div
                        className="col-lg-4 offset-lg-1 d-none d-lg-block"
                        variants={rightVariant}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >

                      <img src="/images/get_trained.png" className='w-100 p-lg-4' alt="" />
                        {/* <video
                        src="/videos/upskill.mp4"
                        muted
                        autoPlay
                        loop
                        className="w-100 rounded-3"
                        /> */}
                    </motion.div>

                    </div>
                </div>
            </div>

              <div className="container">
                <CourseSlider />
              </div>

            <div className="hire_now_banner section_padding">
              <div className="container">
              <img src="/images/upskill.png" className='w-100 rounded-3' alt="" />
              </div>
            </div>


            <Footer />

        </div>
    </>
  )
}

export default UpSkill