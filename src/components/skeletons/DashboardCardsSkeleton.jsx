import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const DashboardCardsSkeleton = () => {
  return (
    <div className="row mt-4 mt-md-5 dashboard_counts">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="col-sm-6 col-xl-3 mb-4 mb-xl-0">
          <div className="statistics_funfact h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div className="details">
                <div className="title">
                  <Skeleton width={40} height={28} />
                </div>
              </div>

              <div className="icon text-center">
                {/* <Skeleton circle width={40} height={40} /> */}
              </div>
            </div>

            <div className="text fz25 mt-2">
              <Skeleton width={120} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCardsSkeleton;