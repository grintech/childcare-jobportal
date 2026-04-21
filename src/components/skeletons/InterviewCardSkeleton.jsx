import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const InterviewCardSkeleton = ({ count = 3 }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div className="interview_card mb-4" key={i}>
          <div className="interview_card_inner">

            {/* LEFT: Avatar */}
            <div className="interview_left">
              <Skeleton circle width={52} height={52} />
            </div>

            {/* CENTER: Info */}
            <div className="interview_info" style={{ flex: 1 }}>
              {/* Title */}
              <Skeleton width="45%" height={18} className="mb-2" />

              {/* Company */}
              <Skeleton width="30%" height={14} className="mb-3" />

              {/* Meta row */}
              <div className="interview_meta_row">
                <Skeleton width={120} height={13} />
                <Skeleton width={100} height={13} />
                <Skeleton width={70} height={13} />
              </div>

              {/* Description */}
              <div className="mt-2">
                <Skeleton width="100%" height={13} />
                <Skeleton width="80%" height={13} />
              </div>
            </div>

            {/* RIGHT: Badge + button */}
            <div className="d-flex flex-sm-column align-items-center gap-2 justify-content-end">
              <Skeleton width={80} height={26} borderRadius={20} />
              <Skeleton width={70} height={32} borderRadius={8} />
            </div>

          </div>
        </div>
      ))}
    </>
  );
};

export default InterviewCardSkeleton;