import { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { MessageSquare, Pencil, User2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const ApplyModal = ({ show, onClose, jobData }) => {
  const fileRef = useRef();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false); //  loader

  useEffect(() => {
    if (show) {
      console.log(" Job Data:", jobData);
    }
  }, [show, jobData]);

  const [step, setStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [questionErrors, setQuestionErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cover: "",
  });

  const [answers, setAnswers] = useState({});
  const [resumeOption, setResumeOption] = useState("existing");
  const [resume, setResume] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // const existingResume = user?.profile?.resume || "";
  const existingResume = localStorage.getItem("user_resume") || user?.profile?.resume || "";

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

  useEffect(() => {
    if (show) {
      setStep(1);
      setIsEditing(false);

      setForm({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.profile?.phone || "",
        cover: "",
      });

      setAnswers({});
      setResume(null);
      setPreviewUrl("");
      setResumeOption(existingResume ? "existing" : "new");

      if (fileRef.current) fileRef.current.value = null;
    }
  }, [show, user]);

  if (!show) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAnswerChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setQuestionErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleUploadClick = () => fileRef.current.click();

  const handleResume = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF allowed");
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

  const validateStep2 = () => {
    const questions = jobData?.questions || [];
    const errs = {};

    for (let q of questions) {
      if (q?.pivot?.is_required === 1 && !answers[q.id]) {
        errs[q.id] = `This answer is required.`;
      }
    }

    setQuestionErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (step === 2 && !validateStep2()) return;

    if (isEditing) {
      setStep(3);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const goToStep = (stepNumber) => {
    setStep(stepNumber);
    setIsEditing(true);
  };

  // ✅ FINAL API INTEGRATION (FIXED)
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      // ✅ required
      formData.append("job_id", jobData.id);
      formData.append("cover_letter", form.cover);

      // ✅ answers format FIX
      Object.keys(answers).forEach((key) => {
        formData.append(`answers[${key}]`, answers[key]);
      });

      // ✅ resume
      if (resumeOption === "new" && resume) {
        formData.append("resume", resume);
      }

      console.log("🚀 Final Payload:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = await api.post("/jobs/apply", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res?.data?.message || "Application submitted successfully!");
      onClose();

    } catch (err) {
      console.error(err);

      if (err?.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        toast.error(firstError);
      } else {
        toast.error("Something went wrong");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom_modal">
      <div className="modal_overlay"></div>

      <div className="modal_content">

        {/* HEADER */}
        <div className="modal_header">
          <h5 className="fw-semibold mb-0">Apply for {jobData.title}</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        {/* BODY */}
       <div className="modal_body">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="mb-3">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.phone}
                  readOnly
                />
              </div>

              {/* RESUME */}
              <div className="mb-3">
                <label className="form-label">Resume</label>

                {/* ✅ If existing resume available */}
                {existingResume && (
                  <div className="mb-2">
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="resume_existing"
                        checked={resumeOption === "existing"}
                        onChange={() => setResumeOption("existing")}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="resume_existing"
                      >
                        Attach existing resume
                      </label>
                    </div>

                    {resumeOption === "existing" && (
                      <div className="resume_preview mt-2">
                        <a
                          href={existingResume}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-secondary"
                        >
                          View Resume
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ Upload new */}
                <div className="form-check mb-2">
                  <input
                    type="radio"
                    className="form-check-input"
                    id="resume_new"
                    checked={resumeOption === "new"}
                    onChange={() => setResumeOption("new")}
                  />
                  <label className="form-check-label" htmlFor="resume_new">
                    Upload new resume
                  </label>
                </div>

                {resumeOption === "new" && (
                  <>
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
                          <p className="mb-1 fw-semibold">
                            Click to upload Resume
                          </p>
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
                  </>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Cover Letter </label>
                <textarea
                  name="cover"
                  className="form-control"
                  value={form.cover}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {/* STEP 2 (DYNAMIC QUESTIONS) */}
          {step === 2 && (
            <>
              {jobData?.questions?.map((q, index) => (
                <div className="mb-3" key={q.id}>
                  <label
                    className="form-label"
                    htmlFor={`q_${q.id}_${q.type === "radio" ? q.options?.[0] : "input"}`}
                  >
                    {index + 1}) {q.question}
                    {q?.pivot?.is_required === 1 && (
                      <span className="text-danger"> *</span>
                    )}
                  </label>

                  {/* RADIO */}
                  {q.type === "radio" &&
                    q.options.map((opt, i) => (
                      <div className="form-check" key={i}>
                        <input
                          type="radio"
                          className="form-check-input"
                          id={`q_${q.id}_${opt}`}
                          name={`q_${q.id}`}
                          checked={answers[q.id] === opt}
                          onChange={() => handleAnswerChange(q.id, opt)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`q_${q.id}_${opt}`}
                        >
                          {opt}
                        </label>
                      </div>
                    ))}

                  {/* SELECT */}
                  {q.type === "select" && (
                    <select
                      id={`q_${q.id}_input`}
                      className="form-select"
                      value={answers[q.id] || ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    >
                      <option value="">Select</option>
                      {q.options.map((opt, i) => (
                        <option key={i}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {/* TEXTAREA */}
                  {q.type === "textarea" && (
                    <textarea
                      id={`q_${q.id}_input`}
                      className="form-control"
                      value={answers[q.id] || ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                  )}

                  {/* Inline error */}
                  {questionErrors[q.id] && (
                    <div className="text-danger small mt-1">
                      {questionErrors[q.id]}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* STEP 3 (REVIEW) */}
          {step === 3 && (
            <div className="review_wrapper">
              {/* BASIC DETAILS */}
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
                    <span>Name :</span>
                    <strong>{form.name}</strong>
                  </div>
                  <div className="review_row">
                    <span>Email :</span>
                    <strong>{form.email}</strong>
                  </div>
                  <div className="review_row">
                    <span>Phone :</span>
                    <strong>{form.phone}</strong>
                  </div>
                  <div className="review_row column">
                    <span>Cover letter :</span>
                    <p>{form.cover || "-"}</p>
                  </div>
                  <div className="review_row">
                    <span className="me-1">Resume :</span>
                    <strong>
                      {resumeOption === "existing"
                        ? existingResume
                          ? existingResume.split("/").pop()
                          : "-"
                        : resume
                          ? resume.name
                          : "-"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* QUESTIONS */}
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
                  {jobData?.questions?.map((q, index) => (
                    <div className="review_qa" key={q.id}>
                      <p className="question">
                        {index + 1}) {q.question}
                      </p>
                      <p className="answer">{answers[q.id] || "-"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="modal_footer">
          {step !== 1 ? (
            <button className="btn btn-secondary" onClick={prevStep}>
              Back
            </button>
          ) : <div></div>}

          {step < 3 && (
            <button className="btn btn-primary" onClick={nextStep}>
              {isEditing ? "Review" : "Next"}
            </button>
          )}

          {step === 3 && (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ApplyModal;