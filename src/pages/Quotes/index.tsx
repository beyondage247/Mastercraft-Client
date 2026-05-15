import { useMutation, useQuery } from '@apollo/client/react';
import { useEffect, useMemo, useState } from 'react';
import FilterToolbar from '../../components/FilterToolbar';
import PageHeader from '../../components/PageHeader';
import QuoteCard from '../../components/QuoteCard';
import StatCard from '../../components/StatCard';
import { quoteFilters, quoteMetrics, quotes as quoteSeed } from '../../data/portal';
import type { Metric, QuoteFilter, QuoteListItem } from '../../data/portal';
import { ACCEPT_QUOTE, GET_QUOTES } from '../../graphql/portal';

function matchesQuoteFilter(quote: QuoteListItem, filter: QuoteFilter) {
  return filter === 'All' || quote.status === filter;
}

function Quotes() {
  const [activeFilter, setActiveFilter] = useState<QuoteFilter>('All');
  const [metrics, setMetrics] = useState(quoteMetrics);
  const [search, setSearch] = useState('');
  const [quotes, setQuotes] = useState<QuoteListItem[]>(quoteSeed);
  const { data } = useQuery<{
    quotes: {
      metrics: Metric[];
      quotes: QuoteListItem[];
    };
  }>(GET_QUOTES);
  const [acceptQuoteMutation] = useMutation<{ acceptQuote: boolean }, { id: string }>(ACCEPT_QUOTE, {
    refetchQueries: [{ query: GET_QUOTES }],
  });

  useEffect(() => {
    if (data?.quotes) {
      setMetrics(data.quotes.metrics.length ? data.quotes.metrics : quoteMetrics);
      setQuotes(data.quotes.quotes.length ? data.quotes.quotes : quoteSeed);
    }
  }, [data]);

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

  async function handleAccept(uid: string) {
    const previousQuotes = quotes;

    setQuotes((currentQuotes) =>
      currentQuotes.map((quote) => (quote.uid === uid ? { ...quote, status: 'Accepted' } : quote)),
    );

    try {
      await acceptQuoteMutation({ variables: { id: uid } });
    } catch {
      setQuotes(previousQuotes);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader actionLabel="New Quote" subtitle="Manage your project estimates and approvals" title="Quotes" />

      <section className="metrics-grid metrics-grid--four" aria-label="Quote summary">
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
