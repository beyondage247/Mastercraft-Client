import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import {
  listBackOfficeQuotes,
  type BackOfficeQuote,
} from "../../services/backOfficeStore";

function AdminQuotes() {
  const [quotes, setQuotes] = useState<BackOfficeQuote[]>([]);

  useEffect(() => {
    setQuotes(listBackOfficeQuotes());
  }, []);

  return (
    <div className="page-stack admin-page">
      <PageHeader subtitle="Quotes created for projects" title="Quotes" />

      <section className="panel admin-client-list">
        <div className="panel__header">
          <h2>Quote List</h2>
          <span>{quotes.length} total</span>
        </div>
        <div className="admin-record-table admin-record-table--quotes">
          <div className="admin-record-table__head">
            <span>Quote</span>
            <span>Client</span>
            <span>Project</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          {quotes.length ? (
            quotes.map((quote) => (
              <article className="admin-record-table__row" key={quote.id}>
                <strong>{quote.title}</strong>
                <span>{quote.clientName}</span>
                <span>{quote.projectName}</span>
                <span>{quote.amount}</span>
                <StatusBadge tone="neutral">{quote.status}</StatusBadge>
              </article>
            ))
          ) : (
            <div className="admin-empty-row">No quotes have been created yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminQuotes;

