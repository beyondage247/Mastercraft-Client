import type { ClientRecord } from "./portalApi";

export type BackOfficeProject = {
  clientEmail?: string;
  clientId: string;
  clientName: string;
  createdAt: string;
  description: string;
  estimatedCompletion: string;
  id: string;
  location: string;
  name: string;
  startDate: string;
  status: string;
};

export type BackOfficeQuote = {
  amount: string;
  clientName: string;
  createdAt: string;
  id: string;
  projectName: string;
  status: string;
  title: string;
};

export type BackOfficeInvoice = {
  amount: string;
  clientName: string;
  createdAt: string;
  dueDate: string;
  id: string;
  projectName: string;
  status: string;
};

export type BackOfficePayment = {
  amount: string;
  clientName: string;
  date: string;
  id: string;
  invoiceId: string;
  method: string;
  projectName: string;
  reference: string;
};

const clientsKey = "mastercraft_backoffice_clients";
const projectsKey = "mastercraft_backoffice_projects";
const quotesKey = "mastercraft_backoffice_quotes";
const invoicesKey = "mastercraft_backoffice_invoices";
const paymentsKey = "mastercraft_backoffice_payments";

const seedClients: ClientRecord[] = [
  {
    company: "Acme Industries",
    contactName: "Jane Doe",
    email: "client@example.com",
    id: "client-seed-1",
    name: "Acme Industries",
    phone: "+234 801 234 5678",
  },
  {
    company: "Lekki Design Group",
    contactName: "Tomi Ade",
    email: "projects@lekkidesign.com",
    id: "client-seed-2",
    name: "Lekki Design Group",
    phone: "+234 809 876 5432",
  },
];

const seedQuotes: BackOfficeQuote[] = [
  {
    amount: "$45,000",
    clientName: "Acme Industries",
    createdAt: "2026-05-01",
    id: "quote-seed-1",
    projectName: "Showroom Joinery",
    status: "Draft",
    title: "Initial millwork package",
  },
];

const seedInvoices: BackOfficeInvoice[] = [
  {
    amount: "$12,500",
    clientName: "Acme Industries",
    createdAt: "2026-05-03",
    dueDate: "2026-06-03",
    id: "invoice-seed-1",
    projectName: "Showroom Joinery",
    status: "Draft",
  },
];

const seedPayments: BackOfficePayment[] = [
  {
    amount: "$5,000",
    clientName: "Acme Industries",
    date: "2026-05-10",
    id: "payment-seed-1",
    invoiceId: "invoice-seed-1",
    method: "Bank Transfer",
    projectName: "Showroom Joinery",
    reference: "TRF-10001",
  },
];

function readCollection<T>(key: string, fallback: T[]) {
  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function writeCollection<T>(key: string, items: T[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
}

export function listBackOfficeClients() {
  return readCollection<ClientRecord>(clientsKey, seedClients);
}

export function saveBackOfficeClient(client: ClientRecord) {
  const clients = listBackOfficeClients();
  const nextClients = [
    client,
    ...clients.filter((currentClient) => currentClient.id !== client.id),
  ];

  writeCollection(clientsKey, nextClients);

  return client;
}

export function listBackOfficeProjects() {
  return readCollection<BackOfficeProject>(projectsKey, []);
}

export function listProjectsForClient(clientId: string) {
  return listBackOfficeProjects().filter((project) => project.clientId === clientId);
}

export function saveBackOfficeProject(project: BackOfficeProject) {
  const projects = listBackOfficeProjects();
  const nextProjects = [
    project,
    ...projects.filter((currentProject) => currentProject.id !== project.id),
  ];

  writeCollection(projectsKey, nextProjects);

  return project;
}

export function listBackOfficeQuotes() {
  return readCollection<BackOfficeQuote>(quotesKey, seedQuotes);
}

export function listBackOfficeInvoices() {
  return readCollection<BackOfficeInvoice>(invoicesKey, seedInvoices);
}

export function listBackOfficePayments() {
  return readCollection<BackOfficePayment>(paymentsKey, seedPayments);
}
