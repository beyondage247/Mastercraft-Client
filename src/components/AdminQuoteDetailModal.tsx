import { Modal } from "antd";
import { useEffect, useMemo, useState } from "react";
import type { QuoteListItem, QuotePaymentSchedule } from "../data/portal";
import { getQuoteDetail } from "../services/portalApi";
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

function scheduleLabel(type: QuotePaymentSchedule["type"]) {
  if (type === "FULL_PAYMENT") return "Full payment";
  if (type === "DEPOSIT_AND_BALANCE") return "Deposit and balance";

  return "Deposit and split balance";
}

function formatScheduleAmount(value?: number | null) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(Number.isFinite(value ?? Number.NaN) ? Number(value) : 0);
}

function formatSchedulePercent(value?: number | null) {
  const number = Number(value);

  return `${Number.isFinite(number) ? Math.round(number * 100) / 100 : 0}%`;
}

type ScheduleRow = {
  amount: number;
  date?: string | null;
  name: string;
  percentage: number;
};

function scheduleRows(schedule?: QuotePaymentSchedule | null): ScheduleRow[] {
  if (!schedule) {
    return [];
  }

  if (schedule.type === "FULL_PAYMENT") {
    return schedule.fullPayment
      ? [{
          amount: schedule.fullPayment.amount,
          date: schedule.fullPayment.date,
          name: schedule.fullPayment.name,
          percentage: schedule.fullPayment.percentage,
        }]
      : [];
  }

  const rows: ScheduleRow[] = [];

  if (schedule.deposit) {
    rows.push({
      amount: schedule.deposit.amount,
      date: schedule.deposit.date,
      name: schedule.deposit.name,
      percentage: schedule.deposit.percentage,
    });
  }

  if (schedule.balance?.split) {
    rows.push(
      ...(schedule.balance.payments ?? []).map((payment) => ({
        amount: payment.amount,
        date: payment.date,
        name: payment.name,
        percentage: payment.percentage,
      })),
    );
  } else if (schedule.balance) {
    rows.push({
      amount: schedule.balance.amount,
      date: schedule.balance.date,
      name: schedule.balance.name || "Balance",
      percentage: schedule.balance.percentage,
    });
  }

  return rows;
}

function AdminQuoteDetailModal({ onClose, open, quote }: AdminQuoteDetailModalProps) {
  const [displayQuote, setDisplayQuote] = useState<QuoteListItem | null>(quote);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const rows = useMemo(() => scheduleRows(displayQuote?.paymentSchedule), [displayQuote?.paymentSchedule]);
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
                  ? scheduleLabel(displayQuote.paymentSchedule.type)
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

          <section className="admin-quote-detail__section">
            <div className="admin-quote-detail__section-header">
              <h3>Payment Schedule</h3>
              {displayQuote.paymentSchedule ? (
                <span>{formatScheduleAmount(displayQuote.paymentSchedule.totalAmount)} scheduled</span>
              ) : null}
            </div>

            {rows.length ? (
              <div className="admin-quote-schedule-table">
                <div className="admin-quote-schedule-table__head">
                  <span>Milestone</span>
                  <span>Due date</span>
                  <span>Percent</span>
                  <span>Amount</span>
                </div>
                {rows.map((row, index) => (
                  <article className="admin-quote-schedule-table__row" key={`${row.name}-${index}`}>
                    <strong>{row.name}</strong>
                    <span>{row.date || "Not set"}</span>
                    <span>{formatSchedulePercent(row.percentage)}</span>
                    <strong>{formatScheduleAmount(row.amount)}</strong>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-empty-row">
                {isRefreshing ? "Loading payment schedule..." : "No payment schedule was returned for this quote."}
              </div>
            )}
          </section>

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
