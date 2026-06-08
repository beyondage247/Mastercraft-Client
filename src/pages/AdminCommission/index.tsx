import { Modal, Pagination } from "antd";
import { useEffect, useMemo, useState } from "react";
import { getCurrentPortalUser } from "../../auth/session";
import PageHeader from "../../components/PageHeader";
import { PortalIcon } from "../../components/PortalIcon";
import StatusBadge from "../../components/StatusBadge";
import type { CommissionItem, CommissionStatus } from "../../data/portal";
import {
  applyCommissionUpdate,
  getCommissions,
  updateCommission,
} from "../../services/portalApi";
import { formatPortalDateOrFallback } from "../../utils/dateFormat";
import { showRequestToast } from "../../utils/portalToast";

type CommissionFormState = {
  percentageCommission: string;
  status: CommissionStatus;
};

const pageSize = 15;

const statusTone = {
  APPROVED_COMMISSION: "success",
  PAID: "info",
  QUOTED_COMMISSION: "warning",
} as const;

function statusLabel(status: CommissionStatus) {
  const labels: Record<CommissionStatus, string> = {
    APPROVED_COMMISSION: "APPROVED COMMISSION",
    PAID: "PAID",
    QUOTED_COMMISSION: "QUOTED COMMISSION",
  };

  return labels[status];
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(Number.isFinite(value) ? value : 0);
}

function dateValue(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function isCurrentMonth(value: string | undefined, now: Date) {
  const date = dateValue(value);

  return Boolean(date && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth());
}

function isCurrentYear(value: string | undefined, now: Date) {
  const date = dateValue(value);

  return Boolean(date && date.getFullYear() === now.getFullYear());
}

function dateText(value?: string) {
  return value ? formatPortalDateOrFallback(value) : "Not set";
}

function formFromCommission(commission: CommissionItem): CommissionFormState {
  return {
    percentageCommission: String(commission.percentageCommission),
    status: commission.status,
  };
}

function statusCanBeChangedByAdmin(status: CommissionStatus) {
  return status === "APPROVED_COMMISSION";
}

function AdminCommission() {
  const currentUser = getCurrentPortalUser();
  const isAdmin = currentUser?.role === "admin";
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [editingCommission, setEditingCommission] = useState<CommissionItem | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CommissionFormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [viewingCommission, setViewingCommission] = useState<CommissionItem | null>(null);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setError("");

    getCommissions()
      .then((data) => {
        if (isMounted) {
          setCommissions(data.commissions);
        }
      })
      .catch((requestError: Error) => {
        if (isMounted) {
          setCommissions([]);
          setError(requestError.message || "Unable to load commissions.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleCommissions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return commissions;
    }

    return commissions.filter((commission) =>
      [
        commission.projectName,
        commission.quoteName,
        commission.quoteReference,
        commission.clientName,
        commission.clientEmail,
        commission.clientCompany,
        commission.staffName,
        commission.staffEmail,
        commission.totalAmount,
        commission.commissionAmount,
        statusLabel(commission.status),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [commissions, search]);

  useEffect(() => {
    setPage(1);
  }, [commissions, search]);

  const paginatedCommissions = useMemo(
    () => visibleCommissions.slice((page - 1) * pageSize, page * pageSize),
    [page, visibleCommissions],
  );

  const summary = useMemo(() => {
    const now = new Date();
    const monthCommissions = commissions.filter((commission) => isCurrentMonth(commission.createdAt, now));
    const yearCommissions = commissions.filter((commission) => isCurrentYear(commission.createdAt, now));

    return {
      allTotal: formatMoney(commissions.reduce((sum, commission) => sum + commission.commissionAmountValue, 0)),
      approvedCount: commissions.filter((commission) => commission.status === "APPROVED_COMMISSION").length,
      monthTotal: formatMoney(
        monthCommissions.reduce((sum, commission) => sum + commission.commissionAmountValue, 0),
      ),
      paidCount: commissions.filter((commission) => commission.status === "PAID").length,
      quotedCount: commissions.filter((commission) => commission.status === "QUOTED_COMMISSION").length,
      yearTotal: formatMoney(
        yearCommissions.reduce((sum, commission) => sum + commission.commissionAmountValue, 0),
      ),
    };
  }, [commissions]);

  function openEdit(commission: CommissionItem) {
    setEditingCommission(commission);
    setForm(formFromCommission(commission));
  }

  function updateField<Field extends keyof CommissionFormState>(
    field: Field,
    value: CommissionFormState[Field],
  ) {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  }

  async function handleSaveCommission() {
    if (!editingCommission || !form) {
      return;
    }

    const percentageCommission = Number(form.percentageCommission);

    if (!Number.isFinite(percentageCommission) || percentageCommission < 0 || percentageCommission > 100) {
      setError("Percentage commission must be between 0 and 100.");
      return;
    }

    const toast = showRequestToast("commission-update", "Saving commission...");

    try {
      setIsSaving(true);
      const updatedCommission = await updateCommission(editingCommission, {
        percentageCommission,
        status: form.status,
      });

      setCommissions((current) =>
        current.map((commission) => (commission.id === editingCommission.id ? updatedCommission : commission)),
      );
      setEditingCommission(null);
      setForm(null);
      toast.success("Commission saved.");
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Unable to save commission.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  const editedPreview = editingCommission && form
    ? applyCommissionUpdate(editingCommission, {
        percentageCommission: Number(form.percentageCommission),
        status: form.status,
      })
    : null;

  return (
    <div className="page-stack admin-page">
      <PageHeader
        subtitle={
          isAdmin
            ? "Review staff commissions and mark approved payouts as paid"
            : "View commission earned from assigned clients"
        }
        title="Commission"
      />

      <section className="billing-metrics" aria-label="Commission summary">
        <article className="billing-metric billing-metric--featured">
          <div>
            <span>All commission</span>
            <strong>{summary.allTotal}</strong>
          </div>
          <span className="icon-tile icon-tile--danger">
            <PortalIcon name="dollar" />
          </span>
        </article>
        <article className="billing-metric">
          <div>
            <span>This year commission</span>
            <strong>{summary.yearTotal}</strong>
          </div>
          <span className="icon-tile icon-tile--success">
            <PortalIcon name="calendar" />
          </span>
        </article>
        <article className="billing-metric">
          <div>
            <span>This month commission</span>
            <strong>{summary.monthTotal}</strong>
          </div>
          <span className="icon-tile icon-tile--danger">
            <PortalIcon name="dollar" />
          </span>
        </article>
        <article className="billing-metric">
          <div>
            <span>Quoted commission status</span>
            <strong>{summary.quotedCount}</strong>
          </div>
          <span className="icon-tile icon-tile--warning">
            <PortalIcon name="clock" />
          </span>
        </article>
        <article className="billing-metric">
          <div>
            <span>Approved status</span>
            <strong>{summary.approvedCount}</strong>
          </div>
          <span className="icon-tile icon-tile--success">
            <PortalIcon name="check" />
          </span>
        </article>
        <article className="billing-metric">
          <div>
            <span>Paid status</span>
            <strong>{summary.paidCount}</strong>
          </div>
          <span className="icon-tile icon-tile--info">
            <PortalIcon name="check" />
          </span>
        </article>
      </section>

      <section className="panel admin-client-list">
        <div className="panel__header">
          <h2>Commission Table</h2>
          <span>{visibleCommissions.length} showing</span>
        </div>
        <label className="admin-table-search">
          <PortalIcon name="search" />
          <input
            aria-label="Search commissions"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search commission"
            type="search"
            value={search}
          />
        </label>
        <div className="admin-record-table admin-record-table--commission">
          <div className="admin-record-table__head">
            <span>Project</span>
            <span>Quote</span>
            <span>Client</span>
            <span>Staff</span>
            <span>Total Amount</span>
            <span>Percentage Commission</span>
            <span>Commission Amount</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {isLoading ? (
            <div className="admin-empty-row">Loading commissions...</div>
          ) : error ? (
            <div className="admin-empty-row">{error}</div>
          ) : visibleCommissions.length ? (
            paginatedCommissions.map((commission) => (
              <article className="admin-record-table__row" key={commission.id}>
                <strong>{commission.projectName}</strong>
                <span>
                  {commission.quoteName}
                  {commission.quoteReference ? <small>{commission.quoteReference}</small> : null}
                </span>
                <span>{commission.clientName}</span>
                <span>
                  {commission.staffName}
                  {commission.staffEmail ? <small>{commission.staffEmail}</small> : null}
                </span>
                <span>{commission.totalAmount}</span>
                <span>{commission.percentageCommission}%</span>
                <strong>{commission.commissionAmount}</strong>
                <span>
                  <StatusBadge tone={statusTone[commission.status]}>{statusLabel(commission.status)}</StatusBadge>
                </span>
                <span className="commission-action-cell">
                  <button className="table-action-button" onClick={() => setViewingCommission(commission)} type="button">
                    View
                  </button>
                  {isAdmin ? (
                    <button className="table-action-button" onClick={() => openEdit(commission)} type="button">
                      Edit
                    </button>
                  ) : null}
                </span>
              </article>
            ))
          ) : (
            <div className="admin-empty-row">No commissions have been generated yet.</div>
          )}
        </div>
        <Pagination
          className="admin-client-pagination"
          current={page}
          onChange={setPage}
          pageSize={pageSize}
          showSizeChanger={false}
          total={visibleCommissions.length}
        />
      </section>

      <Modal
        footer={null}
        onCancel={() => setViewingCommission(null)}
        open={Boolean(viewingCommission)}
        title={viewingCommission?.quoteName || "Commission detail"}
        width={900}
      >
        {viewingCommission ? (
          <div className="admin-detail-grid commission-detail-grid">
            <div>
              <span>Project</span>
              <strong>{viewingCommission.projectName}</strong>
            </div>
            <div>
              <span>Quote</span>
              <strong>{viewingCommission.quoteName}</strong>
            </div>
            <div>
              <span>Quote reference</span>
              <strong>{viewingCommission.quoteReference || "Not set"}</strong>
            </div>
            <div>
              <span>Client</span>
              <strong>{viewingCommission.clientName}</strong>
            </div>
            <div>
              <span>Client email</span>
              <strong>{viewingCommission.clientEmail || "Not set"}</strong>
            </div>
            <div>
              <span>Client company</span>
              <strong>{viewingCommission.clientCompany || "Not set"}</strong>
            </div>
            <div>
              <span>Staff</span>
              <strong>{viewingCommission.staffName}</strong>
            </div>
            <div>
              <span>Staff email</span>
              <strong>{viewingCommission.staffEmail || "Not set"}</strong>
            </div>
            <div>
              <span>Total amount</span>
              <strong>{viewingCommission.totalAmount}</strong>
            </div>
            <div>
              <span>Percentage commission</span>
              <strong>{viewingCommission.percentageCommission}%</strong>
            </div>
            <div>
              <span>Commission amount</span>
              <strong>{viewingCommission.commissionAmount}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{statusLabel(viewingCommission.status)}</strong>
            </div>
            <div>
              <span>Created</span>
              <strong>{dateText(viewingCommission.createdAt)}</strong>
            </div>
            <div>
              <span>Updated</span>
              <strong>{dateText(viewingCommission.updatedAt)}</strong>
            </div>
            <div>
              <span>Paid at</span>
              <strong>{dateText(viewingCommission.paidAt)}</strong>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        okButtonProps={{ loading: isSaving }}
        okText="Save commission"
        onCancel={() => {
          setEditingCommission(null);
          setForm(null);
        }}
        onOk={handleSaveCommission}
        open={Boolean(editingCommission)}
        title={editingCommission?.quoteName || "Edit commission"}
        width={720}
      >
        {editingCommission && form ? (
          <div className="admin-modal-form">
            <div className="quote-project-summary">
              <div>
                <span>Total amount</span>
                <strong>{editingCommission.totalAmount}</strong>
              </div>
              <div>
                <span>Commission amount</span>
                <strong>{editedPreview?.commissionAmount || editingCommission.commissionAmount}</strong>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="commissionPercentage">Percentage commission</label>
                <input
                  id="commissionPercentage"
                  max="100"
                  min="0"
                  onChange={(event) => updateField("percentageCommission", event.target.value)}
                  step="0.1"
                  type="number"
                  value={form.percentageCommission}
                />
              </div>
              <div className="form-group">
                <label htmlFor="commissionStatus">Status</label>
                <select
                  disabled={!statusCanBeChangedByAdmin(editingCommission.status)}
                  id="commissionStatus"
                  onChange={(event) => updateField("status", event.target.value as CommissionStatus)}
                  value={form.status}
                >
                  <option value="APPROVED_COMMISSION">APPROVED COMMISSION</option>
                  <option value="PAID">PAID</option>
                  {editingCommission.status === "QUOTED_COMMISSION" ? (
                    <option value="QUOTED_COMMISSION">QUOTED COMMISSION</option>
                  ) : null}
                </select>
              </div>
            </div>
            {editingCommission.status === "QUOTED_COMMISSION" ? (
              <p className="admin-feedback">
                Status moves to approved automatically when the quote is approved.
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default AdminCommission;
