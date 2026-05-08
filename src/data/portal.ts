import type { BadgeTone } from '../components/StatusBadge';
import type { PortalIconName } from '../components/PortalIcon';

export type Metric = {
  icon: PortalIconName;
  label: string;
  value: string;
  pill?: {
    label: string;
    tone?: BadgeTone;
  };
  tone?: BadgeTone;
};

export type HomeProject = {
  category: string;
  estimate: string;
  location: string;
  name: string;
  status: string;
  tone: BadgeTone;
};

export type ActivityItem = {
  project: string;
  title: string;
  time: string;
};

export type ProjectStatus = 'Pending' | 'In Design' | 'In Fabrication' | 'Completed';

export type ProjectFilter = 'All' | 'Pending' | 'In Progress' | 'Completed';

export type ProjectListItem = {
  category: string;
  dueDate: string;
  location: string;
  progress: number;
  status: ProjectStatus;
  title: string;
};

export type QuoteStatus = 'Draft' | 'Sent' | 'Accepted' | 'Expired' | 'Rejected';

export type QuoteFilter = 'All' | QuoteStatus;

export type QuoteListItem = {
  amount: string;
  description: string;
  id: string;
  status: QuoteStatus;
  title: string;
  uid: string;
  validUntil: string;
};

export type DocumentType = 'Shop drawing' | 'CAD File' | 'Spec Sheet' | 'Photo';

export type DocumentItem = {
  date: string;
  id: string;
  imageUrl?: string;
  project: string;
  title: string;
  type: DocumentType;
};

export type InvoiceStatus = 'Paid' | 'Overdue' | 'Draft';

export type InvoiceItem = {
  amount: string;
  dueDate: string;
  id: string;
  issuedDate: string;
  project: string;
  status: InvoiceStatus;
};

export type PaymentMethod = 'ACH' | 'Wire' | 'Credit Card' | 'Check';

export type PaymentItem = {
  amount: string;
  date: string;
  id: string;
  invoice: string;
  method: PaymentMethod;
  project: string;
  reference: string;
};

export const homeMetrics: Metric[] = [
  {
    icon: 'activeProjects',
    label: 'Active Projects',
    pill: { label: 'Active', tone: 'danger' },
    tone: 'danger',
    value: '3',
  },
  {
    icon: 'file',
    label: 'Pending Quotes',
    pill: { label: 'Review', tone: 'neutral' },
    tone: 'neutral',
    value: '2',
  },
  {
    icon: 'messages',
    label: 'Unread Messages',
    pill: { label: 'New', tone: 'info' },
    tone: 'info',
    value: '3',
  },
];

export const activeProjects: HomeProject[] = [
  {
    category: 'Commercial',
    estimate: 'Est: 15/05/2026',
    location: 'Springhold, IL',
    name: 'Downtown Office Lobby',
    status: 'In Fabrication',
    tone: 'danger',
  },
  {
    category: 'Residential',
    estimate: 'Est: 20/04/2025',
    location: 'Eugene, TX',
    name: 'Riverside Residence',
    status: 'In Design',
    tone: 'info',
  },
  {
    category: 'Installation',
    estimate: 'Est: 20/04/2023',
    location: 'Austin, TX',
    name: 'Tech Park Facade',
    status: 'Installation',
    tone: 'warning',
  },
];

export const recentActivity: ActivityItem[] = [
  {
    project: 'Downtown Office Lobby',
    time: '2 hours ago',
    title: 'Fabrication started',
  },
  {
    project: 'Riverside Residence',
    time: '1 day ago',
    title: 'Design Approved',
  },
  {
    project: 'Tech Park Facade',
    time: '2 days ago',
    title: 'Shop drawings uploaded',
  },
];

export const projectMetrics: Metric[] = [
  { icon: 'projects', label: 'Team Projects', tone: 'danger', value: '5' },
  { icon: 'projects', label: 'In Progress', tone: 'danger', value: '3' },
  { icon: 'projects', label: 'Pending Start', tone: 'danger', value: '1' },
  { icon: 'projects', label: 'Completed', tone: 'danger', value: '1' },
];

export const projectFilters: Array<{ label: string; value: ProjectFilter }> = [
  { label: 'All', value: 'All' },
  { label: 'Pending', value: 'Pending' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
];

export const projects: ProjectListItem[] = [
  {
    category: 'Commercial',
    dueDate: '2024-02-20',
    location: 'Austin, TX',
    progress: 65,
    status: 'In Fabrication',
    title: 'Downtown Office Complex Fit-out',
  },
  {
    category: 'Residential',
    dueDate: '2024-06-15',
    location: 'New York, TX',
    progress: 25,
    status: 'In Design',
    title: 'Highland Residence Custom Cabinetry',
  },
  {
    category: 'Commercial',
    dueDate: '2024-03-10',
    location: 'Chicago, Illinois',
    progress: 5,
    status: 'Pending',
    title: 'Riverside Hotel Lobby Renovation',
  },
];

export const quoteMetrics: Metric[] = [
  { icon: 'dollar', label: 'Total Value', tone: 'danger', value: '$93,890' },
  { icon: 'clock', label: 'Pending', tone: 'danger', value: '2' },
  { icon: 'check', label: 'Accepted', tone: 'danger', value: '1' },
  { icon: 'documents', label: 'Total Quotes', tone: 'danger', value: '5' },
];

export const quoteFilters: Array<{ label: string; value: QuoteFilter }> = [
  { label: 'All', value: 'All' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Sent', value: 'Sent' },
  { label: 'Accepted', value: 'Accepted' },
  { label: 'Expired', value: 'Expired' },
  { label: 'Rejected', value: 'Rejected' },
];

export const quotes: QuoteListItem[] = [
  {
    amount: '$ 45,000.00',
    description: 'Complete interior demolition and build-out for 5,000 sq ft office space.',
    id: 'QT - 2024- 0892',
    status: 'Sent',
    title: 'Downtown Office Renovation',
    uid: 'quote-0892',
    validUntil: '5/15/2024',
  },
  {
    amount: '$ 32,600.00',
    description: 'Access control systems and camera installation for parking garage.',
    id: 'QT-2024-0885',
    status: 'Accepted',
    title: 'Tech Park Security Upgrade',
    uid: 'quote-0885-security',
    validUntil: '12/4/2023',
  },
  {
    amount: '$ 5,455.00',
    description: 'LED retrofit for showroom and back-of-house areas.',
    id: 'QT-2024-0885',
    status: 'Draft',
    title: 'Riverside Retail Lighting',
    uid: 'quote-0885-lighting',
    validUntil: '5/25/2024',
  },
];

export const documents: DocumentItem[] = [
  {
    date: 'Jan 15, 2024',
    id: 'doc-001',
    project: 'Downtown Highrise',
    title: 'Structural Steel Shop Drawings - Level 1',
    type: 'Shop drawing',
  },
  {
    date: 'Mar 12, 2024',
    id: 'doc-002',
    project: 'Riverside Residential Complex',
    title: 'Floor Plan Rev A.dwg',
    type: 'CAD File',
  },
  {
    date: 'Jan 15, 2024',
    id: 'doc-003',
    project: 'Downtown Highrise',
    title: 'HVAC Specification Sheet',
    type: 'Spec Sheet',
  },
  {
    date: 'Jan 15, 2024',
    id: 'doc-004',
    project: 'Tech Park Campus',
    title: 'Glass Facade Submittal Approval',
    type: 'CAD File',
  },
  {
    date: 'Mar 12, 2024',
    id: 'doc-005',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=900',
    project: 'Riverside Residential Complex',
    title: 'Site Progress Photo - North Elevation',
    type: 'Photo',
  },
  {
    date: 'Jan 15, 2024',
    id: 'doc-006',
    project: 'Downtown Highrise',
    title: 'Electrical Layout Plan',
    type: 'Spec Sheet',
  },
];

export const invoiceMetrics: Metric[] = [
  { icon: 'dollar', label: 'Total Outstanding', tone: 'danger', value: '$13,890' },
  { icon: 'documents', label: 'Invoices Sent', tone: 'danger', value: '2' },
  { icon: 'check', label: 'Paid This Month', tone: 'danger', value: '2' },
];

export const invoices: InvoiceItem[] = [
  {
    amount: '$ 2,000.00',
    dueDate: 'Feb 15, 2024',
    id: 'INV - 2024- 001',
    issuedDate: 'Feb 15, 2024',
    project: 'Downtown Office Renovation',
    status: 'Paid',
  },
  {
    amount: '$ 32,000.00',
    dueDate: 'Mar 15, 2024',
    id: 'INV - 2024- 002',
    issuedDate: 'Mar 5, 2024',
    project: 'Mobile App Phase 1',
    status: 'Paid',
  },
  {
    amount: '$ 32,000.00',
    dueDate: 'Mar 15, 2024',
    id: 'INV - 2024- 003',
    issuedDate: 'Mar 5, 2024',
    project: 'SEO Optimization',
    status: 'Overdue',
  },
  {
    amount: '$ 32,000.00',
    dueDate: 'Mar 15, 2024',
    id: 'INV - 2024- 003',
    issuedDate: 'Mar 5, 2024',
    project: 'SEO Optimization',
    status: 'Draft',
  },
  {
    amount: '$ 32,000.00',
    dueDate: 'Mar 15, 2024',
    id: 'INV - 2024- 003',
    issuedDate: 'Mar 5, 2024',
    project: 'SEO Optimization',
    status: 'Paid',
  },
];

export const paymentMetrics: Metric[] = [
  { icon: 'documents', label: 'TOTAL PAID (YTD)', tone: 'danger', value: '$0.00' },
  { icon: 'documents', label: 'LAST 30 DAYS', tone: 'danger', value: '$0.00' },
  { icon: 'check', label: 'TOTAL PAYMENTS', tone: 'danger', value: '6' },
];

export const paymentFilters: Array<{ label: string; value: 'All' | PaymentMethod }> = [
  { label: 'All', value: 'All' },
  { label: 'ACH', value: 'ACH' },
  { label: 'Wire', value: 'Wire' },
  { label: 'Credit Card', value: 'Credit Card' },
  { label: 'Check', value: 'Check' },
];

export const payments: PaymentItem[] = [
  {
    amount: '$15,000.00',
    date: 'Mar 15, 2024',
    id: 'pay-001',
    invoice: 'INV-2024-042',
    method: 'ACH',
    project: 'Westside Tower Renovation',
    reference: 'ACH-9928371',
  },
  {
    amount: '$15,000.00',
    date: 'Mar 15, 2024',
    id: 'pay-002',
    invoice: 'INV-2024-042',
    method: 'Wire',
    project: 'Downtown HVAC Upgrade',
    reference: 'WIRE-7726192',
  },
  {
    amount: '$15,000.00',
    date: 'Mar 15, 2024',
    id: 'pay-003',
    invoice: 'INV-2024-042',
    method: 'Credit Card',
    project: 'Riverside Complex Phase 2',
    reference: 'CC-4451910',
  },
  {
    amount: '$15,000.00',
    date: 'Mar 15, 2024',
    id: 'pay-004',
    invoice: 'INV-2024-042',
    method: 'Check',
    project: 'Westside Tower Renovation',
    reference: 'CHK-001234',
  },
  {
    amount: '$15,000.00',
    date: 'Mar 15, 2024',
    id: 'pay-005',
    invoice: 'INV-2024-042',
    method: 'Credit Card',
    project: 'Northpoint Logistics Center',
    reference: 'CC-98766910',
  },
  {
    amount: '$15,000.00',
    date: 'Mar 15, 2024',
    id: 'pay-006',
    invoice: 'INV-2024-042',
    method: 'Wire',
    project: 'Marina Bay Electrical',
    reference: 'WIRE-7726143',
  },
];
