import { useEffect, useState } from "react";
import { Modal } from "antd";
import type { QuoteListItem } from "../../data/portal";
import AdminQuoteDetailModal from "../../components/AdminQuoteDetailModal";
import AdminQuoteModal from "../../components/AdminQuoteModal";
import AdminQuoteTable from "../../components/AdminQuoteTable";
import PageHeader from "../../components/PageHeader";
import { getQuotes, deleteQuote } from "../../services/portalApi";
import { showRequestToast } from "../../utils/portalToast";
import ExportButton from '../../components/ExportButton';

function AdminQuotes() {
  const [editingQuote, setEditingQuote] = useState<QuoteListItem | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [viewingQuote, setViewingQuote] = useState<QuoteListItem | null>(null);

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

  return (
    <div className="page-stack admin-page">
      <PageHeader subtitle="Quotes created for projects" title="Quotes" />

      <section className="panel admin-client-list">
        <div className="panel__header">
          <h2>Quote List</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>{quotes.length} total</span>
            <ExportButton
              data={quotes.map((q) => ({
                'Quote ID': q.uid,
                Title: q.title,
                Project: q.projectName ?? q.description,
                Amount: q.total ?? q.amount,
                Status: q.status,
                'Valid Until': q.validUntil,
              }))}
              filename="quotes"
              label="Export"
            />
          </div>
        </div>
        <AdminQuoteTable
          error={error}
          isLoading={isLoading}
          onDelete={handleDeleteQuote}
          onEdit={setEditingQuote}
          onView={setViewingQuote}
          quotes={quotes}
        />
      </section>

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
