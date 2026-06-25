import type { QuoteListItem, QuotePaymentSchedule } from "../data/portal";
import { formatPortalDate } from "../utils/dateFormat";

type QuotePaymentSchedulePanelProps = {
  className?: string;
  isLoading?: boolean;
  paymentSchedule?: QuoteListItem["paymentSchedule"];
  amountPaid?: number;
  onPayItem?: (amount: number) => void;
  payDisabled?: boolean;
};

type ScheduleRow = {
  amount: number;
  date?: string | null;
  name: string;
  percentage: number;
};

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

function formatScheduleDate(value?: string | null) {
  if (!value) return "Not set";
  if (value === "Date of Invoice Generation") return value;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

  return formatPortalDate(value) || value;
}

function scheduleRows(schedule?: QuotePaymentSchedule | null): ScheduleRow[] {
  if (!schedule) {
    return [];
  }

  if (schedule.type === "FULL_PAYMENT") {
    return schedule.fullPayment
      ? [{
          amount: schedule.fullPayment.amount,
          date: schedule.fullPayment.date,
          name: schedule.fullPayment.name || "Full Payment",
          percentage: schedule.fullPayment.percentage,
        }]
      : [];
  }

  const rows: ScheduleRow[] = [];

  if (schedule.deposit) {
    rows.push({
      amount: schedule.deposit.amount,
      date: schedule.deposit.date,
      name: schedule.deposit.name || "Deposit",
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

function getRowStatuses(rows: ScheduleRow[], amountPaid: number) {
  let remaining = amountPaid;
  const tolerance = 0.005;

  return rows.map((row) => {
    if (remaining >= row.amount - tolerance) {
      remaining -= row.amount;
      return "paid" as const;
    }

    if (remaining > tolerance) {
      remaining = 0;
      return "next" as const;
    }

    return "unpaid" as const;
  }).map((status, index, statuses) => {
    if (status === "unpaid" && !statuses.slice(0, index).includes("next")) {
      return "next" as const;
    }
    return status;
  });
}

function QuotePaymentSchedulePanel({
  className = "",
  isLoading = false,
  paymentSchedule,
  amountPaid,
  onPayItem,
  payDisabled = false,
}: QuotePaymentSchedulePanelProps) {
  const rows = scheduleRows(paymentSchedule);
  const showPayButtons = onPayItem != null && amountPaid != null;
  const statuses = showPayButtons ? getRowStatuses(rows, amountPaid) : [];

  return (
    <section className={`quote-payment-schedule ${className}`.trim()}>
      <div className="quote-payment-schedule__header">
        <div>
          <h3>Payment Schedule</h3>
          {paymentSchedule ? <p>{scheduleLabel(paymentSchedule.type)}</p> : null}
        </div>
        {paymentSchedule ? (
          <strong>{formatScheduleAmount(paymentSchedule.totalAmount)} scheduled</strong>
        ) : null}
      </div>

      {rows.length ? (
        <div className="quote-payment-schedule__table">
          <div className="quote-payment-schedule__head">
            <span>Name</span>
            <span>Due date</span>
            <span>Percent</span>
            <span>Amount</span>
            <span />
          </div>
          {rows.map((row, index) => {
            const status = statuses[index];

            return (
              <article className="quote-payment-schedule__row" key={`${row.name}-${index}`}>
                <strong>{row.name}</strong>
                <span>{formatScheduleDate(row.date)}</span>
                <span>{formatSchedulePercent(row.percentage)}</span>
                <strong>{formatScheduleAmount(row.amount)}</strong>
                <span style={{ textAlign: "right" }}>
                  {showPayButtons && status === "paid" ? (
                    <span style={{ color: "var(--color-success, #22c55e)", fontSize: 13, fontWeight: 600 }}>Paid</span>
                  ) : showPayButtons && status === "next" ? (
                    <button
                      className="pay-now-btn"
                      disabled={payDisabled}
                      onClick={() => onPayItem(row.amount)}
                      style={{ padding: "4px 12px", fontSize: 13 }}
                      type="button"
                    >
                      {payDisabled ? "Redirecting..." : "Pay"}
                    </button>
                  ) : null}
                </span>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="quote-payment-schedule__empty">
          {isLoading ? "Loading payment schedule..." : "No payment schedule was returned for this quote."}
        </div>
      )}
    </section>
  );
}

export default QuotePaymentSchedulePanel;
