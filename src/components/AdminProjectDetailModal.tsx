import { Modal, Tabs } from "antd";
import { useEffect, useState } from "react";
import type { ProjectListItem, ProjectStageItem, ProjectStageType, QuoteListItem } from "../data/portal";
import { getQuotesForProject } from "../services/portalApi";
import { projectStatusTone } from "../utils/projectStatus";
import AdminQuoteDetailModal from "./AdminQuoteDetailModal";
import AdminQuoteModal from "./AdminQuoteModal";
import AdminQuoteTable from "./AdminQuoteTable";
import ProgressBar from "./ProgressBar";
import ProjectAttachmentsPanel from "./ProjectAttachmentsPanel";
import ProjectCommentsPanel from "./ProjectCommentsPanel";
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
  onProjectUpdated?: (project: ProjectListItem) => void;
  open: boolean;
  project: ProjectListItem | null;
};

function AdminProjectDetailModal({ onClose, onProjectUpdated, open, project }: AdminProjectDetailModalProps) {
  const fabrication = project ? project.fabrication ?? project.progress : 0;
  const assignedStaffName = project?.assignedStaffName || "Not assigned";
  const assignedStaffEmail = project?.assignedStaffEmail || "";
  const [editingQuote, setEditingQuote] = useState<QuoteListItem | null>(null);
  const [error, setError] = useState("");
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [viewingQuote, setViewingQuote] = useState<QuoteListItem | null>(null);

  useEffect(() => {
    if (!open || !project) {
      setQuotes([]);
      return;
    }

    let isMounted = true;
    setIsLoadingQuotes(true);
    setError("");
    getQuotesForProject(project.id)
      .then((projectQuotes) => {
        if (isMounted) {
          setQuotes(projectQuotes);
        }
      })
      .catch((requestError: Error) => {
        if (isMounted) {
          setError(requestError.message || "Unable to load quotes for this project.");
          setQuotes([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingQuotes(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open, project]);

  function handleQuoteSaved(savedQuote: QuoteListItem) {
    setQuotes((current) => {
      const exists = current.some((quote) => quote.id === savedQuote.id);

      return exists
        ? current.map((quote) => (quote.id === savedQuote.id ? savedQuote : quote))
        : [savedQuote, ...current];
    });
    setEditingQuote(null);
  }

  return (
    <Modal
      footer={null}
      onCancel={onClose}
      open={open}
      title={project?.title || "Project details"}
      width={1120}
    >
      {project ? (
        <>
          <Tabs
            items={[
              {
                key: "details",
                label: "Details",
                children: (
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
                        <span>Staff</span>
                        <strong>{assignedStaffEmail ? `${assignedStaffName} (${assignedStaffEmail})` : assignedStaffName}</strong>
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
                ),
              },
              {
                key: "documents",
                label: "Documents",
                children: (
                  <ProjectAttachmentsPanel
                    canUpload
                    onProjectUpdated={onProjectUpdated}
                    project={project}
                  />
                ),
              },
              {
                key: "comments",
                label: "Comments",
                children: <ProjectCommentsPanel project={project} />,
              },
              {
                key: "quotes",
                label: "Quotes",
                children: (
                  <AdminQuoteTable
                    emptyMessage="No quotes have been created for this project yet."
                    error={error}
                    isLoading={isLoadingQuotes}
                    onEdit={setEditingQuote}
                    onView={setViewingQuote}
                    quotes={quotes}
                  />
                ),
              },
            ]}
          />
          <AdminQuoteDetailModal
            onClose={() => setViewingQuote(null)}
            open={Boolean(viewingQuote)}
            quote={viewingQuote}
          />
          <AdminQuoteModal
            mode="edit"
            onClose={() => setEditingQuote(null)}
            onSaved={handleQuoteSaved}
            open={Boolean(editingQuote)}
            project={project}
            quote={editingQuote}
          />
        </>
      ) : null}
    </Modal>
  );
}

export default AdminProjectDetailModal;
