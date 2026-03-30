import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HireNowJobs from '../components/HireNowJobs'
import { motion } from "framer-motion";

const FindJobs = () => {

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
        <div className="hire_now blue_nav">
        <Navbar />
           <div className="job_hero">
            <div className="container">
                <div className="row align-items-center">

                {/* LEFT TEXT */}
                <motion.div
                    className="col-lg-7"
                    variants={leftVariant}
                    initial="hidden"
                    animate="visible"
                >
                    <h1 className="text-white">
                    Find Your Dream Job on EduCare
                    </h1>

                    <motion.p
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    >
                    Discover jobs that match your skills, location, and career goals.
                    </motion.p>

                    <motion.div
                    className="row align-items-center justify-content-center"
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    >
                    <div className="col-sm-9 col-md-10">
                        <div className="row gx-3 mt-4">
                        <div className="col-md-7">
                            <input
                            type="text"
                            placeholder="Job title, keywords (e.g. Teacher, Educator)"
                            className="form-control"
                            />
                        </div>

                        <div className="col-md-5">
                            <input
                            type="text"
                            placeholder="Location (e.g. Sydney)"
                            className="form-control"
                            />
                        </div>
                        </div>
                    </div>

                    <div className="col-sm-3 col-md-2 text-center px-sm-0">
                        <div className="mt-4">
                        <button className="btn-search w-100">
                            Search Jobs
                        </button>
                        </div>
                    </div>
                    </motion.div>
                </motion.div>

                {/* RIGHT IMAGE */}
                <motion.div
                    className="col-lg-4 offset-lg-1"
                    variants={rightVariant}
                    initial="hidden"
                    animate="visible"
                >
                    <img
                    src="/images/find_job.png"
                    className="w-100"
                    alt=""
                    />
                </motion.div>

                </div>
            </div>
          </div>

            <div className="">
              <div className="container">
                  <HireNowJobs />
              </div>
            </div>

            <div className="hire_now_banner section_padding">
              <div className="container">
              <img src="/images/hire_now.png" className='w-100 rounded-3' alt="" />
              </div>
            </div>
        <Footer />
        </div>
    </>
  )
}

export default FindJobs