import {
  columnMap,
  columnText,
  getBoardItems,
  handleError,
  inferredColumnIds,
  json,
  resolveBoard,
} from './_monday.mjs';

function normalizeInvoiceStatus(status) {
  if (['Paid', 'Overdue', 'Draft'].includes(status)) {
    return status;
  }

  return status.toLowerCase().includes('paid') ? 'Paid' : 'Draft';
}

function amountNumber(amount) {
  return Number(amount.replace(/[^0-9.]/g, '')) || 0;
}

function mapInvoice(item, ids) {
  const columns = columnMap(item);

  return {
    amount: columnText(columns, ids.AMOUNT, '$ 0.00'),
    dueDate: columnText(columns, ids.DUE_DATE, ''),
    id: columnText(columns, ids.INVOICE_NUMBER, item.id),
    issuedDate: columnText(columns, ids.ISSUED_DATE, ''),
    project: item.name,
    status: normalizeInvoiceStatus(columnText(columns, ids.STATUS, 'Draft')),
  };
}

function buildMetrics(invoices) {
  const outstanding = invoices
    .filter((invoice) => invoice.status !== 'Paid')
    .reduce((sum, invoice) => sum + amountNumber(invoice.amount), 0);

  return [
    { icon: 'dollar', label: 'Total Outstanding', tone: 'danger', value: `$${outstanding.toLocaleString()}` },
    { icon: 'documents', label: 'Invoices Sent', tone: 'danger', value: `${invoices.length}` },
    {
      icon: 'check',
      label: 'Paid This Month',
      tone: 'danger',
      value: `${invoices.filter((invoice) => invoice.status === 'Paid').length}`,
    },
  ];
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, {});
  }

  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const board = await resolveBoard({
      candidates: ['quotes invoices board', 'quotes invoices', 'invoices', 'invoice', 'billing'],
      envName: 'MONDAY_INVOICES_BOARD_ID',
      label: 'Invoices',
    });
    const ids = inferredColumnIds('MONDAY_INVOICE', board, {
      STATUS: { candidates: ['status', 'payment status', 'invoice status', 'quote status'], fallback: 'status', types: ['status'] },
      AMOUNT: { candidates: ['total value', 'sub total', 'amount', 'total', 'value'], fallback: 'amount', types: ['numbers', 'formula'] },
      DUE_DATE: { candidates: ['due date', 'due', 'deadline'], fallback: 'due_date', types: ['date'] },
      ISSUED_DATE: { candidates: ['issue date', 'date', 'issued', 'sent date'], fallback: 'issued_date', types: ['date'] },
      INVOICE_NUMBER: { candidates: ['quickbooks invoice id', 'quote invoice id', 'invoice number', 'invoice id', 'number'], fallback: 'invoice_number', types: ['text', 'auto_number'] },
    });
    const invoices = (await getBoardItems(board.id)).map((item) => mapInvoice(item, ids));

    return json(200, {
      invoices,
      metrics: buildMetrics(invoices),
    });
  } catch (error) {
    return handleError(error);
  }
}
