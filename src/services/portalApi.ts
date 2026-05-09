import {
  activeProjects,
  documents,
  homeMetrics,
  invoiceMetrics,
  invoices,
  paymentMetrics,
  payments,
  projectMetrics,
  projects,
  quoteMetrics,
  quotes,
  recentActivity,
} from '../data/portal';
import type {
  ActivityItem,
  DocumentItem,
  HomeProject,
  InvoiceItem,
  Metric,
  PaymentItem,
  ProjectListItem,
  QuoteListItem,
} from '../data/portal';

type ProjectResponse = {
  activeProjects: HomeProject[];
  metrics: Metric[];
  projects: ProjectListItem[];
};

type QuoteResponse = {
  metrics: Metric[];
  quotes: QuoteListItem[];
};

type DocumentResponse = {
  documents: DocumentItem[];
};

type InvoiceResponse = {
  invoices: InvoiceItem[];
  metrics: Metric[];
};

type PaymentResponse = {
  metrics: Metric[];
  payments: PaymentItem[];
};

export type DashboardResponse = {
  activeProjects: HomeProject[];
  homeMetrics: Metric[];
  projectMetrics: Metric[];
  quoteMetrics: Metric[];
  recentActivity: ActivityItem[];
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getDashboard(): Promise<DashboardResponse> {
  try {
    const dashboard = await fetchJson<DashboardResponse>('/api/dashboard');

    return {
      activeProjects: dashboard.activeProjects.length ? dashboard.activeProjects : activeProjects,
      homeMetrics: dashboard.homeMetrics.length ? dashboard.homeMetrics : homeMetrics,
      projectMetrics: dashboard.projectMetrics.length ? dashboard.projectMetrics : projectMetrics,
      quoteMetrics: dashboard.quoteMetrics.length ? dashboard.quoteMetrics : quoteMetrics,
      recentActivity: dashboard.recentActivity.length ? dashboard.recentActivity : recentActivity,
    };
  } catch {
    return {
      activeProjects,
      homeMetrics,
      projectMetrics,
      quoteMetrics,
      recentActivity,
    };
  }
}

export async function getProjects(): Promise<ProjectResponse> {
  try {
    return await fetchJson<ProjectResponse>('/api/projects');
  } catch {
    return {
      activeProjects,
      metrics: projectMetrics,
      projects,
    };
  }
}

export async function getQuotes(): Promise<QuoteResponse> {
  try {
    return await fetchJson<QuoteResponse>('/api/quotes');
  } catch {
    return {
      metrics: quoteMetrics,
      quotes,
    };
  }
}

export async function acceptQuote(uid: string): Promise<void> {
  const response = await fetch(`/api/quotes/${encodeURIComponent(uid)}/accept`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Unable to accept quote: ${response.status}`);
  }
}

export async function getDocuments(): Promise<DocumentResponse> {
  try {
    return await fetchJson<DocumentResponse>('/api/documents');
  } catch {
    return { documents };
  }
}

export async function getInvoices(): Promise<InvoiceResponse> {
  try {
    return await fetchJson<InvoiceResponse>('/api/invoices');
  } catch {
    return {
      invoices,
      metrics: invoiceMetrics,
    };
  }
}

export async function getPayments(): Promise<PaymentResponse> {
  try {
    return await fetchJson<PaymentResponse>('/api/payments');
  } catch {
    return {
      metrics: paymentMetrics,
      payments,
    };
  }
}
