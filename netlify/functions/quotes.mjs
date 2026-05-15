import {
  changeColumnValue,
  columnMap,
  columnText,
  getBoardItems,
  handleError,
  inferredColumnIds,
  filterItemsForClient,
  json,
  resolveBoard,
} from './_monday.mjs';

function normalizeQuoteStatus(status) {
  if (['Draft', 'Sent', 'Accepted', 'Expired', 'Rejected'].includes(status)) {
    return status;
  }

  return 'Draft';
}

function amountNumber(amount) {
  return Number(amount.replace(/[^0-9.]/g, '')) || 0;
}

function mapQuote(item, ids) {
  const columns = columnMap(item);

  return {
    amount: columnText(columns, ids.AMOUNT, '$ 0.00'),
    description: columnText(columns, ids.DESCRIPTION, ''),
    id: item.id,
    status: normalizeQuoteStatus(columnText(columns, ids.STATUS, 'Draft')),
    title: item.name,
    uid: item.id,
    validUntil: columnText(columns, ids.VALID_UNTIL, ''),
  };
}

function buildMetrics(quotes) {
  const totalValue = quotes.reduce((sum, quote) => sum + amountNumber(quote.amount), 0);

  return [
    { icon: 'dollar', label: 'Total Value', tone: 'danger', value: `$${totalValue.toLocaleString()}` },
    {
      icon: 'clock',
      label: 'Pending',
      tone: 'danger',
      value: `${quotes.filter((quote) => ['Draft', 'Sent'].includes(quote.status)).length}`,
    },
    {
      icon: 'check',
      label: 'Accepted',
      tone: 'danger',
      value: `${quotes.filter((quote) => quote.status === 'Accepted').length}`,
    },
    { icon: 'documents', label: 'Total Quotes', tone: 'danger', value: `${quotes.length}` },
  ];
}

async function acceptQuote(itemId) {
  const board = await resolveBoard({
    candidates: ['quotes invoices board', 'quotes invoices', 'quotes', 'quote', 'estimates', 'estimate'],
    envName: 'MONDAY_QUOTES_BOARD_ID',
    label: 'Quotes',
  });

  await changeColumnValue({
    boardId: board.id,
    columnId: process.env.MONDAY_QUOTE_STATUS_COLUMN || 'status',
    itemId,
    value: { label: 'Accepted' },
  });
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, {});
  }

  try {
    if (event.httpMethod === 'POST') {
      const match = event.path.match(/\/api\/quotes\/([^/]+)\/accept|\/\.netlify\/functions\/quotes\/([^/]+)\/accept/);
      const itemId = match?.[1] || match?.[2];

      if (!itemId) {
        return json(400, { error: 'Missing quote item id.' });
      }

      await acceptQuote(itemId);

      return json(200, { ok: true });
    }

    if (event.httpMethod !== 'GET') {
      return json(405, { error: 'Method not allowed' });
    }

    const board = await resolveBoard({
      candidates: ['quotes invoices board', 'quotes invoices', 'quotes', 'quote', 'estimates', 'estimate'],
      envName: 'MONDAY_QUOTES_BOARD_ID',
      label: 'Quotes',
    });
    const ids = inferredColumnIds('MONDAY_QUOTE', board, {
      STATUS: { candidates: ['quote status', 'status'], fallback: 'status', types: ['status'] },
      AMOUNT: { candidates: ['total value', 'sub total', 'amount', 'value', 'total', 'price'], fallback: 'amount', types: ['numbers', 'formula'] },
      VALID_UNTIL: { candidates: ['valid until', 'valid', 'expiry', 'expiration', 'due date'], fallback: 'valid_until', types: ['date'] },
      DESCRIPTION: { candidates: ['custom notes', 'description', 'scope', 'details', 'notes'], fallback: 'description', types: ['long_text', 'text', 'mirror'] },
      CLIENT: { candidates: ['client board', 'client', 'customer', 'company'], fallback: 'board_relation_mm3bv2gd', types: ['board_relation'] },
    });
    const items = filterItemsForClient(await getBoardItems(board.id), ids.CLIENT, event.portalUser);
    const quotes = items.map((item) => mapQuote(item, ids));

    return json(200, {
      metrics: buildMetrics(quotes),
      quotes,
    });
  } catch (error) {
    return handleError(error);
  }
}
