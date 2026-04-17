import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const GallerySkeleton = ({ count = 8 }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 8,
      }}
    >
      {[...Array(count)].map((_, i) => (
        <div key={i} style={{ width: "100%", paddingBottom: "100%", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <Skeleton width="100%" height="100%" borderRadius={8} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default GallerySkeleton;