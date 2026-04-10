import { useNavigate } from "react-router-dom";
import {  CheckCircle, LogIn, UserPlus } from "lucide-react";
import "./AuthPopup.css"; // reuse same styles

const UpskillAuthPopup = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="auth-backdrop" />

      <div className="auth-modal">

        {/* Top gradient */}
        <div className="auth-top-bar" />

        <div className="auth-content">

          {/* <div className="auth-logo">
            <span>EduCare</span>
          </div> */}

          <h2>Unlock premium courses</h2>

          <p>
            Sign in to access top courses and boost your career growth.
          </p>

          <ul className="auth-points">
            <li>
              <CheckCircle size={18} /> Access curated professional courses
            </li>
            <li>
              <CheckCircle size={18} /> Learn from verified educators
            </li>
            <li>
              <CheckCircle size={18} /> Improve your teaching & career skills
            </li>
          </ul>

          <button
            className="auth-btn primary"
            onClick={() => navigate("/signup")}
          >
            <UserPlus size={18} /> Create Account
          </button>

          <button
            className="auth-btn outline"
            onClick={() => navigate("/login")}
          >
            <LogIn size={18} /> Sign In
          </button>
        </div>

        <div className="auth-footer">
          By signing up you agree to our{" "}
          <span>Terms</span> &amp; <span>Privacy Policy</span>
        </div>
      </div>
    </>
  );
};

export default UpskillAuthPopup;