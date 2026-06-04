import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { PortalIcon } from '../../components/PortalIcon';
import QuotePaymentSchedulePanel from '../../components/QuotePaymentSchedulePanel';
import StatusBadge from '../../components/StatusBadge';
import { getQuoteDetail, respondToQuote, type QuoteDecisionStatus } from '../../services/portalApi';
import type { QuoteListItem, QuoteDetailInfo } from '../../data/portal';
import { showRequestToast } from '../../utils/portalToast';

function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<QuoteListItem | null>(null);
  const [details, setDetails] = useState<QuoteDetailInfo | null>(null);
  const [comment, setComment] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [responseStatus, setResponseStatus] = useState<QuoteDecisionStatus | null>(null);

  useEffect(() => {
    if (id) {
      getQuoteDetail(id).then((data) => {
        if (data.quote) setQuote(data.quote);
        if (data.details) setDetails(data.details);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return <div className="page-stack">Loading...</div>;
  }

  if (!quote || !details) {
    return (
      <div className="page-stack">
        <button className="back-link" onClick={() => navigate('/quotes')}>
          <PortalIcon name="left" /> Back to Quotes
        </button>
        <div className="panel">Quote not found</div>
      </div>
    );
  }

  function openResponse(status: QuoteDecisionStatus) {
    setResponseStatus(status);
    setComment('');
  }

  async function handleRespond() {
    if (!quote || !responseStatus) {
      return;
    }

    if ((responseStatus === 'REJECTED' || responseStatus === 'IN_REVIEW') && !comment.trim()) {
      showRequestToast('quote-detail-response-validation', 'Checking response...').error(
        'Please add a comment for a rejection or review request.',
      );
      return;
    }

    const toast = showRequestToast('quote-detail-response', 'Sending quote response...');
    setIsResponding(true);

    try {
      const updatedQuote = await respondToQuote(quote.id, responseStatus, comment.trim());
      setQuote(updatedQuote);
      toast.success('Quote response was sent.');
      setResponseStatus(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send quote response.');
    } finally {
      setIsResponding(false);
    }
  }

  const canRespond = quote.status === 'Sent' || quote.status === 'Draft';

  return (
    <div className="page-stack quote-detail-page">
      <button className="back-link" onClick={() => navigate('/quotes')}>
        <PortalIcon name="left" /> Back to Quotes
      </button>

      <div className="billing-header">
        <div className="billing-header-title">
          <h1>{quote.title || quote.id} <StatusBadge tone={quote.status === 'Sent' ? 'success' : 'neutral'}>{quote.status}</StatusBadge></h1>
          <p>Valid until <strong>{quote.validUntil}</strong></p>
        </div>
        <button className="secondary-action-btn"><PortalIcon name="download" /> Download PDF</button>
      </div>

      <div className="detail-panel">
        <h3>Project Specifications</h3>
        <p className="spec-text">{details.specifications}</p>
      </div>

      <div className="detail-grid">
        <div className="detail-grid-left">
          <div className="detail-panel no-padding-bottom">
            <div className="panel-flex-header">
              <h3>Line Items</h3>
              <span className="items-count">{details.lineItems.length} items</span>
            </div>
            
            <div className="line-items-list">
              {details.lineItems.map((item, idx) => (
                <div className="line-item-row" key={idx}>
                  <div className="line-item-icon"><PortalIcon name="documents" /></div>
                  <div className="line-item-info">
                    <h4>{item.description}</h4>
                    <p>Qty: {item.qty} &nbsp;&nbsp;@ {item.rate} / ea</p>
                  </div>
                  <div className="line-item-amount">{item.amount}</div>
                </div>
              ))}
            </div>

            <div className="totals-section">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>{details.subtotal}</span>
              </div>
              <div className="totals-row">
                <span>Tax (8%)</span>
                <span>{details.tax}</span>
              </div>
              <div className="totals-row grand-total">
                <span>Total</span>
                <span>{details.total}</span>
              </div>
            </div>

            <QuotePaymentSchedulePanel paymentSchedule={quote.paymentSchedule} />

            {quote.invoices?.length ? (
              <div className="quote-generated-invoices">
                <div className="panel-flex-header">
                  <h3>Generated Invoice</h3>
                  <span className="items-count">{quote.invoices.length} total</span>
                </div>
                {quote.invoices.map((invoice) => (
                  <Link className="quote-invoice-link" key={invoice.id} to={`/invoices/${invoice.id}`}>
                    <div>
                      <strong>{invoice.invoiceId || invoice.id}</strong>
                      <span>{invoice.issuedDate || 'Date pending'}</span>
                    </div>
                    <div>
                      <strong>{invoice.total || invoice.amount}</strong>
                      <StatusBadge tone={invoice.status === 'Paid' ? 'success' : 'info'}>{invoice.status}</StatusBadge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}

            {canRespond ? (
              <div className="action-buttons-bottom">
                <button className="accept-quote-btn" onClick={() => openResponse('APPROVED')} type="button">Approve Quote</button>
                <button className="request-revision-btn" onClick={() => openResponse('IN_REVIEW')} type="button">Request Revision</button>
                <button className="secondary-action-btn" onClick={() => openResponse('REJECTED')} type="button">Reject Quote</button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="detail-grid-right">
          <div className="detail-panel">
            <div className="panel-flex-header">
              <h3>Linked Project</h3>
              <Link to={`/projects/${details.linkedProject.id}`} className="view-link">View</Link>
            </div>
            <div className="linked-project-card">
              <div className="linked-project-header">
                <div className="project-avatar">DH</div>
                <div className="project-title-info">
                  <h4>{details.linkedProject.title}</h4>
                  <p>{details.linkedProject.category}</p>
                </div>
              </div>
              <div className="linked-project-meta">
                <div className="meta-row">
                  <PortalIcon name="calendar" />
                  <div>
                    <label>Est. Completion</label>
                    <p>{details.linkedProject.estCompletion}</p>
                  </div>
                </div>
                <div className="meta-row">
                  <PortalIcon name="location" />
                  <div>
                    <label>Location</label>
                    <p>{details.linkedProject.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-panel">
            <h3>Action</h3>
            <div className="action-links">
              <button className="action-link-btn"><PortalIcon name="file" /> Print Quote</button>
              <button className="action-link-btn"><PortalIcon name="messages" /> Email to Client</button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        okButtonProps={{ loading: isResponding }}
        okText="Send response"
        onCancel={() => setResponseStatus(null)}
        onOk={handleRespond}
        open={Boolean(responseStatus)}
        title={
          responseStatus === 'APPROVED'
            ? 'Approve quote'
            : responseStatus === 'REJECTED'
              ? 'Reject quote'
              : 'Request quote review'
        }
      >
        <div className="admin-modal-form">
          <div className="form-group">
            <label htmlFor="quoteDetailResponseComment">Comment</label>
            <textarea
              id="quoteDetailResponseComment"
              onChange={(event) => setComment(event.target.value)}
              placeholder="Add a note for the team"
              rows={4}
              value={comment}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default QuoteDetail;
