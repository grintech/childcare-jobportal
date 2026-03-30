import React from "react";

const QuickSearch = () => {
  return (
    <section className="quick-search py-5">
      <div className="container">

        <h5 className="fw-bold mb-3">Quick search</h5>

        {/* Classifications */}
        <div className="mb-2 d-flex flex-wrap align-items-center">
          <span className="me-3 text-muted">Classifications</span>

          <a href="#" className="qs-link">Child Care</a>
          <a href="#" className="qs-link">Early Childhood Education</a>
          <a href="#" className="qs-link">Primary Teacher</a>
          <a href="#" className="qs-link">Secondary Teacher</a>
          <a href="#" className="qs-link">Special Education</a>
          <a href="#" className="qs-link">Teaching Assistant</a>

          {/* <button className="btn btn-sm btn-light border ms-2">
            View all ⌄
          </button> */}
        </div>

        {/* Locations */}
        <div className="mb-2 d-flex flex-wrap">
          <span className="me-3 text-muted">Locations</span>

          <a href="#" className="qs-link">Delhi</a>
          <a href="#" className="qs-link">Gurgaon</a>
          <a href="#" className="qs-link">Noida</a>
          <a href="#" className="qs-link">Mumbai</a>
          <a href="#" className="qs-link">Bangalore</a>
          <a href="#" className="qs-link">Hyderabad</a>
        </div>

        {/* Other */}
        <div className="d-flex flex-wrap">
          <span className="me-3 text-muted">Other</span>

          <a href="#" className="qs-link">All Teaching Jobs</a>
          <a href="#" className="qs-link">Work From Home</a>
          <a href="#" className="qs-link">Part-Time Teaching</a>
          <a href="#" className="qs-link">International Schools</a>
          <a href="#" className="qs-link">Private Tutors</a>
          <a href="#" className="qs-link">Salary Guide</a>
        </div>

      </div>
    </section>
  );
};

export default QuickSearch;