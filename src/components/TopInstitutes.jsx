import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { useEffect, useState } from "react";
import api from "../services/api";
import { BriefcaseBusinessIcon, Building } from "lucide-react";
import { Link } from "react-router-dom";
import InstituteSkeleton from "./skeletons/InstituteSkeleton";

const TopInstitutes = () => {
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInstitutes = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/employer");

      const employers = res?.data?.data || [];

      const formattedData = employers.map((item) => ({
        name: item.name,
        slug: item.slug,
        location: item?.director_profile?.suburb || "N/A",
        logo: item?.director_profile?.profile_image_url,
        openings: item.jobs_count || 0,
      }));

      setInstitutes(formattedData);

    } catch (err) {
      console.error("Error fetching institutes:", err);
      setError("Failed to load institutes!");  // ✅ important
      setInstitutes([]); // optional safety
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutes();
  }, []);

  return (
    <section className="top_institutes">
      <div className="container position-relative">

        {/* Header */}
        <div className="section_header">
          <h4 className="section_title">TOP HIRING INSTITUTES</h4>

         {!loading && !error && institutes.length > 0 && (
            <div className="slider_arrows">
              <div className="swiper-button-prev custom-prev"></div>
              <div className="swiper-button-next custom-next"></div>
            </div>
          )}
        </div>

        {/* Loader */}
        {loading ? (
            <InstituteSkeleton />
          ) : error ? (
            <div className="col-12">
                <div className="d-flex flex-column align-items-center justify-content-center bg-white py-4 px-3 ">
                <Building size={25} className="mb-2" /> 
                <h5 className="text-center">{error} </h5>
              </div>
            </div>
          ) : institutes.length === 0 ? (
            <div className="col-12">
                <div className="d-flex flex-column align-items-center justify-content-center bg-white py-4 px-3 ">
                <Building size={25} className="mb-2" /> 
                <h5 className="text-center">No institutes found</h5>
              </div>
            </div>
           
          ) : (
            <Swiper
              modules={[Navigation]}
              spaceBetween={25}
              navigation={{
                nextEl: ".custom-next",
                prevEl: ".custom-prev",
              }}
              breakpoints={{
                320: { slidesPerView: 1 },
                576: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1200: { slidesPerView: 4 },
              }}
              className="px-3"
            >
              {institutes.map((item, index) => (
                <SwiperSlide key={index}>
                  <div className="institute_card">
                    <Link
                      to={`/company/${item.slug}`}
                      className="text-dark d-flex justify-content-center"
                    >
                      {item.logo ? (
                        <img src={item.logo} alt={item.name} />
                      ) : (
                        <div className="job_logo">
                          <BriefcaseBusinessIcon size={20} />
                        </div>
                      )}
                    </Link>

                    <h6 className="mb-2">{item.name}</h6>

                    <div className="d-flex justify-content-center mt-2">
                      <span className="location m-0">{item.location}</span>
                    </div>

                    <Link to={`/company/${item.slug}`}>
                      <button className="openings_btn mt-3">
                        {item.openings} OPENING
                      </button>
                    </Link>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
      </div>
    </section>
  );
};

export default TopInstitutes;