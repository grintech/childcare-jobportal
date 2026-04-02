// src/services/api.js
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

//  REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

//  LOGOUT HANDLER (centralized)
const handleLogout = (message) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  toast.error(message || "Your session has expired. Please login again.");

  setTimeout(() => {
    window.location.href = "/login";
  }, 2000);
};

//  RESPONSE INTERCEPTOR (UPDATED)
api.interceptors.response.use(
  (response) => {
    //  handle custom logout response (important)
    if (response?.data?.logout) {
      handleLogout(response.data.message);
      return Promise.reject(response.data); // stop further execution
    }

    return response.data;
  },
  (error) => {
    const res = error?.response;

    //  handle backend logout response
    if (res?.data?.logout) {
      handleLogout(res.data.message);
    }

    //  optional: handle 401

    // if (res?.status === 401) {
    //   handleLogout("Your session has expired. Please login again.");
    // }

    return Promise.reject(res?.data || error.message);
  }
);

export default api;