import {
  documents,
  invoiceDetails,
  invoiceMetrics,
  invoices,
  paymentMetrics,
  payments,
  projectDetails,
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
import { getCurrentPortalUser, getPortalToken, type PortalUser } from "../auth/session";

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
  accountPartnerId?: string;
  clientId?: string;
  clientCredit?: "COD" | "CREDIT_ACCOUNT";
  company?: string;
  contactName?: string;
  createdAt?: string;
  email?: string;
  id: string;
  name: string;
  phone?: string;
  phoneNumber?: string;
  temporaryPassword?: string;
};

export type ClientInviteInput = {
  additionalEmail?: string;
  clientCredit?: "COD" | "CREDIT_ACCOUNT";
  company?: string;
  contactName?: string;
  email: string;
  name: string;
  phone?: string;
  staffId?: string;
};

export type DashboardResponse = {
  activeProjects: HomeProject[];
  homeMetrics: Metric[];
  projectMetrics: Metric[];
  quoteMetrics: Metric[];
  recentActivity: ActivityItem[];
};

type BackendLoginResponse = {
  accessToken?: string;
  token?: string;
  user?: Partial<PortalUser> & {
    id?: string;
    isAdmin?: boolean;
    role?: string;
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
  additionalContact?: unknown;
  accountPartnerId?: unknown;
  clientItemId?: string;
  clientCredit?: "COD" | "CREDIT_ACCOUNT" | null;
  company?: unknown;
  createdAt?: string;
  email: string;
  id: string;
  isAdmin?: boolean;
  name?: unknown;
  phone?: unknown;
  phoneNumber?: unknown;
  role?: string;
  temporaryPassword?: string;
};

type BackendProjectClientResponse = {
  email?: string;
  id?: string;
  name?: unknown;
};

type BackendProjectResponse = {
  client?: BackendProjectClientResponse;
  clientId?: string;
  description?: string;
  estimatedCompletion?: string | null;
  fabricationCompleted?: boolean;
  id: string;
  location?: string;
  name?: string;
  startDate?: string | null;
  status?: string;
};

type BackendQuoteResponse = {
  amount?: string | number;
  description?: string;
  id: string;
  name?: string;
  status?: string;
  title?: string;
  total?: string | number;
  uid?: string;
  validUntil?: string | null;
};

type BackendDocumentResponse = {
  createdAt?: string;
  date?: string;
  id: string;
  name?: string;
  project?: string | { name?: string; title?: string };
  title?: string;
  type?: string;
};

type BackendInvoiceResponse = {
  amount?: string | number;
  dueDate?: string | null;
  id: string;
  issuedDate?: string | null;
  project?: string | { name?: string; title?: string };
  status?: string;
  total?: string | number;
};

type BackendPaymentResponse = {
  amount?: string | number;
  date?: string | null;
  id: string;
  invoice?: string | { id?: string };
  method?: string;
  project?: string | { name?: string; title?: string };
  reference?: string;
};

export type StaffRecord = {
  createdAt?: string;
  email: string;
  id: string;
  name: string;
  isAdmin?: boolean;
  role: "ADMIN" | "STAFF" | "CLIENT";
};

export type CreateStaffInput = {
  email: string;
  isAdmin?: boolean;
  name: string;
};

const portalApiUrl = (
  import.meta.env.VITE_PORTAL_API_URL ?? "/portal-api"
).replace(/\/$/, "");

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
  const normalized = typeof value === "string" ? value.toLowerCase() : "";

  if (normalized === "admin" || isAdmin) {
    return "admin";
  }

  if (normalized === "staff") {
    return "staff";
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
  const name = normalizeString(backendUser?.name ?? payload.name);

  return {
    clientItemId: backendUser?.clientItemId ?? backendUser?.id ?? payload.id ?? payload.sub,
    email: backendUser?.email ?? payload.email ?? email,
    name: name || fallbackDisplayName(email, role),
    role,
  };
}

function normalizeCurrentUser(user: BackendUserResponse, fallbackEmail = "", token = getPortalToken() ?? ""): PortalUser {
  const payload = token ? decodeJwtPayload(token) : {};
  const role = roleFromValue(user.role ?? payload.role, user.isAdmin ?? payload.isAdmin);
  const email = user.email || fallbackEmail;

  return {
    clientItemId: user.clientItemId ?? user.id,
    email,
    name: normalizeString(user.name) || fallbackDisplayName(email, role),
    role,
  };
}

function normalizeClientRecord(data: BackendUserResponse, fallbackName = ""): ClientRecord {
  return {
    additionalEmail: normalizeString(data.additionalEmail),
    additionalPhone: normalizeString(data.additionalNumber),
    accountPartnerId: normalizeString(data.accountPartnerId),
    clientCredit: data.clientCredit ?? undefined,
    company: normalizeString(data.company),
    contactName: normalizeString(data.additionalContact ?? data.additionalName),
    createdAt: data.createdAt,
    email: data.email,
    id: data.id,
    name: normalizeString(data.name) || fallbackName,
    phone: normalizeString(data.phone ?? data.phoneNumber),
    phoneNumber: normalizeString(data.phone ?? data.phoneNumber),
    temporaryPassword: data.temporaryPassword,
  };
}

function normalizeString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeString).filter(Boolean).join(" ");
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const directValue = record.text ?? record.value ?? record.name ?? record.fullName ?? record.displayName;
    const directText = normalizeString(directValue);

    if (directText) {
      return directText;
    }

    const joinedName = [record.firstName, record.lastName]
      .map(normalizeString)
      .filter(Boolean)
      .join(" ");

    if (joinedName) {
      return joinedName;
    }
  }

  return "";
}

function fallbackDisplayName(email: string, role: PortalUser["role"]) {
  if (role === "admin") {
    return "Admin";
  }

  if (role === "staff") {
    return "Staff";
  }

  const localPart = email.split("@")[0] || "Client";
  const words = localPart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean);

  if (!words.length) {
    return "Client";
  }

  return words
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`)
    .join(" ");
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
  const token = data.accessToken ?? data.token;

  if (!token) {
    throw new Error("The portal API did not return an access token.");
  }

  let user = normalizeBackendUser(token, email, data.user);

  try {
    const currentUser = await portalRequest<BackendUserResponse>("/auth/me", {}, true, token);
    user = normalizeCurrentUser(currentUser, email, token);
  } catch {
    // Fall back to token-derived identity if /auth/me is temporarily unavailable.
  }

  return {
    token,
    user,
  };
}

export async function getCurrentUserProfile() {
  const data = await portalRequest<BackendUserResponse>("/auth/me", {}, true);

  return normalizeCurrentUser(data);
}

export async function getClientDetails(id: string) {
  const data = await portalRequest<BackendUserResponse>(
    `/users/clients/${encodeURIComponent(id)}`,
    {},
    true,
  );

  return normalizeClientRecord(data);
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

function amountNumber(amount: string) {
  return Number(amount.replace(/[^0-9.]/g, "")) || 0;
}

function normalizeProjectStatus(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized.includes("complete")) {
    return "Completed";
  }

  if (normalized.includes("fabric")) {
    return "In Fabrication";
  }

  if (normalized.includes("design")) {
    return "In Design";
  }

  if (normalized.includes("progress")) {
    return "In Progress";
  }

  if (normalized.includes("pending")) {
    return "Pending";
  }

  return "Pending";
}

function formatProjectDate(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function projectProgress(status: ProjectListItem["status"], fabricationCompleted?: boolean) {
  if (fabricationCompleted || status === "Completed") {
    return 100;
  }

  if (status === "In Fabrication") {
    return 70;
  }

  if (status === "In Progress") {
    return 50;
  }

  if (status === "In Design") {
    return 25;
  }

  return 0;
}

function projectTone(status: ProjectListItem["status"]) {
  if (status === "Completed") return "success";
  if (status === "In Design") return "info";
  if (status === "In Progress") return "warning";
  return "danger";
}

function mapBackendProject(project: BackendProjectResponse): ProjectListItem {
  const status = normalizeProjectStatus(project.status || "Pending");
  const estimatedCompletion = formatProjectDate(project.estimatedCompletion);
  const startDate = formatProjectDate(project.startDate);

  return {
    category: "Fabrication",
    clientEmail: project.client?.email,
    clientId: project.clientId ?? project.client?.id,
    clientName: normalizeString(project.client?.name),
    description: project.description || "",
    dueDate: estimatedCompletion,
    estimatedCompletion,
    fabricationCompleted: project.fabricationCompleted,
    id: project.id,
    location: project.location || "",
    progress: projectProgress(status, project.fabricationCompleted),
    startDate,
    status,
    title: project.name || "Untitled project",
  };
}

function moneyText(value: unknown, fallback = "$ 0.00") {
  if (typeof value === "number") {
    return `$${value.toLocaleString()}`;
  }

  return normalizeString(value) || fallback;
}

function projectName(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    return normalizeString(record.name ?? record.title) || fallback;
  }

  return fallback;
}

function mapBackendQuote(quote: BackendQuoteResponse): QuoteListItem {
  return {
    amount: moneyText(quote.amount ?? quote.total),
    description: quote.description || "",
    id: quote.id,
    status: normalizeQuoteStatus(quote.status || "Draft"),
    title: quote.title || quote.name || "Untitled quote",
    uid: quote.uid || quote.id,
    validUntil: formatProjectDate(quote.validUntil),
  };
}

function mapBackendDocument(document: BackendDocumentResponse): DocumentItem {
  return {
    date: formatProjectDate(document.date ?? document.createdAt),
    id: document.id,
    project: projectName(document.project, ""),
    title: document.title || document.name || "Untitled document",
    type: normalizeDocumentType(document.type || "Spec Sheet"),
  };
}

function mapBackendInvoice(invoice: BackendInvoiceResponse): InvoiceItem {
  return {
    amount: moneyText(invoice.amount ?? invoice.total),
    dueDate: formatProjectDate(invoice.dueDate),
    id: invoice.id,
    issuedDate: formatProjectDate(invoice.issuedDate),
    project: projectName(invoice.project, ""),
    status: normalizeInvoiceStatus(invoice.status || "Draft"),
  };
}

function mapBackendPayment(payment: BackendPaymentResponse): PaymentItem {
  return {
    amount: moneyText(payment.amount),
    date: formatProjectDate(payment.date),
    id: payment.id,
    invoice: projectName(payment.invoice, payment.id),
    method: normalizePaymentMethod(payment.method || "ACH"),
    project: projectName(payment.project, ""),
    reference: payment.reference || payment.id,
  };
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
      value: `${projectList.filter((project) => ["In Progress", "In Design", "In Fabrication"].includes(project.status)).length}`,
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

function emptyProjectResponse(): ProjectResponse {
  return {
    activeProjects: [],
    metrics: buildProjectMetrics([]),
    projects: [],
  };
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
  const currentUser = getCurrentPortalUser();
  const path =
    currentUser?.role === "client" && currentUser.clientItemId
      ? `/projects/clients/${encodeURIComponent(currentUser.clientItemId)}`
      : "/projects";
  const backendProjects = await portalRequest<BackendProjectResponse[]>(path, {}, true);
  const mappedProjects = backendProjects.map(mapBackendProject);
  const mappedActiveProjects = mappedProjects.slice(0, 3).map((project) => ({
    category: project.category,
    estimate: project.dueDate ? `Est: ${project.dueDate}` : "Est: Pending",
    location: project.location,
    name: project.title,
    status: project.status,
    tone: projectTone(project.status),
  })) as HomeProject[];

  return {
    activeProjects: mappedActiveProjects,
    metrics: buildProjectMetrics(mappedProjects),
    projects: mappedProjects,
  };
}

export async function getQuotes(): Promise<QuoteResponse> {
  try {
    const mappedQuotes = (await portalRequest<BackendQuoteResponse[]>("/quotes", {}, true)).map(mapBackendQuote);

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
  const [projectData, quoteData] = await Promise.all([
    getProjects().catch(() => emptyProjectResponse()),
    getQuotes(),
  ]);

  return {
    activeProjects: projectData.activeProjects,
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
  await portalRequest(`/quotes/${encodeURIComponent(uid)}/accept`, {
    method: "POST",
  }, true);
}

export async function getDocuments(): Promise<DocumentResponse> {
  try {
    const mappedDocuments = (await portalRequest<BackendDocumentResponse[]>("/documents", {}, true)).map(mapBackendDocument);

    return { documents: mappedDocuments.length ? mappedDocuments : documents };
  } catch {
    return { documents };
  }
}

export async function getInvoices(): Promise<InvoiceResponse> {
  try {
    const mappedInvoices = (await portalRequest<BackendInvoiceResponse[]>("/invoices", {}, true)).map(mapBackendInvoice);
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
    const mappedPayments = (await portalRequest<BackendPaymentResponse[]>("/payments", {}, true)).map(mapBackendPayment);
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
  const data = await portalRequest<BackendUserResponse[]>("/users/clients", {}, true);

  return data.map((client) => normalizeClientRecord(client));
}

export async function createClient(input: ClientInviteInput) {
  await portalRequest<PortalMessageResponse>("/users/clients", {
    body: JSON.stringify({
      additionalContact: input.contactName || "",
      additionalEmail: input.additionalEmail || "",
      clientCredit: input.clientCredit || "COD",
      company: input.company || "",
      email: input.email,
      name: input.name,
      phone: input.phone || "",
      staffId: input.staffId || "",
    }),
    method: "POST",
  }, true);

  const clients = await getClients();
  const client = clients.find((item) => item.email === input.email);

  if (!client) {
    throw new Error("Client was created, but the refreshed client list did not include it yet.");
  }

  return client;
}

export async function getStaffUsers() {
  return portalRequest<StaffRecord[]>("/users/staff", {}, true);
}

export async function createStaffUser(input: CreateStaffInput) {
  return portalRequest<PortalMessageResponse>("/users/staff", {
    body: JSON.stringify({
      email: input.email,
      isAdmin: Boolean(input.isAdmin),
      name: input.name,
    }),
    method: "POST",
  }, true);
}

export async function reassignClient(clientId: string, staffId: string) {
  return portalRequest<PortalMessageResponse>("/users/clients/reassign", {
    body: JSON.stringify({ clientId, staffId }),
    method: "PATCH",
  }, true);
}

export async function getProjectDetail(id: string): Promise<{ project: ProjectListItem | undefined, details: ProjectDetailInfo | undefined }> {
  const projectData = await getProjects();
  const project = projectData.projects.find((p) => p.id === id) ?? projects.find((p) => p.id === id);
  const details = project
    ? {
        estimatedCompletion: project.estimatedCompletion || project.dueDate || "Pending",
        notes: project.description || "No project notes have been added yet.",
        siteAddress: project.location || "Not provided",
        startDate: project.startDate || "Pending",
        team: project.clientName
          ? [{ initials: project.clientName.slice(0, 2).toUpperCase(), name: project.clientName, role: "Client" }]
          : [],
        timeline: [
          {
            date: project.startDate || "Pending",
            description: project.startDate
              ? "Project start date recorded."
              : "Project start date has not been set yet.",
            title: "Project start",
          },
          {
            date: project.estimatedCompletion || project.dueDate || "Pending",
            description: project.fabricationCompleted
              ? "Fabrication has been marked complete."
              : `Current project status is ${project.status}.`,
            title: project.fabricationCompleted ? "Fabrication completed" : "Current status",
          },
        ],
      }
    : projectDetails[id];

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
