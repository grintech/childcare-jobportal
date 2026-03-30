import React from "react";

const PricingPlan = () => {
  const plans = [
    {
      name: "BASIC PLAN",
      price: 29,
      color: "var(--secondary)",
      features: [
        "5 Jobs Posting",
        "2 Featured Jobs",
        "1 Renew Jobs",
        "10 Days Duration",
        "Email Alert",
      ],
    },
    {
      name: "PREMIUM PLAN",
      price: 59,
      color: "var(--primary)",
      features: [
        "10 Jobs Posting",
        "5 Featured Jobs",
        "1 Renew Jobs",
        "10 Days Duration",
        "Email Alert",
      ],
      active: true,
    },
    {
      name: "ADVANCED PLAN",
      price: 99,
      color: "var(--secondary)",
      features: [
        "25 Jobs Posting",
        "10 Featured Jobs",
        "1 Renew Jobs",
        "10 Days Duration",
        "Email Alert",
      ],
    },
  ];

  return (
    <section className="pricing_section ">
      <div className="container text-center d-flex flex-column align-items-center justify-content-center">

        <h4 className="fw-bold section_title mb-2">PRICING PLAN</h4>
        <p className="text-muted mb-5">
          Default is 3 pack but you can add more if you want.
        </p>

        <div className="row w-100">
          {plans.map((plan, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className={`pricing_card ${plan.active ? "active" : ""}`}>

                {/* Header */}
                <div
                  className="pricing_header"
                  style={{ background: plan.color }}
                >
                  <h5 className="m-0">{plan.name}</h5>
                </div>

                {/* Price Circle */}
                <div className="price_circle">
                  <h3 style={{ color: plan.color }}>${plan.price}</h3>
                </div>

                {/* Features */}
                <ul className="list-unstyled mt-4">
                  {plan.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  className=" mt-4"
                  style={{
                    background: plan.active
                      ? "var(--secondary)"
                      : "var(--primary)",
                    color: "#fff",
                  }}
                >
                  ADD TO CART
                </button>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PricingPlan;