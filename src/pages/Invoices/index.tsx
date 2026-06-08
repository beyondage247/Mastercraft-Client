import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { PortalIcon } from "../../components/PortalIcon";
import StatusBadge from "../../components/StatusBadge";
import type { InvoiceItem, InvoiceStatus } from "../../data/portal";
import { getInvoices } from "../../services/portalApi";

type InvoiceFilter = "All" | InvoiceStatus;

const statusFilters: InvoiceFilter[] = ["All", "Approved", "Paid", "Overdue", "Draft"];
const pageSize = 15;

const invoiceStatusTone = {
  Approved: "success",
  Draft: "neutral",
  Overdue: "danger",
  Paid: "success",
} as const;

function Invoices() {
  const [error, setError] = useState("");
  const [invoiceList, setInvoiceList] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Awaited<ReturnType<typeof getInvoices>>["metrics"]>([]);
  const [page, setPage] = useState(1);
  const [projectFilter, setProjectFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceFilter>("All");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError("");

    getInvoices()
      .then((data) => {
        if (isMounted) {
          setInvoiceList(data.invoices);
          setMetrics(data.metrics);
        }
      })
      .catch((requestError: Error) => {
        if (isMounted) {
          setInvoiceList([]);
          setMetrics([]);
          setError(requestError.message || "Unable to load invoices.");
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

  const projectFilters = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(invoiceList.map((invoice) => invoice.project).filter(Boolean)),
      ),
    ],
    [invoiceList],
  );

  const filteredInvoices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return invoiceList.filter((invoice) => {
      const matchesStatus =
        statusFilter === "All" || invoice.status === statusFilter;
      const matchesProject =
        projectFilter === "All" || invoice.project === projectFilter;
      const matchesSearch =
        !normalizedSearch ||
        [invoice.id, invoice.invoiceId, invoice.project, invoice.amount, invoice.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesProject && matchesSearch;
    });
  }, [invoiceList, projectFilter, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [invoiceList, projectFilter, search, statusFilter]);

  const paginatedInvoices = useMemo(
    () => filteredInvoices.slice((page - 1) * pageSize, page * pageSize),
    [filteredInvoices, page],
  );

  return (
    <div className="page-stack">
      <PageHeader
        subtitle="Track payments and billing history"
        title="Invoices"
      />

      <section className="billing-metrics" aria-label="Invoice summary">
        {metrics.map((metric, index) => (
          <article
            className={`billing-metric${index === 0 ? " billing-metric--featured" : ""}`}
            key={metric.label}
          >
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

      <section className="billing-filter-panel" aria-label="Invoice filters">
        <label className="stacked-select">
          <span>Status</span>
          <span className="select-field">
            <PortalIcon name="filter" />
            <select
              aria-label="Invoice status"
              onChange={(event) =>
                setStatusFilter(event.target.value as InvoiceFilter)
              }
              value={statusFilter}
            >
              {statusFilters.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
            <PortalIcon name="down" />
          </span>
        </label>

        <label className="stacked-select">
          <span>Project</span>
          <span className="select-field">
            <PortalIcon name="filter" />
            <select
              aria-label="Invoice project"
              onChange={(event) => setProjectFilter(event.target.value)}
              value={projectFilter}
            >
              {projectFilters.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
            <PortalIcon name="down" />
          </span>
        </label>

        <label className="invoice-search">
          <span>Search</span>
          <span className="asset-search">
            <PortalIcon name="search" />
            <input
              aria-label="Search invoices"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice number or project..."
              type="search"
              value={search}
            />
          </span>
        </label>
      </section>

      <section className="record-list" aria-label="Invoices">
        {loading ? (
          <div className="quote-payment-schedule__empty">Loading invoices...</div>
        ) : error ? (
          <div className="quote-payment-schedule__empty">{error}</div>
        ) : filteredInvoices.length ? (
          paginatedInvoices.map((invoice, index) => {
          const displayInvoiceId = invoice.invoiceId || invoice.id;

          return (
            <article
              className="invoice-card"
              key={`${invoice.id}-${invoice.status}-${index}`}
              onClick={() => navigate(`/invoices/${invoice.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div>
                <div className="invoice-card__idline">
                  <span>{displayInvoiceId}</span>
                  <StatusBadge
                    icon={invoice.status === "Paid" ? "check" : "clock"}
                    tone={invoiceStatusTone[invoice.status]}
                  >
                    {invoice.status}
                  </StatusBadge>
                </div>
                <h2>{invoice.project}</h2>
                <div className="invoice-card__details">
                  <span>{invoice.amount}</span>
                  <span>
                    <PortalIcon name="calendar" />
                    Issued: {invoice.issuedDate}
                  </span>
                  <span>
                    <PortalIcon name="clock" />
                    Due: {invoice.dueDate}
                  </span>
                </div>
              </div>
              <div className="invoice-card__actions">
                <button
                  type="button"
                  aria-label={`Download ${displayInvoiceId}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <PortalIcon name="download" />
                </button>
                <button type="button" aria-label={`Open ${displayInvoiceId}`}>
                  <PortalIcon name="right" />
                </button>
              </div>
            </article>
          );
        })
        ) : (
          <div className="quote-payment-schedule__empty">No invoices have been created yet.</div>
        )}
      </section>

      <p className="result-count">
        Showing {paginatedInvoices.length} of {filteredInvoices.length} invoices
      </p>
      <Pagination
        className="admin-client-pagination"
        current={page}
        onChange={setPage}
        pageSize={pageSize}
        showSizeChanger={false}
        total={filteredInvoices.length}
      />
    </div>
  );
}

export default Invoices;
