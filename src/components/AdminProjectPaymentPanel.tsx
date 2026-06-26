import { useEffect, useState } from "react";
import type { ProjectListItem } from "../data/portal";
import { getProjectPayments, type ProjectPaymentSummary } from "../services/portalApi";
import { PortalIcon } from "./PortalIcon";
import StatusBadge from "./StatusBadge";

type AdminProjectPaymentPanelProps = {
  project: ProjectListItem;
};

function AdminProjectPaymentPanel({ project }: AdminProjectPaymentPanelProps) {
  const [paymentSummary, setPaymentSummary] = useState<ProjectPaymentSummary | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setPaymentLoading(true);
    setError("");

    getProjectPayments(project.id)
      .then((summary) => {
        if (isMounted) {
          setPaymentSummary(summary);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message || "Failed to load payments");
          setPaymentSummary(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setPaymentLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [project.id]);

  if (paymentLoading) {
    return <p className="admin-empty-copy">Loading payment summary...</p>;
  }

  if (error) {
    return <p className="admin-empty-copy">{error}</p>;
  }

  return (
    <div className="admin-project-detail">
      <section className="billing-metrics project-payment-metrics" aria-label="Project payment summary">
        <article className="billing-metric">
          <div>
            <span>Total paid</span>
            <strong>{paymentSummary?.amountPaid || "$0.00"}</strong>
          </div>
          <span className="icon-tile icon-tile--danger">
            <PortalIcon name="check" />
          </span>
        </article>
        <article className="billing-metric">
          <div>
            <span>Amount due</span>
            <strong>{paymentSummary?.amountDue || "$0.00"}</strong>
          </div>
          <span className="icon-tile icon-tile--danger">
            <PortalIcon name="dollar" />
          </span>
        </article>
      </section>

      <div className="payments-table project-payment-table" style={{ marginTop: '24px' }}>
        <div className="payments-table__head">
          <span>PAYMENT DATE</span>
          <span>METHOD</span>
          <span>REFERENCE</span>
          <span>AMOUNT</span>
        </div>
        {paymentSummary?.payments.length ? (
          paymentSummary.payments.map((payment) => (
            <article className="payments-table__row" key={payment.id}>
              <span>{payment.date}</span>
              <StatusBadge tone="neutral">{payment.method}</StatusBadge>
              <span>{payment.reference}</span>
              <strong>{payment.amount}</strong>
            </article>
          ))
        ) : (
          <div className="admin-empty-row">No payments have been recorded for this project yet.</div>
        )}
      </div>
    </div>
  );
}

export default AdminProjectPaymentPanel;
