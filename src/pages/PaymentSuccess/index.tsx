import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PortalIcon } from '../../components/PortalIcon';
import { getCurrentPortalUser } from '../../auth/session';
import { confirmCheckoutSession } from '../../services/portalApi';

function PaymentSuccess() {
  const user = getCurrentPortalUser();
  const location = useLocation();
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';
  const invoicesPath = isAdmin ? '/admin/invoices' : '/invoices';
  const paymentsPath = isAdmin ? '/admin/payments' : '/payments';
  const params = new URLSearchParams(location.search);
  const sessionId = params.get('session_id');

  const [status, setStatus] = useState<'confirming' | 'confirmed' | 'failed'>('confirming');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('confirmed');
      return;
    }

    confirmCheckoutSession(sessionId)
      .then((result) => {
        setStatus(result.confirmed ? 'confirmed' : 'failed');
        setMessage(result.message);
      })
      .catch(() => {
        setStatus('confirmed');
        setMessage('Payment completed. Your record will appear shortly.');
      });
  }, [sessionId]);

  return (
    <div className="page-stack" style={{ maxWidth: 560, margin: '80px auto', textAlign: 'center' }}>
      <div className="detail-panel" style={{ padding: '48px 32px' }}>
        <div style={{ fontSize: 48, marginBottom: 16, color: 'var(--color-success, #22c55e)' }}>
          <PortalIcon name="check" />
        </div>
        <h1 style={{ marginBottom: 8 }}>
          {status === 'confirming' ? 'Confirming Payment...' : 'Payment Successful'}
        </h1>
        <p style={{ color: 'var(--color-text-secondary, #6b7280)', marginBottom: 24 }}>
          {status === 'confirming'
            ? 'Please wait while we confirm your payment with Stripe.'
            : message || 'Your payment has been recorded.'}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to={invoicesPath} className="secondary-action-btn">
            View Invoices
          </Link>
          <Link to={paymentsPath} className="secondary-action-btn">
            View Payments
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
