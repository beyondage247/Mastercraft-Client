import { Modal, Tabs } from "antd";
import AdminProjectTable from "./AdminProjectTable";
import type { ClientRecord } from "../services/portalApi";
import type { ProjectListItem } from "../data/portal";

type AdminClientDetailModalProps = {
  client: ClientRecord | null;
  isLoadingProjects: boolean;
  onCancel: () => void;
  onCreateQuote?: (project: ProjectListItem) => void;
  onDeleteProject?: (project: ProjectListItem) => void;
  onEditProject?: (project: ProjectListItem) => void;
  onMarkProjectCompleted?: (project: ProjectListItem) => void;
  onViewProject?: (project: ProjectListItem) => void;
  open: boolean;
  projects: ProjectListItem[];
  staffAssignmentText: string;
};

function AdminClientDetailModal({
  client,
  isLoadingProjects,
  onCancel,
  onCreateQuote,
  onDeleteProject,
  onEditProject,
  onMarkProjectCompleted,
  onViewProject,
  open,
  projects,
  staffAssignmentText,
}: AdminClientDetailModalProps) {
  return (
    <Modal
      footer={null}
      maskClosable={false}
      onCancel={onCancel}
      open={open}
      style={{ maxWidth: "calc(100vw - 32px)" }}
      title={client?.name || "Client details"}
      width={1320}
    >
      {client ? (
        <Tabs
          items={[
            {
              key: "details",
              label: "Detail",
              children: (
                <div className="admin-detail-grid">
                  <div>
                    <span>Name</span>
                    <strong>{client.name}</strong>
                  </div>
                  <div>
                    <span>Company</span>
                    <strong>{client.company || "Not set"}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{client.email || "Not set"}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{client.phone || "Not set"}</strong>
                  </div>
                  <div>
                    <span>Contact</span>
                    <strong>{client.contactName || "Not set"}</strong>
                  </div>
                  <div>
                    <span>Additional email</span>
                    <strong>{client.additionalEmail || "Not set"}</strong>
                  </div>
                  <div>
                    <span>Credit</span>
                    <strong>{client.clientCredit || "Not set"}</strong>
                  </div>
                  <div>
                    <span>Team Project</span>
                    <strong>{staffAssignmentText}</strong>
                  </div>
                </div>
              ),
            },
            {
              key: "projects",
              label: "Projects",
              children: isLoadingProjects ? (
                <p className="admin-empty-copy">Loading projects...</p>
              ) : projects.length ? (
                <AdminProjectTable
                  emptyMessage="No projects have been attached to this client yet."
                  onCreateQuote={onCreateQuote}
                  onDelete={onDeleteProject}
                  onEdit={onEditProject}
                  onMarkCompleted={onMarkProjectCompleted}
                  onView={onViewProject}
                  projects={projects}
                />
              ) : (
                <p className="admin-empty-copy">
                  No projects have been attached to this client yet.
                </p>
              ),
            },
          ]}
        />
      ) : null}
    </Modal>
  );
}

export default AdminClientDetailModal;
