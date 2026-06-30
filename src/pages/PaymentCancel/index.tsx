import { Link, useNavigate } from 'react-router-dom';
import { PortalIcon } from '../../components/PortalIcon';
import { getCurrentPortalUser } from '../../auth/session';

function PaymentCancel() {
  const user = getCurrentPortalUser();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';
  const invoicesPath = isAdmin ? '/admin/invoices' : '/invoices';

  return (
    <div className="page-stack" style={{ maxWidth: 560, margin: '80px auto', textAlign: 'center' }}>
      <div className="detail-panel" style={{ padding: '48px 32px' }}>
        <div style={{ fontSize: 48, marginBottom: 16, color: 'var(--color-warning, #f59e0b)' }}>
          <PortalIcon name="clock" />
        </div>
        <h1 style={{ marginBottom: 8 }}>Payment Cancelled</h1>
        <p style={{ color: 'var(--color-text-secondary, #6b7280)', marginBottom: 24 }}>
          Your payment was not completed. No charges were made. You can try again from the invoice page.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="secondary-action-btn" onClick={() => navigate(-1)} type="button">
            <PortalIcon name="left" /> Go Back
          </button>
          <Link to={invoicesPath} className="secondary-action-btn">
            View Invoices
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;
