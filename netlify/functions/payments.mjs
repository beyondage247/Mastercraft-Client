import {
  columnMap,
  columnText,
  getBoardItems,
  handleError,
  inferredColumnIds,
  json,
  resolveBoard,
} from './_monday.mjs';

function normalizePaymentMethod(method) {
  if (['ACH', 'Wire', 'Credit Card', 'Check'].includes(method)) {
    return method;
  }

  const normalizedMethod = method.toLowerCase();

  if (normalizedMethod.includes('wire')) return 'Wire';
  if (normalizedMethod.includes('credit') || normalizedMethod.includes('card')) return 'Credit Card';
  if (normalizedMethod.includes('check') || normalizedMethod.includes('cheque')) return 'Check';

  return 'ACH';
}

function amountNumber(amount) {
  return Number(amount.replace(/[^0-9.]/g, '')) || 0;
}

function mapPayment(item, ids) {
  const columns = columnMap(item);

  return {
    amount: columnText(columns, ids.AMOUNT, '$0.00'),
    date: columnText(columns, ids.DATE, ''),
    id: item.id,
    invoice: columnText(columns, ids.INVOICE, item.name),
    method: normalizePaymentMethod(columnText(columns, ids.METHOD, 'ACH')),
    project: columnText(columns, ids.PROJECT, item.name),
    reference: columnText(columns, ids.REFERENCE, item.id),
  };
}

function buildMetrics(payments) {
  const total = payments.reduce((sum, payment) => sum + amountNumber(payment.amount), 0);

  return [
    { icon: 'documents', label: 'TOTAL PAID (YTD)', tone: 'danger', value: `$${total.toLocaleString()}` },
    { icon: 'documents', label: 'LAST 30 DAYS', tone: 'danger', value: `$${total.toLocaleString()}` },
    { icon: 'check', label: 'TOTAL PAYMENTS', tone: 'danger', value: `${payments.length}` },
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
      candidates: ['deals orders board', 'quotes invoices board', 'quotes invoices', 'payments', 'payment', 'transactions', 'transaction'],
      envName: 'MONDAY_PAYMENTS_BOARD_ID',
      label: 'Payments',
    });
    const ids = inferredColumnIds('MONDAY_PAYMENT', board, {
      DATE: { candidates: ['payment due date', 'payment date', 'date', 'paid date'], fallback: 'date', types: ['date'] },
      INVOICE: { candidates: ['quickbooks invoice id', 'invoice', 'invoice number', 'invoice id'], fallback: 'invoice', types: ['text', 'board_relation'] },
      PROJECT: { candidates: ['deals orders', 'project', 'job', 'site'], fallback: 'project', types: ['text', 'board_relation'] },
      METHOD: { candidates: ['payment status', 'method', 'payment method', 'type'], fallback: 'method', types: ['status', 'dropdown'] },
      REFERENCE: { candidates: ['reference', 'transaction id', 'ref', 'quickbooks invoice id'], fallback: 'reference', types: ['text'] },
      AMOUNT: { candidates: ['deposit amount', 'deal value', 'balance due', 'amount', 'total', 'value'], fallback: 'amount', types: ['numbers', 'formula'] },
    });
    const payments = (await getBoardItems(board.id)).map((item) => mapPayment(item, ids));

    return json(200, {
      metrics: buildMetrics(payments),
      payments,
    });
  } catch (error) {
    return handleError(error);
  }
}
