import { buildSchema, graphql } from 'graphql';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { columnMap, columnText, createItem, getBoardItems, handleError, json, resolveBoard } from './_monday.mjs';
import { handler as dashboardHandler } from './dashboard.mjs';
import { handler as documentsHandler } from './documents.mjs';
import { handler as invoicesHandler } from './invoices.mjs';
import { handler as paymentsHandler } from './payments.mjs';
import { handler as projectsHandler } from './projects.mjs';
import { handler as quotesHandler } from './quotes.mjs';

const schema = buildSchema(`
  type Pill {
    label: String!
    tone: String
  }

  type Metric {
    icon: String!
    label: String!
    value: String!
    tone: String
    pill: Pill
  }

  type HomeProject {
    category: String
    estimate: String
    location: String
    name: String!
    status: String
    tone: String
  }

  type ActivityItem {
    project: String
    title: String!
    time: String
  }

  type Dashboard {
    activeProjects: [HomeProject!]!
    homeMetrics: [Metric!]!
    projectMetrics: [Metric!]!
    quoteMetrics: [Metric!]!
    recentActivity: [ActivityItem!]!
  }

  type Project {
    category: String
    dueDate: String
    id: String
    location: String
    progress: Float
    status: String
    title: String!
  }

  type ProjectsPayload {
    activeProjects: [HomeProject!]!
    metrics: [Metric!]!
    projects: [Project!]!
  }

  type Quote {
    amount: String
    description: String
    id: String!
    status: String
    title: String!
    uid: String!
    validUntil: String
  }

  type QuotesPayload {
    metrics: [Metric!]!
    quotes: [Quote!]!
  }

  type Document {
    date: String
    id: String!
    imageUrl: String
    project: String
    title: String!
    type: String
  }

  type DocumentsPayload {
    documents: [Document!]!
  }

  type Invoice {
    amount: String
    dueDate: String
    id: String!
    issuedDate: String
    project: String
    status: String
  }

  type InvoicesPayload {
    invoices: [Invoice!]!
    metrics: [Metric!]!
  }

  type Payment {
    amount: String
    date: String
    id: String!
    invoice: String
    method: String
    project: String
    reference: String
  }

  type PaymentsPayload {
    metrics: [Metric!]!
    payments: [Payment!]!
  }

  type Client {
    additionalEmail: String
    additionalPhone: String
    id: String!
    clientId: String
    company: String
    contactName: String
    email: String
    name: String!
    phone: String
  }

  type PortalUser {
    clientItemId: String
    email: String!
    name: String!
    role: String!
  }

  type LoginPayload {
    token: String!
    user: PortalUser!
  }

  input InviteClientInput {
    name: String!
    clientId: String
    company: String
    contactName: String
    email: String
    additionalEmail: String
    additionalPhone: String
    phone: String
    passwordHash: String
  }

  type InviteClientPayload {
    id: String!
    name: String!
  }

  type Mutation {
    acceptQuote(id: String!): Boolean!
    inviteClient(input: InviteClientInput!): InviteClientPayload!
    login(email: String!, password: String!): LoginPayload!
  }

  type Query {
    clients: [Client!]!
    dashboard: Dashboard!
    documents: DocumentsPayload!
    invoices: InvoicesPayload!
    payments: PaymentsPayload!
    projects: ProjectsPayload!
    quotes: QuotesPayload!
    me: PortalUser!
  }
`);

async function callJson(handler, event) {
  const response = await handler({ ...event, httpMethod: 'GET', portalUser: event.portalUser });
  const body = JSON.parse(response.body);

  if (response.statusCode >= 400) {
    throw new Error(body.message || body.error || 'GraphQL resolver failed');
  }

  return body;
}

async function acceptQuote(id, event) {
  requireRole(event.portalUser, ['admin', 'client']);
  const response = await quotesHandler({
    ...event,
    httpMethod: 'POST',
    path: `/api/quotes/${encodeURIComponent(id)}/accept`,
  });

  if (response.statusCode >= 400) {
    const body = JSON.parse(response.body);
    throw new Error(body.message || body.error || 'Unable to accept quote');
  }

  return true;
}

async function inviteClient(input, user) {
  requireRole(user, ['admin']);
  const board = await resolveClientBoard();
  const ids = clientColumnIds();
  const temporaryPassword = input.passwordHash || generateTemporaryPassword();
  const columnValues = {
    ...(input.clientId ? { [ids.CLIENT_ID]: input.clientId } : {}),
    ...(input.company ? { [ids.COMPANY]: input.company } : {}),
    ...(input.contactName ? { [ids.CONTACT_NAME]: input.contactName } : {}),
    ...(input.email ? { [ids.EMAIL]: { email: input.email, text: input.email } } : {}),
    ...(input.phone ? { [ids.PHONE]: { phone: input.phone } } : {}),
    ...(input.additionalEmail ? { [ids.ADDITIONAL_EMAIL]: { email: input.additionalEmail, text: input.additionalEmail } } : {}),
    ...(input.additionalPhone ? { [ids.ADDITIONAL_PHONE]: input.additionalPhone } : {}),
    [ids.PASSWORD]: temporaryPassword,
  };
  const data = await createItem({
    boardId: board.id,
    itemName: input.name,
    columnValues,
  });

  return data.create_item;
}

function generateTemporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$';
  const bytes = randomBytes(12);

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

function clientColumnIds() {
  return {
    CLIENT_ID: process.env.MONDAY_CLIENT_ID_COLUMN || 'text_mm3amtas',
    COMPANY: process.env.MONDAY_CLIENT_COMPANY_COLUMN || 'text_mm32xemb',
    CONTACT_NAME: process.env.MONDAY_CLIENT_CONTACT_NAME_COLUMN || 'text_mm38x2kk',
    EMAIL: process.env.MONDAY_CLIENT_EMAIL_COLUMN || 'email_mm2qgcq8',
    PHONE: process.env.MONDAY_CLIENT_PHONE_COLUMN || 'phone_mm2q10cp',
    ADDITIONAL_EMAIL: process.env.MONDAY_CLIENT_ADDITIONAL_EMAIL_COLUMN || 'email_mm3ckqtx',
    ADDITIONAL_PHONE: process.env.MONDAY_CLIENT_ADDITIONAL_PHONE_COLUMN || 'numeric_mm3cj80y',
    PASSWORD: process.env.MONDAY_CLIENT_PASSWORD_COLUMN || 'text_mm3b6fsj',
  };
}

function resolveClientBoard() {
  return resolveBoard({
    candidates: ['client board', 'clients', 'customers'],
    envName: 'MONDAY_CLIENT_BOARD_ID',
    label: 'Client Board',
  });
}

async function clients() {
  const board = await resolveClientBoard();
  const ids = clientColumnIds();

  return (await getBoardItems(board.id)).map((item) => {
    const columns = columnMap(item);

    return {
      id: item.id,
      additionalEmail: columnText(columns, ids.ADDITIONAL_EMAIL, ''),
      additionalPhone: columnText(columns, ids.ADDITIONAL_PHONE, ''),
      clientId: columnText(columns, ids.CLIENT_ID, ''),
      company: columnText(columns, ids.COMPANY, ''),
      contactName: columnText(columns, ids.CONTACT_NAME, ''),
      email: columnText(columns, ids.EMAIL, ''),
      name: item.name,
      phone: columnText(columns, ids.PHONE, ''),
    };
  });
}

function authSecret() {
  return process.env.PORTAL_AUTH_SECRET || process.env.MONDAY_API_TOKEN || 'mastercraft-local-dev-secret';
}

function envValue(name, fallback = '') {
  return `${process.env[name] || fallback}`.trim();
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function signPayload(payload) {
  const body = base64url(JSON.stringify(payload));
  const signature = createHmac('sha256', authSecret()).update(body).digest('base64url');

  return `${body}.${signature}`;
}

function verifyToken(token) {
  const [body, signature] = `${token || ''}`.split('.');

  if (!body || !signature) {
    return null;
  }

  const expected = createHmac('sha256', authSecret()).update(body).digest('base64url');
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

function createToken(user) {
  return signPayload({
    ...user,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  });
}

function userFromEvent(event) {
  const header = event.headers?.authorization || event.headers?.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  return verifyToken(token);
}

function requireRole(user, roles = ['admin', 'client']) {
  if (!user || !roles.includes(user.role)) {
    throw new Error('Unauthorized');
  }
}

function passwordsMatch(savedPassword, submittedPassword) {
  return `${savedPassword || ''}`.trim() === `${submittedPassword || ''}`.trim();
}

async function login({ email, password }) {
  const normalizedEmail = `${email || ''}`.trim().toLowerCase();
  const adminEmail = envValue('PORTAL_ADMIN_EMAIL', 'admin@mastercraft.local').toLowerCase();
  const adminPassword = envValue('PORTAL_ADMIN_PASSWORD', 'admin12345');

  if (normalizedEmail === adminEmail && passwordsMatch(adminPassword, password)) {
    const user = {
      email: normalizedEmail,
      name: envValue('PORTAL_ADMIN_NAME', 'Admin'),
      role: 'admin',
    };

    return { token: createToken(user), user };
  }

  const client = (await clients()).find((item) => `${item.email || ''}`.trim().toLowerCase() === normalizedEmail);

  if (!client) {
    throw new Error('Invalid email or password');
  }

  const boardItems = await getBoardItems((await resolveClientBoard()).id);
  const rawClient = boardItems.find((item) => item.id === client.id);
  const columns = rawClient ? columnMap(rawClient) : {};
  const savedPassword = columnText(columns, clientColumnIds().PASSWORD, '');

  if (!passwordsMatch(savedPassword, password)) {
    throw new Error('Invalid email or password');
  }

  const user = {
    clientItemId: client.id,
    email: client.email,
    name: client.name,
    role: 'client',
  };

  return { token: createToken(user), user };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'GraphQL endpoint only accepts POST requests.' });
  }

  try {
    const { operationName, query, variables } = JSON.parse(event.body || '{}');
    const portalUser = userFromEvent(event);
    event.portalUser = portalUser;
    const rootValue = {
      acceptQuote: ({ id }) => acceptQuote(id, event),
      clients: () => {
        requireRole(portalUser, ['admin']);
        return clients();
      },
      dashboard: () => {
        requireRole(portalUser, ['admin', 'client']);
        return callJson(dashboardHandler, event);
      },
      documents: () => {
        requireRole(portalUser, ['admin', 'client']);
        return callJson(documentsHandler, event);
      },
      inviteClient: ({ input }) => inviteClient(input, portalUser),
      invoices: () => {
        requireRole(portalUser, ['admin', 'client']);
        return callJson(invoicesHandler, event);
      },
      login,
      me: () => {
        requireRole(portalUser, ['admin', 'client']);
        return portalUser;
      },
      payments: () => {
        requireRole(portalUser, ['admin', 'client']);
        return callJson(paymentsHandler, event);
      },
      projects: () => {
        requireRole(portalUser, ['admin', 'client']);
        return callJson(projectsHandler, event);
      },
      quotes: () => {
        requireRole(portalUser, ['admin', 'client']);
        return callJson(quotesHandler, event);
      },
    };
    const result = await graphql({
      schema,
      source: query,
      rootValue,
      variableValues: variables,
      operationName,
    });

    return json(result.errors ? 400 : 200, result);
  } catch (error) {
    return handleError(error);
  }
}
