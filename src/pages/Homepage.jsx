import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import SearchSection from '../components/SearchSection'
import TeacherJobs from '../components/TeacherJobs'
import BestDealsSection from '../components/BestDealsSection'
import TopInstitutes from '../components/TopInstitutes'
import TeacherProfiles from '../components/TeacherProfiles'
import PricingPlan from '../components/PricingPlan'
import TestimonialSlider from '../components/TestimonialSlider'
import Footer from '../components/Footer'
import CourseSlider from '../components/CourseSlider'
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import QuickSearch from '../components/QuickSearch'
import HireNowJobs from '../components/HireNowJobs'

const Homepage = () => {

  const location = useLocation();

useEffect(() => {
  const params = new URLSearchParams(location.search);
  const scrollTo = params.get("scroll");

  if (scrollTo) {
    if (scrollTo === "home") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    const el = document.getElementById(scrollTo);

    if (el) {
      setTimeout(() => {
        const offset = 80;

        const elementPosition =
          el.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }, 100);
    }
  }
}, [location]);

  return (
    <>
        <Navbar />
        <Hero />

        <div className="hire_now">
          <div className="container">
              <HireNowJobs />
          </div>
        </div>

        {/* <SearchSection /> */}
        {/* <TeacherJobs /> */}
        {/* <TeacherProfiles /> */}
        {/* <BestDealsSection /> */}
        {/* <CourseSlider /> */}
        <TopInstitutes />
        {/* <PricingPlan /> */}
        {/* <TestimonialSlider /> */}
        <div className="container  py-5">
          <img src="/images/bg2.png" className='w-100 rounded-3' alt="" />
        </div>
        <QuickSearch />
        <Footer />
    </>
  )
}

export default Homepage