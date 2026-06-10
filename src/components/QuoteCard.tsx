import type { MouseEvent } from "react";
import { useNavigate } from 'react-router-dom';
import type { QuoteListItem } from '../data/portal';
import { downloadQuotePdf } from '../services/portalApi';
import { formatPortalDate } from '../utils/dateFormat';
import { showRequestToast } from '../utils/portalToast';
import { PortalIcon } from './PortalIcon';
import StatusBadge from './StatusBadge';

const quoteStatusTone = {
  Approved: 'info',
  Draft: 'neutral',
  Expired: 'warning',
  Rejected: 'neutral',
  Sent: 'danger',
} as const;

type QuoteCardProps = {
  onRespond: (quote: QuoteListItem, status: "APPROVED" | "REJECTED" | "IN_REVIEW") => void;
  quote: QuoteListItem;
};

function formatScheduleAmount(value?: number | null) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(Number.isFinite(value ?? Number.NaN) ? Number(value) : 0);
}

function formatScheduleDate(value?: string | null) {
  if (!value) return "date not set";
  if (value === "Date of Invoice Generation") return value;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

  return formatPortalDate(value) || value;
}

function scheduleTypeText(quote: QuoteListItem) {
  if (quote.paymentSchedule?.type === "FULL_PAYMENT") return "Full payment";
  if (quote.paymentSchedule?.type === "DEPOSIT_AND_BALANCE") return "Deposit and balance";
  if (quote.paymentSchedule?.type === "DEPOSIT_AND_SPLIT_BALANCE") return "Deposit and split balance";

  return "";
}

function nextScheduleText(quote: QuoteListItem) {
  const schedule = quote.paymentSchedule;

  if (!schedule) return "";

  if (schedule.type === "FULL_PAYMENT" && schedule.fullPayment) {
    return `${formatScheduleAmount(schedule.fullPayment.amount)} due ${formatScheduleDate(schedule.fullPayment.date)}`;
  }

  if (schedule.deposit) {
    return `${formatScheduleAmount(schedule.deposit.amount)} deposit due ${formatScheduleDate(schedule.deposit.date)}`;
  }

  return "";
}

function QuoteCard({ onRespond, quote }: QuoteCardProps) {
  const navigate = useNavigate();
  const canRespond = quote.status === "Sent" || quote.status === "Draft";
  const displayQuoteId = quote.uid || quote.id;
  const scheduleType = scheduleTypeText(quote);
  const nextSchedule = nextScheduleText(quote);

  async function handleDownload(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    const toast = showRequestToast(`quote-download-${quote.id}`, "Downloading quote PDF...");

    try {
      await downloadQuotePdf(quote.id, `${displayQuoteId}.pdf`);
      toast.success("Quote PDF downloaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to download quote PDF.");
    }
  }

  return (
    <article className="record-card quote-card" onClick={() => navigate(`/quotes/${quote.uid}`)} style={{ cursor: 'pointer' }}>
      <div className="record-card__body">
        <div className="quote-card__idline">
          <span>{displayQuoteId}</span>
          <StatusBadge icon={quote.status === 'Sent' ? 'clock' : 'check'} tone={quoteStatusTone[quote.status]}>
            {quote.status}
          </StatusBadge>
        </div>
        <h2>{quote.title}</h2>
        <p>{quote.description}</p>
        <div className="record-card__details">
          <span>
            <PortalIcon name="dollar" />
            {quote.amount}
          </span>
          <span>
            <PortalIcon name="calendar" />
            Valid until {quote.validUntil}
          </span>
        </div>
        {scheduleType ? (
          <div className="quote-card__schedule">
            <span>{scheduleType}</span>
            {nextSchedule ? <strong>{nextSchedule}</strong> : null}
          </div>
        ) : null}
      </div>
      <div className="quote-card__actions">
        <button
          aria-label={`Download ${displayQuoteId}`}
          className="secondary-action-btn quote-card__small-action"
          onClick={handleDownload}
          type="button"
        >
          <PortalIcon name="download" />
          PDF
        </button>
        {canRespond ? (
          <>
            <button className="accept-button" onClick={(e) => { e.stopPropagation(); onRespond(quote, "APPROVED"); }} type="button">
              Approve
            </button>
            <button className="request-revision-btn quote-card__small-action" onClick={(e) => { e.stopPropagation(); onRespond(quote, "IN_REVIEW"); }} type="button">
              Review
            </button>
            <button className="secondary-action-btn quote-card__small-action" onClick={(e) => { e.stopPropagation(); onRespond(quote, "REJECTED"); }} type="button">
              Reject
            </button>
          </>
        ) : null}
        <button className="record-card__arrow" type="button" aria-label={`Open ${quote.title}`}>
          <PortalIcon name="right" />
        </button>
      </div>
    </article>
  );
}

export default QuoteCard;
