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
  projectDetails,
  quoteMetrics,
  quotes,
  quoteDetails,
  recentActivity,
  invoiceDetails,
} from '../data/portal';
import type {
  ActivityItem,
  DocumentItem,
  HomeProject,
  InvoiceItem,
  Metric,
  PaymentItem,
  ProjectListItem,
  ProjectDetailInfo,
  QuoteListItem,
  QuoteDetailInfo,
  InvoiceDetailInfo,
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

export async function getProjectDetail(id: string): Promise<{ project: ProjectListItem | undefined, details: ProjectDetailInfo | undefined }> {
  try {
    const data = await fetchJson<{ project: ProjectListItem, details: ProjectDetailInfo }>(`/api/projects/${id}`);
    return data;
  } catch {
    const project = projects.find(p => p.id === id);
    const details = projectDetails[id];
    return { project, details };
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

export async function getQuoteDetail(id: string): Promise<{ quote: QuoteListItem | undefined, details: QuoteDetailInfo | undefined }> {
  try {
    const data = await fetchJson<{ quote: QuoteListItem, details: QuoteDetailInfo }>(`/api/quotes/${id}`);
    return data;
  } catch {
    const quote = quotes.find(q => q.id === id || q.uid === id);
    const details = quoteDetails[id] || quoteDetails['quote-0892']; // Fallback to mock
    return { quote, details };
  }
}

export async function getInvoiceDetail(id: string): Promise<{ invoice: InvoiceItem | undefined, details: InvoiceDetailInfo | undefined }> {
  try {
    const data = await fetchJson<{ invoice: InvoiceItem, details: InvoiceDetailInfo }>(`/api/invoices/${id}`);
    return data;
  } catch {
    const invoice = invoices.find(i => i.id === id);
    const details = invoiceDetails[id] || invoiceDetails['INV - 2024- 001']; // Fallback to mock
    return { invoice, details };
  }
}
