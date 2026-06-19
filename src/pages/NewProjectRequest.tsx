import React, { useState } from "react";
// New Project Request Page Component
import { useNavigate } from "react-router-dom";
import StepIndicator from "../components/StepIndicator";
import { PortalIcon } from "../components/PortalIcon";
import type { PortalIconName } from "../components/PortalIcon";
import { documentUploadLimitText } from "../utils/uploadLimits";

type Step = {
  label: string;
  icon: PortalIconName;
};

type ProjectRequestFormData = {
  dimensions: string;
  files: File[];
  finish: string;
  materialType: string;
  projectDescription: string;
  projectName: string;
  siteAddress: string;
};

type ProjectRequestField = keyof Omit<ProjectRequestFormData, "files">;

type ProjectRequestChangeEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

type ProjectRequestChangeHandler = (event: ProjectRequestChangeEvent) => void;

const STEPS: Step[] = [
  { label: "Project Details", icon: "activeProjects" },
  { label: "Specifications", icon: "tool" },
  { label: "File Upload", icon: "file" },
  { label: "Review", icon: "review" },
];

function NewProjectRequest() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProjectRequestFormData>({
    projectName: "",
    siteAddress: "",
    projectDescription: "",
    materialType: "",
    finish: "",
    dimensions: "",
    files: [] as File[],
  });

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleInputChange: ProjectRequestChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as ProjectRequestField]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepProjectDetails data={formData} onChange={handleInputChange} />
        );
      case 1:
        return (
          <StepSpecifications data={formData} onChange={handleInputChange} />
        );
      case 2:
        return (
          <StepFileUpload
            data={formData}
            onFilesChange={(files) =>
              setFormData((prev) => ({ ...prev, files }))
            }
          />
        );
      case 3:
        return (
          <StepReview data={formData} onEdit={(step) => setCurrentStep(step)} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>New Project Request</h1>
          <p>Millwork Fabrication Portal</p>
        </div>
      </div>

      <StepIndicator currentStep={currentStep} steps={STEPS} />

      <div className="form-container panel">
        {renderStep()}

        <div className="form-actions">
          <button
            className="secondary-action-btn"
            onClick={prevStep}
            disabled={currentStep === 0}
            type="button"
          >
            <PortalIcon name="right" className="icon-flip" />
            <span>Previous</span>
          </button>
          {currentStep === STEPS.length - 1 ? (
            <button
              className="primary-action-btn submit-btn"
              type="button"
              onClick={() => navigate("/projects")}
            >
              <span>Submit Request</span>
            </button>
          ) : (
            <button
              className="primary-action-btn"
              type="button"
              onClick={nextStep}
            >
              <span>Next</span>
              <PortalIcon name="right" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-components (Simplified for now, will refine styles later)

function StepProjectDetails({
  data,
  onChange,
}: {
  data: ProjectRequestFormData;
  onChange: ProjectRequestChangeHandler;
}) {
  return (
    <div className="step-content">
      <div className="step-header">
        <h3>Project Details</h3>
        <p>Provide the basic details and location for the project.</p>
      </div>
      <div className="form-group">
        <label htmlFor="projectName">Project Name *</label>
        <input
          id="projectName"
          name="projectName"
          placeholder="e.g Downtown Lobby Renovation"
          type="text"
          value={data.projectName}
          onChange={onChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="siteAddress">Site Address *</label>
        <input
          id="siteAddress"
          name="siteAddress"
          placeholder="e.g 123 Main Street"
          type="text"
          value={data.siteAddress}
          onChange={onChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="projectDescription">Project Description</label>
        <textarea
          id="projectDescription"
          name="projectDescription"
          placeholder="Brief overview of the project scope and requirements..."
          value={data.projectDescription}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function StepSpecifications({
  data,
  onChange,
}: {
  data: ProjectRequestFormData;
  onChange: ProjectRequestChangeHandler;
}) {
  return (
    <div className="step-content">
      <div className="step-header">
        <h3>Specifications</h3>
        <p>Specify materials, finishes, and physical dimensions.</p>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="materialType">Material Type *</label>
          <select
            id="materialType"
            name="materialType"
            value={data.materialType}
            onChange={onChange}
          >
            <option value="">Select Material</option>
            <option value="Maple">Maple</option>
            <option value="Oak">Oak</option>
            <option value="Steel">Steel</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="finish">Finish *</label>
          <select
            id="finish"
            name="finish"
            value={data.finish}
            onChange={onChange}
          >
            <option value="">Select Finish</option>
            <option value="Natural">Natural</option>
            <option value="Stained">Stained</option>
            <option value="Polished">Polished</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="dimensions">Dimensions (L x W x H) *</label>
        <input
          id="dimensions"
          name="dimensions"
          placeholder='e.g 120" X 36" X 84"'
          type="text"
          value={data.dimensions}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function StepFileUpload({
  data,
  onFilesChange,
}: {
  data: ProjectRequestFormData;
  onFilesChange: (files: File[]) => void;
}) {
  const selectedFileText =
    data.files.length === 1
      ? data.files[0].name
      : data.files.length > 1
        ? `${data.files.length} files selected`
        : "No files selected";

  return (
    <div className="step-content">
      <div className="step-header">
        <h3>File Upload</h3>
        <p>Upload CAD files, drawings, and project plans.</p>
      </div>
      <div className="upload-zone">
        <div className="upload-zone__inner">
          <PortalIcon name="download" className="upload-icon" />
          <h4>Upload CAD Files & Plans</h4>
          <p>Drag and drop files here, or click to browse</p>
          <label className="select-files-btn">
            <input
              multiple
              type="file"
              onChange={(event) =>
                onFilesChange(Array.from(event.target.files ?? []))
              }
            />
            <span>Select Files</span>
          </label>
        </div>
        <p className="upload-hint">
          Supported formats: DWG, DXF, PDF, JPG, PNG (Max {documentUploadLimitText()} each)
        </p>
        <p className="upload-hint">{selectedFileText}</p>
      </div>
    </div>
  );
}

function StepReview({
  data,
  onEdit,
}: {
  data: ProjectRequestFormData;
  onEdit: (step: number) => void;
}) {
  return (
    <div className="step-content">
      <div className="step-header">
        <h3>Review</h3>
        <p>Review all information before submitting your request.</p>
      </div>
      <div className="review-section">
        <div className="review-section__header">
          <div className="review-section__title">
            <PortalIcon name="activeProjects" />
            <span>Project Details</span>
          </div>
          <button className="edit-btn" onClick={() => onEdit(0)}>
            Edit
          </button>
        </div>
        <div className="review-grid">
          <div className="review-item">
            <label>Project Name:</label>
            <p>{data.projectName || "Not specified"}</p>
          </div>
          <div className="review-item">
            <label>Site Address:</label>
            <p>{data.siteAddress || "Not specified"}</p>
          </div>
          <div className="review-item">
            <label>Description:</label>
            <p>{data.projectDescription || "Not specified"}</p>
          </div>
        </div>
      </div>

      <div className="review-section">
        <div className="review-section__header">
          <div className="review-section__title">
            <PortalIcon name="tool" />
            <span>Specifications</span>
          </div>
          <button className="edit-btn" onClick={() => onEdit(1)}>
            Edit
          </button>
        </div>
        <div className="review-grid review-grid--two">
          <div className="review-item">
            <label>Material:</label>
            <p>{data.materialType || "Not specified"}</p>
          </div>
          <div className="review-item">
            <label>Finish:</label>
            <p>{data.finish || "Not specified"}</p>
          </div>
          <div className="review-item">
            <label>Dimensions:</label>
            <p>{data.dimensions || "Not specified"}</p>
          </div>
        </div>
      </div>

      <div className="review-section">
        <div className="review-section__header">
          <div className="review-section__title">
            <PortalIcon name="file" />
            <span>Documents</span>
          </div>
          <button className="edit-btn" onClick={() => onEdit(2)}>
            Edit
          </button>
        </div>
        <div className="file-list">
          <p className="no-files">No files uploaded</p>
        </div>
      </div>
    </div>
  );
}

export default NewProjectRequest;
