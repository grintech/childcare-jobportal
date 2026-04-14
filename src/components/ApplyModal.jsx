import { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { MessageSquare, Pencil, User2 } from "lucide-react";
import toast from "react-hot-toast";

const ApplyModal = ({ show, onClose, jobData }) => {
  const fileRef = useRef();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false); // ⭐ important

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cover: "",
    q1: "",
    q2: "",
    q3: "",
  });

  const [resume, setResume] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Autofill
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user?.name || "",
        email: user?.email || "",
         phone: user?.profile?.phone || "", 
      }));
    }
  }, [user]);

  // Reset on open
  useEffect(() => {
    if (show) {
      setStep(1);
      setIsEditing(false);

      setForm({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.profile?.phone || "",
        cover: "",
        q1: "",
        q2: "",
        q3: "",
      });

      setResume(null);
      setPreviewUrl("");

      if (fileRef.current) fileRef.current.value = null;
    }
  }, [show]);

  if (!show) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUploadClick = () => fileRef.current.click();

  const handleResume = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF allowed");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResume(file);
  };

  const removeResume = () => {
    setPreviewUrl("");
    setResume(null);
    fileRef.current.value = null;
  };

  const nextStep = () => {
    if (isEditing) {
      setStep(3); //  go back to review directly
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const goToStep = (stepNumber) => {
    setStep(stepNumber);
    setIsEditing(true); //  mark editing mode
  };

  return (
    <div className="custom_modal">
      <div className="modal_overlay"></div>

      <div className="modal_content">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-semibold">Apply for {jobData.title}</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        {/* STEP TEXT */}
        {/* <div className="mb-3 text-center text_blue fw-semibold">
          <span>Step {step} of 3</span>
        </div> */}

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <>
            <div className="mb-3">
              <label className="form-label">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                readOnly
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                readOnly
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Phone <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={form.phone}
                onChange={handleChange}
                readOnly
              />
            </div>

            {/* RESUME */}
            <div className="mb-3">
              <label className="form-label">Upload Resume</label>

              <input
                type="file"
                accept="application/pdf"
                ref={fileRef}
                onChange={handleResume}
                style={{ display: "none" }}
              />

              {!resume ? (
                <div className="upload_box" onClick={handleUploadClick}>
                  <div className="upload_content">
                     <i className="fa-solid fa-cloud-arrow-up upload_icon"></i>
                      <p className="mb-1 fw-semibold">Click to upload Resume</p>
                      <small>PDF only, max size 2MB</small>
                  </div>
                </div>
              ) : (
                <div className="resume_preview">
                  <p className="small">{resume.name}</p>
                  <div className="d-flex gap-2">
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-secondary"
                    >
                      Preview
                    </a>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={removeResume}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* COVER */}
            <div className="mb-3">
              <label className="form-label">
                Cover Letter <span className="text-danger">*</span>
              </label>
              <textarea
                name="cover"
                className="form-control"
                value={form.cover}
                onChange={handleChange}
                placeholder="Write here..."
              />
            </div>
          </>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <>
            <div className="mb-3">
              <label className="form-label">Why should we hire you?</label>
              <input
                type="text"
                name="q1"
                className="form-control"
                value={form.q1}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Your experience?</label>
              <input
                type="text"
                name="q2"
                className="form-control"
                value={form.q2}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Availability?</label>
              <input
                type="text"
                name="q3"
                className="form-control"
                value={form.q3}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <div className="review_wrapper">
            {/* -------- BASIC DETAILS -------- */}
            <div className="review_block">
              <div className="review_header">
                <div className="d-flex align-items-center gap-2">
                  <User2 size={18} />
                  <span>Basic details</span>
                </div>

                <button className="edit_btn" onClick={() => goToStep(1)}>
                  <Pencil size={16} />
                </button>
              </div>

              <div className="review_body">
                <div className="review_row">
                  <span>Name</span>
                  <strong>{form.name || "-"}</strong>
                </div>

                <div className="review_row">
                  <span>Email</span>
                  <strong>{form.email || "-"}</strong>
                </div>

                <div className="review_row">
                  <span>Phone</span>
                  <strong>{form.phone || "-"}</strong>
                </div>

                <div className="review_row column">
                  <span>Cover letter</span>
                  <p>{form.cover || "-"}</p>
                </div>
              </div>
            </div>

            {/* -------- QUESTIONS -------- */}
            <div className="review_block">
              <div className="review_header">
                <div className="d-flex align-items-center gap-2">
                  <MessageSquare size={18} />
                  <span>Questions</span>
                </div>

                <button className="edit_btn" onClick={() => goToStep(2)}>
                  <Pencil size={16} />
                </button>
              </div>

              <div className="review_body">
                <div className="review_qa">
                  <p className="question">Why should we hire you?</p>
                  <p className="answer">{form.q1 || "-"}</p>
                </div>

                <div className="review_qa">
                  <p className="question">Your experience?</p>
                  <p className="answer">{form.q2 || "-"}</p>
                </div>

                <div className="review_qa">
                  <p className="question">Availability?</p>
                  <p className="answer">{form.q3 || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= FOOTER ================= */}
        <div className="d-flex justify-content-between mt-4">
          {step !== 1 ? (
            <button className="btn btn-secondary" onClick={prevStep}>
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 && (
            <button className="btn btn-primary" onClick={nextStep}>
              {isEditing ? "Review" : "Next"}
            </button>
          )}

          {step === 3 && (
            <button
              className="btn btn-primary"
              onClick={() => {toast.success("Job Applied successfully!"), onClose()}}
            >
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;
