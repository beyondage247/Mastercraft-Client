import { useEffect, useState } from "react";
import type { PaymentItem } from "../../data/portal";
import PageHeader from "../../components/PageHeader";
import { getPayments } from "../../services/portalApi";

function AdminPayments() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    getPayments()
      .then((data) => {
        if (isMounted) {
          setPayments(data.payments);
          setError("");
        }
      })
      .catch((requestError: Error) => {
        if (isMounted) {
          setPayments([]);
          setError(requestError.message || "Unable to load payments.");
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
            <span>Invoice/Record</span>
            <span>Project</span>
            <span>Amount</span>
            <span>Method</span>
          </div>
          {isLoading ? (
            <div className="admin-empty-row">Loading payments...</div>
          ) : error ? (
            <div className="admin-empty-row">{error}</div>
          ) : payments.length ? (
            payments.map((payment) => (
              <article className="admin-record-table__row" key={payment.id}>
                <strong>{payment.reference}</strong>
                <span>{payment.invoice}</span>
                <span>{payment.project}</span>
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
