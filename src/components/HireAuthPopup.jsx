import { useNavigate } from "react-router-dom";
import { Check, CheckCircle, LogIn, UserPlus } from "lucide-react";
import "./AuthPopup.css"; // reuse same CSS

const HireAuthPopup = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="auth-backdrop" />

      <div className="auth-modal">

        <div className="auth-top-bar" />

        <div className="auth-content">

          {/* <div className="auth-logo">
            <span>EduCare</span>
          </div> */}

          <h2>Sign in to see more</h2>

          <ul className="auth-points">
            <li>
              <CheckCircle size={18} /> Unlock profile details, skills and filters
            </li>
            <li>
              <CheckCircle size={18} /> Check verified credentials
            </li>
            <li>
              <CheckCircle size={18} /> Browse and compare profiles
            </li>
          </ul>

          <button
            className="auth-btn primary"
            onClick={() => navigate("/signup", { state: { role: "principal" } })}
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

        {/* SAME footer */}
        <div className="auth-footer">
          By signing up you agree to our{" "}
          <span>Terms</span> &amp; <span>Privacy Policy</span>
        </div>
      </div>
    </>
  );
};

export default HireAuthPopup;