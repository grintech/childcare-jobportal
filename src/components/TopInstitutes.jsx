import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const institutes = [
  {
    name: "Bright Kids School",
    location: "New York",
    logo: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200",
    openings: 3,
  },
  {
    name: "Little Stars Academy",
    location: "India",
    logo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200",
    openings: 1,
  },
  {
    name: "Green Valley School",
    location: "London",
    logo: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=200",
    openings: 2,
  },
  {
    name: "Future Minds Institute",
    location: "Australia",
    logo: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200",
    openings: 2,
  },
  {
    name: "Kids World School",
    location: "USA",
    logo: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200",
    openings: 4,
  },
  {
    name: "Creative Learners",
    location: "Canada",
    logo: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=200",
    openings: 2,
  },
  {
    name: "Sunrise Public School",
    location: "Dubai",
    logo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200",
    openings: 3,
  },
  {
    name: "EduCare Institute",
    location: "Singapore",
    logo: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=200",
    openings: 1,
  },
];

const TopInstitutes = () => {
  return (
    <section className="top_institutes ">
      <div className="container position-relative">

        {/* Title + Arrows */}
        <div className="section_header">
          <h4 className="section_title">TOP HIRING INSTITUTES </h4>

          <div className="slider_arrows">
            <div className="swiper-button-prev custom-prev"></div>
            <div className="swiper-button-next custom-next"></div>
          </div>
        </div>

        {/* Slider */}

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

                <img src={item.logo} alt={item.name} />

                <h6>{item.name}</h6>

                <span className="location">
                  ({item.location})
                </span>

                <button className="openings_btn">
                  {item.openings} OPENING
                </button>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
};

export default TopInstitutes;