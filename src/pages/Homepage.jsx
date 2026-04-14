import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import TopInstitutes from '../components/TopInstitutes'
import Footer from '../components/Footer'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import QuickSearch from '../components/QuickSearch'
import HireNowJobs from '../components/HireNowJobs'
import { useAuth } from '../context/AuthContext' // adjust path as needed
import { LogIn, UserPlus } from 'lucide-react'
import AuthPopup from '../components/AuthPopup'


const Homepage = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollTo = params.get("scroll");
    if (scrollTo) {
      if (scrollTo === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const el = document.getElementById(scrollTo);
      if (el) {
        setTimeout(() => {
          const offset = 80;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  return (
    <>
      <Navbar />

      {/* Show popup only when user is NOT logged in — no dismiss option */}
      {/* {!user && <AuthPopup />} */}

      <Hero />

      <div className="hire_now">
        <div className="container">
          <HireNowJobs />
        </div>
      </div>

      <TopInstitutes />

      <div className="container py-5">
        <img src="/images/bg2.png" className='w-100 rounded-3' alt="" />
      </div>

      <QuickSearch />
      <Footer />
    </>
  );
};

export default Homepage;