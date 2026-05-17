import {
  activeProjects,
  documents,
  invoiceDetails,
  invoiceMetrics,
  invoices,
  paymentMetrics,
  payments,
  projectDetails,
  projectMetrics,
  projects,
  quoteDetails,
  quoteMetrics,
  quotes,
  recentActivity,
} from "../data/portal";
import type {
  ActivityItem,
  DocumentItem,
  HomeProject,
  InvoiceDetailInfo,
  InvoiceItem,
  Metric,
  PaymentItem,
  ProjectDetailInfo,
  ProjectListItem,
  QuoteDetailInfo,
  QuoteListItem,
} from "../data/portal";
import { getPortalToken, type PortalUser } from "../auth/session";

type MondayColumn = {
  id: string;
  text?: string | null;
  value?: string | null;
};

type MondayItem = {
  id: string;
  name: string;
  column_values: MondayColumn[];
};

type BoardItemsResponse = {
  boards?: Array<{
    items_page?: {
      items?: MondayItem[];
    };
  }>;
};

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

export type ClientRecord = {
  additionalEmail?: string;
  additionalPhone?: string;
  clientId?: string;
  company?: string;
  contactName?: string;
  email?: string;
  id: string;
  name: string;
  phone?: string;
  phoneNumber?: string;
  temporaryPassword?: string;
};

export type ClientInviteInput = {
  additionalEmail?: string;
  additionalPhone?: string;
  company?: string;
  contactName?: string;
  email: string;
  name: string;
  phone?: string;
};

export type DashboardResponse = {
  activeProjects: HomeProject[];
  homeMetrics: Metric[];
  projectMetrics: Metric[];
  quoteMetrics: Metric[];
  recentActivity: ActivityItem[];
};

type BackendLoginResponse = {
  token: string;
  user?: Partial<PortalUser> & {
    id?: string;
    isAdmin?: boolean;
  };
};

type JwtPayload = {
  email?: string;
  exp?: number;
  id?: string;
  isAdmin?: boolean;
  name?: string;
  role?: string;
  sub?: string;
};

type PortalMessageResponse = {
  message: string;
};

type VerifyPasswordResetOtpResponse = PortalMessageResponse & {
  resetToken: string;
};

type BackendUserResponse = {
  additionalEmail?: unknown;
  additionalName?: unknown;
  additionalNumber?: unknown;
  clientItemId?: string;
  email: string;
  id: string;
  isAdmin: boolean;
  name?: unknown;
  phoneNumber?: unknown;
  temporaryPassword?: string;
};

const portalApiUrl = (
  import.meta.env.VITE_PORTAL_API_URL ?? "https://api-damp-garden-130.fly.dev"
).replace(/\/$/, "");

const mondayApiUrl =
  import.meta.env.VITE_MONDAY_API_URL ?? "https://api.monday.com/v2";
const mondayToken = import.meta.env.VITE_MONDAY_TOKEN ?? "";
const mondayApiVersion = import.meta.env.VITE_MONDAY_API_VERSION ?? "2026-04";

const boardIds = {
  clients: import.meta.env.VITE_MONDAY_CLIENT_BOARD_ID ?? "18410183790",
  documents: import.meta.env.VITE_MONDAY_DOCUMENTS_BOARD_ID ?? "",
  invoices: import.meta.env.VITE_MONDAY_INVOICES_BOARD_ID ?? "18413146142",
  payments: import.meta.env.VITE_MONDAY_PAYMENTS_BOARD_ID ?? "",
  projects: import.meta.env.VITE_MONDAY_PROJECTS_BOARD_ID ?? "18410184393",
  quotes: import.meta.env.VITE_MONDAY_QUOTES_BOARD_ID ?? "18410185109",
};

const clientColumns = {
  additionalEmail:
    import.meta.env.VITE_MONDAY_CLIENT_ADDITIONAL_EMAIL_COLUMN ??
    "email_mm3ckqtx",
  additionalPhone:
    import.meta.env.VITE_MONDAY_CLIENT_ADDITIONAL_PHONE_COLUMN ??
    "numeric_mm3cj80y",
  company: import.meta.env.VITE_MONDAY_CLIENT_COMPANY_COLUMN ?? "text_mm32xemb",
  contactName:
    import.meta.env.VITE_MONDAY_CLIENT_CONTACT_NAME_COLUMN ?? "text_mm38x2kk",
  email: import.meta.env.VITE_MONDAY_CLIENT_EMAIL_COLUMN ?? "email_mm2qgcq8",
  password: import.meta.env.VITE_MONDAY_CLIENT_PASSWORD_COLUMN ?? "text_mm3b6fsj",
  phone: import.meta.env.VITE_MONDAY_CLIENT_PHONE_COLUMN ?? "phone_mm2q10cp",
};

function requireMondayToken() {
  if (!mondayToken) {
    throw new Error("Missing public VITE_MONDAY_TOKEN.");
  }
}

function decodeJwtPayload(token: string): JwtPayload {
  const payload = token.split(".")[1];

  if (!payload) {
    return {};
  }

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

    return JSON.parse(window.atob(padded)) as JwtPayload;
  } catch {
    return {};
  }
}

function roleFromValue(value: unknown, isAdmin?: boolean): PortalUser["role"] {
  if (value === "admin" || isAdmin) {
    return "admin";
  }

  return "client";
}

function normalizeBackendUser(
  token: string,
  email: string,
  backendUser?: BackendLoginResponse["user"],
): PortalUser {
  const payload = decodeJwtPayload(token);
  const role = roleFromValue(backendUser?.role ?? payload.role, backendUser?.isAdmin ?? payload.isAdmin);

  return {
    clientItemId: backendUser?.clientItemId ?? payload.id ?? payload.sub,
    email: backendUser?.email ?? payload.email ?? email,
    name: backendUser?.name ?? payload.name ?? (role === "admin" ? "Admin" : email),
    role,
  };
}

function normalizeCurrentUser(user: BackendUserResponse, fallbackEmail = ""): PortalUser {
  const role = user.isAdmin ? "admin" : "client";
  const email = user.email || fallbackEmail;

  return {
    clientItemId: user.clientItemId ?? user.id,
    email,
    name: normalizeString(user.name) || (role === "admin" ? "Admin" : email),
    role,
  };
}

function normalizeClientRecord(data: BackendUserResponse, fallbackName = ""): ClientRecord {
  return {
    additionalEmail: normalizeString(data.additionalEmail),
    additionalPhone: normalizeString(data.additionalNumber),
    contactName: normalizeString(data.additionalName),
    email: data.email,
    id: data.id,
    name: normalizeString(data.name) || fallbackName,
    phone: normalizeString(data.phoneNumber),
    phoneNumber: normalizeString(data.phoneNumber),
    temporaryPassword: data.temporaryPassword,
  };
}

function normalizeString(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "text" in value && typeof value.text === "string") {
    return value.text;
  }

  return "";
}

async function portalRequest<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false,
  tokenOverride?: string,
) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (authenticated) {
    const token = tokenOverride ?? getPortalToken();

    if (!token) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${portalApiUrl}${path}`, {
    ...options,
    headers,
  });
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof body === "object" && body && "message" in body
        ? String(body.message)
        : "The portal API rejected the request.";

    throw new Error(message);
  }

  return body as T;
}

export async function loginPortalUser(email: string, password: string) {
  const data = await portalRequest<BackendLoginResponse>("/auth/login", {
    body: JSON.stringify({ email, password }),
    method: "POST",
  });
  let user = normalizeBackendUser(data.token, email, data.user);

  try {
    const currentUser = await portalRequest<BackendUserResponse>("/auth/me", {}, true, data.token);
    user = normalizeCurrentUser(currentUser, email);
  } catch {
    // Fall back to token-derived identity if /auth/me is temporarily unavailable.
  }

  return {
    token: data.token,
    user,
  };
}

export async function getCurrentUserProfile() {
  const data = await portalRequest<BackendUserResponse>("/auth/me", {}, true);

  return normalizeCurrentUser(data);
}

export async function requestPasswordResetOtp(email: string) {
  return portalRequest<PortalMessageResponse>("/users/password-reset/request-otp", {
    body: JSON.stringify({ email }),
    method: "POST",
  });
}

export async function verifyPasswordResetOtp(email: string, otp: string) {
  return portalRequest<VerifyPasswordResetOtpResponse>("/users/password-reset/verify-otp", {
    body: JSON.stringify({ email, otp }),
    method: "POST",
  });
}

export async function confirmPasswordReset(
  resetToken: string,
  newPassword: string,
  confirmPassword: string,
) {
  return portalRequest<PortalMessageResponse>("/users/password-reset/confirm", {
    body: JSON.stringify({ confirmPassword, newPassword, resetToken }),
    method: "POST",
  });
}

export async function resetUserPassword(
  email: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
) {
  return portalRequest<PortalMessageResponse>("/users/reset-password", {
    body: JSON.stringify({ confirmPassword, currentPassword, email, newPassword }),
    method: "POST",
  });
}

async function mondayRequest<T>(query: string, variables: Record<string, unknown> = {}) {
  requireMondayToken();

  const response = await fetch(mondayApiUrl, {
    body: JSON.stringify({ query, variables }),
    headers: {
      "API-Version": mondayApiVersion,
      Authorization: mondayToken,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = await response.json();

  if (!response.ok || payload.errors) {
    throw new Error(payload.errors?.[0]?.message || "Monday request failed.");
  }

  return payload.data as T;
}

async function getBoardItems(boardId: string) {
  if (!boardId) {
    return [];
  }

  const query = `
    query GetBoardItems($boardId: [ID!]) {
      boards(ids: $boardId) {
        items_page(limit: 100) {
          items {
            id
            name
            column_values {
              id
              text
              value
            }
          }
        }
      }
    }
  `;
  const data = await mondayRequest<BoardItemsResponse>(query, {
    boardId: [boardId],
  });

  return data.boards?.[0]?.items_page?.items ?? [];
}

function columnMap(item: MondayItem) {
  return Object.fromEntries(item.column_values.map((column) => [column.id, column]));
}

function columnText(
  columns: Record<string, MondayColumn>,
  id: string,
  fallback = "",
) {
  return columns[id]?.text || fallback;
}

function amountNumber(amount: string) {
  return Number(amount.replace(/[^0-9.]/g, "")) || 0;
}

function normalizeProjectStatus(status: string) {
  if (["Pending", "In Design", "In Fabrication", "Completed"].includes(status)) {
    return status as ProjectListItem["status"];
  }

  return "Pending";
}

function normalizeQuoteStatus(status: string) {
  if (["Draft", "Sent", "Accepted", "Expired", "Rejected"].includes(status)) {
    return status as QuoteListItem["status"];
  }

  return "Draft";
}

function normalizeInvoiceStatus(status: string) {
  if (["Paid", "Overdue", "Draft"].includes(status)) {
    return status as InvoiceItem["status"];
  }

  return status.toLowerCase().includes("paid") ? "Paid" : "Draft";
}

function normalizePaymentMethod(method: string) {
  if (["ACH", "Wire", "Credit Card", "Check"].includes(method)) {
    return method as PaymentItem["method"];
  }

  const normalized = method.toLowerCase();

  if (normalized.includes("wire")) return "Wire";
  if (normalized.includes("credit") || normalized.includes("card")) {
    return "Credit Card";
  }
  if (normalized.includes("check") || normalized.includes("cheque")) return "Check";

  return "ACH";
}

function normalizeDocumentType(type: string) {
  if (["Shop drawing", "CAD File", "Spec Sheet", "Photo"].includes(type)) {
    return type as DocumentItem["type"];
  }

  const normalized = type.toLowerCase();

  if (normalized.includes("photo") || normalized.includes("image")) return "Photo";
  if (normalized.includes("cad") || normalized.includes("dwg")) return "CAD File";
  if (normalized.includes("shop")) return "Shop drawing";

  return "Spec Sheet";
}

function buildProjectMetrics(projectList: ProjectListItem[]) {
  return [
    { icon: "projects", label: "Team Projects", tone: "danger", value: `${projectList.length}` },
    {
      icon: "projects",
      label: "In Progress",
      tone: "danger",
      value: `${projectList.filter((project) => ["In Design", "In Fabrication"].includes(project.status)).length}`,
    },
    {
      icon: "projects",
      label: "Pending Start",
      tone: "danger",
      value: `${projectList.filter((project) => project.status === "Pending").length}`,
    },
    {
      icon: "projects",
      label: "Completed",
      tone: "danger",
      value: `${projectList.filter((project) => project.status === "Completed").length}`,
    },
  ] as Metric[];
}

function buildQuoteMetrics(quoteList: QuoteListItem[]) {
  const total = quoteList.reduce((sum, quote) => sum + amountNumber(quote.amount), 0);

  return [
    { icon: "dollar", label: "Total Value", tone: "danger", value: `$${total.toLocaleString()}` },
    {
      icon: "clock",
      label: "Pending",
      tone: "danger",
      value: `${quoteList.filter((quote) => ["Draft", "Sent"].includes(quote.status)).length}`,
    },
    {
      icon: "check",
      label: "Accepted",
      tone: "danger",
      value: `${quoteList.filter((quote) => quote.status === "Accepted").length}`,
    },
    { icon: "documents", label: "Total Quotes", tone: "danger", value: `${quoteList.length}` },
  ] as Metric[];
}

export async function getProjects(): Promise<ProjectResponse> {
  try {
    const items = await getBoardItems(boardIds.projects);
    const mappedProjects = items.map((item) => {
      const columns = columnMap(item);

      return {
        category: "Commercial",
        dueDate: columnText(columns, "date_mm383qdq", ""),
        id: item.id,
        location: columnText(columns, "text_mm3aea8y", ""),
        progress: 0,
        status: normalizeProjectStatus(columnText(columns, "color_mm35nk1m", "Pending")),
        title: item.name,
      };
    });
    const mappedActiveProjects = mappedProjects.slice(0, 3).map((project) => ({
      category: project.category,
      estimate: project.dueDate ? `Est: ${project.dueDate}` : "Est: Pending",
      location: project.location,
      name: project.title,
      status: project.status,
      tone: project.status === "Completed" ? "success" : project.status === "In Design" ? "info" : "danger",
    })) as HomeProject[];

    return {
      activeProjects: mappedActiveProjects.length ? mappedActiveProjects : activeProjects,
      metrics: buildProjectMetrics(mappedProjects),
      projects: mappedProjects.length ? mappedProjects : projects,
    };
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
    const items = await getBoardItems(boardIds.quotes);
    const mappedQuotes = items.map((item) => {
      const columns = columnMap(item);

      return {
        amount: columnText(columns, "formula_mm3be01v", "$ 0.00"),
        description: "",
        id: item.id,
        status: normalizeQuoteStatus(columnText(columns, "color_mm2qqbms", "Draft")),
        title: item.name,
        uid: item.id,
        validUntil: columnText(columns, "date_mm2trm4j", ""),
      };
    });

    return {
      metrics: buildQuoteMetrics(mappedQuotes),
      quotes: mappedQuotes.length ? mappedQuotes : quotes,
    };
  } catch {
    return {
      metrics: quoteMetrics,
      quotes,
    };
  }
}

export async function getDashboard(): Promise<DashboardResponse> {
  const [projectData, quoteData] = await Promise.all([getProjects(), getQuotes()]);

  return {
    activeProjects: projectData.activeProjects.length ? projectData.activeProjects : activeProjects,
    homeMetrics: [
      {
        icon: "activeProjects",
        label: "Active Projects",
        pill: { label: "Active", tone: "danger" },
        tone: "danger",
        value: `${projectData.activeProjects.length}`,
      },
      {
        icon: "file",
        label: "Pending Quotes",
        pill: { label: "Review", tone: "neutral" },
        tone: "neutral",
        value: quoteData.metrics.find((metric) => metric.label === "Pending")?.value || "0",
      },
      {
        icon: "messages",
        label: "Unread Messages",
        pill: { label: "New", tone: "info" },
        tone: "info",
        value: "0",
      },
    ],
    projectMetrics: projectData.metrics,
    quoteMetrics: quoteData.metrics,
    recentActivity,
  };
}

export async function acceptQuote(uid: string): Promise<void> {
  const mutation = `
    mutation AcceptQuote($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
      change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) {
        id
      }
    }
  `;

  await mondayRequest(mutation, {
    boardId: boardIds.quotes,
    columnId: "color_mm2qqbms",
    itemId: uid,
    value: JSON.stringify({ label: "Accepted" }),
  });
}

export async function getDocuments(): Promise<DocumentResponse> {
  try {
    const items = await getBoardItems(boardIds.documents);
    const mappedDocuments = items.map((item) => {
      const columns = columnMap(item);

      return {
        date: columnText(columns, "date", ""),
        id: item.id,
        project: columnText(columns, "project", ""),
        title: item.name,
        type: normalizeDocumentType(columnText(columns, "type", "Spec Sheet")),
      };
    });

    return { documents: mappedDocuments.length ? mappedDocuments : documents };
  } catch {
    return { documents };
  }
}

export async function getInvoices(): Promise<InvoiceResponse> {
  try {
    const items = await getBoardItems(boardIds.invoices);
    const mappedInvoices = items.map((item) => {
      const columns = columnMap(item);

      return {
        amount: columnText(columns, "formula_mm3be01v", "$ 0.00"),
        dueDate: columnText(columns, "date_mm2trm4j", ""),
        id: columnText(columns, "autonumber_mm2w68r2", item.id),
        issuedDate: "",
        project: item.name,
        status: normalizeInvoiceStatus(columnText(columns, "color_mm2qqbms", "Draft")),
      };
    });
    const outstanding = mappedInvoices
      .filter((invoice) => invoice.status !== "Paid")
      .reduce((sum, invoice) => sum + amountNumber(invoice.amount), 0);

    return {
      invoices: mappedInvoices.length ? mappedInvoices : invoices,
      metrics: [
        { icon: "dollar", label: "Total Outstanding", tone: "danger", value: `$${outstanding.toLocaleString()}` },
        { icon: "documents", label: "Invoices Sent", tone: "danger", value: `${mappedInvoices.length}` },
        {
          icon: "check",
          label: "Paid This Month",
          tone: "danger",
          value: `${mappedInvoices.filter((invoice) => invoice.status === "Paid").length}`,
        },
      ],
    };
  } catch {
    return {
      invoices,
      metrics: invoiceMetrics,
    };
  }
}

export async function getPayments(): Promise<PaymentResponse> {
  try {
    const items = await getBoardItems(boardIds.payments);
    const mappedPayments = items.map((item) => {
      const columns = columnMap(item);

      return {
        amount: columnText(columns, "amount", "$0.00"),
        date: columnText(columns, "date", ""),
        id: item.id,
        invoice: columnText(columns, "invoice", item.name),
        method: normalizePaymentMethod(columnText(columns, "method", "ACH")),
        project: columnText(columns, "project", item.name),
        reference: columnText(columns, "reference", item.id),
      };
    });
    const total = mappedPayments.reduce((sum, payment) => sum + amountNumber(payment.amount), 0);

    return {
      metrics: [
        { icon: "documents", label: "TOTAL PAID (YTD)", tone: "danger", value: `$${total.toLocaleString()}` },
        { icon: "documents", label: "LAST 30 DAYS", tone: "danger", value: `$${total.toLocaleString()}` },
        { icon: "check", label: "TOTAL PAYMENTS", tone: "danger", value: `${mappedPayments.length}` },
      ],
      payments: mappedPayments.length ? mappedPayments : payments,
    };
  } catch {
    return {
      metrics: paymentMetrics,
      payments,
    };
  }
}

export async function getClients(): Promise<ClientRecord[]> {
  let items: MondayItem[] = [];

  try {
    items = await getBoardItems(boardIds.clients);
  } catch (error) {
    if (error instanceof Error && error.message.includes("VITE_MONDAY_TOKEN")) {
      return [];
    }

    throw error;
  }

  return items.map((item) => {
    const columns = columnMap(item);

    return {
      additionalEmail: columnText(columns, clientColumns.additionalEmail, ""),
      additionalPhone: columnText(columns, clientColumns.additionalPhone, ""),
      clientId: columnText(columns, "text_mm3amtas", ""),
      company: columnText(columns, clientColumns.company, ""),
      contactName: columnText(columns, clientColumns.contactName, ""),
      email: columnText(columns, clientColumns.email, ""),
      id: item.id,
      name: item.name,
      phone: columnText(columns, clientColumns.phone, ""),
    };
  });
}

export async function createClient(input: ClientInviteInput) {
  const data = await portalRequest<BackendUserResponse>("/users/clients", {
    body: JSON.stringify({
      additionalEmail: input.additionalEmail || undefined,
      additionalName: input.contactName || undefined,
      additionalNumber: input.additionalPhone || undefined,
      email: input.email,
      name: input.name,
      phoneNumber: input.phone || undefined,
    }),
    method: "POST",
  }, true);

  return normalizeClientRecord(data, input.name);
}

export async function getProjectDetail(id: string): Promise<{ project: ProjectListItem | undefined, details: ProjectDetailInfo | undefined }> {
  const project = projects.find((p) => p.id === id);
  const details = projectDetails[id];

  return { project, details };
}

export async function getQuoteDetail(id: string): Promise<{ quote: QuoteListItem | undefined, details: QuoteDetailInfo | undefined }> {
  const quote = quotes.find((q) => q.id === id || q.uid === id);
  const details = quoteDetails[id] || quoteDetails["quote-0892"];

  return { quote, details };
}

export async function getInvoiceDetail(id: string): Promise<{ invoice: InvoiceItem | undefined, details: InvoiceDetailInfo | undefined }> {
  const invoice = invoices.find((item) => item.id === id);
  const details = invoiceDetails[id] || invoiceDetails["INV - 2024- 001"];

  return { invoice, details };
}
