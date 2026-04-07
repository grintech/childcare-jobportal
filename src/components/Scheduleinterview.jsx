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


  const { user, isAuthenticated } = useAuth();
  
    const canViewContact =
    isAuthenticated &&
    user?.role === "principal" &&
    user?.has_subscription;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate]);

  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  const handleSubmit = () => {
    if (!selectedDate) {
      toast.error("Please select a date.");
      return;
    }
    if (!selectedTime) {
      toast.error("Please select a time slot.");
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      toast.success("Interview scheduled successfully!");
      onClose();
    }, 1200);
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

                <div className="col-12 col-md-6">
                  <h6 className="schedule_section_label mb-3">
                    <CalIcon size={15} className="me-1" />
                    Select Date <span className="text-danger">*</span>
                  </h6>

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
                </div>

                <div className="col-12 col-md-6 d-flex flex-column">

                  <h6 className="schedule_section_label mb-3">
                    <Clock size={15} className="me-1" />
                    Select Time <span className="text-danger">*</span>
                  </h6>

                  {!selectedDate ? (
                    <div className="schedule_time_placeholder mb-3">
                      <Clock size={24} className="mb-2 opacity-25" />
                      <span>Pick a date first</span>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="schedule_time_placeholder mb-3">
                      <span>No slots available for today</span>
                    </div>
                  ) : (
                    <div className="time-grid mb-4">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          className={`time-btn ${selectedTime === time ? "active" : ""}`}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto">
                    <h6 className="schedule_section_label mb-2">
                      Note{" "}
                      <span className="text-muted small fw-normal ms-1">(optional)</span>
                    </h6>
                    <textarea
                      className="form-control schedule_note"
                      rows={3}
                      placeholder="Add an additional note.."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
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
      `}</style>
    </>
  );
};

export default ScheduleInterview;