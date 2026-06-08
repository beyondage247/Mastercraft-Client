import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import FilterToolbar from "../../components/FilterToolbar";
import PageHeader from "../../components/PageHeader";
import { PortalIcon } from "../../components/PortalIcon";
import StatusBadge from "../../components/StatusBadge";
import { paymentFilters } from "../../data/portal";
import type { PaymentItem, PaymentMethod } from "../../data/portal";
import { getPayments } from "../../services/portalApi";

type PaymentFilter = "All" | PaymentMethod;

const methodTone = {
  ACH: "danger",
  Check: "info",
  "Credit Card": "warning",
  Wire: "warning",
} as const;

const pageSize = 15;

function Payments() {
  const [activeFilter, setActiveFilter] = useState<PaymentFilter>("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Awaited<ReturnType<typeof getPayments>>["metrics"]>([]);
  const [page, setPage] = useState(1);
  const [paymentList, setPaymentList] = useState<PaymentItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError("");

    getPayments()
      .then((data) => {
        if (isMounted) {
          setMetrics(data.metrics);
          setPaymentList(data.payments);
        }
      })
      .catch((requestError: Error) => {
        if (isMounted) {
          setMetrics([]);
          setPaymentList([]);
          setError(requestError.message || "Unable to load payments.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return paymentList.filter((payment) => {
      const matchesMethod =
        activeFilter === "All" || payment.method === activeFilter;
      const matchesSearch =
        !normalizedSearch ||
        [payment.invoice, payment.project, payment.method, payment.reference]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesMethod && matchesSearch;
    });
  }, [activeFilter, paymentList, search]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter, paymentList, search]);

  const paginatedPayments = useMemo(
    () => filteredPayments.slice((page - 1) * pageSize, page * pageSize),
    [filteredPayments, page],
  );

  return (
    <div className="page-stack">
      <PageHeader
        subtitle="Transaction history and payment records"
        title="Payments"
      />

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
        onFilterChange={(value) => setActiveFilter(value as PaymentFilter)}
        onSearchChange={(value) => setSearch(value)}
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
          {loading ? (
            <div className="quote-payment-schedule__empty">Loading payments...</div>
          ) : error ? (
            <div className="quote-payment-schedule__empty">{error}</div>
          ) : filteredPayments.length ? (
            paginatedPayments.map((payment) => (
              <article className="payments-table__row" key={payment.id}>
                <span>{payment.date}</span>
                <strong>{payment.invoice}</strong>
                <span>{payment.project}</span>
                <StatusBadge tone={methodTone[payment.method]}>
                  {payment.method}
                </StatusBadge>
                <span>{payment.reference}</span>
                <span>{payment.amount}</span>
                <button
                  type="button"
                  aria-label={`Open payment ${payment.reference}`}
                >
                  <PortalIcon name="right" />
                </button>
              </article>
            ))
          ) : (
            <div className="quote-payment-schedule__empty">No payments have been recorded yet.</div>
          )}
        </div>
        <p className="result-count">
          Showing {paginatedPayments.length} of {filteredPayments.length} payments
        </p>
        <Pagination
          className="admin-client-pagination"
          current={page}
          onChange={setPage}
          pageSize={pageSize}
          showSizeChanger={false}
          total={filteredPayments.length}
        />
      </section>
    </div>
  );
}

export default Payments;
