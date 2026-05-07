import { useMemo, useState } from 'react';
import FilterToolbar from '../../components/FilterToolbar';
import PageHeader from '../../components/PageHeader';
import QuoteCard from '../../components/QuoteCard';
import StatCard from '../../components/StatCard';
import { quoteFilters, quoteMetrics, quotes as quoteSeed } from '../../data/portal';
import type { QuoteFilter, QuoteListItem } from '../../data/portal';

function matchesQuoteFilter(quote: QuoteListItem, filter: QuoteFilter) {
  return filter === 'All' || quote.status === filter;
}

function Quotes() {
  const [activeFilter, setActiveFilter] = useState<QuoteFilter>('All');
  const [search, setSearch] = useState('');
  const [quotes, setQuotes] = useState<QuoteListItem[]>(quoteSeed);

  const filteredQuotes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return quotes.filter((quote) => {
      const matchesSearch =
        !normalizedSearch ||
        [quote.id, quote.title, quote.description, quote.status]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesQuoteFilter(quote, activeFilter) && matchesSearch;
    });
  }, [activeFilter, quotes, search]);

  function handleAccept(uid: string) {
    setQuotes((currentQuotes) =>
      currentQuotes.map((quote) => (quote.uid === uid ? { ...quote, status: 'Accepted' } : quote)),
    );
  }

  return (
    <div className="page-stack">
      <PageHeader actionLabel="New Quote" subtitle="Manage your project estimates and approvals" title="Quotes" />

      <section className="metrics-grid metrics-grid--four" aria-label="Quote summary">
        {quoteMetrics.map((metric) => (
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
