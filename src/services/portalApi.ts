import {
  projectDetails,
  projects,
} from "../data/portal";
import type {
  ActivityItem,
  CommissionItem,
  CommissionStatus,
  DocumentItem,
  DocumentCategoryItem,
  
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
import { formatPortalDate, parsePortalDate } from "../utils/dateFormat";
import { documentUploadLimitText, isWithinDocumentUploadLimit } from "../utils/uploadLimits";

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

type CommissionResponse = {
  commissions: CommissionItem[];
  metrics: Metric[];
};

type PaymentResponse = {
  metrics: Metric[];
  payments: PaymentItem[];
};

export type ClientRecord = {
  additionalEmail?: string;
  additionalPhone?: string;
  accountPartner?: {
    email?: string;
    id?: string;
    name?: string;
  };
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

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

type DeleteUploadsResponse = {
  count: number;
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
  material?: string;
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
export type CreateCatalogItemInput = Omit<CatalogItem, "createdAt" | "id" | "updatedAt">;

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

export type InventoryAvailabilityStatus = CatalogAvailabilityStatus;

export type InventoryItem = {
  active: boolean;
  availabilityStatus: InventoryAvailabilityStatus[];
  category: string;
  createdAt?: string;
  id: string;
  inStock?: number | null;
  lastPriceUpdate?: string | null;
  lowStock: boolean;
  material?: string | null;
  minReserve?: number | null;
  name: string;
  notes?: string | null;
  ourPrice?: number | string | null;
  sizeDimension?: string | null;
  sku?: string | null;
  subcategory?: string | null;
  supplier: string;
  unitMeasure?: string | null;
  updatedAt?: string;
};

export type InventorySummaryResponse = {
  activeItems: number;
  categoriesCount: number;
  inactiveItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalItems: number;
  trackedItems: number;
};

export type UpdateInventoryItemInput = Partial<{
  active: boolean;
  availabilityStatus: InventoryAvailabilityStatus[];
  category: string;
  inStock: number | string | null;
  lastPriceUpdate: string | null;
  material: string | null;
  minReserve: number | string | null;
  name: string;
  notes: string | null;
  ourPrice: number | string | null;
  sizeDimension: string | null;
  sku: string | null;
  subcategory: string | null;
  supplier: string;
  unitMeasure: string | null;
}>;
export type CreateInventoryItemInput = Required<Pick<UpdateInventoryItemInput, "active" | "availabilityStatus" | "category" | "name" | "supplier">> &
  Omit<UpdateInventoryItemInput, "active" | "availabilityStatus" | "category" | "name" | "supplier">;

export type InventoryImportIssue = {
  reason: string;
  row: number;
};

export type InventoryImportResponse = {
  createdCount: number;
  errorCount: number;
  errors: InventoryImportIssue[];
  message: string;
  processedCount: number;
  skippedCount: number;
  skippedRows: InventoryImportIssue[];
  updatedCount: number;
};

type BackendUserResponse = {
  additionalEmail?: unknown;
  additionalName?: unknown;
  additionalNumber?: unknown;
  additionalContact?: unknown;
  accountPartnerId?: unknown;
  accountPartner?: BackendProjectStaffResponse | null;
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
  accountPartner?: BackendProjectStaffResponse | null;
  accountPartnerId?: unknown;
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
  quote?: {
    id: string;
    paymentSchedule?: BackendQuotePaymentScheduleResponse | null;
    quoteId?: string;
    status?: string;
    validUntil?: string | null;
  } | null;
  invoice?: {
    id: string;
    clientComment?: unknown;
    dateIssued?: string | null;
    invoiceId?: string;
    lineItems?: Array<{
      id: string;
      ourPrice?: string | number | null;
      productName?: string;
      quantity?: number;
      lineTotal?: string | number | null;
    }>;
    status?: string;
    subtotal?: string | number;
    tax?: string | number;
    taxAmount?: string | number;
    total?: string | number;
    validUntil?: string | null;
    paymentSchedule?: BackendQuotePaymentScheduleResponse | null;
  } | null;
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
  buildAssemble?: ProjectStageInput;
  clientId: string;
  delivery?: ProjectStageInput;
  description: string;
  endDate: string;
  finishing?: ProjectStageInput;
  install?: ProjectStageInput;
  location: string;
  mil?: ProjectStageInput;
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
  invoices?: BackendInvoiceResponse[];
  lineItems?: BackendQuoteLineItemResponse[];
  message?: unknown;
  name?: string;
  project?: string | {
    clientId?: string;
    id?: string;
    name?: string;
    status?: string;
  };
  projectId?: string;
  quoteId?: string;
  status?: string;
  title?: string;
  subtotal?: string | number;
  tax?: string | number;
  taxAmount?: string | number;
  total?: string | number;
  uid?: string;
  validUntil?: string | null;
  paymentSchedule?: BackendQuotePaymentScheduleResponse | null;
};

type BackendInvoiceResponse = {
  createdAt?: string | null;
  id: string;
  invoiceId?: string;
  payments?: BackendPaymentResponse[];
  status?: string;
  total?: string | number;
};

type BackendQuoteLineItemResponse = {
  id?: string;
  lineTotal?: string | number | null;
  ourPrice?: string | number | null;
  price?: string | number | null;
  productName?: string;
  quantity?: number | string;
  service?: {
    id?: string;
    ourPrice?: string | number | null;
    price?: string | number | null;
    productName?: string;
    name?: string;
  } | null;
  serviceId?: string;
  total?: string | number | null;
  unitPrice?: string | number | null;
};

export type QuotePaymentScheduleInput = {
  balance?: {
    amount: number;
    date?: string | null;
    name?: string;
    payments?: Array<{
      amount: number;
      date: string;
      name: string;
      percentage: number;
    }>;
    percentage: number;
    split?: boolean;
  };
  deposit?: {
    amount: number;
    amountType: "fixed" | "percentage";
    date: string;
    name: string;
    percentage: number;
  };
  fullPayment?: {
    amount: number;
    date: string;
    name: string;
    percentage: number;
  };
  totalAmount: number;
  type: "FULL_PAYMENT" | "DEPOSIT_AND_BALANCE" | "DEPOSIT_AND_SPLIT_BALANCE";
};

export type CreateQuoteInput = {
  dateIssued: string;
  discount?: number;
  lineItems: Array<{
    ourPrice?: number;
    productName?: string;
    quantity: number;
    serviceId?: string;
  }>;
  message?: string;
  name: string;
  paymentSchedule: QuotePaymentScheduleInput;
  projectId: string;
  shippingFee?: number;
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

type BackendQuoteEnvelopeResponse = BackendCreateQuoteResponse | BackendQuoteResponse | {
  data?: BackendCreateQuoteResponse | BackendQuoteResponse | BackendQuoteResponse[];
  quotes?: BackendQuoteResponse[];
};

type BackendQuotePaymentSchedulePaymentResponse = {
  amount?: string | number;
  date?: string;
  name?: string;
  percentage?: string | number;
};

type BackendQuotePaymentScheduleResponse = {
  balance?: {
    amount?: string | number;
    date?: string | null;
    name?: string | null;
    payments?: BackendQuotePaymentSchedulePaymentResponse[];
    percentage?: string | number;
    split?: boolean | null;
  } | null;
  deposit?: {
    amount?: string | number;
    amountType?: string;
    date?: string;
    name?: string;
    percentage?: string | number;
  } | null;
  fullPayment?: BackendQuotePaymentSchedulePaymentResponse | null;
  totalAmount?: string | number;
  type?: string;
};

type BackendPaymentResponse = {
  amount?: string | number;
  createdAt?: string | null;
  date?: string | null;
  id: string;
  invoice?: string | { id?: string };
  invoiceId?: string;
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

type BackendCommissionResponse = {
  amount?: string | number;
  amountPaid?: string | number;
  client?: {
    company?: unknown;
    email?: string;
    id?: string;
    name?: unknown;
  } | null;
  clientId?: string;
  clientName?: unknown;
  commissionAmount?: string | number;
  commissionAmountBalance?: string | number;
  commissionAmountPaid?: string | number;
  commissionPercentage?: string | number;
  createdAt?: string | null;
  id: string;
  paidAt?: string | null;
  percentageCommission?: string | number;
  invoice?: {
    id?: string;
    invoiceId?: string;
    status?: string;
    total?: string | number;
  } | null;
  invoiceId?: string;
  invoiceNumber?: string;
  invoiceStatus?: string;
  invoiceTotal?: string | number;
  percentage?: string | number;
  project?: { id?: string; name?: unknown } | null;
  projectId?: string;
  projectName?: unknown;
  quote?: {
    id?: string;
    name?: unknown;
    project?: { id?: string; name?: unknown } | null;
    quoteId?: string;
    taxAmount?: string | number;
    total?: string | number;
  } | null;
  quoteId?: string;
  quoteName?: unknown;
  quoteReference?: string;
  staff?: { email?: string; id?: string; name?: unknown } | null;
  staffEmail?: string;
  staffId?: string;
  staffName?: unknown;
  status?: string;
  total?: string | number;
  updatedAt?: string | null;
};

type BackendCommissionUpdateResponse = {
  commission?: BackendCommissionResponse;
  message?: string;
};

export type CommissionCreatePayload = {
  clientId?: string;
  clientName: string;
  percentageCommission: number;
  projectId?: string;
  quoteId?: string;
  staffEmail?: string;
  staffId?: string;
  staffName: string;
  status: CommissionStatus;
  total: number;
};

export type CommissionUpdatePayload = {
  commissionAmountPaid?: number;
  percentageCommission?: number;
  status?: CommissionStatus;
};

export type PaymentMethodInput = "ACH" | "WIRE" | "CREDIT_CARD" | "CHECK";

export type CreatePaymentInput = {
  amount: number;
  createdAt: string;
  invoiceId: string;
  method: PaymentMethodInput;
  projectId?: string;
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
  isActive?: boolean;
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
    accountPartner: data.accountPartner
      ? {
          email: data.accountPartner.email,
          id: data.accountPartner.id,
          name: normalizeString(data.accountPartner.name),
        }
      : undefined,
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

function fileNameFromDisposition(disposition: string | null, fallbackName: string) {
  if (!disposition) {
    return fallbackName;
  }

  const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (encodedMatch?.[1]) {
    return decodeURIComponent(encodedMatch[1].replace(/"/g, ""));
  }

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i);

  return plainMatch?.[1] || fallbackName;
}

async function downloadPortalFile(path: string, fallbackName: string) {
  const token = getPortalToken();

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const response = await fetch(`${portalApiUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json") ? await response.json() : await response.text();
    const message =
      typeof body === "object" && body && "message" in body
        ? String(body.message)
        : "The portal API rejected the download request.";

    throw new Error(message);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileNameFromDisposition(response.headers.get("content-disposition"), fallbackName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
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
  const clients = await portalRequest<BackendUserResponse[]>("/users/clients", {}, true);
  const data = clients.find((client) => client.id === id || client.clientItemId === id);

  if (!data) {
    throw new Error("Client was not found.");
  }

  return normalizeClientRecord(data);
}

export async function requestPasswordResetOtp(email: string) {
  return portalRequest<PortalMessageResponse>("/auth/forgot-password", {
    body: JSON.stringify({ email }),
    method: "POST",
  });
}

export async function confirmPasswordReset(
  email: string,
  otp: string,
  newPassword: string,
) {
  return portalRequest<PortalMessageResponse>("/auth/reset-password", {
    body: JSON.stringify({ email, newPassword, otp }),
    method: "POST",
  });
}

export async function changePassword(input: ChangePasswordInput) {
  return portalRequest<PortalMessageResponse>("/auth/change-password", {
    body: JSON.stringify(input),
    method: "POST",
  }, true);
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
  return formatPortalDate(value);
}

function formatDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = parsePortalDate(value);

  if (!date || Number.isNaN(date.getTime())) {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(value) ? value : "";
  }

  return formatPortalDate(value);
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
  const assignedStaff = project.client?.accountPartner ?? project.accountPartner ?? project.assignedStaff ?? project.staff;

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
    invoice: project.invoice
      ? {
          dateIssued: formatProjectDate(project.invoice.dateIssued),
          id: project.invoice.id,
          invoiceId: project.invoice.invoiceId || project.invoice.id,
          lineItems: normalizeLineItems(project.invoice.lineItems),
          paymentSchedule: normalizeQuotePaymentSchedule(project.invoice.paymentSchedule),
          status: normalizeString(project.invoice.status),
          subtotal: moneyText(project.invoice.subtotal),
          tax: normalizeString(project.invoice.tax),
          taxAmount: moneyText(project.invoice.taxAmount),
          total: moneyText(project.invoice.total),
          validUntil: formatProjectDate(project.invoice.validUntil),
        }
      : null,
    quote: project.quote
      ? {
          id: project.quote.id,
          paymentSchedule: normalizeQuotePaymentSchedule(project.quote.paymentSchedule),
          quoteId: project.quote.quoteId || project.quote.id,
          status: normalizeString(project.quote.status),
          validUntil: formatProjectDate(project.quote.validUntil),
        }
      : null,
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

function normalizeLineItems(
  lineItems?: BackendQuoteLineItemResponse[],
) {
  return (lineItems ?? []).map((item) => {
    const service = item.service ?? undefined;
    const price = item.ourPrice ?? item.unitPrice ?? item.price ?? service?.ourPrice ?? service?.price;
    const rate = moneyText(price);
    const quantity = Number(item.quantity) || 1;
    const lineTotal = numberFromDecimal(item.lineTotal ?? item.total) || numberFromDecimal(price) * quantity;

    return {
      amount: moneyText(lineTotal),
      description: item.productName || service?.productName || service?.name || "Line item",
      qty: quantity,
      rate,
      serviceId: item.serviceId || service?.id,
    };
  });
}

function normalizePaymentScheduleAmountType(value?: string) {
  return value === "percentage" ? "percentage" : "fixed";
}

function normalizeQuotePaymentSchedulePayment(
  payment: BackendQuotePaymentSchedulePaymentResponse,
  fallbackName: string,
) {
  return {
    amount: numberFromDecimal(payment.amount),
    date: formatScheduleDate(payment.date),
    name: normalizeString(payment.name) || fallbackName,
    percentage: numberFromDecimal(payment.percentage),
  };
}

function formatScheduleDate(value?: string | null) {
  if (!value || value === "Date of Invoice Generation") {
    return value || "";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : formatPortalDate(value);
}

function normalizeQuotePaymentSchedule(
  schedule?: BackendQuotePaymentScheduleResponse | null,
): QuoteListItem["paymentSchedule"] {
  if (!schedule?.type) {
    return null;
  }

  const type = schedule.type as NonNullable<QuoteListItem["paymentSchedule"]>["type"];

  if (
    type !== "FULL_PAYMENT" &&
    type !== "DEPOSIT_AND_BALANCE" &&
    type !== "DEPOSIT_AND_SPLIT_BALANCE"
  ) {
    return null;
  }

  return {
    balance: schedule.balance
      ? {
          amount: numberFromDecimal(schedule.balance.amount),
          date: formatScheduleDate(schedule.balance.date) || null,
          name: schedule.balance.name ?? null,
          payments: (schedule.balance.payments ?? []).map((payment, index) =>
            normalizeQuotePaymentSchedulePayment(payment, `Payment ${index + 1}`),
          ),
          percentage: numberFromDecimal(schedule.balance.percentage),
          split: schedule.balance.split ?? null,
        }
      : null,
    deposit: schedule.deposit
      ? {
          amount: numberFromDecimal(schedule.deposit.amount),
          amountType: normalizePaymentScheduleAmountType(schedule.deposit.amountType),
          date: formatScheduleDate(schedule.deposit.date),
          name: normalizeString(schedule.deposit.name) || "Deposit",
          percentage: numberFromDecimal(schedule.deposit.percentage),
        }
      : null,
    fullPayment: schedule.fullPayment
      ? normalizeQuotePaymentSchedulePayment(schedule.fullPayment, "Full Payment")
      : null,
    totalAmount: numberFromDecimal(schedule.totalAmount),
    type,
  };
}

function quoteProjectId(quote: BackendQuoteResponse) {
  if (quote.project && typeof quote.project === "object") {
    return quote.project.id;
  }

  return quote.projectId || normalizeString(quote.project);
}

function quoteProjectName(quote: BackendQuoteResponse) {
  if (quote.project && typeof quote.project === "object") {
    return quote.project.name;
  }

  return undefined;
}

function mapBackendQuote(quote: BackendQuoteResponse): QuoteListItem {
  const validUntil = formatProjectDate(quote.validUntil);
  const lineItems = normalizeLineItems(quote.lineItems);
  const projectId = quoteProjectId(quote);
  const projectNameValue = quoteProjectName(quote);
  const title = quote.title || quote.name || quote.quoteId || "Untitled quote";
  const paymentSchedule = normalizeQuotePaymentSchedule(quote.paymentSchedule);
  const total = moneyText(quote.total);

  return {
    amount: moneyText(quote.amount ?? quote.total),
    clientComment: normalizeString(quote.clientComment),
    dateIssued: formatProjectDate(quote.dateIssued),
    description: quote.description || projectName(quote.project, ""),
    id: quote.id,
    invoices: (quote.invoices ?? []).map((invoice) =>
      invoiceFromQuote(invoice, {
        lineItems,
        paymentSchedule,
        projectId,
        projectName: projectNameValue || projectName(quote.project, "") || title,
        quoteReference: quote.quoteId || quote.uid || quote.id,
        tax: normalizeString(quote.tax),
        taxAmount: moneyText(quote.taxAmount),
        subtotal: moneyText(quote.subtotal),
        validUntil,
      }),
    ),
    lineItems,
    message: normalizeString(quote.message),
    paymentSchedule,
    projectId,
    projectName: projectNameValue,
    status: normalizeQuoteStatus(quote.status || "PENDING", quote.validUntil),
    subtotal: moneyText(quote.subtotal),
    tax: normalizeString(quote.tax),
    taxAmount: moneyText(quote.taxAmount),
    title,
    total,
    uid: quote.uid || quote.quoteId || quote.id,
    validUntil,
  };
}

function mapBackendPayment(payment: BackendPaymentResponse): PaymentItem {
  const project = payment.project && typeof payment.project === "object" ? payment.project : undefined;
  const invoice = payment.invoice && typeof payment.invoice === "object" ? payment.invoice : undefined;

  return {
    amount: moneyText(payment.amount),
    date: formatProjectDate(payment.date ?? payment.createdAt),
    id: payment.id,
    invoice: payment.invoiceId || projectName(payment.invoice, payment.id),
    invoiceId: payment.invoiceId || invoice?.id,
    method: normalizePaymentMethod(payment.method || "ACH"),
    project: projectName(payment.project, ""),
    projectId: payment.projectId ?? project?.id,
    reference: payment.reference || payment.id,
  };
}

function mapBackendCommission(commission: BackendCommissionResponse): CommissionItem {
  const invoice = commission.invoice ?? undefined;
  const client = commission.client ?? undefined;
  const staff = commission.staff ?? undefined;
  const quote = commission.quote ?? undefined;
  const project = commission.project ?? quote?.project ?? undefined;
  const totalAmountValue = numberFromDecimal(commission.total ?? commission.invoiceTotal ?? invoice?.total);
  const percentageCommission = numberFromDecimal(
    commission.percentageCommission ?? commission.commissionPercentage ?? commission.percentage,
  );
  const commissionValue =
    numberFromDecimal(commission.amount ?? commission.commissionAmount) ||
    commissionAmountValue(totalAmountValue, percentageCommission);

  const invoiceId = commission.invoiceId ?? invoice?.invoiceId ?? invoice?.id;

  const amountPaidValue = numberFromDecimal(commission.amountPaid) || 0;
  const commissionAmountPaidValue = numberFromDecimal(commission.commissionAmountPaid) || 0;
  const commissionAmountBalanceValue = numberFromDecimal(commission.commissionAmountBalance) || (commissionValue - commissionAmountPaidValue);

  return {
    clientId: commission.clientId ?? client?.id,
    clientCompany: normalizeString(client?.company),
    clientEmail: client?.email,
    clientName: normalizeString(commission.clientName ?? client?.name) || "Client",
    amountPaid: formatMoney(amountPaidValue),
    amountPaidValue,
    commissionAmount: formatMoney(commissionValue),
    commissionAmountValue: commissionValue,
    commissionAmountPaid: formatMoney(commissionAmountPaidValue),
    commissionAmountPaidValue,
    commissionAmountBalance: formatMoney(commissionAmountBalanceValue),
    commissionAmountBalanceValue,
    createdAt: formatProjectDate(commission.createdAt),
    id: commission.id,
    invoiceId,
    paidAt: formatProjectDate(commission.paidAt),
    percentageCommission,
    projectId: commission.projectId ?? project?.id,
    projectName: normalizeString(commission.projectName ?? project?.name) || "Project",
    quoteId: commission.quoteId ?? quote?.id ?? commission.quoteReference,
    quoteName: normalizeString(commission.quoteName ?? quote?.name) || "Quote",
    quoteReference: quote?.quoteId ?? commission.quoteReference,
    quoteTaxAmount: moneyText(quote?.taxAmount),
    quoteTotal: moneyText(quote?.total),
    staffEmail: commission.staffEmail ?? staff?.email,
    staffId: commission.staffId ?? staff?.id,
    staffName: normalizeString(commission.staffName ?? staff?.name) || "Not assigned",
    status: normalizeCommissionStatus(commission.status),
    totalAmount: formatMoney(totalAmountValue),
    totalAmountValue,
    updatedAt: formatProjectDate(commission.updatedAt),
  };
}

function commissionFromInvoice(
  invoice: InvoiceItem,
  projectsById: Map<string, ProjectListItem>,
  projectsByName: Map<string, ProjectListItem>,
  percentage = 5,
): CommissionItem {
  const project =
    (invoice.projectId ? projectsById.get(invoice.projectId) : undefined) ??
    projectsByName.get(invoice.project);
  const totalAmountValue = amountNumber(invoice.total || invoice.amount);
  const commissionValue = commissionAmountValue(totalAmountValue, percentage);

  return {
    clientId: project?.clientId,
    clientEmail: project?.clientEmail,
    clientName: invoice.clientName || project?.clientName || "Client",
    commissionAmount: formatMoney(commissionValue),
    commissionAmountValue: commissionValue,
    createdAt: invoice.issuedDate,
    id: `commission-${invoice.id}`,
    percentageCommission: percentage,
    projectId: invoice.projectId || project?.id,
    projectName: invoice.project || project?.title || "Project",
    quoteId: invoice.quoteReference,
    quoteName: invoice.quoteReference || "Generated quote",
    quoteReference: invoice.quoteReference,
    staffEmail: project?.assignedStaffEmail,
    staffId: project?.assignedStaffId,
    staffName: project?.assignedStaffName || project?.assignedStaffEmail || "Not assigned",
    status: invoice.status === "Paid" ? "PAID" : "APPROVED_COMMISSION",
    totalAmount: formatMoney(totalAmountValue),
    totalAmountValue,
  };
}

function commissionsFromResponse(
  response: BackendCommissionResponse[] | { commissions?: BackendCommissionResponse[]; data?: BackendCommissionResponse[] },
) {
  if (Array.isArray(response)) {
    return response;
  }

  return response.commissions ?? response.data ?? [];
}

function commissionFromUpdateResponse(response: BackendCommissionResponse | BackendCommissionUpdateResponse) {
  return "commission" in response && response.commission ? response.commission : (response as BackendCommissionResponse);
}

function isCurrentStaffCommission(commission: CommissionItem, user: PortalUser) {
  const staffName = commission.staffName.toLowerCase();
  const currentName = user.name.toLowerCase();

  return Boolean(
    (commission.staffId && commission.staffId === user.clientItemId) ||
      (commission.staffEmail && commission.staffEmail.toLowerCase() === user.email.toLowerCase()) ||
      (staffName && currentName && staffName === currentName),
  );
}

function filterCommissionsForRole(commissionList: CommissionItem[]) {
  const currentUser = getCurrentPortalUser();

  if (currentUser?.role !== "staff") {
    return commissionList;
  }

  return commissionList.filter((commission) => isCurrentStaffCommission(commission, currentUser));
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
  const normalized = status.trim().toUpperCase();

  if (normalized === "APPROVED") {
    return "Approved";
  }

  if (["Paid", "Overdue", "Draft", "Approved"].includes(status)) {
    return status as InvoiceItem["status"];
  }

  return status.toLowerCase().includes("paid") ? "Paid" : "Draft";
}

function normalizePaymentMethod(method: string) {
  if (["ACH", "Wire", "Credit Card", "Check"].includes(method)) {
    return method as PaymentItem["method"];
  }

  const normalized = method.toLowerCase();

  if (normalized.includes("stripe")) return "Stripe";
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

// function normalizeDocumentType(type: string) {
//   if (["Shop drawing", "CAD File", "Spec Sheet", "Photo"].includes(type)) {
//     return type as DocumentItem["type"];
//   }

//   const normalized = type.toLowerCase();

//   if (normalized.includes("photo") || normalized.includes("image")) return "Photo";
//   if (normalized.includes("cad") || normalized.includes("dwg")) return "CAD File";
//   if (normalized.includes("shop")) return "Shop drawing";

//   return "Spec Sheet";
// }

// function documentFromProjectUpload(project: ProjectListItem, upload: ProjectUploadItem): DocumentItem {
//   return {
//     date: project.startDate || project.dueDate || project.estimatedCompletion || "",
//     downloadUrl: uploadDownloadUrl(upload.id),
//     id: `${project.id}-${upload.id}`,
//     project: project.title,
//     title: upload.name || "Uploaded file",
//     type: normalizeDocumentType(upload.name || "Spec Sheet"),
//   };
// }

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

function emptyQuoteResponse(): QuoteResponse {
  return {
    metrics: buildQuoteMetrics([]),
    quotes: [],
  };
}

function buildInvoiceMetrics(invoiceList: InvoiceItem[]) {
  const outstanding = invoiceList
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((sum, invoice) => sum + amountNumber(invoice.amount), 0);

  return [
    { icon: "dollar", label: "Total Outstanding", tone: "danger", value: `$${outstanding.toLocaleString()}` },
    { icon: "documents", label: "Invoices Sent", tone: "danger", value: `${invoiceList.length}` },
    {
      icon: "check",
      label: "Paid This Month",
      tone: "danger",
      value: `${invoiceList.filter((invoice) => invoice.status === "Paid").length}`,
    },
  ] as Metric[];
}

function buildPaymentMetrics(paymentList: PaymentItem[]) {
  const total = paymentList.reduce((sum, payment) => sum + amountNumber(payment.amount), 0);

  return [
    { icon: "documents", label: "TOTAL PAID (YTD)", tone: "danger", value: `$${total.toLocaleString()}` },
    { icon: "documents", label: "LAST 30 DAYS", tone: "danger", value: `$${total.toLocaleString()}` },
    { icon: "check", label: "TOTAL PAYMENTS", tone: "danger", value: `${paymentList.length}` },
  ] as Metric[];
}

function commissionAmountValue(invoiceTotal: number, percentage: number) {
  return Math.round((invoiceTotal * (percentage / 100) + Number.EPSILON) * 100) / 100;
}

function normalizeCommissionStatus(status?: string): CommissionStatus {
  const normalized = status?.trim().toUpperCase();

  if (normalized === "PAID") {
    return "PAID";
  }
  
  if (normalized === "PARTIALLY_PAID") {
    return "PARTIALLY_PAID";
  }

  if (normalized === "APPROVED_COMMISSION" || normalized === "APPROVED" || normalized === "INVOICE_COMMISSION") {
    return "INVOICE_COMMISSION";
  }

  return "QUOTED_COMMISSION";
}

function buildCommissionMetrics(commissionList: CommissionItem[]) {
  const total = commissionList.reduce((sum, commission) => sum + commission.commissionAmountValue, 0);

  return [
    { icon: "dollar", label: "Total Commission", tone: "danger", value: formatMoney(total) },
    {
      icon: "clock",
      label: "Pending",
      tone: "danger",
      value: `${commissionList.filter((commission) => commission.status === "QUOTED_COMMISSION").length}`,
    },
    {
      icon: "check",
      label: "Approved",
      tone: "danger",
      value: `${commissionList.filter((commission) => commission.status === "APPROVED_COMMISSION").length}`,
    },
  ] as Metric[];
}

function emptyCommissionResponse(): CommissionResponse {
  return {
    commissions: [],
    metrics: buildCommissionMetrics([]),
  };
}

function emptyInvoiceResponse(): InvoiceResponse {
  return {
    invoices: [],
    metrics: buildInvoiceMetrics([]),
  };
}

function emptyPaymentResponse(): PaymentResponse {
  return {
    metrics: buildPaymentMetrics([]),
    payments: [],
  };
}

function invoiceFromQuote(
  invoice: BackendInvoiceResponse,
  quote: {
    lineItems?: InvoiceItem["lineItems"];
    paymentSchedule?: QuoteListItem["paymentSchedule"];
    projectId?: string;
    projectName: string;
    quoteReference?: string;
    subtotal?: string;
    tax?: string;
    taxAmount?: string;
    validUntil?: string;
  },
): InvoiceItem {
  const total = moneyText(invoice.total);

  return {
    amount: total,
    dueDate: quote.validUntil || "",
    id: invoice.id,
    invoiceId: invoice.invoiceId || invoice.id,
    issuedDate: formatProjectDate(invoice.createdAt),
    lineItems: quote.lineItems,
    paymentSchedule: quote.paymentSchedule ?? null,
    project: quote.projectName || "Linked project",
    projectId: quote.projectId,
    quoteReference: quote.quoteReference,
    status: normalizeInvoiceStatus(invoice.status || "Approved"),
    subtotal: quote.subtotal,
    tax: quote.tax,
    taxAmount: quote.taxAmount,
    total,
  };
}

function invoiceFromProject(project: ProjectListItem): InvoiceItem | null {
  if (!project.invoice) {
    return null;
  }

  return {
    amount: project.invoice.total || "$0.00",
    clientEmail: project.clientEmail,
    clientName: project.clientName,
    dueDate: project.invoice.validUntil || project.dueDate,
    id: project.invoice.id,
    invoiceId: project.invoice.invoiceId,
    issuedDate: project.invoice.dateIssued || project.startDate || "",
    lineItems: project.invoice.lineItems,
    project: project.title,
    projectId: project.id,
    quoteReference: project.quote?.quoteId,
    status: normalizeInvoiceStatus(project.invoice.status || "Approved"),
    subtotal: project.invoice.subtotal,
    tax: project.invoice.tax,
    taxAmount: project.invoice.taxAmount,
    total: project.invoice.total,
    paymentSchedule: project.invoice.paymentSchedule ?? project.quote?.paymentSchedule ?? null,
  };
}

function mergeInvoices(...sources: InvoiceItem[][]) {
  const invoiceMap = new Map<string, InvoiceItem>();

  sources.flat().forEach((invoice) => {
    const key = invoice.id || invoice.invoiceId || `${invoice.projectId}-${invoice.quoteReference}`;
    const existing = invoiceMap.get(key);

    invoiceMap.set(key, {
      ...invoice,
      ...existing,
      lineItems: existing?.lineItems?.length ? existing.lineItems : invoice.lineItems,
      paymentSchedule: existing?.paymentSchedule ?? invoice.paymentSchedule,
    });
  });

  return Array.from(invoiceMap.values());
}

async function getProjectInvoices() {
  const projectData = await getProjects();

  return projectData.projects
    .map(invoiceFromProject)
    .filter((invoice): invoice is InvoiceItem => Boolean(invoice));
}

function paymentsWithInvoiceIds(payments: PaymentItem[], invoices: InvoiceItem[]) {
  const invoiceById = new Map(
    invoices.flatMap((invoice) =>
      [invoice.id, invoice.invoiceId]
        .filter((value): value is string => Boolean(value))
        .map((value) => [value, invoice] as const),
    ),
  );
  const invoiceByProject = new Map(
    invoices
      .filter((invoice) => invoice.projectId)
      .map((invoice) => [invoice.projectId, invoice] as const),
  );

  return payments.map((payment) => {
    const invoice =
      (payment.invoiceId ? invoiceById.get(payment.invoiceId) : undefined) ??
      (payment.projectId ? invoiceByProject.get(payment.projectId) : undefined);

    return invoice
      ? {
          ...payment,
          invoice: invoice.invoiceId || invoice.id,
          invoiceId: payment.invoiceId || invoice.id,
          project: payment.project || invoice.project,
        }
      : payment;
  });
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

  const portalDateMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const oldPortalDateMatch = value.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  const date = portalDateMatch
    ? new Date(`${portalDateMatch[3]}-${portalDateMatch[1]}-${portalDateMatch[2]}T00:00:00.000Z`)
    : oldPortalDateMatch
      ? new Date(`${oldPortalDateMatch[1]}-${oldPortalDateMatch[3]}-${oldPortalDateMatch[2]}T00:00:00.000Z`)
    : value.includes("T")
      ? new Date(value)
      : new Date(`${value}T00:00:00.000Z`);

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
  const mil = input.mil ? projectStagePayload(input.mil) : undefined;
  const buildAssemble = input.buildAssemble ? projectStagePayload(input.buildAssemble) : undefined;
  const finishing = input.finishing ? projectStagePayload(input.finishing) : undefined;

  return {
    ...(buildAssemble ? { buildAssemble } : {}),
    clientId: input.clientId,
    ...(input.delivery ? { delivery: projectStagePayload(input.delivery) } : {}),
    description: input.description,
    endDate: toApiDate(input.endDate),
    fabrication: calculateFabricationProgress({ buildAssemble, finishing, mil }),
    ...(finishing ? { finishing } : {}),
    ...(input.install ? { install: projectStagePayload(input.install) } : {}),
    location: input.location,
    ...(mil ? { mil } : {}),
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

function quotePayload(input: CreateQuoteInput | UpdateQuoteInput) {
  return {
    ...input,
    ...(input.dateIssued ? { dateIssued: toApiDate(input.dateIssued) } : {}),
    ...(input.validUntil ? { validUntil: toApiDate(input.validUntil) } : {}),
  };
}

function quoteFromResponse(response: BackendQuoteEnvelopeResponse): BackendQuoteResponse {
  if (Array.isArray(response)) {
    throw new Error("The portal API returned a quote list when one quote was expected.");
  }

  if ("quote" in response && response.quote) {
    return response.quote;
  }

  if ("data" in response && response.data) {
    return quoteFromResponse(response.data as BackendQuoteEnvelopeResponse);
  }

  return response as BackendQuoteResponse;
}

function quotesFromResponse(response: BackendQuoteResponse[] | BackendQuoteEnvelopeResponse) {
  if (Array.isArray(response)) {
    return response;
  }

  if ("quotes" in response && Array.isArray(response.quotes)) {
    return response.quotes;
  }

  if ("data" in response && response.data) {
    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    }

    return quotesFromResponse(data as BackendQuoteEnvelopeResponse);
  }

  return [];
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

function createUploadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (character) =>
    (Number(character) ^ (Math.random() * 16 >> Number(character) / 4)).toString(16),
  );
}

export async function uploadFile(file: File) {
  return uploadFileWithId(createUploadId(), file);
}

export async function uploadFileWithId(uploadId: string, file: File) {
  if (!isWithinDocumentUploadLimit(file)) {
    throw new Error(`Documents can be up to ${documentUploadLimitText()} each.`);
  }

  const body = new FormData();
  body.append("file", file);

  const response = await portalRequest<{ uploadId: string }>(
    `/uploads/${encodeURIComponent(uploadId)}`,
    {
      body,
      method: "POST",
    },
    true,
  );

  return response.uploadId || uploadId;
}

export async function deleteUploads(uploadIds: string[]) {
  return portalRequest<DeleteUploadsResponse>("/uploads", {
    body: JSON.stringify({ ids: uploadIds }),
    method: "DELETE",
  }, true);
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

export async function getProjectDocumentsCategories(projectId: string): Promise<DocumentCategoryItem[]> {
  return portalRequest<DocumentCategoryItem[]>(`/documents/project/${encodeURIComponent(projectId)}`, {}, true);
}

export async function createDocumentCategory(projectId: string, name: string): Promise<void> {
  await portalRequest(
    `/documents/categories`,
    {
      body: JSON.stringify({ projectId, name }),
      method: "POST",
    },
    true
  );
}

export async function updateDocumentCategory(categoryId: string, name: string): Promise<void> {
  await portalRequest(
    `/documents/categories/${encodeURIComponent(categoryId)}`,
    {
      body: JSON.stringify({ name }),
      method: "PATCH",
    },
    true
  );
}

export async function deleteDocumentCategory(categoryId: string): Promise<void> {
  await portalRequest(
    `/documents/categories/${encodeURIComponent(categoryId)}`,
    {
      method: "DELETE",
    },
    true
  );
}

export async function addProjectDocument(projectId: string, uploadId: string, categoryId?: string): Promise<void> {
  await portalRequest(
    `/documents`,
    {
      body: JSON.stringify({ projectId, uploadId, categoryId }),
      method: "POST",
    },
    true
  );
}

export async function deleteProjectDocument(documentId: string): Promise<void> {
  await portalRequest(
    `/documents/${encodeURIComponent(documentId)}`,
    {
      method: "DELETE",
    },
    true
  );
}

export async function getCatalogItems() {
  return portalRequest<CatalogItem[]>("/services", {}, true);
}

export async function getCatalogItem(id: string) {
  return portalRequest<CatalogItem>(`/services/${encodeURIComponent(id)}`, {}, true);
}

export async function createCatalogItem(input: CreateCatalogItemInput) {
  return portalRequest<{ item: CatalogItem; message: string }>("/services", {
    body: JSON.stringify(input),
    method: "POST",
  }, true);
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

export async function getInventoryItems() {
  return portalRequest<InventoryItem[]>("/inventory", {}, true);
}

export async function getInventorySummary() {
  return portalRequest<InventorySummaryResponse>("/inventory/summary", {}, true);
}

export async function getInventoryItem(id: string) {
  return portalRequest<InventoryItem>(`/inventory/${encodeURIComponent(id)}`, {}, true);
}

export async function createInventoryItem(input: CreateInventoryItemInput) {
  return portalRequest<{ item: InventoryItem; message: string }>("/inventory", {
    body: JSON.stringify(input),
    method: "POST",
  }, true);
}

export async function updateInventoryItem(id: string, input: UpdateInventoryItemInput) {
  return portalRequest<{ item: InventoryItem; message: string }>(
    `/inventory/${encodeURIComponent(id)}`,
    {
      body: JSON.stringify(input),
      method: "PATCH",
    },
    true,
  );
}

export async function importInventoryItems(file: File) {
  const body = new FormData();
  body.append("file", file);

  return portalRequest<InventoryImportResponse>("/inventory/import", {
    body,
    method: "POST",
  }, true);
}

export async function createQuote(input: CreateQuoteInput) {
  const response = await portalRequest<BackendQuoteEnvelopeResponse>("/quotes", {
    body: JSON.stringify(quotePayload(input)),
    method: "POST",
  }, true);

  return mapBackendQuote(quoteFromResponse(response));
}

export async function updateQuote(id: string, input: UpdateQuoteInput) {
  const response = await portalRequest<BackendQuoteEnvelopeResponse>(
    `/quotes/${encodeURIComponent(id)}`,
    {
      body: JSON.stringify(quotePayload(input)),
      method: "PATCH",
    },
    true,
  );

  return mapBackendQuote(quoteFromResponse(response));
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
    const quoteResponse = await portalRequest<BackendQuoteResponse[] | BackendQuoteEnvelopeResponse>("/quotes", {}, true);
    const mappedQuotes = quotesFromResponse(quoteResponse).map(mapBackendQuote);

    return {
      metrics: buildQuoteMetrics(mappedQuotes),
      quotes: mappedQuotes,
    };
  } catch {
    return emptyQuoteResponse();
  }
}

export function downloadQuotePdf(quoteId: string, fileName?: string) {
  return downloadPortalFile(
    `/quotes/${encodeURIComponent(quoteId)}/download`,
    fileName || `quote-${quoteId}.pdf`,
  );
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
    recentActivity: [],
  };
}

export async function acceptQuote(uid: string, comment = ""): Promise<QuoteListItem> {
  return respondToQuote(uid, "APPROVED", comment);
}

export async function getDocuments(): Promise<DocumentResponse> {
  try {
    const projectData = await getProjects();
    const allDocs: DocumentItem[] = [];

    await Promise.all(
      projectData.projects.map(async (project) => {
        try {
          const categoriesData = await getProjectDocumentsCategories(project.id);
          let parsedCategories = [];
          if (Array.isArray(categoriesData)) {
            parsedCategories = categoriesData;
          } else if (categoriesData && typeof categoriesData === "object") {
            parsedCategories = (categoriesData as any).categories || (categoriesData as any).data || (categoriesData as any).documents || [];
          }

          if (Array.isArray(parsedCategories)) {
            for (const cat of parsedCategories) {
              const docs = cat.documents || [];
              for (const doc of docs) {
                allDocs.push({
                  id: doc.id,
                  date: doc.createdAt ? formatPortalDate(doc.createdAt) : "",
                  downloadUrl: uploadDownloadUrl(doc.uploadId || doc.id),
                  project: project.title,
                  title: doc.name,
                  type: (cat.id === "uncategorized" ? "Uncategorized" : cat.name) as any,
                });
              }
            }
          }
        } catch (e) {
          console.error(`Failed to fetch documents for project ${project.id}`, e);
        }
      })
    );

    return { documents: allDocs };
  } catch {
    return { documents: [] };
  }
}

export async function getInvoices(): Promise<InvoiceResponse> {
  try {
    const [projectInvoices, quoteData] = await Promise.all([
      getProjectInvoices(),
      getQuotes().catch(() => emptyQuoteResponse()),
    ]);
    const quoteInvoices = quoteData.quotes.flatMap((quote) => quote.invoices ?? []);
    const mappedInvoices = mergeInvoices(projectInvoices, quoteInvoices);

    return {
      invoices: mappedInvoices,
      metrics: buildInvoiceMetrics(mappedInvoices),
    };
  } catch {
    return emptyInvoiceResponse();
  }
}

export function downloadInvoicePdf(invoiceId: string, fileName?: string) {
  return downloadPortalFile(
    `/quotes/invoices/${encodeURIComponent(invoiceId)}/download`,
    fileName || `invoice-${invoiceId}.pdf`,
  );
}

export function applyCommissionUpdate(
  commission: CommissionItem,
  input: { commissionAmountPaid?: number; percentageCommission?: number; status?: CommissionStatus },
): CommissionItem {
  const percentageCommission = Number.isFinite(input.percentageCommission)
    ? Number(input.percentageCommission)
    : commission.percentageCommission;
  const commissionValue = commissionAmountValue(commission.totalAmountValue, percentageCommission);
  const commissionAmountPaidValue = Number.isFinite(input.commissionAmountPaid)
    ? Number(input.commissionAmountPaid)
    : (commission.commissionAmountPaidValue || 0);
  const commissionAmountBalanceValue = commissionValue - commissionAmountPaidValue;

  return {
    ...commission,
    commissionAmount: formatMoney(commissionValue),
    commissionAmountValue: commissionValue,
    commissionAmountPaid: formatMoney(commissionAmountPaidValue),
    commissionAmountPaidValue,
    commissionAmountBalance: formatMoney(commissionAmountBalanceValue),
    commissionAmountBalanceValue,
    percentageCommission,
    status: input.status ?? commission.status,
  };
}

export function buildCommissionCreatePayload(commission: CommissionItem): CommissionCreatePayload {
  return {
    clientId: commission.clientId,
    clientName: commission.clientName,
    percentageCommission: commission.percentageCommission,
    projectId: commission.projectId,
    quoteId: commission.quoteId,
    staffEmail: commission.staffEmail,
    staffId: commission.staffId,
    staffName: commission.staffName,
    status: commission.status,
    total: commission.totalAmountValue,
  };
}

export function buildCommissionUpdatePayload(
  commission: CommissionItem,
  input: { commissionAmountPaid?: number; percentageCommission?: number; status?: CommissionStatus } = {},
): CommissionUpdatePayload {
  const payload: CommissionUpdatePayload = {};

  if (Number.isFinite(input.percentageCommission)) {
    payload.percentageCommission = Number(input.percentageCommission);
  }
  
  if (Number.isFinite(input.commissionAmountPaid)) {
    payload.commissionAmountPaid = Number(input.commissionAmountPaid);
  }

  if (
    input.status === "PAID" &&
    commission.status === "PARTIALLY_PAID"
  ) {
    payload.status = input.status;
  }

  return payload;
}

export async function getCommissions(): Promise<CommissionResponse> {
  try {
    const currentUser = getCurrentPortalUser();
    const path = currentUser?.role === "staff" ? "/commissions/me" : "/commissions";
    
    const response = await portalRequest<
      BackendCommissionResponse[] | { commissions?: BackendCommissionResponse[]; data?: BackendCommissionResponse[] }
    >(path, {}, true);
    
    const commissions = filterCommissionsForRole(commissionsFromResponse(response).map(mapBackendCommission));

    return {
      commissions,
      metrics: buildCommissionMetrics(commissions),
    };
  } catch {
    try {
      const [invoiceData, projectData] = await Promise.all([
        getInvoices().catch(() => emptyInvoiceResponse()),
        getProjects().catch(() => emptyProjectResponse()),
      ]);
      const projectsById = new Map(projectData.projects.map((project) => [project.id, project]));
      const projectsByName = new Map(projectData.projects.map((project) => [project.title, project]));
      const generatedCommissions = invoiceData.invoices
        .filter((invoice) => invoice.status !== "Draft")
        .map((invoice) => commissionFromInvoice(invoice, projectsById, projectsByName));
      const commissions = filterCommissionsForRole(generatedCommissions);

      return {
        commissions,
        metrics: buildCommissionMetrics(commissions),
      };
    } catch {
      return emptyCommissionResponse();
    }
  }
}

export async function updateCommission(
  commission: CommissionItem,
  input: { commissionAmountPaid?: number; percentageCommission?: number; status?: CommissionStatus },
) {
  const payload = buildCommissionUpdatePayload(commission, input);

  try {
    const response = await portalRequest<BackendCommissionResponse | BackendCommissionUpdateResponse>(
      `/commissions/${encodeURIComponent(commission.id)}`,
      {
        body: JSON.stringify(payload),
        method: "PATCH",
      },
      true,
    );

    return mapBackendCommission(commissionFromUpdateResponse(response));
  } catch {
    return applyCommissionUpdate(commission, input);
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
    const projectInvoices = await getProjectInvoices().catch(() => []);
    const displayPayments = paymentsWithInvoiceIds(mappedPayments, projectInvoices);

    return {
      metrics: buildPaymentMetrics(displayPayments),
      payments: displayPayments,
    };
  } catch {
    return emptyPaymentResponse();
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
    payments: paymentsWithInvoiceIds(
      response.payments.map((payment) => mapBackendPayment({ ...payment, projectId })),
      await getProjectInvoices().catch(() => []),
    ),
    projectId: response.projectId,
  };
}

export async function createPayment(input: CreatePaymentInput): Promise<ProjectPaymentSummary> {
  const response = await portalRequest<BackendCreatePaymentResponse>("/payments", {
    body: JSON.stringify({
      amount: input.amount,
      createdAt: input.createdAt,
      invoiceId: input.invoiceId,
      method: input.method,
      reference: input.reference,
    }),
    method: "POST",
  }, true);
  const responseProjectId = response.payment.projectId || input.projectId || "";

  const summary = responseProjectId ? await getProjectPayments(responseProjectId).catch(() => ({
    amountDue: moneyText(response.amountDue),
    amountPaid: moneyText(response.amountPaid),
    paymentStatus: response.paymentStatus,
    payments: [mapBackendPayment(response.payment)],
    projectId: responseProjectId,
  })) : {
    amountDue: moneyText(response.amountDue),
    amountPaid: moneyText(response.amountPaid),
    paymentStatus: response.paymentStatus,
    payments: [mapBackendPayment(response.payment)],
    projectId: "",
  };

  return summary;
}

export async function confirmCheckoutSession(sessionId: string) {
  return portalRequest<{ confirmed: boolean; message: string }>("/payments/confirm", {
    body: JSON.stringify({ sessionId }),
    method: "POST",
  }, true);
}

export async function createCheckoutSession(invoiceId: string, amount?: number) {
  const body: Record<string, unknown> = { invoiceId };

  if (amount != null) {
    body.amount = amount;
  }

  const response = await portalRequest<{ url: string }>("/payments/checkout", {
    body: JSON.stringify(body),
    method: "POST",
  }, true);

  return response;
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

export async function deactivateStaff(staffId: string) {
  return portalRequest<PortalMessageResponse>(`/users/staff/${encodeURIComponent(staffId)}/deactivate`, {
    method: "PATCH",
  }, true);
}

export async function reactivateStaff(staffId: string) {
  return portalRequest<PortalMessageResponse>(`/users/staff/${encodeURIComponent(staffId)}/reactivate`, {
    method: "PATCH",
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
      quoteFromResponse(
        await portalRequest<BackendQuoteEnvelopeResponse>(`/quotes/${encodeURIComponent(id)}`, {}, true),
      ),
    );
  } catch {
    const quoteData = await getQuotes().catch(() => emptyQuoteResponse());
    quote = quoteData.quotes.find((q) => q.id === id || q.uid === id);
  }

  const details = quote ? {
    lineItems: quote.lineItems ?? [],
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
  } : undefined;

  return { quote, details };
}

export async function getInvoiceDetail(id: string): Promise<{ invoice: InvoiceItem | undefined, details: InvoiceDetailInfo | undefined }> {
  const invoiceData = await getInvoices().catch(() => emptyInvoiceResponse());
  let invoice = invoiceData.invoices.find((item) => item.id === id || item.invoiceId === id);

  if (invoice && !invoice.paymentSchedule && invoice.projectId) {
    const quoteData = await getQuotes().catch(() => emptyQuoteResponse());
    const sourceQuote = quoteData.quotes.find((quote) =>
      quote.projectId === invoice?.projectId &&
      (
        !invoice?.quoteReference ||
        quote.uid === invoice.quoteReference ||
        quote.id === invoice.quoteReference
      ),
    );

    if (sourceQuote?.paymentSchedule) {
      invoice = {
        ...invoice,
        paymentSchedule: sourceQuote.paymentSchedule,
      };
    }
  }

  const details = invoice ? {
    billToAddress1: "",
    billToAddress2: "",
    billToEmail: invoice.clientEmail || "",
    billToName: invoice.clientName || "Client",
    lineItems: invoice.lineItems ?? [],
    linkedProject: {
      category: "Project",
      estCompletion: invoice.dueDate,
      id: invoice.projectId || "",
      location: "",
      title: invoice.project,
    },
    projectReference: invoice.project,
    quoteReference: invoice.quoteReference || "Not set",
    subtotal: invoice.subtotal || invoice.amount,
    tax: invoice.taxAmount || "$0.00",
    total: invoice.total || invoice.amount,
  } : undefined;

  return { invoice, details };
}
