import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { PortalIcon } from "../../components/PortalIcon";
import StatusBadge from "../../components/StatusBadge";
import { invoiceMetrics, invoices } from "../../data/portal";
import type { InvoiceItem, InvoiceStatus } from "../../data/portal";
import { getInvoices } from "../../services/portalApi";

type InvoiceFilter = "All" | InvoiceStatus;

const statusFilters: InvoiceFilter[] = ["All", "Paid", "Overdue", "Draft"];
const invoiceStatusTone = {
  Draft: "neutral",
  Overdue: "danger",
  Paid: "success",
} as const;

function Invoices() {
  const [invoiceList, setInvoiceList] = useState<InvoiceItem[]>(invoices);
  const [metrics, setMetrics] = useState(invoiceMetrics);
  const [projectFilter, setProjectFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceFilter>("All");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    getInvoices().then((data) => {
      if (isMounted) {
        setInvoiceList(data.invoices);
        setMetrics(data.metrics);
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
        [invoice.id, invoice.project, invoice.amount, invoice.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesProject && matchesSearch;
    });
  }, [invoiceList, projectFilter, search, statusFilter]);

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
        {filteredInvoices.map((invoice, index) => (
          <article
            className="invoice-card"
            key={`${invoice.id}-${invoice.status}-${index}`}
            onClick={() => navigate(`/invoices/${invoice.id}`)}
            style={{ cursor: "pointer" }}
          >
            <div>
              <div className="invoice-card__idline">
                <span>{invoice.id}</span>
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
                  Issued: {invoice.dueDate}
                </span>
              </div>
            </div>
            <div className="invoice-card__actions">
              <button
                type="button"
                aria-label={`Download ${invoice.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <PortalIcon name="download" />
              </button>
              <button type="button" aria-label={`Open ${invoice.id}`}>
                <PortalIcon name="right" />
              </button>
            </div>
          </article>
        ))}
      </section>

      <p className="result-count">
        Showing {filteredInvoices.length} of {invoiceList.length} invoices
      </p>
    </div>
  );
}

export default Invoices;
