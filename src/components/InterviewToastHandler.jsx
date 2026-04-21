import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const InterviewToastHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const interview = params.get("interview");
    const interviewError = params.get("interview_error");
    const message = params.get("message");

    if (message) {
      const decodedMessage = decodeURIComponent(message.replace(/\+/g, " "));

      if (interview === "accepted") {
        toast.success(decodedMessage);
      } else if (interview === "declined") {
        toast.error(decodedMessage);
      } else if (interviewError) {
        toast.error(decodedMessage);
      }

      // Clear URL params after toast
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return null;
};

export default InterviewToastHandler;