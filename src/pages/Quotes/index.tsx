import { useEffect, useMemo, useState } from "react";
import FilterToolbar from "../../components/FilterToolbar";
import PageHeader from "../../components/PageHeader";
import QuoteCard from "../../components/QuoteCard";
import StatCard from "../../components/StatCard";
import {
  quoteFilters,
  quoteMetrics,
  quotes as quoteSeed,
} from "../../data/portal";
import type { QuoteFilter, QuoteListItem } from "../../data/portal";
import { acceptQuote, getQuotes } from "../../services/portalApi";

function matchesQuoteFilter(quote: QuoteListItem, filter: QuoteFilter) {
  return filter === "All" || quote.status === filter;
}

function Quotes() {
  const [activeFilter, setActiveFilter] = useState<QuoteFilter>("All");
  const [metrics, setMetrics] = useState(quoteMetrics);
  const [search, setSearch] = useState("");
  const [quotes, setQuotes] = useState<QuoteListItem[]>(quoteSeed);

  useEffect(() => {
    let isMounted = true;

    getQuotes().then((data) => {
      if (isMounted) {
        setMetrics(data.metrics);
        setQuotes(data.quotes);
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
        [quote.id, quote.title, quote.description, quote.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesQuoteFilter(quote, activeFilter) && matchesSearch;
    });
  }, [activeFilter, quotes, search]);

  async function handleAccept(uid: string) {
    const previousQuotes = quotes;

    setQuotes((currentQuotes) =>
      currentQuotes.map((quote) =>
        quote.uid === uid ? { ...quote, status: "Accepted" } : quote,
      ),
    );

    try {
      await acceptQuote(uid);
    } catch {
      setQuotes(previousQuotes);
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
        {filteredQuotes.map((quote) => (
          <QuoteCard key={quote.uid} onAccept={handleAccept} quote={quote} />
        ))}
      </section>

      <p className="result-count">
        Showing {filteredQuotes.length} of {quotes.length} quotes
      </p>
    </div>
  );
}

export default Quotes;
