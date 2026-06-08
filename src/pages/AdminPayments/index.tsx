import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import type { PaymentItem } from "../../data/portal";
import PageHeader from "../../components/PageHeader";
import { PortalIcon } from "../../components/PortalIcon";
import { getPayments } from "../../services/portalApi";

const pageSize = 15;

function AdminPayments() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    getPayments()
      .then((data) => {
        if (isMounted) {
          setPayments(data.payments);
          setError("");
        }
      })
      .catch((requestError: Error) => {
        if (isMounted) {
          setPayments([]);
          setError(requestError.message || "Unable to load payments.");
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

  return (
    <div className="page-stack admin-page">
      <PageHeader subtitle="Payments recorded against invoices" title="Payments" />

      <section className="panel admin-client-list">
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
    </div>
  );
}

export default AdminPayments;
