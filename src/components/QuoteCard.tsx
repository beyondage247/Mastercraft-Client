import { useNavigate } from 'react-router-dom';
import type { QuoteListItem } from '../data/portal';
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

function QuoteCard({ onRespond, quote }: QuoteCardProps) {
  const navigate = useNavigate();
  const canRespond = quote.status === "Sent" || quote.status === "Draft";

  return (
    <article className="record-card quote-card" onClick={() => navigate(`/quotes/${quote.uid}`)} style={{ cursor: 'pointer' }}>
      <div className="record-card__body">
        <div className="quote-card__idline">
          <span>{quote.id}</span>
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
      </div>
      <div className="quote-card__actions">
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
