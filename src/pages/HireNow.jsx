import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import TeacherProfiles from '../components/TeacherProfiles'
import { motion } from "framer-motion";
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HireNow = () => {

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
                    <motion.div className="col-lg-7" 
                       variants={leftVariant}
                        initial="hidden"
                        animate="visible"
                    >
                        <h1 className='text-white'>Find the right people on EduCare</h1>
                        <motion.p 
                          initial={{ x: -40, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                        >
                          Search for people who have made their profiles public
                          </motion.p>

                         <motion.div className=""
                          initial={{ x: -40, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.6, duration: 0.6 }}
                          >
                           <Link to='/signup'>
                           <button className="btn-search w-auto">Get Started <ArrowRight size={18} className=''  /> </button>
                           </Link>

                        </motion.div>

                      {/*  <motion.div className="row align-items-center justify-content-center"
                          initial={{ y: 40, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                           transition={{ delay: 0.6, duration: 0.6 }}
                         >
                          <div className="col-md-9 col-lg-10">
                            <div className="row gy-3 gy-md-0 gx-3 mt-2 mt-md-4">
                              <div className="col-md-7">
                                <input
                                type="text"
                                placeholder="Search by name or skills.."
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

                          <div className="col-md-3 col-lg-2 text-center px-md-0">
                            <div className="mt-3 mt-md-4">
                              <button className="btn-search w-100">Search Now</button>
                            </div>
                          </div>
                        </motion.div> */}

                    </motion.div>
                    <motion.div className="col-lg-4 offset-lg-1 d-none d-lg-block"
                      variants={rightVariant}
                      initial="hidden"
                      animate="visible"
                    >
                      <img src="/images/hire_now2.png" className='w-100 p-lg-4' alt="" />
                    </motion.div>
                </div>
                </div>
            </div>

            <div className="">
              <div className="container">
                  <TeacherProfiles />
              </div>
            </div>

            <div className="hire_now_banner section_padding_bottom">
              <div className="container">
              <img src="/images/hire_now.png" className='w-100 rounded-3' alt="" />
              </div>
            </div>
        <Footer />
        </div>
    </>
  )
}

export default HireNow