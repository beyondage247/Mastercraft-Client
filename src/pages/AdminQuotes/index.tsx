import { useEffect, useMemo, useState } from "react";
import { Modal } from "antd";
import type { QuoteListItem } from "../../data/portal";
import AdminQuoteDetailModal from "../../components/AdminQuoteDetailModal";
import AdminQuoteModal from "../../components/AdminQuoteModal";
import AdminQuoteTable from "../../components/AdminQuoteTable";
import PageHeader from "../../components/PageHeader";
import { getQuotes, deleteQuote, reactivateQuote, approveQuote, declineQuote, getCatalogItems, getQuoteCategories, type CatalogItem, type QuoteCategory } from "../../services/portalApi";
import QuoteCategoryManagerModal from "../../components/QuoteCategoryManagerModal";
import { ALL_CATEGORIES_FILTER, matchesCategoryFilter } from "../../utils/categoryFilter";
import { showRequestToast } from "../../utils/portalToast";
import ExportButton from '../../components/ExportButton';
import ReportFilterBar from "../../components/ReportFilterBar";
import { buildCatalogLookup, describeLineItemTaxonomy } from "../../utils/lineItemCatalog";
import { isDateWithinRange, type PortalDateRange } from "../../utils/dateFormat";

function AdminQuotes() {
  const [editingQuote, setEditingQuote] = useState<QuoteListItem | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [viewingQuote, setViewingQuote] = useState<QuoteListItem | null>(null);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const catalogById = useMemo(() => buildCatalogLookup(catalogItems), [catalogItems]);
  const [dateRange, setDateRange] = useState<PortalDateRange>(null);
  const [clientFilter, setClientFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES_FILTER);
  const [quoteCategories, setQuoteCategories] = useState<QuoteCategory[]>([]);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  const clientOptions = useMemo(
    () => Array.from(new Set(quotes.map((q) => q.clientName).filter((name): name is string => Boolean(name)))).sort(),
    [quotes],
  );

  const filteredQuotes = useMemo(
    () =>
      quotes.filter((q) => {
        const matchesClient = clientFilter === "All" || q.clientName === clientFilter;
        const matchesDate = isDateWithinRange(q.dateIssued || q.validUntil, dateRange);
        const matchesCategory = matchesCategoryFilter(q.categoryId, categoryFilter);

        return matchesClient && matchesDate && matchesCategory;
      }),
    [quotes, clientFilter, dateRange, categoryFilter],
  );

  function loadQuotes() {
    let isMounted = true;
    setIsLoading(true);

    getQuotes()
      .then((data) => {
        if (isMounted) {
          setQuotes(data.quotes);
          setError("");
        }
      })
      .catch((requestError: Error) => {
        if (isMounted) {
          setQuotes([]);
          setError(requestError.message || "Unable to load quotes.");
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
  }

  useEffect(() => {
    return loadQuotes();
  }, []);

  useEffect(() => {
    getCatalogItems()
      .then(setCatalogItems)
      .catch(() => setCatalogItems([]));
    getQuoteCategories()
      .then(setQuoteCategories)
      .catch(() => setQuoteCategories([]));
  }, []);

  function handleCategoriesChange(next: QuoteCategory[]) {
    const removedIds = new Set(
      quoteCategories.filter((category) => !next.some((item) => item.id === category.id)).map((category) => category.id),
    );

    setQuoteCategories(next);

    if (removedIds.size) {
      // Deleted categories are detached server-side (onDelete: SetNull); mirror that locally.
      setQuotes((current) =>
        current.map((quote) =>
          quote.categoryId && removedIds.has(quote.categoryId)
            ? { ...quote, categoryId: undefined, categoryName: undefined }
            : quote,
        ),
      );

      if (removedIds.has(categoryFilter)) {
        setCategoryFilter(ALL_CATEGORIES_FILTER);
      }
    }
  }

  function handleQuoteSaved(savedQuote: QuoteListItem) {
    setQuotes((current) => {
      const exists = current.some((quote) => quote.id === savedQuote.id);

      return exists
        ? current.map((quote) => (quote.id === savedQuote.id ? savedQuote : quote))
        : [savedQuote, ...current];
    });
    setEditingQuote(null);
  }

  function handleDeleteQuote(quote: QuoteListItem) {
    Modal.confirm({
      title: "Delete quote?",
      content: `Delete quote ${quote.uid || quote.id}? This cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        const toast = showRequestToast(`admin-quote-delete-${quote.id}`, "Deleting quote...");
        return deleteQuote(quote.id)
          .then(() => {
            toast.success("Quote deleted.");
            setQuotes((current) => current.filter((q) => q.id !== quote.id));
          })
          .catch((err) => toast.error(err instanceof Error ? err.message : "Unable to delete quote."));
      },
    });
  }

  function handleReactivateQuote(quote: QuoteListItem) {
    const toast = showRequestToast(`admin-quote-reactivate-${quote.id}`, "Reactivating quote...");
    reactivateQuote(quote.id)
      .then(() => {
        toast.success("Quote reactivated.");
        loadQuotes();
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Unable to reactivate quote."));
  }

  function handleApproveQuote(quote: QuoteListItem) {
    Modal.confirm({
      title: "Approve quote?",
      content: `Approve quote "${quote.title}"? This will mark it as approved.`,
      okText: "Approve",
      cancelText: "Cancel",
      onOk: () => {
        const toast = showRequestToast(`admin-quote-approve-${quote.id}`, "Approving quote...");
        return approveQuote(quote.id)
          .then(() => {
            toast.success("Quote approved.");
            setQuotes((current) =>
              current.map((q) => (q.id === quote.id ? { ...q, status: "Approved" } : q)),
            );
          })
          .catch((err) => toast.error(err instanceof Error ? err.message : "Unable to approve quote."));
      },
    });
  }

  function handleDeclineQuote(quote: QuoteListItem) {
    Modal.confirm({
      title: "Decline quote?",
      content: `Decline quote "${quote.title}"? The quote will be marked as rejected and its project as lost.`,
      okText: "Decline",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        const toast = showRequestToast(`admin-quote-decline-${quote.id}`, "Declining quote...");
        return declineQuote(quote.id)
          .then(() => {
            toast.success("Quote declined.");
            setQuotes((current) =>
              current.map((q) => (q.id === quote.id ? { ...q, status: "Rejected" } : q)),
            );
          })
          .catch((err) => toast.error(err instanceof Error ? err.message : "Unable to decline quote."));
      },
    });
  }

  return (
    <div className="page-stack admin-page">
      <PageHeader subtitle="Quotes created for projects" title="Quotes" />

      <section className="panel admin-client-list">
        <div className="panel__header">
          <h2>Quote List</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>{filteredQuotes.length} total</span>
            <button className="secondary-action-btn" onClick={() => setIsCategoryManagerOpen(true)} type="button">
              Categories
            </button>
            <ExportButton
              data={filteredQuotes.map((q) => {
                const taxonomy = describeLineItemTaxonomy(q.lineItems, catalogById);

                return {
                  'Quote ID': q.uid,
                  Title: q.title,
                  'Job Category': q.categoryName ?? '',
                  Client: q.clientName ?? '',
                  Project: q.projectName ?? q.description,
                  Amount: q.total ?? q.amount,
                  Status: q.status,
                  'Valid Until': q.validUntil,
                  Category: taxonomy.category,
                  Subcategory: taxonomy.subcategory,
                  Supplier: taxonomy.supplier,
                };
              })}
              filename="quotes"
              label="Export"
            />
          </div>
        </div>
        <ReportFilterBar
          categoryOptions={quoteCategories}
          categoryValue={categoryFilter}
          onCategoryChange={setCategoryFilter}
          clientOptions={clientOptions}
          clientValue={clientFilter}
          dateRange={dateRange}
          onClientChange={setClientFilter}
          onDateRangeChange={setDateRange}
        />
        <AdminQuoteTable
          error={error}
          isLoading={isLoading}
          onApprove={handleApproveQuote}
          onDecline={handleDeclineQuote}
          onDelete={handleDeleteQuote}
          onEdit={setEditingQuote}
          onReactivate={handleReactivateQuote}
          onView={setViewingQuote}
          quotes={filteredQuotes}
        />
      </section>

      <QuoteCategoryManagerModal
        categories={quoteCategories}
        onCategoriesChange={handleCategoriesChange}
        onClose={() => setIsCategoryManagerOpen(false)}
        open={isCategoryManagerOpen}
      />
      <AdminQuoteDetailModal
        onClose={() => setViewingQuote(null)}
        open={Boolean(viewingQuote)}
        quote={viewingQuote}
      />
      <AdminQuoteModal
        mode="edit"
        onClose={() => setEditingQuote(null)}
        onSaved={handleQuoteSaved}
        open={Boolean(editingQuote)}
        project={null}
        quote={editingQuote}
      />
    </div>
  );
}

export default AdminQuotes;
