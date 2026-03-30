import React, { useRef } from 'react';
// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Swiper CSS
import 'swiper/css';
import 'swiper/css/pagination';

// Icons from lucide-react
import { Star } from 'lucide-react';

// Custom CSS with root colors
const customStyles = `


`;

// Mock testimonials with unsplash images
const testimonials = [
  {
    id: 1,
    text: "As a daycare owner, I was able to hire qualified and experienced staff quickly. Posting jobs and managing applications is very easy here.",
    name: "Rohit Mehta",
    title: "Daycare Owner",
    rating: 5,
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&auto=format",
  },
  {
    id: 2,
     text: "This platform helped me find a teaching job at a reputed preschool within days. The process was smooth, and I could easily connect with verified institutes.",
    name: "Neha Verma",
    title: "Preschool Teacher",
    rating: 5,
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&auto=format",
  },
  {
    id: 3,
    text: "The platform is perfect for educators looking for new opportunities. I received multiple interview calls within a week of applying.",
    name: "Rahul Mehta",
    title: "Kindergarten Teacher",
    rating: 5,
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&auto=format",
  },
  {
    id: 4,
     text: "I found a trusted childcare provider for my child through this platform. The profiles and reviews made it easy to choose the right caregiver.",
    name: "Anjali Sharma",
    title: "Parent",
    rating: 5,
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&auto=format",
  }
];

function TestimonialSlider() {
  const swiperRef = useRef(null);

  const renderStars = (rating) => {
    return [...Array(rating)].map((_, i) => (
      <Star key={i} size={16} fill="currentColor" />
    ));
  };

  return (
    <>
      <style>{customStyles}</style>
      <section className="testimonial-slider-section">
        <div className="testimonial-container">
          <div className="section-header d-flex flex-column align-items-center justify-content-center">
            <h2 className='section_title text-white mb-3'>WHAT CLIENTS SAY?</h2>
            <p className="section-subtitle">Trusted by hundreds of happy customers worldwide</p>
          </div>

          <div className="col-lg-9 col-xxl-7 col-11 mx-auto overflow-hidden">
            <Swiper
                modules={[Pagination, Autoplay]}
                slidesPerView={1}
                centeredSlides={true}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000 }}
                 speed={1200}
                loop={true}
                className='pb-4'
                >
                {testimonials.map((item) => (
                <SwiperSlide key={item.id}>
                    <div className="testimonial-card text-center">

                        <div className="client-avatar-wrapper">
                        <img src={item.img} alt={item.name} />
                        </div>

                        <div className="client-rating">
                        {renderStars(item.rating)}
                        </div>

                        <p className="testimonial-text">
                        "{item.text}"
                        </p>

                        <h5 className="client-name">{item.name}</h5>
                        <span className="client-title">({item.title})</span>

                    </div>
                    </SwiperSlide>
                ))}
            </Swiper>

          </div>


        </div>
      </section>
    </>
  );
}

export default TestimonialSlider;