import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { PortalIcon } from '../../components/PortalIcon';
import QuotePaymentSchedulePanel from '../../components/QuotePaymentSchedulePanel';
import StatusBadge from '../../components/StatusBadge';
import { createCheckoutSession, downloadInvoicePdf, getInvoiceDetail, getProjectPayments, type ProjectPaymentSummary } from '../../services/portalApi';
import type { InvoiceItem, InvoiceDetailInfo, PaymentItem } from '../../data/portal';
import { showRequestToast } from '../../utils/portalToast';

const paymentStatusLabels = {
  PAID: 'Paid',
  PARTIALLY_PAID: 'Partially paid',
  UNPAID: 'Unpaid',
} as const;

const paymentStatusTone = {
  PAID: 'success',
  PARTIALLY_PAID: 'warning',
  UNPAID: 'neutral',
} as const;

function matchesInvoicePayment(payment: PaymentItem, invoice: InvoiceItem) {
  const invoiceKeys = [invoice.id, invoice.invoiceId].filter(Boolean);

  return invoiceKeys.some((key) => key === payment.invoiceId || key === payment.invoice);
}

function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceItem | null>(null);
  const [details, setDetails] = useState<InvoiceDetailInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSummary, setPaymentSummary] = useState<ProjectPaymentSummary | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadInvoice() {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setPaymentError('');
      setPaymentSummary(null);
      setPaymentsLoading(false);

      try {
        const data = await getInvoiceDetail(id);

        if (!isMounted) {
          return;
        }

        setInvoice(data.invoice ?? null);
        setDetails(data.details ?? null);
        setLoading(false);

        if (!data.invoice?.projectId) {
          return;
        }

        setPaymentsLoading(true);

        try {
          const summary = await getProjectPayments(data.invoice.projectId);

          if (isMounted) {
            setPaymentSummary(summary);
          }
        } catch (error) {
          if (isMounted) {
            setPaymentError(error instanceof Error ? error.message : 'Unable to load payment details.');
          }
        } finally {
          if (isMounted) {
            setPaymentsLoading(false);
          }
        }
      } catch {
        if (isMounted) {
          setInvoice(null);
          setDetails(null);
          setLoading(false);
        }
      }
    }

    loadInvoice();

    return () => {
      isMounted = false;
    };
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
  const invoicePayments = paymentSummary?.payments.filter((payment) => matchesInvoicePayment(payment, invoice)) ?? [];
  const paymentStatus = paymentSummary?.paymentStatus ?? 'UNPAID';
  const canPay = invoice.status === 'Approved' && paymentStatus !== 'PAID';
  const amountPaidNumber = paymentSummary ? Number(paymentSummary.amountPaid.replace(/[^0-9.-]/g, '')) || 0 : 0;

  async function handlePayScheduleItem(amount: number) {
    if (!invoice) {
      return;
    }

    setCheckoutLoading(true);

    try {
      const { url } = await createCheckoutSession(invoice.id, amount);

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      const toast = showRequestToast('invoice-pay-now', '');
      toast.error(error instanceof Error ? error.message : 'Unable to create payment session.');
      setCheckoutLoading(false);
    }
  }

  async function handlePayNow() {
    if (!invoice) {
      return;
    }

    setCheckoutLoading(true);

    try {
      const { url } = await createCheckoutSession(invoice.id);

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      const toast = showRequestToast('invoice-pay-now', '');
      toast.error(error instanceof Error ? error.message : 'Unable to create payment session.');
      setCheckoutLoading(false);
    }
  }

  async function handleDownloadInvoice() {
    if (!invoice) {
      return;
    }

    const toast = showRequestToast('invoice-detail-download', 'Downloading invoice PDF...');

    try {
      await downloadInvoicePdf(invoice.id, `${displayInvoiceId}.pdf`);
      toast.success('Invoice PDF downloaded.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to download invoice PDF.');
    }
  }

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
          <button className="secondary-action-btn" onClick={handleDownloadInvoice} type="button">
            <PortalIcon name="download" /> PDF
          </button>
          {canPay && !invoice.paymentSchedule && (
            <button
              className="pay-now-btn"
              disabled={checkoutLoading}
              onClick={handlePayNow}
              type="button"
            >
              <PortalIcon name="dollar" /> {checkoutLoading ? 'Redirecting...' : 'Pay Now'}
            </button>
          )}
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
              {details.lineItems.length ? (
                details.lineItems.map((item, idx) => (
                  <div className="line-item-row" key={idx}>
                    <div className="line-item-icon"><PortalIcon name="documents" /></div>
                    <div className="line-item-info">
                      <h4>{item.description}</h4>
                      <p>Qty: {item.qty} &nbsp;&nbsp;@ {item.rate} / ea</p>
                    </div>
                    <div className="line-item-amount">{item.amount}</div>
                  </div>
                ))
              ) : (
                <div className="quote-payment-schedule__empty">No line items were returned for this invoice.</div>
              )}
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

            <QuotePaymentSchedulePanel
              paymentSchedule={invoice.paymentSchedule}
              amountPaid={canPay ? amountPaidNumber : undefined}
              onPayItem={canPay ? handlePayScheduleItem : undefined}
              payDisabled={checkoutLoading}
            />

          </div>
        </div>

        <div className="detail-grid-right">
          <div className="detail-panel">
            <div className="panel-flex-header">
              <h3>Payment Details</h3>
              <StatusBadge tone={paymentStatusTone[paymentStatus]}>{paymentStatusLabels[paymentStatus]}</StatusBadge>
            </div>
            <div className="invoice-payment-summary">
              <div>
                <span>Amount paid</span>
                <strong>{paymentsLoading ? 'Loading...' : paymentSummary?.amountPaid || '$0.00'}</strong>
              </div>
              <div>
                <span>Amount due</span>
                <strong>{paymentsLoading ? 'Loading...' : paymentSummary?.amountDue || details.total}</strong>
              </div>
            </div>
            {paymentError ? (
              <div className="quote-payment-schedule__empty">{paymentError}</div>
            ) : paymentsLoading ? (
              <div className="quote-payment-schedule__empty">Loading recorded payments...</div>
            ) : invoicePayments.length ? (
              <div className="payments-table project-payment-table invoice-payment-table">
                <div className="payments-table__head">
                  <span>Date</span>
                  <span>Method</span>
                  <span>Reference</span>
                  <span>Amount</span>
                </div>
                {invoicePayments.map((payment) => (
                  <article className="payments-table__row" key={payment.id}>
                    <span>{payment.date || 'Not set'}</span>
                    <span>{payment.method}</span>
                    <span>{payment.reference}</span>
                    <strong>{payment.amount}</strong>
                  </article>
                ))}
              </div>
            ) : (
              <div className="quote-payment-schedule__empty">No payments have been recorded for this invoice.</div>
            )}
          </div>

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

          {/* <div className="detail-panel">
            <h3>Action</h3>
            <div className="action-links">
              <button className="action-link-btn"><PortalIcon name="file" /> Print Quote</button>
              <button className="action-link-btn"><PortalIcon name="messages" /> Email to Client</button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetail;
