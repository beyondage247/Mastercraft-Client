import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { PortalIcon } from '../../components/PortalIcon';
import QuotePaymentSchedulePanel from '../../components/QuotePaymentSchedulePanel';
import StatusBadge from '../../components/StatusBadge';
import { getInvoiceDetail } from '../../services/portalApi';
import type { InvoiceItem, InvoiceDetailInfo } from '../../data/portal';

function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceItem | null>(null);
  const [details, setDetails] = useState<InvoiceDetailInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getInvoiceDetail(id).then((data) => {
        if (data.invoice) setInvoice(data.invoice);
        if (data.details) setDetails(data.details);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return <div className="page-stack">Loading...</div>;
  }

  if (!invoice || !details) {
    return (
      <div className="page-stack">
        <button className="back-link" onClick={() => navigate(location.pathname.startsWith('/admin/') ? '/admin/invoices' : '/invoices')}>
          <PortalIcon name="left" /> Back to Invoices
        </button>
        <div className="panel">Invoice not found</div>
      </div>
    );
  }

  const displayInvoiceId = invoice.invoiceId || invoice.id;
  const invoiceListPath = location.pathname.startsWith('/admin/') ? '/admin/invoices' : '/invoices';

  return (
    <div className="page-stack quote-detail-page invoice-detail-page">
      <button className="back-link" onClick={() => navigate(invoiceListPath)}>
        <PortalIcon name="left" /> Back to Invoices
      </button>

      <div className="billing-header">
        <div className="billing-header-title">
          <h1>{displayInvoiceId} <StatusBadge tone={invoice.status === 'Paid' ? 'success' : invoice.status === 'Overdue' ? 'danger' : 'neutral'}>{invoice.status}</StatusBadge></h1>
          <p>Issued <strong>{invoice.issuedDate}</strong></p>
        </div>
        <div className="billing-header-actions">
          <button className="secondary-action-btn"><PortalIcon name="download" /> PDF</button>
          <button className="pay-now-btn"><PortalIcon name="dollar" /> Pay Now</button>
        </div>
      </div>

      <div className="detail-panel billing-info-panel">
        <div className="billing-info-grid">
          <div className="billing-col">
            <label>BILL TO</label>
            <strong>{details.billToName}</strong>
            <p>{details.billToEmail}</p>
            <p>{details.billToAddress1}</p>
            <p>{details.billToAddress2}</p>
          </div>
          <div className="billing-col">
            <div className="billing-ref">
              <label>PROJECT REFERENCE</label>
              <p><PortalIcon name="clock" /> {details.projectReference}</p>
            </div>
            <div className="billing-ref">
              <label>QUOTE REFERENCE</label>
              <p><PortalIcon name="documents" /> {details.quoteReference}</p>
            </div>
          </div>
        </div>
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
                <span className="total-amount-red">{details.total}</span>
              </div>
            </div>

            <QuotePaymentSchedulePanel paymentSchedule={invoice.paymentSchedule} />

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
    </div>
  );
}

export default InvoiceDetail;
