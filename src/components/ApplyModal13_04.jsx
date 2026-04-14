import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const ApplyModal = ({ show, onClose, jobData, onApplied}) => {
  const fileRef = useRef();
  const { user } = useAuth();
  // console.log(jobData)

  const [submitStatus, setSubmitStatus] = useState(null); 

const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    cover: "",
  });
  const [resume, setResume] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Auto-fill user data safely
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user?.name || "",
        email: user?.email || "",
      }));
    }
  }, [user]);

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
  if (show) {
    // reset form with fresh user data
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      cover: "",
    });

    // reset API states 
    setSubmitStatus(null);
    setSubmitting(false);

    // clear resume
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setResume(null);

    // clear file input
    if (fileRef.current) fileRef.current.value = null;
  }
}, [show, jobData]);


  if (!show) return null;

  const handleUploadClick = () => {
    fileRef.current.click();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResume = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max size is 2MB");
      return;
    }
    // cleanup old preview
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResume(file);

    // toast.success("Resume uploaded");
  };

  const removeResume = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setResume(null);
    fileRef.current.value = null;
  };

const handleSubmit = async () => {
  if (!form.name || !form.email || !form.cover) {
    setSubmitStatus({
      type: "error",
      message: "Please fill all required fields",
    });
    return;
  }

  try {
    setSubmitting(true);
    setSubmitStatus(null);

    const formData = new FormData();
    formData.append("job_id", jobData.id);
    formData.append("cover_letter", form.cover);

    if (resume) {
      formData.append("resume", resume);
    }

    const res = await api.post("/jobs/apply", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.status) {
      setSubmitStatus({
        type: "success",
        message: res.message || "Application submitted successfully!",
      });

      //  ADD THIS
      if (onApplied) {
        onApplied(jobData.job_id || jobData.id);
      }

      // optional: auto close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    }

  } catch (err) {
      if (err.errors) {
      const firstError = Object.values(err.errors)[0]?.[0];

      setSubmitStatus({
        type: "error",
        message: firstError || "Validation error",
      });
    } else {
      setSubmitStatus({
        type: "error",
        message: err.message || "Something went wrong",
      });
    }
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="custom_modal">
      <div className="modal_overlay" ></div>

      <div className="modal_content">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-semibold">Apply for {jobData.title} </h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        {/* NAME */}
        <div className="mb-3">
          <label className="form-label">
            Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={form.name}
            readOnly
          />
        </div>

        {/* EMAIL */}
        <div className="mb-3">
          <label className="form-label">
            Email <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={form.email}
            readOnly
          />
        </div>

        {/* RESUME */}
        <div className="mb-3">
          <label className="form-label">
            Upload Resume (optional)
          </label>

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
            <div className="resume_preview mb-3">
              <p className="mb-1 small">{resume.name}</p>

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

        {/* COVER LETTER */}
        <div className="mb-3">
          <label className="form-label">
            Cover Letter <span className="text-danger">*</span>
          </label>
          <textarea
            name="cover"
            className="form-control"
            placeholder="Write your cover letter..."
            value={form.cover}
            onChange={handleChange}
          />
        </div>

        {submitStatus && (
          <div
            className={`my-2 text-center text-${
              submitStatus.type === "success" ? "success" : "danger"
            } fw-semibold`}
          >
            {submitStatus.message}
          </div>
        )}

        {/* BUTTON */}
        <div className="text-end mt-3">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!form.cover || submitting}
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ApplyModal;