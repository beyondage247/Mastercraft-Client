import { useEffect, useMemo, useState } from "react";
import { Dropdown, Pagination, type MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
import AdminPaymentModal from "../../components/AdminPaymentModal";
import PageHeader from "../../components/PageHeader";
import { PortalIcon } from "../../components/PortalIcon";
import StatusBadge from "../../components/StatusBadge";
import type { InvoiceItem } from "../../data/portal";
import { getInvoices } from "../../services/portalApi";

const pageSize = 15;

function invoiceTone(status: InvoiceItem["status"]) {
  if (status === "Paid" || status === "Approved") return "success";
  if (status === "Overdue") return "danger";
  return "neutral";
}

function AdminInvoices() {
  const [error, setError] = useState("");
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceItem | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError("");

    getInvoices()
      .then((data) => {
        if (isMounted) {
          setInvoices(data.invoices);
        }
      })
      .catch((requestError: Error) => {
        if (isMounted) {
          setError(requestError.message || "Unable to load invoices.");
          setInvoices([]);
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

  function refreshInvoices() {
    return getInvoices().then((data) => {
      setInvoices(data.invoices);
    });
  }

  function actionMenu(invoice: InvoiceItem): MenuProps {
    return {
      items: [
        { disabled: invoice.status === "Paid", key: "record-payment", label: "Record payment" },
        { key: "view", label: "View" },
      ],
      onClick: ({ key }) => {
        if (key === "record-payment") {
          setPaymentInvoice(invoice);
          return;
        }

        navigate(`/admin/invoices/${invoice.id}`);
      },
    };
  }

  const visibleInvoices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return invoices;
    }

    return invoices.filter((invoice) =>
      [
        invoice.invoiceId,
        invoice.id,
        invoice.clientName,
        invoice.project,
        invoice.total,
        invoice.amount,
        invoice.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [invoices, search]);

  useEffect(() => {
    setPage(1);
  }, [invoices, search]);

  const paginatedInvoices = useMemo(
    () => visibleInvoices.slice((page - 1) * pageSize, page * pageSize),
    [page, visibleInvoices],
  );

  return (
    <div className="page-stack admin-page">
      <PageHeader subtitle="Invoices created for client projects" title="Invoices" />

      <section className="panel admin-client-list">
        <div className="panel__header">
          <h2>Invoice List</h2>
          <span>{visibleInvoices.length} showing</span>
        </div>
        <label className="admin-table-search">
          <PortalIcon name="search" />
          <input
            aria-label="Search invoices"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search invoices"
            type="search"
            value={search}
          />
        </label>
        <div className="admin-record-table admin-record-table--invoices">
          <div className="admin-record-table__head">
            <span>Invoice</span>
            <span>Client</span>
            <span>Project</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {loading ? (
            <div className="admin-empty-row">Loading invoices...</div>
          ) : error ? (
            <div className="admin-empty-row">{error}</div>
          ) : visibleInvoices.length ? (
            paginatedInvoices.map((invoice) => (
              <article
                className="admin-record-table__row"
                key={invoice.id}
                onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                style={{ cursor: "pointer" }}
              >
                <strong>{invoice.invoiceId || invoice.id}</strong>
                <span>{invoice.clientName || "Not set"}</span>
                <span>{invoice.project || "Not set"}</span>
                <span>{invoice.total || invoice.amount}</span>
                <StatusBadge tone={invoiceTone(invoice.status)}>{invoice.status}</StatusBadge>
                <span onClick={(event) => event.stopPropagation()}>
                  <Dropdown menu={actionMenu(invoice)} placement="bottomRight">
                    <button className="table-action-button" type="button">
                      <span>Actions</span>
                      <PortalIcon name="down" />
                    </button>
                  </Dropdown>
                </span>
              </article>
            ))
          ) : (
            <div className="admin-empty-row">No invoices have been created yet.</div>
          )}
        </div>
        <Pagination
          className="admin-client-pagination"
          current={page}
          onChange={setPage}
          pageSize={pageSize}
          showSizeChanger={false}
          total={visibleInvoices.length}
        />
      </section>
      <AdminPaymentModal
        invoice={paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        onRecorded={() => {
          refreshInvoices().catch(() => undefined);
        }}
        open={Boolean(paymentInvoice)}
      />
    </div>
  );
}

export default AdminInvoices;
