import { useState, useEffect } from "react";
import {
  User2,
  CheckCircle,
  Phone,
  Mail,
  Calendar as CalIcon,
  Clock,
  Send,
} from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

// ─── helpers ─────────────────────────────────────────────────────────────────

const maskPhone = (phone) => {
  if (!phone) return "";
  const hasPlus = phone.trim().startsWith("+");
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 6) return phone;
  let countryCode = "";
  let number = clean;
  if (hasPlus && clean.length > 10) {
    const ccLength = clean.length - 10;
    countryCode = `+${clean.slice(0, ccLength)}`;
    number = clean.slice(ccLength);
  }
  const first3 = number.slice(0, 3);
  const last3 = number.slice(-3);
  const prefix = countryCode ? `${countryCode} ` : "";
  return `${prefix}${first3} *** *** ${last3}`;
};

const maskEmail = (email) => {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  let visible;
  if (name.length <= 2) visible = "*".repeat(name.length);
  else if (name.length <= 5) visible = name.slice(0, 1) + "*".repeat(name.length - 1);
  else visible = name.slice(0, 3) + "*".repeat(name.length - 3);
  return `${visible}@${domain}`;
};

const formatDateDisplay = (date) => {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const generateTimeSlots = (selectedDate) => {
  const slots = [];
  const startHour = 9;
  const endHour = 17;
  const now = new Date();
  let currentHour = startHour;

  if (selectedDate && selectedDate.toDateString() === now.toDateString()) {
    currentHour = now.getHours() + 1;
  }

  for (let h = currentHour; h <= endHour; h++) {
    let hour = h;
    const suffix = hour >= 12 ? "PM" : "AM";
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    slots.push(`${hour}:00 ${suffix}`);
  }
  return slots;
};

const formatName = (name) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
};

// ─── component ────────────────────────────────────────────────────────────────

const ScheduleInterview = ({ teacher, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
  const [meetingType, setMeetingType] = useState("online"); // default
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  // const [maxBudget, setMaxBudget] = useState("");
  const [description, setDescription] = useState("");
  // console.log(teacher);
  const { user, isAuthenticated } = useAuth();
  
  const canViewContact = isAuthenticated && user?.role === "principal" && user?.has_subscription;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate]);

  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

 const handleSubmit = async () => {
  if (!jobTitle) { toast.error("Please enter job title"); return; }
  if (meetingType === "online" && !meetingLink) { toast.error("Please enter meeting link"); return; }
  if (meetingType === "offline" && !location) { toast.error("Please enter location"); return; }
  if (!selectedDate) { toast.error("Please select a date."); return; }
  if (!selectedTime) { toast.error("Please select a time slot."); return; }

  setSubmitting(true);

  try {
    // Convert "10:00 AM" → "10:00", "2:00 PM" → "14:00"
    const parseTime = (timeStr) => {
      const [time, period] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    };

    const startTime = parseTime(selectedTime);
    // end_time = start + 1 hour
    const [sh, sm] = startTime.split(":").map(Number);
    const endHour = String(sh + 1).padStart(2, "0");
    const endTime = `${endHour}:${String(sm).padStart(2, "0")}`;

    // Format date as YYYY-MM-DD
    const interviewDate = selectedDate.toLocaleDateString("en-CA"); // "2026-04-10"

    const formData = new FormData();
    formData.append("teacher_id", teacher.id);
    formData.append("job_title", jobTitle);
    formData.append("job_id", teacher?.jobId || ""); 
    // formData.append("max_budget", maxBudget);
    formData.append("description", description);
    formData.append("interview_date", interviewDate);
    formData.append("start_time", startTime);
    formData.append("end_time", endTime);

    // 2. Fix formData — send correct key per type
    formData.append("type", meetingType);

    if (meetingType === "online") {
      formData.append("meeting_link", meetingLink);
      // do NOT append location at all
    } else {
      formData.append("location", location);
      // do NOT append meeting_link at all
    }

    // invites array
    formData.append("invites[0][email]", teacher.email);
    formData.append("invites[0][user_id]", teacher.id);
    formData.append("invites[0][role]", "teacher");

    const response = await api.post("/invite", formData, {
      // headers: {
      //   "Content-Type": undefined, // removes the default for this request only
      // },
    });
    toast.success(response?.message || "Interview scheduled successfully!");
    console.log(response?.message);
    onClose();
  } catch (err) {
    toast.error(err?.message || "Failed to schedule interview.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1050 }}
        onClick={onClose}
      />

      <div className="modal fade show d-block" style={{ zIndex: 1055 }} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content schedule_modal">

            <div className="modal-header schedule_modal_header">
              <div className="d-flex align-items-center gap-3">
                <div className="schedule_avatar">
                  {teacher?.image ? (
                    <img src={teacher.image} alt={teacher.name} className="rounded-circle" />
                  ) : (
                    <div className="schedule_avatar_fallback">
                      <User2 size={28} />
                    </div>
                  )}
                </div>

                <div>
                  <h5 className="mb-0 fw-bold text-capitalize">
                    {formatName(teacher?.name)}
                    {teacher?.verified && (
                      <span className="verified_badge ms-2">
                        <CheckCircle size={14} /> Verified
                      </span>
                    )}
                  </h5>
                  <p className="mb-0 small text-muted">{teacher?.jobRole}</p>
                </div>
              </div>

              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body schedule_modal_body">

              <div className="schedule_contact_row mb-4">
                <span>
                  <Phone size={14} className="me-1" />
                  {canViewContact ? teacher.phone : maskPhone(teacher.phone)}
                </span>
                <span>
                  <Mail size={14} className="me-1" />
                  {canViewContact ? teacher.email : maskEmail(teacher.email)}
                </span>
              </div>

              <div className="row g-4">

              {/* LEFT SIDE → FORM */}
              <div className="col-12 col-lg-6">
                <div className="schedule_card">

                  <h6 className="side_title">Interview Details</h6>

                  {/* JOB TITLE */}
                  <div className="mb-3">
                    <label className="form-label">Job Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Math Teacher"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>

                  {/* MEETING TYPE */}
                  <div className="mb-3">
                    <label className="form-label">Meeting Type</label>

                    <div className="meeting_toggle">
                      <button
                        type="button"
                        className={meetingType === "online" ? "active" : ""}
                        onClick={() => { setMeetingType("online"); setLocation(""); }}
                      >
                        Online
                      </button>
                      <button
                        type="button"
                        className={meetingType === "offline" ? "active" : ""}
                        onClick={() => { setMeetingType("offline"); setMeetingLink(""); }}
                      >
                        Offline
                      </button>
                    </div>
                 </div>

                  {/* CONDITIONAL */}
                  {meetingType === "online" ? (
                    <div className="mb-3">
                      <label className="form-label">Meeting Link</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Paste meeting link"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="mb-3">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter address"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  )}

                  {/*  MAX BUDGET (INPUT GROUP) */}
                  {/* <div className="mb-3">
                    <label className="form-label">Max Budget</label>
                    <div className="input-group custom_budget">
                      <span className="input-group-text">AUD</span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="500"
                        value={maxBudget}
                        maxLength={4}
                        onChange={(e) => {
                          const val = e.target.value.slice(0, 4); // limit 4 digits
                          setMaxBudget(val);
                        }}
                      />
                    </div>
                  </div> */}

                  {/* DESCRIPTION */}
                  <div>
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control schedule_note"
                      rows={3}
                      placeholder="Write your message..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                </div>
              </div>

              {/* RIGHT SIDE → DATE & TIME */}
              <div className="col-12 col-lg-6">
                <div className="schedule_card">

                  <h6 className="side_title">Select Schedule</h6>

                  <Calendar
                      value={selectedDate}
                      onChange={(date) => {
                        setSelectedDate(date);
                        setSelectedTime(null);
                      }}
                      showNeighboringMonth={false}
                      prev2Label={null}
                      next2Label={null}
                      calendarType="gregory"
                      tileDisabled={({ date, view }) => {
                        if (view !== "month") return false;
                        
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        const localDate = new Date(
                          date.getFullYear(),
                          date.getMonth(),
                          date.getDate()
                        );
                        
                        const day = localDate.getDay();
                        
                        return localDate < today || day === 0;
                      }}
                    />

                  {selectedDate && (
                    <div className="schedule_selected_date mt-2">
                      <CalIcon size={13} className="me-1" />
                      {formatDateDisplay(selectedDate)}
                    </div>
                  )}

                  <h6 className="schedule_section_label mt-3">
                    <Clock size={15} className="me-1" />
                    Select Time
                  </h6>

                  {!selectedDate ? (
                    <div className="schedule_time_placeholder">
                      Pick a date first
                    </div>
                  ) : (
                    <div className="time-grid mt-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          className={`time-btn ${selectedTime === time ? "active" : ""}`}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              </div>

            </div>

              {selectedDate && selectedTime && (
                <div className="schedule_summary mt-4">
                  <CheckCircle size={15} className="me-2 text-success" />
                  <strong>Interview set for&nbsp;</strong>
                  {formatDateDisplay(selectedDate)}&nbsp;at&nbsp;
                  <strong>{selectedTime}</strong>
                </div>
              )}

            </div>

            <div className="modal-footer schedule_modal_footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>

              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={handleSubmit}
                disabled={submitting || !selectedDate || !selectedTime}
              >
                {submitting ? (
                  "Scheduling..."
                ) : (
                  <>
                    <Send size={15} />
                    Schedule Interview
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .schedule_modal {
          border: none;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
        }
        .schedule_modal_header {
          background: #f8f9fb;
          border-bottom: 1px solid #e9ecef;
          padding: 18px 24px;
        }
        .schedule_avatar {
          width: 52px;
          height: 52px;
          flex-shrink: 0;
        }
        .schedule_avatar img {
          width: 52px;
          height: 52px;
          object-fit: cover;
        }
        .schedule_avatar_fallback {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
        }
        .schedule_modal_body {
          padding: 24px;
        }
        .schedule_contact_row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          font-size: 0.875rem;
          color: var(--theme-color, #0d6efd);
          background: var(--light);
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 500;
        }
        .schedule_contact_row span {
          display: flex;
          align-items: center;
          color: var(--secondary);
          font-weight:600
        }
        .schedule_section_label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #343a40;
          display: flex;
          align-items: center;
        }

        /* Only keep minimal calendar styling */
        .react-calendar {
          width: 100% !important;
          border: 1px solid #e9ecef !important;
          border-radius: 12px !important;
          font-family: inherit !important;
        }
        
        .react-calendar__navigation {
          background: #f8f9fb;
          border-radius: 12px 12px 0 0;
        }
        
        .react-calendar__tile {
          padding: 8px 4px;
          border-radius: 8px;
        }
        
        .react-calendar__tile--active {
          background: var(--primary) !important;
          border-radius: 8px;
        }
        
        .react-calendar__tile--now {
          background: #e8f0fe;
          border-radius: 8px;
        }

        .schedule_selected_date {
          font-size: 0.82rem;
          color: var(--bs-primary, #0d6efd);
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .time-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        
        .time-btn {
          border: 1.5px solid var(--primary);
          background: #fff;
          border-radius: 8px;
          padding: 7px 4px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all .18s ease;
          color: #343a40;
        }
        
        .time-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: #f0f6ff;
        }
        
        .time-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: #fff;
        }

        .schedule_time_placeholder {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 140px;
          color: #adb5bd;
          font-size: 0.875rem;
          border: 1.5px dashed #dee2e6;
          border-radius: 12px;
        }

        .schedule_note {
          border-radius: 10px;
          font-size: 0.875rem;
          resize: none;
          border: 1.5px solid #dee2e6;
          min-height:100px !important;
        }
        
        .schedule_note:focus {
          border-color: var(--bs-primary, #0d6efd);
          box-shadow: 0 0 0 3px rgba(13,110,253,.12);
          outline: none;
        }

        .schedule_summary {
          display: flex;
          align-items: center;
          background: #f0fff4;
          border: 1px solid #b2dfdb;
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 0.875rem;
          color: #1b5e20;
        }

        .schedule_modal_footer {
          background: #f8f9fb;
          border-top: 1px solid #e9ecef;
          padding: 14px 24px;
          gap: 10px;
        }
          .react-calendar__tile:disabled{background:unset !important}
          .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus {
              background-color: unset !important;;
          }
       .react-calendar__tile--now, .react-calendar__navigation{background: var(--light) !important;}
    .schedule_card {
      background: #fff;
      border-radius: 14px;
      padding: 18px;
      border: 1px solid #e9ecef;
      box-shadow: 0 8px 24px rgba(0,0,0,0.04);
    }

    .schedule_modal_body .form-label {
      margin-bottom: .5rem;
      font-size: 14px;
      font-weight: 600;
  }

    .side_title {
      font-weight: 600;
      margin-bottom: 14px;
      font-size: 0.9rem;
      color: #212529;
      text-transform:uppercase;
    }

    /* Meeting toggle buttons */
    .meeting_toggle {
      display: flex;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      overflow: hidden;
    }

    .meeting_toggle button {
      flex: 1;
      padding: 6px;
      border: none;
      background: #f8f9fa;
      font-size: 0.85rem;
      cursor: pointer;
    }

    .meeting_toggle button.active {
      background: var(--primary);
      color: #fff;
    }

    .custom_budget .input-group-text {
      background: #f1f3f5;
      font-weight: 600;
      font-size:14px;
    }
    .custom_budget input {border-top-left-radius : 0 !important; border-bottom-left-radius: 0 !important;}


    .form-control {
      border-radius: 8px;
      font-size: 0.85rem;
    }

    .form-control:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(13,110,253,.1);
    }

      `}</style>
    </>
  );
};

export default ScheduleInterview;