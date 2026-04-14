import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GuestOnlyRoute = ({ children }) => {
  const { user } = useAuth();

  //  If logged in → redirect
  if (user) {
    return <Navigate to="/" replace />;
  }

  // If NOT logged in → allow
  return children;
};

export default GuestOnlyRoute;