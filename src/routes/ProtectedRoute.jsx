// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  //  Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  //  TEACHER → allowed
  if (user?.role === "teacher") {
    return children;
  }

  //  PRINCIPAL → redirect to external dashboard
  if (user?.role === "principal") {
    window.location.replace(
      `${import.meta.env.VITE_WEBSITE_URL}/childcare/centre/director/dashboard`
    );
    return null;
  }

  // SUPER ADMIN → redirect to admin dashboard
  if (user?.role === "super_admin") {
    window.location.replace(
      `${import.meta.env.VITE_WEBSITE_URL}/admin/dashboard`
    );
    return null;
  }

  // fallback
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;