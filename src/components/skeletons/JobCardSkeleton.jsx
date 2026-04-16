import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const JobCardSkeleton = () => {
  return (
    <div className="col-12 mb-4">
      <div className="job_card">
        <div className="job_card_body list_view">

          {/* Logo */}
          <div className="">
            <Skeleton height={65} width={65} borderRadius={50} />
          </div>

          {/* Info */}
          <div className="job_info w-100">
            <h5>
              <Skeleton width="60%" height={20} />
            </h5>

            <p className="company">
              <Skeleton width="40%" />
            </p>

            <p className="salary">
              <Skeleton width="30%" />
            </p>

           
            <p className="">
              <Skeleton width="70%" />
            </p>
          </div>

          {/* Actions */}
          <div className="job_actions ">
            <Skeleton circle width={30} height={30} />
            <Skeleton width={80} height={35} borderRadius={6} />
          </div>

        </div>

        {/* Tags */}
        <div className="job_tags d-flex gap-2 mt-2">
          <Skeleton width={50} />
          <Skeleton width={50} />
          <Skeleton width={50} />
        </div>
      </div>
    </div>
  );
};

export default JobCardSkeleton