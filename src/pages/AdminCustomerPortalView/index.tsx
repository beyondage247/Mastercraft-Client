import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pagination, Tabs } from "antd";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import ProjectCard from "../../components/ProjectCard";
import QuoteCard from "../../components/QuoteCard";
import { PortalIcon } from "../../components/PortalIcon";
import AdminProjectDetailModal from "../../components/AdminProjectDetailModal";
import AdminQuoteDetailModal from "../../components/AdminQuoteDetailModal";
import type { DocumentItem, InvoiceItem, Metric, PaymentItem, PaymentMethod, ProjectListItem, QuoteListItem } from "../../data/portal";
import {
  buildProjectMetrics,
  buildQuoteMetrics,
  downloadInvoicePdf,
  getClientDetails,
  getDocuments,
  getInvoices,
  getPayments,
  getProjectsForClient,
  getQuotes,
  type ClientRecord,
} from "../../services/portalApi";
import { showRequestToast } from "../../utils/portalToast";

const pageSize = 10;

const invoiceStatusTone = {
  Approved: "success",
  Draft: "neutral",
  Overdue: "danger",
  Paid: "success",
} as const;

const paymentMethodTone: Record<PaymentMethod, "danger" | "info" | "warning" | "success"> = {
  ACH: "danger",
  Check: "info",
  "Credit Card": "warning",
  Stripe: "success",
  Wire: "warning",
};

function belongsToClient(
  item: { projectId?: string; clientId?: string; clientName?: string },
  clientId: string,
  clientName: string | undefined,
  projectIds: Set<string>,
): boolean {
  if (item.projectId && projectIds.has(item.projectId)) return true;
  if (item.clientId && item.clientId === clientId) return true;
  if (item.clientName && clientName && item.clientName === clientName) return true;
  return false;
}

function AdminCustomerPortalView() {
  const { clientId = "" } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [client, setClient] = useState<ClientRecord | null>(null);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [documentFolder, setDocumentFolder] = useState<{ project: string; folder: string } | null>(null);
  const [invoicePage, setInvoicePage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [viewingProject, setViewingProject] = useState<ProjectListItem | null>(null);
  const [viewingQuote, setViewingQuote] = useState<QuoteListItem | null>(null);

  useEffect(() => {
    if (!clientId) {
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");

    async function load() {
      try {
        const [clientRecord, clientProjects] = await Promise.all([
          getClientDetails(clientId),
          getProjectsForClient(clientId),
        ]);

        const projectIds = new Set(clientProjects.map((project) => project.id));

        const [quoteData, invoiceData, paymentData, documentData] = await Promise.all([
          getQuotes().catch(() => ({ metrics: [] as Metric[], quotes: [] as QuoteListItem[] })),
          getInvoices().catch(() => ({ invoices: [] as InvoiceItem[], metrics: [] as Metric[] })),
          getPayments().catch(() => ({ metrics: [] as Metric[], payments: [] as PaymentItem[] })),
          getDocuments(clientProjects).catch(() => ({ documents: [] as DocumentItem[] })),
        ]);

        if (!isMounted) return;

        setClient(clientRecord);
        setProjects(clientProjects);
        setQuotes(quoteData.quotes.filter((quote) => belongsToClient(quote, clientId, clientRecord.name, projectIds)));
        setInvoices(invoiceData.invoices.filter((invoice) => belongsToClient(invoice, clientId, clientRecord.name, projectIds)));
        setPayments(paymentData.payments.filter((payment) => payment.clientId === clientId));
        setDocuments(documentData.documents);
      } catch (requestError) {
        if (isMounted) {
          setError(requestError instanceof Error ? requestError.message : "Unable to load this customer's portal view.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [clientId]);

  const projectMetrics = useMemo(() => buildProjectMetrics(projects), [projects]);
  const quoteMetrics = useMemo(() => buildQuoteMetrics(quotes), [quotes]);

  const homeMetrics: Metric[] = useMemo(
    () => [
      { icon: "activeProjects", label: "Active Projects", tone: "danger", value: `${Math.min(projects.length, 3)}` },
      {
        icon: "file",
        label: "Pending Quotes",
        tone: "neutral",
        value: quoteMetrics.find((metric) => metric.label === "Pending")?.value ?? "0",
      },
      { icon: "messages", label: "Unread Messages", tone: "info", value: "0" },
    ],
    [projects, quoteMetrics],
  );

  const paginatedInvoices = useMemo(
    () => invoices.slice((invoicePage - 1) * pageSize, invoicePage * pageSize),
    [invoices, invoicePage],
  );

  const paginatedPayments = useMemo(
    () => payments.slice((paymentPage - 1) * pageSize, paymentPage * pageSize),
    [payments, paymentPage],
  );

  const documentGroups = useMemo(() => {
    const groups = new Map<string, DocumentItem[]>();
    documents.forEach((document) => {
      const key = document.project || "Unassigned project";
      groups.set(key, [...(groups.get(key) ?? []), document]);
    });
    return Array.from(groups.entries()).map(([project, items]) => ({ items, project }));
  }, [documents]);

  async function handleDownloadInvoice(invoice: InvoiceItem) {
    const displayInvoiceId = invoice.invoiceId || invoice.id;
    const toast = showRequestToast(`customer-view-invoice-download-${invoice.id}`, "Downloading invoice PDF...");

    try {
      await downloadInvoicePdf(invoice.id, `${displayInvoiceId}.pdf`);
      toast.success("Invoice PDF downloaded.");
    } catch (downloadError) {
      toast.error(downloadError instanceof Error ? downloadError.message : "Unable to download invoice PDF.");
    }
  }

  const homeTab = (
    <div className="page-stack">
      <section className="metrics-grid metrics-grid--three" aria-label="Client portal summary">
        {homeMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>
      <section className="panel active-projects-panel">
        <div className="panel__header">
          <h2>Active Projects</h2>
        </div>
        <div className="active-project-list">
          {projects.slice(0, 3).map((project) => (
            <article className="active-project-row" key={project.id}>
              <PortalIcon name="file" />
              <div>
                <h3>{project.title}</h3>
                <p>{project.location}</p>
              </div>
              <div className="active-project-row__meta">
                <strong>{project.category}</strong>
                <span>{project.dueDate ? `Est: ${project.dueDate}` : "Est: Pending"}</span>
              </div>
              <StatusBadge tone="neutral">{project.status}</StatusBadge>
            </article>
          ))}
        </div>
      </section>
    </div>
  );

  const projectsTab = (
    <div className="page-stack">
      <section className="metrics-grid metrics-grid--four" aria-label="Project summary">
        {projectMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>
      <section className="record-list" aria-label="Projects">
        {projects.length ? (
          projects.map((project) => (
            <ProjectCard key={project.id} onOpen={setViewingProject} project={project} />
          ))
        ) : (
          <div className="panel">No projects have been assigned to this account yet.</div>
        )}
      </section>
    </div>
  );

  const quotesTab = (
    <div className="page-stack">
      <section className="metrics-grid metrics-grid--four" aria-label="Quote summary">
        {quoteMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>
      <section className="record-list" aria-label="Quotes">
        {quotes.length ? (
          quotes.map((quote) => (
            <QuoteCard key={quote.uid || quote.id} onOpen={setViewingQuote} quote={quote} readOnly />
          ))
        ) : (
          <div className="quote-payment-schedule__empty">No quotes have been created yet.</div>
        )}
      </section>
    </div>
  );

  const invoicesTab = (
    <div className="page-stack">
      <section className="record-list" aria-label="Invoices">
        {invoices.length ? (
          paginatedInvoices.map((invoice, index) => {
            const displayInvoiceId = invoice.invoiceId || invoice.id;

            return (
              <article
                className="invoice-card"
                key={`${invoice.id}-${index}`}
                onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                style={{ cursor: "pointer" }}
              >
                <div>
                  <div className="invoice-card__idline">
                    <span>{displayInvoiceId}</span>
                    <StatusBadge icon={invoice.status === "Paid" ? "check" : "clock"} tone={invoiceStatusTone[invoice.status]}>
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
                    aria-label={`Download ${displayInvoiceId}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDownloadInvoice(invoice);
                    }}
                    type="button"
                  >
                    <PortalIcon name="download" />
                  </button>
                  <button aria-label={`Open ${displayInvoiceId}`} type="button">
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
        Showing {paginatedInvoices.length} of {invoices.length} invoices
      </p>
      <Pagination
        className="admin-client-pagination"
        current={invoicePage}
        onChange={setInvoicePage}
        pageSize={pageSize}
        showSizeChanger={false}
        total={invoices.length}
      />
    </div>
  );

  const paymentsTab = (
    <div className="page-stack">
      <section className="payments-panel" aria-label="Payments">
        <div className="payments-table">
          <div className="payments-table__head">
            <span>PAYMENT DATE</span>
            <span>INVOICE</span>
            <span>PROJECT</span>
            <span>METHOD</span>
            <span>REFERENCE</span>
            <span>AMOUNT</span>
          </div>
          {payments.length ? (
            paginatedPayments.map((payment) => (
              <article className="payments-table__row" key={payment.id}>
                <span>{payment.date}</span>
                <strong>{payment.invoice}</strong>
                <span>{payment.project}</span>
                <StatusBadge tone={paymentMethodTone[payment.method]}>{payment.method}</StatusBadge>
                <span>{payment.reference}</span>
                <span>{payment.amount}</span>
              </article>
            ))
          ) : (
            <div className="quote-payment-schedule__empty">No payments have been recorded yet.</div>
          )}
        </div>
        <p className="result-count">
          Showing {paginatedPayments.length} of {payments.length} payments
        </p>
        <Pagination
          className="admin-client-pagination"
          current={paymentPage}
          onChange={setPaymentPage}
          pageSize={pageSize}
          showSizeChanger={false}
          total={payments.length}
        />
      </section>
    </div>
  );

  const documentsTab = (
    <div className="page-stack">
      <section className="document-project-groups" aria-label="Documents grouped by project">
        {documentFolder ? (
          <article className="document-project-group">
            <button
              className="back-link"
              onClick={() => setDocumentFolder(null)}
              style={{ alignItems: "center", background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", display: "flex", gap: "8px", marginBottom: "16px" }}
              type="button"
            >
              <PortalIcon name="left" /> Back to Folders
            </button>
            <div className="document-project-group__header" style={{ marginBottom: "16px" }}>
              <h2>{documentFolder.project} &rsaquo; {documentFolder.folder}</h2>
            </div>
            <div className="project-upload-list">
              {documents
                .filter((doc) => (doc.project || "Unassigned project") === documentFolder.project && doc.type === documentFolder.folder)
                .map((doc) => (
                  <article className="project-upload-row" key={doc.id}>
                    <div>
                      <strong>{doc.title}</strong>
                      <span>{doc.date || "Not set"}</span>
                    </div>
                    <a className="table-action-button" href={doc.downloadUrl} rel="noreferrer" target="_blank">
                      <PortalIcon name="download" />
                      <span>Download</span>
                    </a>
                  </article>
                ))}
            </div>
          </article>
        ) : documentGroups.length ? (
          documentGroups.map((group) => {
            const folders = new Map<string, DocumentItem[]>();
            group.items.forEach((doc) => {
              const folderName = doc.type || "Uncategorized";
              folders.set(folderName, [...(folders.get(folderName) ?? []), doc]);
            });

            return (
              <article className="document-project-group" key={group.project} style={{ marginBottom: "40px" }}>
                <div className="document-project-group__header" style={{ marginBottom: "16px" }}>
                  <h2>{group.project}</h2>
                  <span>{group.items.length} total documents</span>
                </div>
                <div className="document-grid" style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                  {Array.from(folders.entries()).map(([folderName, docs]) => (
                    <div
                      className="document-folder"
                      key={folderName}
                      onClick={() => setDocumentFolder({ folder: folderName, project: group.project })}
                      style={{
                        alignItems: "center",
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        padding: "24px 16px",
                      }}
                    >
                      <div style={{ color: "var(--color-primary)", display: "flex" }}>
                        <PortalIcon name="documents" />
                      </div>
                      <strong style={{ fontSize: "15px", textAlign: "center" }}>{folderName}</strong>
                      <span style={{ color: "var(--color-text-light)", fontSize: "13px" }}>{docs.length} documents</span>
                    </div>
                  ))}
                </div>
              </article>
            );
          })
        ) : (
          <div className="quote-payment-schedule__empty">No documents match this view.</div>
        )}
      </section>
    </div>
  );

  return (
    <div className="page-stack admin-page">
      <PageHeader
        actionLabel="Back to Clients"
        onAction={() => navigate("/admin/clients")}
        subtitle={client ? `Viewing ${client.name}'s portal as an admin` : "Loading customer portal..."}
        title="Customer Portal View"
      />

      <div className="admin-feedback" role="note" style={{ background: "var(--color-surface-hover, #f5f5f5)", borderRadius: "8px", padding: "12px 16px" }}>
        Read-only preview — this shows what {client?.name || "the customer"} sees in their portal. Actions like approving a
        quote or paying an invoice are disabled here; use the admin actions on the Quotes/Payments pages instead.
      </div>

      {loading ? (
        <div className="panel">Loading customer portal...</div>
      ) : error ? (
        <div className="panel">{error}</div>
      ) : (
        <Tabs
          items={[
            { children: homeTab, key: "home", label: "Home" },
            { children: projectsTab, key: "projects", label: "Projects" },
            { children: quotesTab, key: "quotes", label: "Quotes" },
            { children: invoicesTab, key: "invoices", label: "Invoices" },
            { children: paymentsTab, key: "payments", label: "Payments" },
            { children: documentsTab, key: "documents", label: "Documents" },
          ]}
        />
      )}

      <AdminProjectDetailModal onClose={() => setViewingProject(null)} open={Boolean(viewingProject)} project={viewingProject} />
      <AdminQuoteDetailModal onClose={() => setViewingQuote(null)} open={Boolean(viewingQuote)} quote={viewingQuote} />
    </div>
  );
}

export default AdminCustomerPortalView;
