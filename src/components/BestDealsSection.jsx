import { Search, Users, ShieldCheck, Bell, Wallet, Headphones } from "lucide-react";

const BestDealsSection = () => {
  return (
    <section className="best_deals">

      <div className="overlay"></div>

      <div className="container position-relative">
        <div className="d-flex flex-column align-items-center justify-content-center">
          <h5 className="section_title text-white text-center ">
            OFFERING THE BEST DEALS
          </h5>
        </div>

        <div className="row mt-5">

          {/* Item */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="deal_card ">
              <Search size={34} />
              <h5>Search a Jobs</h5>
              <p className="m-0">
                Find teaching opportunities for schools and childcare centers near you.
              </p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 mb-4">
            <div className="deal_card">
              <Users size={34} />
              <h5>Apply a Good Job</h5>
              <p>
                Apply to trusted schools and institutions looking for qualified teachers.
              </p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 mb-4">
            <div className="deal_card">
              <ShieldCheck size={34} />
              <h5>Job Security</h5>
              <p>
                Verified schools and safe teaching environments for educators.
              </p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 mb-4">
            <div className="deal_card">
              <Bell size={34} />
              <h5>Job Notifications</h5>
              <p>
                Get alerts when new teaching jobs are posted in your area.
              </p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 mb-4">
            <div className="deal_card">
              <Wallet size={34} />
              <h5>Easy Payments</h5>
              <p>
                Secure and transparent salary information for every job.
              </p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 mb-4">
            <div className="deal_card">
              <Headphones size={34} />
              <h5>Happy Support</h5>
              <p>
                Our team helps teachers and schools connect easily.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BestDealsSection;