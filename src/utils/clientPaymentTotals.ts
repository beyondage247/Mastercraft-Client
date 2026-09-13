import type { OutstandingPaymentItem, PaymentItem } from "../data/portal";

export type ClientPaymentTotals = {
  paid: number;
  owed: number;
};

const EMPTY_TOTALS: ClientPaymentTotals = { paid: 0, owed: 0 };

/** Roll up per-project paid/owed amounts (from getPayments/getOutstandingPayments) into per-client totals. */
export function buildClientPaymentTotals(
  payments: PaymentItem[],
  outstandingPayments: OutstandingPaymentItem[],
): Map<string, ClientPaymentTotals> {
  const totals = new Map<string, ClientPaymentTotals>();

  function ensure(clientId: string): ClientPaymentTotals {
    const existing = totals.get(clientId);
    if (existing) return existing;
    const created: ClientPaymentTotals = { paid: 0, owed: 0 };
    totals.set(clientId, created);
    return created;
  }

  for (const payment of payments) {
    if (!payment.clientId) continue;
    ensure(payment.clientId).paid += payment.amountValue || 0;
  }

  for (const item of outstandingPayments) {
    if (!item.clientId) continue;
    ensure(item.clientId).owed += item.amountOverdueValue || 0;
  }

  return totals;
}

export function getClientPaymentTotals(
  totals: Map<string, ClientPaymentTotals>,
  clientId: string | undefined,
): ClientPaymentTotals {
  return (clientId && totals.get(clientId)) || EMPTY_TOTALS;
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(Number.isFinite(value) ? value : 0);
}
