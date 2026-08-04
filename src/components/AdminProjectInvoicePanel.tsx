import { useState } from "react";
import { Dropdown, Modal, Pagination, type MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
import type { InvoiceItem, QuoteListItem } from "../data/portal";
import { deleteInvoice, downloadInvoicePdf } from "../services/portalApi";
import { showRequestToast } from "../utils/portalToast";
import AdminPaymentModal from "./AdminPaymentModal";
import { PortalIcon } from "./PortalIcon";
import StatusBadge from "./StatusBadge";

const pageSize = 15;

type AdminProjectInvoicePanelProps = {
  onInvoiceDeleted?: () => void;
  quotes: QuoteListItem[];
};

function invoiceTone(status: string) {
  if (status === "Paid" || status === "Approved") return "success";
  if (status === "Overdue") return "danger";
  return "neutral";
}

function AdminProjectInvoicePanel({ quotes, onInvoiceDeleted }: AdminProjectInvoicePanelProps) {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceItem | null>(null);
  const [page, setPage] = useState(1);

  // Flatten all invoices from all quotes for this project
  const invoices = quotes.flatMap((q) => q.invoices || []) as InvoiceItem[];

  const paginatedInvoices = invoices.slice((page - 1) * pageSize, page * pageSize);

  function handleDeleteInvoice(invoice: InvoiceItem) {
    Modal.confirm({
      title: "Delete invoice?",
      content: `Delete invoice ${invoice.invoiceId || invoice.id}? This cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        const toast = showRequestToast(`admin-invoice-delete-${invoice.id}`, "Deleting invoice...");
        setDeletingId(invoice.id);
        return deleteInvoice(invoice.id)
          .then(() => {
            toast.success("Invoice deleted.");
            onInvoiceDeleted?.();
          })
          .catch((err: Error) => toast.error(err instanceof Error ? err.message : "Unable to delete invoice."))
          .finally(() => setDeletingId(null));
      },
    });
  }

  function actionMenu(invoice: InvoiceItem): MenuProps {
    return {
      items: [
        { key: "view", label: "View" },
        { disabled: invoice.status === "Paid", key: "record-payment", label: "Record payment" },
        { key: "download", label: "Download PDF" },
        { type: "divider" },
        {
          danger: true,
          disabled: invoice.status === "Paid" || deletingId === invoice.id,
          key: "delete",
          label: deletingId === invoice.id ? "Deleting..." : "Delete Invoice",
        },
      ],
      onClick: ({ key }) => {
        if (key === "record-payment") {
          setPaymentInvoice(invoice);
          return;
        }

        if (key === "download") {
          const displayId = invoice.invoiceId || invoice.id;
          const toast = showRequestToast(`admin-invoice-download-${invoice.id}`, "Downloading invoice PDF...");
          downloadInvoicePdf(invoice.id, `${displayId}.pdf`)
            .then(() => toast.success("Invoice PDF downloaded."))
            .catch((error) =>
              toast.error(error instanceof Error ? error.message : "Unable to download invoice PDF."),
            );
          return;
        }

        if (key === "delete") {
          handleDeleteInvoice(invoice);
          return;
        }

        // "view" — navigate to invoice detail page
        navigate(`/admin/invoices/${invoice.id}`);
      },
    };
  }

  return (
    <div>
      <div className="admin-record-table admin-record-table--invoices">
        <div className="admin-record-table__head">
          <span>Invoice</span>
          <span>Issued Date</span>
          <span>Due Date</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {invoices.length ? (
          paginatedInvoices.map((invoice) => (
            <article
              className="admin-record-table__row"
              key={invoice.id}
              onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
              style={{ cursor: "pointer" }}
            >
              <strong>{invoice.invoiceId || invoice.id}</strong>
              <span>{invoice.issuedDate || "Not set"}</span>
              <span>{invoice.dueDate || "Not set"}</span>
              <span>{invoice.total || invoice.amount || "—"}</span>
              <StatusBadge tone={invoiceTone(invoice.status)}>{invoice.status}</StatusBadge>
              <span onClick={(event) => event.stopPropagation()}>
                <Dropdown menu={actionMenu(invoice)} placement="bottomRight">
                  <button className="table-action-button" type="button">
                    <span>Actions</span>
                    <PortalIcon name="down" />
                  </button>
                </Dropdown>
              </span>
            </article>
          ))
        ) : (
          <div className="admin-empty-row">No invoices have been created for this project yet.</div>
        )}
      </div>
      {invoices.length > pageSize && (
        <Pagination
          className="admin-client-pagination"
          current={page}
          onChange={setPage}
          pageSize={pageSize}
          showSizeChanger={false}
          total={invoices.length}
        />
      )}
      <AdminPaymentModal
        invoice={paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        onRecorded={() => {
          onInvoiceDeleted?.(); // reload quotes to refresh invoice state
        }}
        open={Boolean(paymentInvoice)}
      />    </div>
  );
}

export default AdminProjectInvoicePanel;
