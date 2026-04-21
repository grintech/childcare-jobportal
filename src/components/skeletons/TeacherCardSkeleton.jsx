import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const TeacherCardSkeleton = () => {
  return (
    <div className="col-12 mb-4">
      <div className="job_card p-3">
        <div className="d-flex profile_wrap gap-4">

          {/* PROFILE IMAGE */}
          <div className="">
            <Skeleton circle width={80} height={80} />
          </div>

          <div className="flex-grow-1">

            {/* NAME */}
            <div className="mb-0">
              <Skeleton width="30%" height={14} />
            </div>

            {/* ROLE */}
            <div className="mb-0">
              <Skeleton width="40%" height={10} />
            </div>

            {/* LOCATION */}
            <div className="">
              <Skeleton width="50%" height={10} />
            </div>

            {/* CONTACT */}
            <div className="d-flex flex-wrap gap-2 mb-0">
              <Skeleton width={120} height={10} />
              <Skeleton width={150} height={10} />
            </div>

            {/* STARS */}
            <div className="d-flex gap-1 my-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} width={16} height={16} />
              ))}
            </div>

            {/* DESCRIPTION */}
            <div className="mb-0">
              <Skeleton width="100%" height={10} />
              <Skeleton width="90%" height={10} />
            </div>

            {/* BUTTON */}
            <div className="d-flex flex-wrap gap-2 mt-1">
              <Skeleton width={80} height={32} />
              <Skeleton width={80} height={32} />
              <Skeleton width={80} height={32} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCardSkeleton; 