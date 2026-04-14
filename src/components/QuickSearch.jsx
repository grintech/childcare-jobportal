import { useNavigate } from "react-router-dom";

const QuickSearch = () => {
  const navigate = useNavigate();

  // Handlers
  const handleRoleClick = (role) => {
    navigate(`/?role=${encodeURIComponent(role)}`);
  };

  const handleLocationClick = (location) => {
    navigate(`/?location=${encodeURIComponent(location)}`);
  };

  return (
    <section className="quick-search py-5">
      <div className="container">

        <h5 className="fw-bold mb-3">Quick search</h5>

        {/* Classifications */}
        <div className="mb-2 d-flex flex-wrap align-items-center">
          <span className="me-3 text-muted">Classifications</span>

          {[
            "Childcare Assistant",
            "Early Childhood Education",
            "Primary Teacher",
            "KinderGar Teacher",
            "Special Education",
            "Childcare Centre",
          ].map((role) => (
            <span
              key={role}
              className="qs-link"
              onClick={() => handleRoleClick(role)}
              style={{ cursor: "pointer" }}
            >
              {role}
            </span>
          ))}
        </div>

        {/* Locations */}
        <div className="mb-2 d-flex flex-wrap">
          <span className="me-3 text-muted">Locations</span>

          {[
            "Sydney",
            "Melbourne",
            "Beerwah QLD",
            "Perth",
            "Myrtleford VIC",
            "Adelaide",
            "Gold Coast",
            "Canberra",
            "The Rocks",
          ].map((loc) => (
            <span
              key={loc}
              className="qs-link"
              onClick={() => handleLocationClick(loc)}
              style={{ cursor: "pointer" }}
            >
              {loc}
            </span>
          ))}
        </div>


      </div>
    </section>
  );
};

export default QuickSearch;