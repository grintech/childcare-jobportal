import React from "react";
import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const NotFound = () => {
  return (
    <div className="auth-wrapper">
    <Navbar />
        <section className="notfound-section d-flex align-items-center">
        <div className="container text-center">

            <div className="notfound-box mx-auto">
            <h1 className="notfound-code">4<span className="text_theme">0</span>4</h1>

            <h2 className="fw-bold mb-3">
                Page Not Found
            </h2>

            <p className="text-muted mb-4">
                Sorry, the page you’re looking for doesn’t exist or has been moved.  
                Let’s help you find a room near your campus.
            </p>

            <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/" className="btn-post d-flex align-items-center gap-2">
                <Home size={18} />
                Go to Homepage
                </Link>

            
            </div>
            </div>

        </div>
        </section>
    <Footer />
    </div>
  );
};

export default NotFound;
