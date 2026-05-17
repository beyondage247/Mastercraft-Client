import { useEffect, useMemo, useState } from 'react';
import FilterToolbar from '../../components/FilterToolbar';
import PageHeader from '../../components/PageHeader';
import { PortalIcon } from '../../components/PortalIcon';
import StatusBadge from '../../components/StatusBadge';
import { paymentFilters, paymentMetrics, payments } from '../../data/portal';
import type { PaymentItem, PaymentMethod } from '../../data/portal';
import { getPayments } from '../../services/portalApi';

type PaymentFilter = 'All' | PaymentMethod;

const methodTone = {
  ACH: 'danger',
  Check: 'info',
  'Credit Card': 'warning',
  Wire: 'warning',
} as const;

function Payments() {
  const [activeFilter, setActiveFilter] = useState<PaymentFilter>('All');
  const [metrics, setMetrics] = useState(paymentMetrics);
  const [paymentList, setPaymentList] = useState<PaymentItem[]>(payments);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;

    getPayments().then((data) => {
      if (isMounted) {
        setMetrics(data.metrics);
        setPaymentList(data.payments);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return paymentList.filter((payment) => {
      const matchesMethod = activeFilter === 'All' || payment.method === activeFilter;
      const matchesSearch =
        !normalizedSearch ||
        [payment.invoice, payment.project, payment.method, payment.reference]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesMethod && matchesSearch;
    });
  }, [activeFilter, paymentList, search]);

  return (
    <div className="page-stack">
      <PageHeader actionLabel="New Invoice" subtitle="Transaction history and payment records" title="Payments" />

      <section className="billing-metrics" aria-label="Payment summary">
        {metrics.map((metric) => (
          <article className="billing-metric" key={metric.label}>
            <div>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
            <span className="icon-tile icon-tile--danger">
              <PortalIcon name={metric.icon} />
            </span>
          </article>
        ))}
      </section>

      <FilterToolbar
        activeFilter={activeFilter}
        filters={paymentFilters}
        onFilterChange={setActiveFilter}
        onSearchChange={setSearch}
        search={search}
        searchLabel="payments"
      />

      <section className="payments-panel" aria-label="Payments">
        <div className="payments-table">
          <div className="payments-table__head">
            <span>PAYMENT DATE</span>
            <span>INVOICE</span>
            <span>PROJECT</span>
            <span>METHOD</span>
            <span>REFERENCE</span>
            <span>AMOUNT</span>
            <span />
          </div>
          {filteredPayments.map((payment) => (
            <article className="payments-table__row" key={payment.id}>
              <span>{payment.date}</span>
              <strong>{payment.invoice}</strong>
              <span>{payment.project}</span>
              <StatusBadge tone={methodTone[payment.method]}>{payment.method}</StatusBadge>
              <span>{payment.reference}</span>
              <span>{payment.amount}</span>
              <button type="button" aria-label={`Open payment ${payment.reference}`}>
                <PortalIcon name="right" />
              </button>
            </article>
          ))}
        </div>
        <p className="result-count">
          Showing {filteredPayments.length} of {paymentList.length} payments
        </p>
      </section>
    </div>
  );
}

export default Payments;
