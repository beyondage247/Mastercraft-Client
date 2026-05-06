import type { QuoteListItem } from '../data/portal';
import { PortalIcon } from './PortalIcon';
import StatusBadge from './StatusBadge';

const quoteStatusTone = {
  Accepted: 'info',
  Draft: 'neutral',
  Expired: 'warning',
  Rejected: 'neutral',
  Sent: 'danger',
} as const;

type QuoteCardProps = {
  onAccept: (quoteId: string) => void;
  quote: QuoteListItem;
};

function QuoteCard({ onAccept, quote }: QuoteCardProps) {
  return (
    <article className="record-card quote-card">
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
        <button className="accept-button" onClick={() => onAccept(quote.uid)} type="button">
          Accept
        </button>
        <button className="record-card__arrow" type="button" aria-label={`Open ${quote.title}`}>
          <PortalIcon name="right" />
        </button>
      </div>
    </article>
  );
}

export default QuoteCard;
