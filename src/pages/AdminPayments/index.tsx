import { useEffect, useMemo, useState } from "react";
import { Pagination, Tabs } from "antd";
import type { PaymentItem, OutstandingPaymentItem } from "../../data/portal";
import PageHeader from "../../components/PageHeader";
import { PortalIcon } from "../../components/PortalIcon";
import { getPayments, getOutstandingPayments } from "../../services/portalApi";

const pageSize = 15;

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(Number.isFinite(value) ? value : 0);
}

function AdminPayments() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [outstandingPayments, setOutstandingPayments] = useState<OutstandingPaymentItem[]>([]);
  const [search, setSearch] = useState("");
  const [outstandingSearch, setOutstandingSearch] = useState("");
  const [activeTab, setActiveTab] = useState("payments");
  const [outstandingPage, setOutstandingPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      getPayments().catch((requestError: Error) => {
        if (isMounted) {
          setError(requestError.message || "Unable to load payments.");
        }
        return { payments: [] as PaymentItem[], metrics: [] };
      }),
      getOutstandingPayments().catch(() => [])
    ])
      .then(([paymentData, outstandingData]) => {
        if (isMounted) {
          setPayments(paymentData.payments);
          setOutstandingPayments(outstandingData);
          setError((currentError) => currentError || ""); // Keep existing error if getPayments failed
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visiblePayments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return payments;
    }

    return payments.filter((payment) =>
      [payment.reference, payment.invoice, payment.project, payment.amount, payment.method, payment.date]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [payments, search]);

  useEffect(() => {
    setPage(1);
  }, [payments, search]);

  const paginatedPayments = useMemo(
    () => visiblePayments.slice((page - 1) * pageSize, page * pageSize),
    [page, visiblePayments],
  );

  const visibleOutstanding = useMemo(() => {
    const normalizedSearch = outstandingSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return outstandingPayments;
    }

    return outstandingPayments.filter((payment) =>
      [payment.projectName, payment.clientName, payment.amountOverdue]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [outstandingPayments, outstandingSearch]);

  useEffect(() => {
    setOutstandingPage(1);
  }, [outstandingPayments, outstandingSearch]);

  const paginatedOutstanding = useMemo(
    () => visibleOutstanding.slice((outstandingPage - 1) * pageSize, outstandingPage * pageSize),
    [outstandingPage, visibleOutstanding],
  );

  const summary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const paidAmountTotal = payments.reduce((sum, payment) => sum + (payment.amountValue || 0), 0);
    const overdueTotal = outstandingPayments.reduce((sum, payment) => sum + (payment.amountOverdueValue || 0), 0);

    const monthTotal = payments
      .filter((payment) => {
        if (!payment.dateISO) return false;
        const d = new Date(payment.dateISO);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, payment) => sum + (payment.amountValue || 0), 0);

    const yearTotal = payments
      .filter((payment) => {
        if (!payment.dateISO) return false;
        return new Date(payment.dateISO).getFullYear() === currentYear;
      })
      .reduce((sum, payment) => sum + (payment.amountValue || 0), 0);

    return {
      paidTotal: formatMoney(paidAmountTotal),
      overdueTotal: formatMoney(overdueTotal),
      monthTotal: formatMoney(monthTotal),
      yearTotal: formatMoney(yearTotal),
    };
  }, [payments, outstandingPayments]);

  const paymentsTab = (
    <section className="panel admin-client-list" style={{ marginTop: '0px' }}>
      <div className="panel__header">
        <h2>Payment List</h2>
        <span>{visiblePayments.length} showing</span>
      </div>
      <label className="admin-table-search">
        <PortalIcon name="search" />
        <input
          aria-label="Search payments"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search payments"
          type="search"
          value={search}
        />
      </label>
      <div className="admin-record-table admin-record-table--payments">
        <div className="admin-record-table__head">
          <span>Reference</span>
          <span>Invoice/Record</span>
          <span>Project</span>
          <span>Amount</span>
          <span>Method</span>
        </div>
        {isLoading ? (
          <div className="admin-empty-row">Loading payments...</div>
        ) : error ? (
          <div className="admin-empty-row">{error}</div>
        ) : visiblePayments.length ? (
          paginatedPayments.map((payment) => (
            <article className="admin-record-table__row" key={payment.id}>
              <strong>{payment.reference}</strong>
              <span>{payment.invoice}</span>
              <span>{payment.project}</span>
              <span>{payment.amount}</span>
              <span>{payment.method}</span>
            </article>
          ))
        ) : (
          <div className="admin-empty-row">No payments have been recorded yet.</div>
        )}
      </div>
      <Pagination
        className="admin-client-pagination"
        current={page}
        onChange={setPage}
        pageSize={pageSize}
        showSizeChanger={false}
        total={visiblePayments.length}
      />
    </section>
  );

  const outstandingTab = (
    <section className="panel admin-client-list" style={{ marginTop: '0px' }}>
      <div className="panel__header">
        <h2>Outstanding List</h2>
        <span>{visibleOutstanding.length} showing</span>
      </div>
      <label className="admin-table-search">
        <PortalIcon name="search" />
        <input
          aria-label="Search outstanding payments"
          onChange={(event) => setOutstandingSearch(event.target.value)}
          placeholder="Search outstanding payments"
          type="search"
          value={outstandingSearch}
        />
      </label>
      <div className="admin-record-table admin-record-table--payments">
        <div className="admin-record-table__head" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <span>Project Name</span>
          <span>Client Name</span>
          <span>Amount Overdue</span>
        </div>
        {isLoading ? (
          <div className="admin-empty-row">Loading outstanding data...</div>
        ) : visibleOutstanding.length ? (
          paginatedOutstanding.map((item) => (
            <article className="admin-record-table__row" key={item.projectId} style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              <strong>{item.projectName}</strong>
              <span>{item.clientName}</span>
              <span className="text-danger"><strong>{item.amountOverdue}</strong></span>
            </article>
          ))
        ) : (
          <div className="admin-empty-row">No outstanding balances found.</div>
        )}
      </div>
      <Pagination
        className="admin-client-pagination"
        current={outstandingPage}
        onChange={setOutstandingPage}
        pageSize={pageSize}
        showSizeChanger={false}
        total={visibleOutstanding.length}
      />
    </section>
  );

  return (
    <div className="page-stack admin-page">
      <PageHeader subtitle="Payments recorded against invoices" title="Payments" />

      <section className="billing-metrics" aria-label="Payments summary">
        <article className="billing-metric billing-metric--featured">
          <div>
            <span>Paid Amount</span>
            <strong>{summary.paidTotal}</strong>
          </div>
          <span className="icon-tile icon-tile--success">
            <PortalIcon name="dollar" />
          </span>
        </article>
        <article className="billing-metric">
          <div>
            <span>Paid This Month</span>
            <strong>{summary.monthTotal}</strong>
          </div>
          <span className="icon-tile icon-tile--primary">
            <PortalIcon name="calendar" />
          </span>
        </article>
        <article className="billing-metric">
          <div>
            <span>Paid This Year</span>
            <strong>{summary.yearTotal}</strong>
          </div>
          <span className="icon-tile icon-tile--info">
            <PortalIcon name="calendar" />
          </span>
        </article>
        <article className="billing-metric">
          <div>
            <span>Overdue Amount</span>
            <strong>{summary.overdueTotal}</strong>
          </div>
          <span className="icon-tile icon-tile--danger">
            <PortalIcon name="clock" />
          </span>
        </article>
      </section>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          { key: 'payments', label: 'Payments', children: paymentsTab },
          { key: 'outstanding', label: 'Outstanding', children: outstandingTab }
        ]}
      />
    </div>
  );
}

export default AdminPayments;
