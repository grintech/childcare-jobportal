import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Footer = () => {
   
  const [email, setEmail] = useState();
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);


 const handleSubscribe = async () => {
  if (!email || !email.trim()) {
    setErrorMsg("Email is required");
    setTimeout(() => setErrorMsg(""), 2000);
    return;
  }

  try {
    setLoading(true);
    const res = await api.post("/newsletter", { email });

    if (res.status) {
      setSuccessMsg(res.message || "Successfully subscribed.");
      setEmail("");
    } else {
      setErrorMsg(res.message || "Something went wrong.");
    }

    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);

  } catch (err) {
    setErrorMsg(err.message || "Something went wrong.");
    setTimeout(() => setErrorMsg(""), 3000);
  } finally {
    setLoading(false);
  }
};

  return (
    <footer className="footer_section text-white">
      <div className="container">

        <div className="row">

          {/* Logo + Description */}
          <div className="col-lg-4 mb-4">
            <img
              src="/images/logo2.png"
              alt="Early Learning Careers"
              className="footer_logo mb-3"
            />
            <p className="footer_desc">
              Early Learning Careers connects passionate educators with leading childcare
              centres across Australia. Find jobs, hire talent, and grow your career.
            </p>

            <div className="footer_social d-flex gap-3 mt-3">
            <a href="#" className="social_icon">
               <i className="fa-brands fa-facebook"></i>
            </a>
            <a href="#" className="social_icon">
                <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="#" className="social_icon">
                <i className="fa-brands fa-twitter"></i>
            </a>
            <a href="#" className="social_icon">
               <i className="fa-brands fa-linkedin"></i>
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

           <div className="newsletter-box">
            <input 
            placeholder="Email address"
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
             />

            <button onClick={handleSubscribe} disabled={loading}  > {loading ? "Subscribing..." : "Subscribe"}</button>
            </div>

             {/* Messages */}
              {successMsg && (
                <p className="text-success mt-2 mb-0 fw-semibold small">{successMsg}</p>
              )}

              {errorMsg && (
                <p className="text-danger mt-2 mb-0 fw-semibold small">{errorMsg}</p>
              )}

          </div>

        </div>

        {/* Bottom */}

      </div>
        <div className="footer_bottom text-center">
          <p className="mb-0">
            © {new Date().getFullYear()} <Link to="/">Early Learning Careers</Link> | All rights reserved.
          </p>
        </div>
    </footer>
  );
};

export default Footer;