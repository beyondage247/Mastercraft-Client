import type { QuoteListItem } from "../data/portal";
import StatusBadge from "./StatusBadge";

type AdminProjectInvoicePanelProps = {
  quotes: QuoteListItem[];
};

function invoiceStatusTone(status: string) {
  if (status === "Paid") return "success";
  if (status === "Overdue") return "danger";
  if (status === "Approved") return "primary";
  return "neutral";
}

function AdminProjectInvoicePanel({ quotes }: AdminProjectInvoicePanelProps) {
  const invoices = quotes.flatMap((q) => q.invoices || []);

  return (
    <div className="admin-project-detail">
      <div className="payments-table" style={{ marginTop: "0px" }}>
        <div
          className="payments-table__head"
          style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr" }}
        >
          <span>INVOICE</span>
          <span>ISSUED DATE</span>
          <span>DUE DATE</span>
          <span>STATUS</span>
          <span>TOTAL</span>
        </div>
        {invoices.length ? (
          invoices.map((invoice) => (
            <article
              className="payments-table__row"
              key={invoice.id}
              style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr" }}
            >
              <strong>{invoice.invoiceId || invoice.id.slice(0, 8)}</strong>
              <span>{invoice.issuedDate || "Not set"}</span>
              <span>{invoice.dueDate || "Not set"}</span>
              <StatusBadge tone={invoiceStatusTone(invoice.status)}>
                {invoice.status}
              </StatusBadge>
              <strong>{invoice.total || invoice.amount || "$0.00"}</strong>
            </article>
          ))
        ) : (
          <div className="admin-empty-row">
            No invoices have been created for this project yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProjectInvoicePanel;
