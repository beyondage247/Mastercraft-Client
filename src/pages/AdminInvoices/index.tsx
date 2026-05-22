import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import {
  listBackOfficeInvoices,
  type BackOfficeInvoice,
} from "../../services/backOfficeStore";

function AdminInvoices() {
  const [invoices, setInvoices] = useState<BackOfficeInvoice[]>([]);

  useEffect(() => {
    setInvoices(listBackOfficeInvoices());
  }, []);

  return (
    <div className="page-stack admin-page">
      <PageHeader subtitle="Invoices created for client projects" title="Invoices" />

      <section className="panel admin-client-list">
        <div className="panel__header">
          <h2>Invoice List</h2>
          <span>{invoices.length} total</span>
        </div>
        <div className="admin-record-table admin-record-table--invoices">
          <div className="admin-record-table__head">
            <span>Invoice</span>
            <span>Client</span>
            <span>Project</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          {invoices.length ? (
            invoices.map((invoice) => (
              <article className="admin-record-table__row" key={invoice.id}>
                <strong>{invoice.id}</strong>
                <span>{invoice.clientName}</span>
                <span>{invoice.projectName}</span>
                <span>{invoice.amount}</span>
                <StatusBadge tone="neutral">{invoice.status}</StatusBadge>
              </article>
            ))
          ) : (
            <div className="admin-empty-row">No invoices have been created yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminInvoices;

