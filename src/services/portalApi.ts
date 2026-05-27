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
  ProjectStageItem,
  ProjectStageType,
  ProjectListItem,
  ProjectCommentItem,
  ProjectUploadItem,
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

export type CatalogAvailabilityStatus = "EMAIL_FOR_QUOTE" | "IN_STOCK" | "SPECIAL_ORDER";

export type CatalogItem = {
  active: boolean;
  availabilityStatus: CatalogAvailabilityStatus[];
  category: string;
  createdAt?: string;
  id: string;
  itemCode?: string;
  lastPriceUpdate?: string;
  markUp?: string;
  ourPrice?: string;
  productName: string;
  sizeDimension?: string;
  styleProfile?: string;
  subcategory?: string;
  supplier: string;
  supplierCatalogue?: string;
  supplierCost?: string;
  unitMeasure?: string;
  updatedAt?: string;
};

export type UpdateCatalogItemInput = Partial<Omit<CatalogItem, "createdAt" | "id" | "updatedAt">>;

export type CatalogImportIssue = {
  reason: string;
  row: number;
};

export type CatalogImportResponse = {
  errorCount: number;
  errors: CatalogImportIssue[];
  importedCount: number;
  message: string;
  processedCount: number;
  skippedCount: number;
  skippedRows: CatalogImportIssue[];
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

type BackendProjectStaffResponse = {
  email?: string;
  id?: string;
  name?: unknown;
};

type BackendProjectResponse = {
  accountPartner?: BackendProjectStaffResponse | null;
  attachment?: {
    uploads?: BackendProjectUploadResponse[];
  } | null;
  assignedStaff?: BackendProjectStaffResponse | null;
  client?: BackendProjectClientResponse;
  clientId?: string;
  comments?: BackendProjectCommentResponse[];
  description?: string;
  endDate?: string | null;
  fabrication?: number;
  estimatedCompletion?: string | null;
  fabricationCompleted?: boolean;
  id: string;
  location?: string;
  name?: string;
  startDate?: string | null;
  stages?: BackendProjectStageResponse[];
  staff?: BackendProjectStaffResponse | null;
  staffEmail?: string;
  staffId?: string;
  staffName?: unknown;
  status?: string;
};

type BackendProjectCommentResponse = {
  createdAt?: string;
  id: string;
  message?: string;
  user?: {
    id?: string;
    name?: string;
    role?: string;
  };
};

type BackendProjectUploadResponse = {
  id: string;
  name?: string;
  size?: number;
};

type BackendProjectStageResponse = {
  id?: string;
  stage: ProjectStageType;
  hoursBudgeted?: number;
  hoursSpent?: number;
  progress?: number;
  startDate?: string | null;
};

export type ProjectStageInput = {
  hoursBudgeted: number;
  hoursSpent?: number;
  startDate: string;
};

export type CreateProjectInput = {
  buildAssemble: ProjectStageInput;
  clientId: string;
  delivery: ProjectStageInput;
  description: string;
  endDate: string;
  finishing: ProjectStageInput;
  install: ProjectStageInput;
  location: string;
  mil: ProjectStageInput;
  name: string;
  startDate: string;
};

type BackendCreateProjectResponse = {
  message: string;
  project: BackendProjectResponse;
};

export type UpdateProjectStatusInput = {
  buildAssemble?: ProjectStageInput;
  delivery?: ProjectStageInput;
  finishing?: ProjectStageInput;
  install?: ProjectStageInput;
  mil?: ProjectStageInput;
  status?: ProjectListItem["status"];
};

type BackendUpdateProjectResponse = {
  message: string;
  project: BackendProjectResponse;
};

type BackendProjectCommentCreateResponse = {
  comment: BackendProjectCommentResponse;
  message: string;
};

type BackendProjectAttachmentResponse = {
  message: string;
  project: BackendProjectResponse;
};

type BackendQuoteResponse = {
  amount?: string | number;
  clientComment?: unknown;
  description?: string;
  dateIssued?: string | null;
  id: string;
  lineItems?: Array<{
    id: string;
    ourPrice?: string | number | null;
    productName?: string;
    quantity?: number;
    lineTotal?: string | number | null;
    serviceId?: string;
  }>;
  name?: string;
  project?: {
    clientId?: string;
    id?: string;
    name?: string;
    status?: string;
  };
  quoteId?: string;
  status?: string;
  title?: string;
  subtotal?: string | number;
  tax?: string | number;
  taxAmount?: string | number;
  total?: string | number;
  uid?: string;
  validUntil?: string | null;
};

export type CreateQuoteInput = {
  dateIssued: string;
  lineItems: Array<{
    quantity: number;
    serviceId: string;
  }>;
  name: string;
  projectId: string;
  subtotal: number;
  tax: number;
  taxAmount: number;
  total: number;
  validUntil: string;
};

export type UpdateQuoteInput = Partial<Omit<CreateQuoteInput, "projectId">>;

export type QuoteDecisionStatus = "APPROVED" | "REJECTED" | "IN_REVIEW";

type BackendCreateQuoteResponse = {
  message: string;
  quote: BackendQuoteResponse;
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
  createdAt?: string | null;
  date?: string | null;
  id: string;
  invoice?: string | { id?: string };
  method?: string;
  project?: string | {
    client?: { id?: string; name?: string };
    clientId?: string;
    clientName?: string;
    id?: string;
    name?: string;
    title?: string;
  };
  projectId?: string;
  reference?: string;
};

export type PaymentMethodInput = "ACH" | "WIRE" | "CREDIT_CARD" | "CHECK";

export type CreatePaymentInput = {
  amount: number;
  createdAt: string;
  method: PaymentMethodInput;
  projectId: string;
  reference?: string;
};

export type ProjectPaymentSummary = {
  amountDue: string;
  amountPaid: string;
  paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID";
  payments: PaymentItem[];
  projectId: string;
};

type BackendProjectPaymentsResponse = {
  amountDue: string;
  amountPaid: string;
  paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID";
  payments: BackendPaymentResponse[];
  projectId: string;
};

type BackendCreatePaymentResponse = {
  amountDue: string;
  amountPaid: string;
  message: string;
  payment: BackendPaymentResponse;
  paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID";
};

type BackendClientPaymentsResponse = {
  amountPaid: string;
  payments: BackendPaymentResponse[];
};

export type ReportRecord = {
  coldCalls: number;
  coffeeLunch: number;
  coldEmails: number;
  createdAt: string;
  endDate: string;
  id: string;
  networkingEvent: string;
  newCustomers: number;
  notes: string;
  siteVisit: number;
  socialMedia: number;
  startDate: string;
  updatedAt: string;
  user: {
    email: string;
    id: string;
    name: string;
  };
};

export type CreateReportInput = {
  coldCalls: string;
  coffeeLunch: string;
  coldEmails: string;
  endDate: string;
  networkingEvent: string;
  newCustomers: string;
  notes: string;
  siteVisit: string;
  socialMedia: string;
  startDate: string;
};

type BackendCreateReportResponse = {
  message: string;
  report: ReportRecord;
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
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }

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

  if (normalized.includes("quoted")) {
    return "Quoted";
  }

  if (normalized.includes("lost")) {
    return "Lost";
  }

  if (normalized.includes("production")) {
    return "In Production";
  }

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

function formatDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : "";
  }

  return date.toISOString().slice(0, 10);
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateStageProgress(hoursBudgeted?: number, hoursSpent?: number, fallbackProgress = 0) {
  const budgeted = Number(hoursBudgeted) || 0;
  const spent = Number(hoursSpent) || 0;

  if (budgeted <= 0) {
    return clampPercent(fallbackProgress);
  }

  return clampPercent((spent / budgeted) * 100);
}

function stageProgress(stage?: Pick<ProjectStageItem, "hoursBudgeted" | "hoursSpent" | "progress">) {
  if (!stage) {
    return 0;
  }

  return calculateStageProgress(stage.hoursBudgeted, stage.hoursSpent, stage.progress);
}

export function calculateFabricationProgress(stages: {
  buildAssemble?: Pick<ProjectStageItem, "hoursBudgeted" | "hoursSpent" | "progress">;
  finishing?: Pick<ProjectStageItem, "hoursBudgeted" | "hoursSpent" | "progress">;
  mil?: Pick<ProjectStageItem, "hoursBudgeted" | "hoursSpent" | "progress">;
}) {
  return clampPercent(
    (stageProgress(stages.mil) +
      stageProgress(stages.buildAssemble) +
      stageProgress(stages.finishing)) /
      3,
  );
}

function projectProgress(
  status: ProjectListItem["status"],
  fabricationCompleted?: boolean,
  fabrication?: number,
) {
  if (typeof fabrication === "number") {
    return clampPercent(fabrication);
  }

  if (fabricationCompleted || status === "Completed") {
    return 100;
  }

  if (status === "In Fabrication" || status === "In Production") {
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

function normalizeProjectStage(stage: BackendProjectStageResponse): ProjectStageItem {
  const hoursBudgeted = Number(stage.hoursBudgeted) || 0;
  const hoursSpent = Number(stage.hoursSpent) || 0;

  return {
    hoursBudgeted,
    hoursSpent,
    id: stage.id,
    progress: calculateStageProgress(hoursBudgeted, hoursSpent, Number(stage.progress) || 0),
    stage: stage.stage,
    startDate: formatProjectDate(stage.startDate),
    startDateValue: formatDateInputValue(stage.startDate),
  };
}

function normalizeProjectComment(comment: BackendProjectCommentResponse): ProjectCommentItem {
  return {
    createdAt: comment.createdAt ? formatProjectDate(comment.createdAt) : "",
    id: comment.id,
    message: comment.message || "",
    user: {
      id: comment.user?.id || "",
      name: comment.user?.name || "Unknown user",
      role: comment.user?.role || "USER",
    },
  };
}

function normalizeProjectUpload(upload: BackendProjectUploadResponse): ProjectUploadItem {
  return {
    id: upload.id,
    name: upload.name || "Uploaded file",
    size: Number(upload.size) || 0,
  };
}

function stageByType(stages: ProjectStageItem[], stage: ProjectStageType) {
  return stages.find((item) => item.stage === stage);
}

function projectFabrication(project: BackendProjectResponse, stages: ProjectStageItem[]) {
  const calculated = calculateFabricationProgress({
    buildAssemble: stageByType(stages, "BUILD_ASSEMBLE"),
    finishing: stageByType(stages, "FINISHING"),
    mil: stageByType(stages, "MIL"),
  });

  if (calculated > 0 || stages.length) {
    return calculated;
  }

  return typeof project.fabrication === "number" ? clampPercent(project.fabrication) : undefined;
}

function projectTone(status: ProjectListItem["status"]) {
  if (status === "Completed") return "success";
  if (status === "In Design" || status === "Quoted") return "info";
  if (status === "In Progress" || status === "In Fabrication" || status === "In Production") return "warning";
  return "danger";
}

function mapBackendProject(project: BackendProjectResponse): ProjectListItem {
  const status = normalizeProjectStatus(project.status || "Pending");
  const endDateSource = project.endDate ?? project.estimatedCompletion;
  const estimatedCompletion = formatProjectDate(endDateSource);
  const startDate = formatProjectDate(project.startDate);
  const stages = (project.stages ?? []).map(normalizeProjectStage);
  const fabrication = projectFabrication(project, stages);
  const assignedStaff = project.accountPartner ?? project.assignedStaff ?? project.staff;

  return {
    category: "Fabrication",
    assignedStaffEmail: assignedStaff?.email ?? project.staffEmail,
    assignedStaffId: assignedStaff?.id ?? project.staffId,
    assignedStaffName: normalizeString(assignedStaff?.name ?? project.staffName),
    clientEmail: project.client?.email,
    clientId: project.clientId ?? project.client?.id,
    clientName: normalizeString(project.client?.name),
    description: project.description || "",
    dueDate: estimatedCompletion,
    endDate: estimatedCompletion,
    endDateValue: formatDateInputValue(endDateSource),
    estimatedCompletion,
    fabrication,
    fabricationCompleted: project.fabricationCompleted,
    id: project.id,
    location: project.location || "",
    progress: projectProgress(status, project.fabricationCompleted, fabrication),
    attachment: project.attachment
      ? { uploads: (project.attachment.uploads ?? []).map(normalizeProjectUpload) }
      : null,
    comments: (project.comments ?? []).map(normalizeProjectComment),
    stages,
    startDate,
    startDateValue: formatDateInputValue(project.startDate),
    status,
    title: project.name || "Untitled project",
  };
}

function moneyText(value: unknown, fallback = "$ 0.00") {
  if (typeof value === "number") {
    return formatMoney(value);
  }

  const text = normalizeString(value);
  const numeric = numberFromDecimal(value);

  if (text && text.startsWith("$")) {
    return text;
  }

  return text ? formatMoney(numeric) : fallback;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(Number.isFinite(value) ? value : 0);
}

function numberFromDecimal(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    return Number(value.replace(/[^0-9.-]/g, "")) || 0;
  }

  return 0;
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
  const validUntil = formatProjectDate(quote.validUntil);
  const lineItems = (quote.lineItems ?? []).map((item) => {
    const rate = moneyText(item.ourPrice);
    const quantity = Number(item.quantity) || 1;
    const lineTotal = numberFromDecimal(item.lineTotal) || numberFromDecimal(item.ourPrice) * quantity;

    return {
      amount: moneyText(lineTotal),
      description: item.productName || "Line item",
      qty: quantity,
      rate,
    };
  });

  return {
    amount: moneyText(quote.amount ?? quote.total),
    clientComment: normalizeString(quote.clientComment),
    dateIssued: formatProjectDate(quote.dateIssued),
    description: quote.description || projectName(quote.project, ""),
    id: quote.id,
    lineItems,
    projectId: quote.project?.id,
    projectName: quote.project?.name,
    status: normalizeQuoteStatus(quote.status || "PENDING", quote.validUntil),
    subtotal: moneyText(quote.subtotal),
    tax: normalizeString(quote.tax),
    taxAmount: moneyText(quote.taxAmount),
    title: quote.title || quote.name || quote.quoteId || "Untitled quote",
    total: moneyText(quote.total),
    uid: quote.uid || quote.quoteId || quote.id,
    validUntil,
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
    date: formatProjectDate(payment.date ?? payment.createdAt),
    id: payment.id,
    invoice: projectName(payment.invoice, payment.id),
    method: normalizePaymentMethod(payment.method || "ACH"),
    project: projectName(payment.project, ""),
    reference: payment.reference || payment.id,
  };
}

function normalizeQuoteStatus(status: string, validUntil?: string | null) {
  if (validUntil) {
    const expiry = new Date(validUntil);

    if (!Number.isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
      return "Expired";
    }
  }

  const normalized = status.trim().toUpperCase();

  if (normalized === "APPROVED") {
    return "Approved";
  }

  if (normalized === "REJECTED") {
    return "Rejected";
  }

  if (normalized === "EXPIRED") {
    return "Expired";
  }

  if (normalized === "PENDING") {
    return "Sent";
  }

  if (normalized === "IN_REVIEW") {
    return "Draft";
  }

  if (["Draft", "Sent", "Approved", "Expired", "Rejected"].includes(status)) {
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

function toBackendPaymentMethod(method: PaymentItem["method"]): PaymentMethodInput {
  if (method === "Wire") return "WIRE";
  if (method === "Credit Card") return "CREDIT_CARD";
  if (method === "Check") return "CHECK";

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
    { icon: "projects", label: "All", tone: "danger", value: `${projectList.length}` },
    { icon: "projects", label: "Quoted", tone: "danger", value: `${projectList.filter((project) => project.status === "Quoted").length}` },
    {
      icon: "projects",
      label: "Lost",
      tone: "danger",
      value: `${projectList.filter((project) => project.status === "Lost").length}`,
    },
    {
      icon: "projects",
      label: "In Production",
      tone: "danger",
      value: `${projectList.filter((project) => project.status === "In Production").length}`,
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
      label: "Approved",
      tone: "danger",
      value: `${quoteList.filter((quote) => quote.status === "Approved").length}`,
    },
    { icon: "documents", label: "Total Quotes", tone: "danger", value: `${quoteList.length}` },
  ] as Metric[];
}

function toBackendProjectStatus(status?: ProjectListItem["status"]) {
  if (status === "Completed") {
    return "COMPLETED";
  }

  if (status === "In Progress" || status === "In Design" || status === "In Fabrication" || status === "In Production") {
    return "IN_PRODUCTION";
  }

  return "PENDING";
}

function toApiDate(value: string) {
  if (!value) {
    return "";
  }

  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function projectStagePayload(stage: ProjectStageInput) {
  const hoursBudgeted = Number(stage.hoursBudgeted) || 0;
  const hoursSpent = Number(stage.hoursSpent) || 0;

  return {
    hoursBudgeted,
    hoursSpent,
    progress: calculateStageProgress(hoursBudgeted, hoursSpent),
    startDate: toApiDate(stage.startDate),
  };
}

function createProjectPayload(input: CreateProjectInput) {
  const mil = projectStagePayload(input.mil);
  const buildAssemble = projectStagePayload(input.buildAssemble);
  const finishing = projectStagePayload(input.finishing);
  const delivery = projectStagePayload(input.delivery);
  const install = projectStagePayload(input.install);

  return {
    buildAssemble,
    clientId: input.clientId,
    delivery,
    description: input.description,
    endDate: toApiDate(input.endDate),
    fabrication: calculateFabricationProgress({ buildAssemble, finishing, mil }),
    finishing,
    install,
    location: input.location,
    mil,
    name: input.name,
    startDate: toApiDate(input.startDate),
  };
}

function updateProjectPayload(input: UpdateProjectStatusInput) {
  return {
    ...(input.status ? { status: toBackendProjectStatus(input.status) } : {}),
    ...(input.mil ? { mil: projectStagePayload(input.mil) } : {}),
    ...(input.buildAssemble ? { buildAssemble: projectStagePayload(input.buildAssemble) } : {}),
    ...(input.finishing ? { finishing: projectStagePayload(input.finishing) } : {}),
    ...(input.delivery ? { delivery: projectStagePayload(input.delivery) } : {}),
    ...(input.install ? { install: projectStagePayload(input.install) } : {}),
  };
}

export async function getProjects(): Promise<ProjectResponse> {
  const currentUser = getCurrentPortalUser();
  const path = "/projects";
  let backendProjects: BackendProjectResponse[];

  try {
    backendProjects = await portalRequest<BackendProjectResponse[]>(path, {}, true);
  } catch (error) {
    if (currentUser?.role === "client") {
      return emptyProjectResponse();
    }

    throw error;
  }

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

export async function getProjectsForClient(clientId: string) {
  const backendProjects = await portalRequest<BackendProjectResponse[]>(
    `/projects/client/${encodeURIComponent(clientId)}`,
    {},
    true,
  );

  return backendProjects.map(mapBackendProject);
}

export async function createProject(input: CreateProjectInput) {
  const response = await portalRequest<BackendCreateProjectResponse>("/projects", {
    body: JSON.stringify(createProjectPayload(input)),
    method: "POST",
  }, true);

  return mapBackendProject(response.project);
}

export async function updateProjectStatus(projectId: string, input: UpdateProjectStatusInput) {
  const response = await portalRequest<BackendUpdateProjectResponse>(
    `/projects/${encodeURIComponent(projectId)}/status`,
    {
      body: JSON.stringify(updateProjectPayload(input)),
      method: "PATCH",
    },
    true,
  );

  return mapBackendProject(response.project);
}

export async function addProjectComment(projectId: string, message: string) {
  const response = await portalRequest<BackendProjectCommentCreateResponse>(
    "/projects/comments",
    {
      body: JSON.stringify({ message, projectId }),
      method: "POST",
    },
    true,
  );

  return normalizeProjectComment(response.comment);
}

export async function uploadFile(file: File) {
  const body = new FormData();
  body.append("file", file);

  const response = await portalRequest<{ uploadId: string }>("/uploads", {
    body,
    method: "POST",
  }, true);

  return response.uploadId;
}

export function uploadDownloadUrl(uploadId: string) {
  return `${portalApiUrl}/uploads/download/${encodeURIComponent(uploadId)}`;
}

export async function attachProjectUploads(projectId: string, uploadIds: string[]) {
  const response = await portalRequest<BackendProjectAttachmentResponse>(
    `/projects/${encodeURIComponent(projectId)}/attachment`,
    {
      body: JSON.stringify({ attachment: { uploadIds } }),
      method: "PATCH",
    },
    true,
  );

  return mapBackendProject(response.project);
}

export async function getCatalogItems() {
  return portalRequest<CatalogItem[]>("/services", {}, true);
}

export async function updateCatalogItem(id: string, input: UpdateCatalogItemInput) {
  const response = await portalRequest<{ item: CatalogItem; message: string }>(
    `/services/${encodeURIComponent(id)}`,
    {
      body: JSON.stringify(input),
      method: "PATCH",
    },
    true,
  );

  return response;
}

export async function importCatalogItems(file: File) {
  const body = new FormData();
  body.append("file", file);

  return portalRequest<CatalogImportResponse>("/services/import", {
    body,
    method: "POST",
  }, true);
}

export async function createQuote(input: CreateQuoteInput) {
  const response = await portalRequest<BackendCreateQuoteResponse>("/quotes", {
    body: JSON.stringify(input),
    method: "POST",
  }, true);

  return mapBackendQuote(response.quote);
}

export async function updateQuote(id: string, input: UpdateQuoteInput) {
  const response = await portalRequest<BackendCreateQuoteResponse>(
    `/quotes/${encodeURIComponent(id)}`,
    {
      body: JSON.stringify(input),
      method: "PATCH",
    },
    true,
  );

  return mapBackendQuote(response.quote);
}

export async function respondToQuote(id: string, status: QuoteDecisionStatus, comment?: string) {
  const response = await portalRequest<BackendCreateQuoteResponse>(
    `/quotes/${encodeURIComponent(id)}/respond`,
    {
      body: JSON.stringify({
        comment: comment || "",
        status,
      }),
      method: "PATCH",
    },
    true,
  );

  return mapBackendQuote(response.quote);
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

export async function getQuotesForProject(projectId: string) {
  const data = await getQuotes();

  return data.quotes.filter((quote) => quote.projectId === projectId);
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

export async function acceptQuote(uid: string, comment = ""): Promise<QuoteListItem> {
  return respondToQuote(uid, "APPROVED", comment);
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
    const currentUser = getCurrentPortalUser();
    const paymentSource =
      currentUser?.role === "client" && currentUser.clientItemId
        ? (await portalRequest<BackendClientPaymentsResponse>(
            `/payments/client/${encodeURIComponent(currentUser.clientItemId)}`,
            {},
            true,
          )).payments
        : await portalRequest<BackendPaymentResponse[]>("/payments", {}, true);
    const mappedPayments = paymentSource.map(mapBackendPayment);
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

export async function getProjectPayments(projectId: string): Promise<ProjectPaymentSummary> {
  const response = await portalRequest<BackendProjectPaymentsResponse>(
    `/payments/project/${encodeURIComponent(projectId)}`,
    {},
    true,
  );

  return {
    amountDue: moneyText(response.amountDue),
    amountPaid: moneyText(response.amountPaid),
    paymentStatus: response.paymentStatus,
    payments: response.payments.map(mapBackendPayment),
    projectId: response.projectId,
  };
}

export async function createPayment(input: CreatePaymentInput): Promise<ProjectPaymentSummary> {
  const response = await portalRequest<BackendCreatePaymentResponse>("/payments", {
    body: JSON.stringify(input),
    method: "POST",
  }, true);

  const summary = await getProjectPayments(input.projectId).catch(() => ({
    amountDue: moneyText(response.amountDue),
    amountPaid: moneyText(response.amountPaid),
    paymentStatus: response.paymentStatus,
    payments: [mapBackendPayment(response.payment)],
    projectId: input.projectId,
  }));

  return summary;
}

export { toBackendPaymentMethod };

export async function getReports() {
  return portalRequest<ReportRecord[]>("/reports", {}, true);
}

export async function createReport(input: CreateReportInput) {
  const response = await portalRequest<BackendCreateReportResponse>("/reports", {
    body: JSON.stringify(input),
    method: "POST",
  }, true);

  return response.report;
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
  let project: ProjectListItem | undefined;

  try {
    project = mapBackendProject(
      await portalRequest<BackendProjectResponse>(`/projects/${encodeURIComponent(id)}`, {}, true),
    );
  } catch {
    const projectData = await getProjects().catch(() => emptyProjectResponse());
    project = projectData.projects.find((p) => p.id === id) ?? projects.find((p) => p.id === id);
  }

  const details = project
    ? {
        estimatedCompletion: project.estimatedCompletion || project.dueDate || "Pending",
        notes: project.description || "No project notes have been added yet.",
        siteAddress: project.location || "Not provided",
        startDate: project.startDate || "Pending",
        team: project.assignedStaffName || project.assignedStaffEmail
          ? [
              {
                initials: (project.assignedStaffName || project.assignedStaffEmail || "ST").slice(0, 2).toUpperCase(),
                name: project.assignedStaffName || "Assigned staff",
                role: project.assignedStaffEmail || "Staff",
              },
            ]
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
  let quote: QuoteListItem | undefined;

  try {
    quote = mapBackendQuote(
      await portalRequest<BackendQuoteResponse>(`/quotes/${encodeURIComponent(id)}`, {}, true),
    );
  } catch {
    const quoteData = await getQuotes().catch(() => ({ metrics: quoteMetrics, quotes }));
    quote = quoteData.quotes.find((q) => q.id === id || q.uid === id);
  }

  const details = quote
    ? {
        lineItems: quote.lineItems?.length ? quote.lineItems : quoteDetails[id]?.lineItems ?? [],
        linkedProject: {
          category: "Project",
          estCompletion: "",
          id: quote.projectId || "",
          location: "",
          title: quote.projectName || quote.description || "Linked project",
        },
        specifications: quote.description || "Quote created for this project.",
        subtotal: quote.subtotal || "$0.00",
        tax: quote.taxAmount || "$0.00",
        total: quote.total || quote.amount,
      }
    : quoteDetails[id] || quoteDetails["quote-0892"];

  return { quote, details };
}

export async function getInvoiceDetail(id: string): Promise<{ invoice: InvoiceItem | undefined, details: InvoiceDetailInfo | undefined }> {
  const invoice = invoices.find((item) => item.id === id);
  const details = invoiceDetails[id] || invoiceDetails["INV - 2024- 001"];

  return { invoice, details };
}
