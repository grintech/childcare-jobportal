import { BookMarked, BookMarkedIcon, BriefcaseBusinessIcon, ChevronDown, Heart, LogIn, LogOut, Menu, Plus, PlusCircle, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {

  const { user, isAuthenticated, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  

useEffect(() => {
  const handleClickOutside = (e) => {
    // Close search dropdown
    setDropdownOpen(false);

    // Close user dropdown
    setUserMenuOpen(false);

    // Close navbar (mobile)
    if (navRef.current && !navRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  document.addEventListener("click", handleClickOutside);

  return () => {
    document.removeEventListener("click", handleClickOutside);
  };
}, []);


const scrollToSection = (id) => {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};


  return (
    <>
      <nav ref={navRef} className={`navbar navbar-expand-lg custom-navbar ${scrolled ? "navbar-scrolled" : ""}`} >
        <div className="container">

          {/* Logo */}
          <Link className="navbar-brand" to="/">
            <img src="/images/logo_white.png" alt="" />
          </Link>

          {/* Mobile toggle */}
          <button
            className="navbar-toggler border-0"
            onClick={() => setOpen(!open)}
          >
            <Menu size={28} />
          </button>

          <div className={`collapse navbar-collapse ${open ? "show" : ""}`}>
          
            <ul className="navbar-nav ms-auto me-3 gap-lg-3">

              <li className="nav-item">
                <Link
                to="/"
                className={`nav-link nav-hover ${ location.pathname === "/" ? "active" : "" }`}
                onClick={() => setOpen(false)}
              >
                Find a Job
              </Link>
              </li>

              <li className="nav-item">
                <Link
                to="/profiles"
                className={`nav-link nav-hover ${ location.pathname === "/profiles" ? "active" : "" }`}
                onClick={() => setOpen(false)}
              >
                Hire Now
              </Link>
              </li>

              <li className="nav-item">
                <Link
                // to="/?scroll=upskill"
                to="/get-trained"
                className={`nav-link nav-hover ${ location.pathname === "/get-trained" ? "active" : "" }`}
                onClick={() => setOpen(false)}
              >
                Get Trained
              </Link>
              </li>

            </ul>


          <div className="d-flex flex-wrap mt-2 mt-lg-0 gap-3 align-items-center">
                 {/* <Link to="/login" className="btn-login d-flex align-items-center">
                    Login
                  </Link>
                  <Link
                    to="/job-post"
                    className="btn-post"
                    onClick={() => setOpen(false)}
                  >
                    Post a Job <PlusCircle size={15} className="ms-1 mb-1" />
                  </Link> */}

              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="btn-login d-flex align-items-center">
                    Login
                  </Link>
                  <Link
                    to="/job-post"
                    className="btn-post"
                    onClick={() => setOpen(false)}
                  >
                    Post a Job <PlusCircle size={15} className="ms-1 mb-1" />
                  </Link>
                </>
              ) : (
                <div
                  className="user-dropdown position-relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* User Button */}
                  <button
                    className="btn-post d-flex align-items-center gap-1"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    {user?.name?.split(" ")[0]} <ChevronDown size={14} />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="dropdown-menu show custom-user-dropdown">

                      {/* TEACHER */}
                      {user?.role === "teacher" && (
                        <>
                          <Link
                            to="/profile"
                            className="dropdown-item"
                            onClick={() => setUserMenuOpen(false)}
                          >
                          <User size={16} className="mb-1 me-1" /> My Profile
                          </Link>

                          <Link
                            to="/saved-jobs"
                            className="dropdown-item"
                            onClick={() => setUserMenuOpen(false)}
                          >
                          <Heart size={16} className="mb-1 me-1" /> Saved Jobs
                          </Link>

                          <Link
                            to="/applied-jobs"
                            className="dropdown-item"
                            onClick={() => setUserMenuOpen(false)}
                          >
                          <BriefcaseBusinessIcon size={16} className="mb-1 me-1" /> Applied Jobs
                          </Link>

                          <button
                            className="dropdown-item text-danger"
                            onClick={() => {
                            setShowModal(true);
                              setUserMenuOpen(false);
                            }}
                          >
                          <LogOut size={16} className="mb-1 me-1" />  Logout
                          </button>
                        </>
                      )}

                      {/* PRINCIPAL */}
                      {user?.role === "principal" && (
                        <>
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              window.location.href = `${import.meta.env.VITE_WEBSITE_URL}/childcare/centre/director/dashboard`;
                            }}
                          >
                          <User size={16} className="mb-1" /> Dashboard
                          </button>

                          {/* <button
                            className="dropdown-item text-danger"
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                            }}
                          >
                            <LogOut size={16} className="mb-1" />  Logout
                          </button> */}
                        </>
                      )}

                      {/* SUPER ADMIN */}
                      {user?.role === "super_admin" && (
                        <>
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              window.location.href = `${import.meta.env.VITE_WEBSITE_URL}/admin/dashboard`;
                            }}
                          >
                          <User size={16} className="mb-1" /> Dashboard
                          </button>

                          {/* <button
                            className="dropdown-item"
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                            }}
                          >
                          <LogOut size={16} className="mb-1" /> Logout
                          </button> */}
                        </>
                      )}

                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

       {showModal && (
        <>
          <div className="modal-backdrop fade show"></div>

          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ zIndex: 1055 }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Confirm Logout</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body text-center">
                  <h6 className="fw-bold my-2">Are you sure you want to logout?</h6>
                </div>
                <div className="modal-footer d-flex justify-content-center">
                  <button
                    type="button"
                    className="btn  btn-secondary "
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className=" btn btn-primary"
                    onClick={() => {
                      logout();
                      setShowModal(false);
                    }}
                  >
                    Yes, Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    
    </>
  );
};

export default Navbar;