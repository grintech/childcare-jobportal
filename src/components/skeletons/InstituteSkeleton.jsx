import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const InstituteSkeleton = () => {
  return (
   <div className="row px-3">
      {[...Array(4)].map((_, index) => (
        <div className="col-lg-3 col-md-4 col-sm-6 mb-3" key={index}>
          
          <div className="institute_card">

            {/* Logo */}
            <div className="mb-2">
              <Skeleton circle height={60} width={60} />
            </div>

            {/* Name */}
            <h6 className="mb-2">
              <Skeleton width="80%" height={15} />
            </h6>

            {/* Location */}
            <span className=" mt-2">
              <Skeleton width="60%" height={12} />
            </span>

            {/* Button */}
            <div className="mt-2">
              <Skeleton height={30} width={120} borderRadius={8} />
            </div>

          </div>

        </div>
      ))}
    </div>
  );
};

export default InstituteSkeleton;