import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer_section text-white">
      <div className="container">

        <div className="row">

          {/* Logo + Description */}
          <div className="col-lg-4 mb-4">
            <img
              src="/images/logo_white.png"
              alt="Educare"
              className="footer_logo mb-3"
            />
            <p className="footer_desc">
              Educare connects passionate educators with leading childcare
              centres across Australia. Find jobs, hire talent, and grow your career.
            </p>

            <div className="footer_social d-flex gap-3 mt-3">
            <a href="#" className="social_icon">
                <Facebook size={18} />
            </a>
            <a href="#" className="social_icon">
                <Instagram size={18} />
            </a>
            <a href="#" className="social_icon">
                <Twitter size={18} />
            </a>
            <a href="#" className="social_icon">
                <Linkedin size={18} />
            </a>
            </div>

            
          </div>

          {/* Links */}
          <div className="col-lg-4 mb-4">
            <h6 className="footer_title">Quick Links</h6>
            <ul className="footer_links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms & Conditions</a></li>
              <li><a href="#">Help Center</a></li>
            </ul>
          </div>

          {/* Extra (optional spacing or future use) */}
          <div className="col-lg-4 mb-4">
            <h6 className="footer_title">Contact</h6>
            <Link> Email: support@educare.com</Link>
            <p></p>

           <div className="newsletter-box"><input placeholder="Email address" type="email"  /><button>Subscribe</button></div>

          </div>

        </div>

        {/* Bottom */}

      </div>
        <div className="footer_bottom text-center">
          <p className="mb-0">
            © {new Date().getFullYear()} <Link to="/">EduCare</Link> | All rights reserved.
          </p>
        </div>
    </footer>
  );
};

export default Footer;