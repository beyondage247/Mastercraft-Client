import { Modal } from "antd";
import type { ProjectListItem, ProjectStageItem, ProjectStageType } from "../data/portal";
import { projectStatusTone } from "../utils/projectStatus";
import ProgressBar from "./ProgressBar";
import StatusBadge from "./StatusBadge";

const stageLabels: Record<ProjectStageType, string> = {
  BUILD_ASSEMBLE: "Build/Assemble",
  DELIVERY: "Delivery",
  FINISHING: "Finishing",
  INSTALL: "Install",
  MIL: "MIL",
};

function stageLabel(stage: ProjectStageItem) {
  return stageLabels[stage.stage] || stage.stage;
}

type AdminProjectDetailModalProps = {
  onClose: () => void;
  open: boolean;
  project: ProjectListItem | null;
};

function AdminProjectDetailModal({ onClose, open, project }: AdminProjectDetailModalProps) {
  const fabrication = project ? project.fabrication ?? project.progress : 0;

  return (
    <Modal
      footer={null}
      onCancel={onClose}
      open={open}
      title={project?.title || "Project details"}
      width={920}
    >
      {project ? (
        <div className="admin-project-detail">
          <div className="admin-project-detail__hero">
            <div>
              <span>Fabrication progress</span>
              <strong>{fabrication}%</strong>
            </div>
            <ProgressBar value={fabrication} />
          </div>

          <div className="admin-detail-grid">
            <div>
              <span>Project</span>
              <strong>{project.title}</strong>
            </div>
            <div>
              <span>Client</span>
              <strong>{project.clientName || "Not set"}</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>{project.location || "Not set"}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>
                <StatusBadge tone={projectStatusTone(project.status)}>{project.status}</StatusBadge>
              </strong>
            </div>
            <div>
              <span>Start date</span>
              <strong>{project.startDate || "Not set"}</strong>
            </div>
            <div>
              <span>Estimated completion</span>
              <strong>{project.estimatedCompletion || project.dueDate || "Not set"}</strong>
            </div>
          </div>

          <div className="admin-project-detail__notes">
            <span>Description</span>
            <p>{project.description || "No project description has been added yet."}</p>
          </div>

          <div className="admin-project-stage-table">
            <div className="admin-project-stage-table__head">
              <span>Stage</span>
              <span>Budgeted</span>
              <span>Spent</span>
              <span>Progress</span>
              <span>Start</span>
            </div>
            {project.stages?.length ? (
              project.stages.map((stage) => (
                <article className="admin-project-stage-table__row" key={stage.id || stage.stage}>
                  <strong>{stageLabel(stage)}</strong>
                  <span>{stage.hoursBudgeted}h</span>
                  <span>{stage.hoursSpent}h</span>
                  <span className="admin-project-progress-cell">
                    <strong>{stage.progress}%</strong>
                    <ProgressBar value={stage.progress} />
                  </span>
                  <span>{stage.startDate || "Not set"}</span>
                </article>
              ))
            ) : (
              <div className="admin-empty-row">No stage details have been added yet.</div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export default AdminProjectDetailModal;
