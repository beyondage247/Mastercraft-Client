import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import {
  listBackOfficePayments,
  type BackOfficePayment,
} from "../../services/backOfficeStore";

function AdminPayments() {
  const [payments, setPayments] = useState<BackOfficePayment[]>([]);

  useEffect(() => {
    setPayments(listBackOfficePayments());
  }, []);

  return (
    <div className="page-stack admin-page">
      <PageHeader subtitle="Payments recorded against invoices" title="Payments" />

      <section className="panel admin-client-list">
        <div className="panel__header">
          <h2>Payment List</h2>
          <span>{payments.length} total</span>
        </div>
        <div className="admin-record-table admin-record-table--payments">
          <div className="admin-record-table__head">
            <span>Reference</span>
            <span>Client</span>
            <span>Project</span>
            <span>Amount</span>
            <span>Method</span>
          </div>
          {payments.length ? (
            payments.map((payment) => (
              <article className="admin-record-table__row" key={payment.id}>
                <strong>{payment.reference}</strong>
                <span>{payment.clientName}</span>
                <span>{payment.projectName}</span>
                <span>{payment.amount}</span>
                <span>{payment.method}</span>
              </article>
            ))
          ) : (
            <div className="admin-empty-row">No payments have been recorded yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminPayments;

