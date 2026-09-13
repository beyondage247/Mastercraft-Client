import { Modal, Tabs } from "antd";
import { useNavigate } from "react-router-dom";
import AdminProjectTable from "./AdminProjectTable";
import type { ClientRecord } from "../services/portalApi";
import type { ProjectListItem } from "../data/portal";
import { formatMoney, type ClientPaymentTotals } from "../utils/clientPaymentTotals";

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
  paymentTotals?: ClientPaymentTotals;
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
  paymentTotals,
  projects,
  staffAssignmentText,
}: AdminClientDetailModalProps) {
  const navigate = useNavigate();

  return (
    <Modal
      footer={null}
      maskClosable={false}
      onCancel={onCancel}
      open={open}
      style={{ maxWidth: "calc(100vw - 32px)" }}
      title={
        client ? (
          <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", paddingRight: "32px" }}>
            <span>{client.name}</span>
            <button
              className="secondary-action-btn"
              onClick={() => {
                onCancel();
                navigate(`/admin/clients/${client.id}/portal-view`);
              }}
              type="button"
            >
              View Customer Portal
            </button>
          </div>
        ) : (
          "Client details"
        )
      }
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
                  <div>
                    <span>Total Paid</span>
                    <strong>{formatMoney(paymentTotals?.paid ?? 0)}</strong>
                  </div>
                  <div>
                    <span>Amount Owed</span>
                    <strong style={paymentTotals && paymentTotals.owed > 0 ? { color: "var(--danger, #dc2626)" } : undefined}>
                      {formatMoney(paymentTotals?.owed ?? 0)}
                    </strong>
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
