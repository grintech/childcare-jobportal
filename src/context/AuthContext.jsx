import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  //  Load from localStorage on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    setLoading(false);
  }, []);



  const handleExternalLogout = async () => {
  try {
    // Only call API if token exists
    if (localStorage.getItem("token")) {
      await api.post("/logout");
    }
  } catch (err) {
    console.log("External logout error:", err);
  } finally {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user_resume");

    toast.success("Logged out successfully!");

    //  Clean URL (remove ?logout=true)
    navigate("/login", { replace: true });
  }
};


  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const shouldLogout = params.get("logout");

  if (shouldLogout === "true") {
    //  Call logout API + clear state
    handleExternalLogout();
  }
}, [location.search]);


  // LOGIN
  const login = (data) => {
    const { user, token } = data;

    setUser(user);
    setToken(token);

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
   
  };

  // LOGOUT

  const logout = async () => {
  try {
    const res = await api.post("/logout");

    // Show toast from API response
    if (res?.status) {
      toast.success(res.message || "Logged out successfully!");
    }

  } catch (err) {
    toast.error(err?.message || "Logout failed");
  } finally {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user_resume");

    //  Redirect after short delay (so toast is visible)
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000);
  }
};




  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

//  Custom Hook
export const useAuth = () => useContext(AuthContext);