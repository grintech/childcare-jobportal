import React from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'
import CountUp from 'react-countup'
import { Link } from 'react-router-dom'
import './dashboard.css'
import DashSidebar from './DashSidebar'
import { Heart } from 'lucide-react'

const MyAccount = () => {
    const {user} = useAuth();
    const CountUpComponent = CountUp?.default || CountUp;

  return (
    <>
        <div className="my_account blue_nav">
            <Navbar />
             <div className="min_height top_padding ">
                 <div className="container py-4">
                <div className="row">
                    <div className="col-lg-4 col-xl-3 mb-4 mb-lg-0">
                        {/* <DashSidebar /> */}
                    </div>
                    <div className="col-lg-8 col-xl-9 mb-4 mb-lg-0 ">
                     <h1 className="text-center sec-title">Welcome <span className="text_theme text-capitalize">{user?.name}</span> to your account </h1>

                     <h6 className='text-center'>Here you can manage your profile, view saved and applied jobs and keep track of your activities.</h6>


                      <div className="row mt-4 mt-md-5 dashboard_counts d-none">
                        <div className="col-sm-6 col-xl-3 mb-4 mb-xl-0">
                        <Link to='/saved-jobs'>
                            <div className="statistics_funfact h-100">
                            <div className="d-flex justify-content-between">
                                <div className="details">
                                <div className="title">
                                <CountUpComponent end={5} duration={2} />
                                </div>

                                </div>
                                <div className="icon text-center">
                                 <Heart size={20} />
                                </div>
                            </div>
                            <div className="text fz25 mt-2">Your Favourites</div>

                        </div>
                        </Link>
                        </div>

                        <div className="col-sm-6 col-xl-3 mb-4 mb-xl-0 ">
                        <Link to='/applied-jobs'>
                            <div className="statistics_funfact h-100">
                            <div className="d-flex justify-content-between">
                                <div className="details">
                                <div className="title">
                                    <CountUpComponent end={6} duration={2} />
                                    </div>

                                </div>
                                <div className="icon text-center">
                                <i className="fa-solid fa-briefcase"></i>
                                </div>
                            </div>
                            <div className="text fz25 mt-2">Applied Jobs</div>

                        </div>
                        </Link>
                        </div>


                    </div>

                    </div>
                </div>
            </div>   
              </div>
             <Footer />
        </div>
    </>
  )
}

export default MyAccount