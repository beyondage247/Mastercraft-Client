import { Dropdown, type MenuProps } from "antd";
import type { ProjectListItem } from "../data/portal";
import ProgressBar from "./ProgressBar";
import { PortalIcon } from "./PortalIcon";
import StatusBadge from "./StatusBadge";
import { projectStatusTone } from "../utils/projectStatus";

type AdminProjectTableProps = {
  emptyMessage?: string;
  error?: string;
  isLoading?: boolean;
  onCreateQuote: (project: ProjectListItem) => void;
  onRecordPayment?: (project: ProjectListItem) => void;
  onEdit: (project: ProjectListItem) => void;
  onView: (project: ProjectListItem) => void;
  projects: ProjectListItem[];
};

function AdminProjectTable({
  emptyMessage = "No projects have been created yet.",
  error,
  isLoading = false,
  onCreateQuote,
  onRecordPayment,
  onEdit,
  onView,
  projects,
}: AdminProjectTableProps) {
  function actionMenu(project: ProjectListItem): MenuProps {
    return {
      items: [
        { key: "view", label: "View" },
        { key: "edit", label: "Edit" },
        { key: "create-quote", label: "Create quote" },
        ...(onRecordPayment ? [{ key: "record-payment", label: "Record payment" }] : []),
      ],
      onClick: ({ key }) => {
        if (key === "view") {
          onView(project);
          return;
        }

        if (key === "edit") {
          onEdit(project);
          return;
        }

        if (key === "record-payment") {
          onRecordPayment?.(project);
          return;
        }

        onCreateQuote(project);
      },
    };
  }

  return (
    <div className="admin-project-table-wrap">
      <div className="admin-record-table admin-record-table--projects">
      <div className="admin-record-table__head">
        <span>Project</span>
        <span>Client</span>
        <span>Location</span>
        <span>Estimated Completion</span>
        <span>Fabrication</span>
        <span>Status</span>
        <span>Action</span>
      </div>
      {isLoading ? (
        <div className="admin-empty-row">Loading projects...</div>
      ) : error ? (
        <div className="admin-empty-row">{error}</div>
      ) : projects.length ? (
        projects.map((project) => {
          const fabrication = project.fabrication ?? project.progress;

          return (
            <article className="admin-record-table__row" key={project.id}>
              <strong>{project.title}</strong>
              <span>{project.clientName || "Not set"}</span>
              <span>{project.location || "Not set"}</span>
              <span>{project.estimatedCompletion || project.dueDate || "Not set"}</span>
              <span className="admin-project-progress-cell">
                <strong>{fabrication}%</strong>
                <ProgressBar value={fabrication} />
              </span>
              <StatusBadge tone={projectStatusTone(project.status)}>{project.status}</StatusBadge>
              <span>
                <Dropdown menu={actionMenu(project)} placement="bottomRight">
                  <button className="table-action-button" type="button">
                    <span>Actions</span>
                    <PortalIcon name="down" />
                  </button>
                </Dropdown>
              </span>
            </article>
          );
        })
      ) : (
        <div className="admin-empty-row">{emptyMessage}</div>
      )}
      </div>
    </div>
  );
}

export default AdminProjectTable;
