import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import "./AuthPopup.css";

const AuthPopup = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="auth-backdrop" />

      <div className="auth-modal">

        {/* Top gradient bar */}
        <div className="auth-top-bar" />

        <div className="auth-content">

          {/* <div className="auth-logo">
            <span>EduCare</span>
          </div> */}

          <h2>Find jobs matched to you</h2>
          <p>
            Join thousands of educators discovering their perfect roles on EduCare.
          </p>

          <button
            className="auth-btn primary"
            onClick={() => navigate("/signup", { state: { role: "teacher" } })}
          >
            <UserPlus size={18} />
            Create an Account
          </button>

          <button
            className="auth-btn outline"
            onClick={() => navigate("/login")}
          >
            <LogIn size={18} />
            Sign In
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

export default AuthPopup;