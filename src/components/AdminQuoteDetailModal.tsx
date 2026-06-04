import { Modal } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { QuoteListItem } from "../data/portal";
import { getQuoteDetail } from "../services/portalApi";
import QuotePaymentSchedulePanel from "./QuotePaymentSchedulePanel";
import StatusBadge from "./StatusBadge";

type AdminQuoteDetailModalProps = {
  onClose: () => void;
  open: boolean;
  quote: QuoteListItem | null;
};

function quoteTone(status: QuoteListItem["status"]) {
  if (status === "Approved") return "success";
  if (status === "Rejected" || status === "Expired") return "danger";
  if (status === "Draft") return "neutral";

  return "warning";
}

function AdminQuoteDetailModal({ onClose, open, quote }: AdminQuoteDetailModalProps) {
  const [displayQuote, setDisplayQuote] = useState<QuoteListItem | null>(quote);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lineTotal = displayQuote?.lineItems?.length ?? 0;

  useEffect(() => {
    if (!open || !quote) {
      setDisplayQuote(quote);
      return;
    }

    let isMounted = true;

    setDisplayQuote(quote);
    setIsRefreshing(true);
    getQuoteDetail(quote.id)
      .then(({ quote: refreshedQuote }) => {
        if (isMounted && refreshedQuote) {
          setDisplayQuote(refreshedQuote);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) {
          setIsRefreshing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open, quote]);

  return (
    <Modal
      footer={null}
      onCancel={onClose}
      open={open}
      title={displayQuote?.title || "Quote details"}
      width={1040}
    >
      {displayQuote ? (
        <div className="admin-quote-detail">
          <div className="admin-quote-detail__hero">
            <div>
              <span>Quote total</span>
              <strong>{displayQuote.total || displayQuote.amount}</strong>
            </div>
            <div>
              <span>Schedule</span>
              <strong>
                {displayQuote.paymentSchedule
                  ? "Configured"
                  : isRefreshing
                    ? "Loading..."
                    : "Not set"}
              </strong>
            </div>
            <StatusBadge tone={quoteTone(displayQuote.status)}>{displayQuote.status}</StatusBadge>
          </div>

          <div className="admin-detail-grid admin-quote-detail__summary">
            <div>
              <span>Quote ID</span>
              <strong>{displayQuote.uid || displayQuote.id}</strong>
            </div>
            <div>
              <span>Project</span>
              <strong>{displayQuote.projectName || displayQuote.description || "Not set"}</strong>
            </div>
            <div>
              <span>Date issued</span>
              <strong>{displayQuote.dateIssued || "Not set"}</strong>
            </div>
            <div>
              <span>Valid until</span>
              <strong>{displayQuote.validUntil || "Not set"}</strong>
            </div>
            <div>
              <span>Subtotal</span>
              <strong>{displayQuote.subtotal || "$0.00"}</strong>
            </div>
            <div>
              <span>Tax</span>
              <strong>{displayQuote.tax ? `${displayQuote.tax}%` : "0%"}</strong>
            </div>
            <div>
              <span>Tax amount</span>
              <strong>{displayQuote.taxAmount || "$0.00"}</strong>
            </div>
            <div>
              <span>Line items</span>
              <strong>{lineTotal}</strong>
            </div>
          </div>

          {displayQuote.clientComment ? (
            <div className="admin-project-detail__notes">
              <span>Client comment</span>
              <p>{displayQuote.clientComment}</p>
            </div>
          ) : null}

          <QuotePaymentSchedulePanel
            className="admin-quote-detail__section"
            isLoading={isRefreshing}
            paymentSchedule={displayQuote.paymentSchedule}
          />

          {displayQuote.invoices?.length ? (
            <section className="admin-quote-detail__section">
              <div className="admin-quote-detail__section-header">
                <h3>Generated Invoices</h3>
                <span>{displayQuote.invoices.length} total</span>
              </div>
              <div className="quote-generated-invoices quote-generated-invoices--admin">
                {displayQuote.invoices.map((invoice) => (
                  <Link className="quote-invoice-link" key={invoice.id} to={`/admin/invoices/${invoice.id}`}>
                    <div>
                      <strong>{invoice.invoiceId || invoice.id}</strong>
                      <span>{invoice.issuedDate || "Date pending"}</span>
                    </div>
                    <div>
                      <strong>{invoice.total || invoice.amount}</strong>
                      <StatusBadge tone={invoice.status === "Paid" ? "success" : "info"}>{invoice.status}</StatusBadge>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="admin-quote-detail__section">
            <div className="admin-quote-detail__section-header">
              <h3>Line Items</h3>
              <span>{lineTotal} total</span>
            </div>

            <div className="admin-project-stage-table admin-quote-line-table">
              <div className="admin-project-stage-table__head">
                <span>Product/service</span>
                <span>Qty</span>
                <span>Unit price</span>
                <span>Total</span>
              </div>
              {displayQuote.lineItems?.length ? (
                displayQuote.lineItems.map((item, index) => (
                  <article className="admin-project-stage-table__row" key={`${item.description}-${index}`}>
                    <strong>{item.description}</strong>
                    <span>{item.qty}</span>
                    <span>{item.rate}</span>
                    <span>{item.amount}</span>
                  </article>
                ))
              ) : (
                <div className="admin-empty-row">No line items were returned for this quote.</div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </Modal>
  );
}

export default AdminQuoteDetailModal;
