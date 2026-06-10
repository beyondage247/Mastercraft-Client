import { useEffect, useMemo, useState } from "react";
import { Modal } from "antd";
import FilterToolbar from "../../components/FilterToolbar";
import PageHeader from "../../components/PageHeader";
import QuoteCard from "../../components/QuoteCard";
import StatCard from "../../components/StatCard";
import { quoteFilters } from "../../data/portal";
import type { QuoteFilter, QuoteListItem } from "../../data/portal";
import { getQuotes, respondToQuote, type QuoteDecisionStatus } from "../../services/portalApi";
import { showRequestToast } from "../../utils/portalToast";

function matchesQuoteFilter(quote: QuoteListItem, filter: QuoteFilter) {
  return filter === "All" || quote.status === filter;
}

function Quotes() {
  const [activeFilter, setActiveFilter] = useState<QuoteFilter>("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Awaited<ReturnType<typeof getQuotes>>["metrics"]>([]);
  const [comment, setComment] = useState("");
  const [respondingQuote, setRespondingQuote] = useState<QuoteListItem | null>(null);
  const [responseStatus, setResponseStatus] = useState<QuoteDecisionStatus>("APPROVED");
  const [isResponding, setIsResponding] = useState(false);
  const [search, setSearch] = useState("");
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError("");

    getQuotes()
      .then((data) => {
        if (isMounted) {
          setMetrics(data.metrics);
          setQuotes(data.quotes);
        }
      })
      .catch((requestError: Error) => {
        if (isMounted) {
          setMetrics([]);
          setQuotes([]);
          setError(requestError.message || "Unable to load quotes.");
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

  const filteredQuotes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return quotes.filter((quote) => {
      const matchesSearch =
        !normalizedSearch ||
        [quote.id, quote.uid, quote.title, quote.description, quote.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesQuoteFilter(quote, activeFilter) && matchesSearch;
    });
  }, [activeFilter, quotes, search]);

  function openResponseModal(quote: QuoteListItem, status: QuoteDecisionStatus) {
    setRespondingQuote(quote);
    setResponseStatus(status);
    setComment("");
  }

  async function handleRespond() {
    if (!respondingQuote) {
      return;
    }

    if ((responseStatus === "REJECTED" || responseStatus === "IN_REVIEW") && !comment.trim()) {
      showRequestToast("quote-response-validation", "Checking response...").error(
        "Please add a comment for a rejection or review request.",
      );
      return;
    }

    const toast = showRequestToast("quote-response", "Sending quote response...");
    setIsResponding(true);

    try {
      const updatedQuote = await respondToQuote(respondingQuote.id, responseStatus, comment.trim());
      setQuotes((currentQuotes) =>
        currentQuotes.map((quote) => (quote.id === updatedQuote.id ? updatedQuote : quote)),
      );
      toast.success("Quote response was sent.");
      setRespondingQuote(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send quote response.");
    } finally {
      setIsResponding(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        subtitle="Manage your project estimates and approvals"
        title="Quotes"
      />

      <section
        className="metrics-grid metrics-grid--four"
        aria-label="Quote summary"
      >
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>

      <FilterToolbar
        activeFilter={activeFilter}
        filters={quoteFilters}
        onFilterChange={(value) => setActiveFilter(value)}
        onSearchChange={(value) => setSearch(value)}
        search={search}
        searchLabel="quotes"
      />

      <section className="record-list" aria-label="Quotes">
        {loading ? (
          <div className="quote-payment-schedule__empty">Loading quotes...</div>
        ) : error ? (
          <div className="quote-payment-schedule__empty">{error}</div>
        ) : filteredQuotes.length ? (
          filteredQuotes.map((quote) => (
          <QuoteCard key={quote.uid} onRespond={openResponseModal} quote={quote} />
        ))
        ) : (
          <div className="quote-payment-schedule__empty">No quotes have been created yet.</div>
        )}
      </section>

      <p className="result-count">
        Showing {filteredQuotes.length} of {quotes.length} quotes
      </p>

      <Modal maskClosable={false}
        okButtonProps={{ loading: isResponding }}
        okText="Send response"
        onCancel={() => setRespondingQuote(null)}
        onOk={handleRespond}
        open={Boolean(respondingQuote)}
        title={
          responseStatus === "APPROVED"
            ? "Approve quote"
            : responseStatus === "REJECTED"
              ? "Reject quote"
              : "Request quote review"
        }
      >
        <div className="admin-modal-form">
          <div className="form-group">
            <label htmlFor="quoteResponseComment">Comment</label>
            <textarea
              id="quoteResponseComment"
              onChange={(event) => setComment(event.target.value)}
              placeholder="Add a note for the team"
              rows={4}
              value={comment}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Quotes;
