// src/routes/PublicRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated && user?.role === "teacher") {
    return <Navigate to="/profile" />;
  }
  // if (isAuthenticated && user?.role === "principal") {
  //   return <Navigate to="/" />;
  // }
  
  return children;
};

export default PublicRoute;