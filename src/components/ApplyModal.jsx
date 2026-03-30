import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const ApplyModal = ({ show, onClose, jobId }) => {
  const fileRef = useRef();
  const { user } = useAuth();

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

    // clear resume
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setResume(null);

    // clear file input
    if (fileRef.current) fileRef.current.value = null;
  }
}, [show, jobId]);


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

    toast.success("Resume uploaded");
  };

  const removeResume = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setResume(null);
    fileRef.current.value = null;
  };

 const handleSubmit = () => {
  if (!form.name || !form.email || !form.cover || !resume) {
    toast.error("Please fill all fields");
    return;
  }

  const payload = {
    job_id: jobId,
    name: form.name,
    email: form.email,
    cover_letter: form.cover,
    resume: resume,
  };

  console.log("Payload:", payload); 

  toast.success("Application submitted successfully!");

  onClose();
};

  return (
    <div className="custom_modal">
      <div className="modal_overlay" ></div>

      <div className="modal_content">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-semibold">Apply Job </h4>
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
            Upload Resume <span className="text-danger">*</span>
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

        {/* BUTTON */}
        <div className="text-end">
          <button className="btn btn-primary" 
           onClick={handleSubmit}
           disabled={!form.cover || !resume}
          >
            Submit Application
          </button>
        </div>

      </div>
    </div>
  );
};

export default ApplyModal;