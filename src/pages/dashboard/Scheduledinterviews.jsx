import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Briefcase,
  X,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  User2,
  BriefcaseBusinessIcon,
} from "lucide-react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";
import InterviewCardSkeleton from "../../components/skeletons/InterviewCardSkeleton";
import api from "../../services/api";
import toast from "react-hot-toast";


// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time) => {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
};

// const getInitials = (name) => {
//   if (!name) return "?";
//   const parts = name.trim().split(" ");
//   return parts.length === 1
//     ? parts[0][0].toUpperCase()
//     : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
// };

const STATUS_CONFIG = {
  upcoming: {
    label: "Upcoming",
    badgeClass: "badge_upcoming",
    icon: <Clock size={12} />,
  },
  passed: {
    label: "Completed",
    badgeClass: "badge_passed",
    icon: <CheckCircle size={12} />,
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "badge_cancelled",
    icon: <X size={12} />,
  },
};

// ── Cancel Confirm Modal ──────────────────────────────────────────────────────
const CancelModal = ({ interview, onConfirm, onClose }) => (
  <>
    <div className="modal-backdrop fade show" onClick={onClose} />
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered ">
        <div className="modal-content rounded-4 border-0">

          <div className="modal-header border-0 pb-0 justify-content-end">
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body text-center px-4 pt-2 pb-3">
            <AlertCircle size={40} color="#ef5350" className="mb-3" />
            <h5 className="fw-bold mb-2">Cancel Interview?</h5>
            <p className="text-muted mb-1" >
              Are you sure you want to cancel your interview for
            </p>
            <p className="fw-semibold mb-0" >
              {interview.job_title} at {interview.institution_name}
            </p>
          </div>

          <div className="modal-footer border-0 justify-content-center gap-2 pb-4 pt-0">
            <button className="btn btn-secondary px-4" onClick={onClose}>
              Keep It
            </button>
            <button
              className="btn btn-danger px-4"
              onClick={() => onConfirm(interview.id)}
            >
              Yes, Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  </>
);

// ── Interview Card ────────────────────────────────────────────────────────────
const InterviewCard = ({ interview, onCancelClick }) => {
  const status = STATUS_CONFIG[interview.status];
  const isUpcoming = interview.status === "upcoming";

  return (
    <div className="interview_card mb-4">
      <div className="interview_card_inner">

        {/* LEFT: Avatar + meta */}
        <div className="interview_left">
          <div className="interview_avatar">
            {interview.interviewer_image ? (
              <img src={interview.interviewer_image} alt={interview.interviewer_name} />
            ) : (
              <BriefcaseBusinessIcon size={22} />
            )}
          </div>
        </div>

        {/* CENTER: Main info */}
        <div className="interview_info">
          <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-1">
            <h5 className="interview_title mb-0">{interview.job_title}</h5>

          </div>

          <Link
            to={`/company/${interview.institution_slug}`}
            className="interview_company"
          >
            {interview.institution_name}
          </Link>

          <div className="interview_meta_row">
            <span className="interview_meta_item">
              <Calendar size={13} />
              {formatDate(interview.interview_date)}
            </span>
            <span className="interview_meta_item">
              <Clock size={13} />
              {formatTime(interview.start_time)} – {formatTime(interview.end_time)}
            </span>
            <span className="interview_meta_item">
              {interview.type === "online" ? (
                <><Video size={13} /> Online</>
              ) : (
                <><MapPin size={13} /> In-Person</>
              )}
            </span>
          </div>

          {interview.type === "online" && interview.meeting_link && interview.status === "upcoming" && (
            <a
              href={interview.meeting_link}
              target="_blank"
              rel="noreferrer"
              className="interview_link"
            >
              Join Meeting <ChevronRight size={13} />
            </a>
          )}

          {interview.type === "offline" && interview.location && (
            <p className="interview_location">
              <MapPin size={13} /> {interview.location}
            </p>
          )}

          {interview.description && (
            <p className="interview_desc mb-0">{interview.description}</p>
          )}



        </div>

        {/* RIGHT: Actions */}
        <div className="d-flex flex-sm-column align-items-center gap-2 justify-content-end">
            <span className={`interview_badge ${status.badgeClass}`}>
                {status.icon}
                {status.label}
            </span>
            {isUpcoming && (
            <div className="interview_actions">
                <button
                className="btn_cancel_interview"
                onClick={() => onCancelClick(interview)}
                >
                Cancel
                </button>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ScheduledInterviews = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [interviews, setInterviews] = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Fetch ──
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/invite-list");
      if (res.status) {
        // Map API response to our shape
        const mapped = res.data.map((item) => {
          const invite = item.invites?.[0];
          const dp = item.director_data?.directorprofile;

          // Determine tab based on invite status
          const inviteStatus = invite?.status;
          const tabStatus = inviteStatus === "accepted" ? "upcoming" : "cancelled";

          return {
            id: item.id,
            invite_id: invite?.id || null,
            job_title: item.job_title,
            institution_name: dp?.institution_name  || "",
            institution_slug: item.director_data?.slug || "",
            interviewer_image: dp?.profile_image_url || null,
            interview_date: item.interview_date,
            start_time: item.start_time,
            end_time: item.end_time,
            type: item.type,
            meeting_link: item.meeting_link || null,
            location: item.location || null,
            description: item.description || "",
            status: tabStatus,
            invite_status: inviteStatus,
          };
        });
        setInterviews(mapped);
      }
    } catch (err) {
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);


 const handleCancelConfirm = async (id) => {
  const target = interviews.find((i) => i.id === id);
  if (!target?.invite_id) return;

  try {
    const formData = new FormData();
    formData.append("invite_id", target.invite_id);
    formData.append("status", "declined");

    const res = await api.post("/cancel-interview", formData, {
      // headers: { "Content-Type": undefined },
    });

    if (res?.status) {
      toast.success(res?.message || "Interview declined successfully.");
      setInterviews((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "cancelled" } : item
        )
      );
    } else {
      toast.error(res?.message || "Failed to cancel interview.");
    }
  } catch (err) {
    toast.error(err?.message || "Something went wrong.");
  } finally {
    setCancelTarget(null);
  }
};

  const tabs = [
    {
      key: "upcoming",
      label: "Upcoming",
      count: interviews.filter((i) => i.status === "upcoming").length,
    },
    {
      key: "cancelled",
      label: "Declined",
      count: interviews.filter((i) => i.status === "cancelled").length,
    },
  ];

  const filtered = interviews.filter((i) => i.status === activeTab);

  return (
    <>
      <div className="my_account blue_nav">
        <Navbar />
        <div className="top_padding">
          <div className="container py-4">
            <h1 className="sec-title mb-3">Scheduled Interviews</h1>

            {/* ── TABS ── */}
            <div className="interview_tabs mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`interview_tab_btn ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                  <span className="interview_tab_count">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* ── LIST ── */}
            {loading ? (
              <InterviewCardSkeleton count={3} />
            ) : filtered.length === 0 ? (
              <div className="interview_empty">
                <Calendar size={32} className="mb-2 text-muted" />
                <h6>
                  {activeTab === "upcoming"
                    ? "You have no upcoming interviews scheduled."
                    : "No declined interviews."}
                </h6>
              </div>
            ) : (
              filtered.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  onCancelClick={setCancelTarget}
                />
              ))
            )}
          </div>
        </div>
        <Footer />
      </div>

      {cancelTarget && (
        <CancelModal
          interview={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </>
  );
};

export default ScheduledInterviews;