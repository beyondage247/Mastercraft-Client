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

export type ProjectStatus = 'Pending' | 'Quoted' | 'Lost' | 'In Progress' | 'In Design' | 'In Fabrication' | 'In Production' | 'Completed';

export type ProjectFilter = 'All' | 'Quoted' | 'Lost' | 'In Production' | 'Completed';

export type ProjectStageType = 'MIL' | 'BUILD_ASSEMBLE' | 'FINISHING' | 'DELIVERY' | 'INSTALL';

export type ProjectStageItem = {
  id?: string;
  stage: ProjectStageType;
  hoursBudgeted: number;
  hoursSpent: number;
  progress: number;
  startDate?: string;
  startDateValue?: string;
};

export type ProjectCommentItem = {
  createdAt: string;
  id: string;
  message: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
};

export type ProjectUploadItem = {
  id: string;
  name: string;
  size: number;
};

export type ProjectListItem = {
  id: string;
  category: string;
  assignedStaffEmail?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  clientEmail?: string;
  clientId?: string;
  clientName?: string;
  description?: string;
  dueDate: string;
  endDate?: string;
  endDateValue?: string;
  estimatedCompletion?: string;
  fabrication?: number;
  fabricationCompleted?: boolean;
  location: string;
  progress: number;
  comments?: ProjectCommentItem[];
  attachment?: {
    uploads: ProjectUploadItem[];
  } | null;
  invoice?: {
    id: string;
    invoiceId: string;
    dateIssued?: string;
    lineItems?: LineItem[];
    paymentSchedule?: QuotePaymentSchedule | null;
    status: string;
    subtotal?: string;
    tax?: string;
    taxAmount?: string;
    total?: string;
    validUntil?: string;
  } | null;
  quote?: {
    id: string;
    paymentSchedule?: QuotePaymentSchedule | null;
    quoteId: string;
    status: string;
    validUntil?: string;
  } | null;
  stages?: ProjectStageItem[];
  startDate?: string;
  startDateValue?: string;
  status: ProjectStatus;
  title: string;
};

export type QuoteStatus = 'Draft' | 'Sent' | 'Approved' | 'Expired' | 'Rejected';

export type QuoteFilter = 'All' | QuoteStatus;

export type QuotePaymentScheduleType = 'FULL_PAYMENT' | 'DEPOSIT_AND_BALANCE' | 'DEPOSIT_AND_SPLIT_BALANCE';

export type QuotePaymentScheduleAmountType = 'fixed' | 'percentage';

export type QuotePaymentSchedulePayment = {
  amount: number;
  date: string;
  name: string;
  percentage: number;
};

export type QuotePaymentSchedule = {
  balance?: {
    amount: number;
    date?: string | null;
    name?: string | null;
    payments?: QuotePaymentSchedulePayment[];
    percentage: number;
    split?: boolean | null;
  } | null;
  deposit?: {
    amount: number;
    amountType: QuotePaymentScheduleAmountType;
    date: string;
    name: string;
    percentage: number;
  } | null;
  fullPayment?: QuotePaymentSchedulePayment | null;
  totalAmount: number;
  type: QuotePaymentScheduleType;
};

export type QuoteListItem = {
  amount: string;
  clientComment?: string;
  dateIssued?: string;
  description: string;
  id: string;
  invoices?: InvoiceItem[];
  lineItems?: LineItem[];
  message?: string;
  paymentSchedule?: QuotePaymentSchedule | null;
  projectId?: string;
  projectName?: string;
  subtotal?: string;
  status: QuoteStatus;
  tax?: string;
  taxAmount?: string;
  title: string;
  total?: string;
  uid: string;
  validUntil: string;
};

export type DocumentType = 'Shop drawing' | 'CAD File' | 'Spec Sheet' | 'Photo';

export type DocumentItem = {
  date: string;
  downloadUrl?: string;
  id: string;
  imageUrl?: string;
  project: string;
  title: string;
  type: DocumentType;
};

export type InvoiceStatus = 'Paid' | 'Overdue' | 'Draft' | 'Approved';

export type InvoiceItem = {
  amount: string;
  clientEmail?: string;
  clientName?: string;
  dueDate: string;
  id: string;
  invoiceId?: string;
  issuedDate: string;
  lineItems?: LineItem[];
  paymentSchedule?: QuotePaymentSchedule | null;
  project: string;
  projectId?: string;
  quoteReference?: string;
  status: InvoiceStatus;
  subtotal?: string;
  tax?: string;
  taxAmount?: string;
  total?: string;
};

export type CommissionStatus = 'QUOTED_COMMISSION' | 'APPROVED_COMMISSION' | 'PAID';

export type CommissionItem = {
  clientId?: string;
  clientEmail?: string;
  clientCompany?: string;
  clientName: string;
  commissionAmount: string;
  commissionAmountValue: number;
  createdAt?: string;
  id: string;
  paidAt?: string;
  percentageCommission: number;
  projectId?: string;
  projectName: string;
  quoteId?: string;
  quoteName: string;
  quoteReference?: string;
  quoteTaxAmount?: string;
  quoteTotal?: string;
  staffEmail?: string;
  staffId?: string;
  staffName: string;
  status: CommissionStatus;
  totalAmount: string;
  totalAmountValue: number;
  updatedAt?: string;
};

export type PaymentMethod = 'ACH' | 'Wire' | 'Credit Card' | 'Check';

export type PaymentItem = {
  amount: string;
  date: string;
  id: string;
  invoice: string;
  invoiceId?: string;
  method: PaymentMethod;
  project: string;
  projectId?: string;
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
  { label: 'Quoted', value: 'Quoted' },
  { label: 'Lost', value: 'Lost' },
  { label: 'In Production', value: 'In Production' },
  { label: 'Completed', value: 'Completed' },
];

export const projects: ProjectListItem[] = [
  {
    id: 'proj-1',
    category: 'Commercial',
    dueDate: '2024-02-20',
    location: 'Austin, TX',
    progress: 65,
    status: 'In Fabrication',
    title: 'Downtown Office Complex Fit-out',
  },
  {
    id: 'proj-2',
    category: 'Residential',
    dueDate: '2024-06-15',
    location: 'New York, TX',
    progress: 25,
    status: 'In Design',
    title: 'Highland Residence Custom Cabinetry',
  },
  {
    id: 'proj-3',
    category: 'Commercial',
    dueDate: '2024-03-10',
    location: 'Chicago, Illinois',
    progress: 5,
    status: 'Pending',
    title: 'Riverside Hotel Lobby Renovation',
  },
];

export type ProjectTeamMember = {
  initials: string;
  name: string;
  role: string;
};

export type ProjectTimelineEvent = {
  date: string;
  description: string;
  title: string;
};

export type ProjectDetailInfo = {
  estimatedCompletion: string;
  notes: string;
  siteAddress: string;
  startDate: string;
  team: ProjectTeamMember[];
  timeline: ProjectTimelineEvent[];
};

export const projectDetails: Record<string, ProjectDetailInfo> = {
  'proj-2': {
    estimatedCompletion: '4/30/2024',
    notes: 'Client requested custom walnut shelving with integrated LED lighting. All dimensions must be verified on-site due to ceiling irregularities.',
    siteAddress: '420 West 42nd Street, Penthouse B',
    startDate: '1/15/2024',
    team: [
      { initials: 'PM', name: 'Sarah Miller', role: 'Project Manager' },
      { initials: 'PM', name: 'John Doe', role: 'Lead Fabricator' },
    ],
    timeline: [
      {
        date: 'Feb 20, 2024',
        description: 'Site visit completed and initial measurements taken.',
        title: 'Project initiated',
      },
      {
        date: 'Feb 20, 2024',
        description: 'Finalized CNC files sent to production manager.',
        title: 'CAD files exported',
      },
      {
        date: 'Feb 12, 2024',
        description: 'Signed shop drawings received via email.',
        title: 'Drawings approved by client',
      },
      {
        date: 'Feb 20, 2024',
        description: 'Shop floor began cutting walnut panels for the primary shelving unit.',
        title: 'Fabrication started - Main framing',
      },
    ],
  },
};

export const quoteMetrics: Metric[] = [
  { icon: 'dollar', label: 'Total Value', tone: 'danger', value: '$93,890' },
  { icon: 'clock', label: 'Pending', tone: 'danger', value: '2' },
  { icon: 'check', label: 'Approved', tone: 'danger', value: '1' },
  { icon: 'documents', label: 'Total Quotes', tone: 'danger', value: '5' },
];

export const quoteFilters: Array<{ label: string; value: QuoteFilter }> = [
  { label: 'All', value: 'All' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Sent', value: 'Sent' },
  { label: 'Approved', value: 'Approved' },
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
    status: 'Approved',
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

export type LineItem = {
  description: string;
  qty: number;
  rate: string;
  amount: string;
  serviceId?: string;
};

export type LinkedProject = {
  id: string;
  title: string;
  category: string;
  estCompletion: string;
  location: string;
};

export type QuoteDetailInfo = {
  specifications: string;
  lineItems: LineItem[];
  subtotal: string;
  tax: string;
  total: string;
  linkedProject: LinkedProject;
};

export type InvoiceDetailInfo = {
  billToName: string;
  billToEmail: string;
  billToAddress1: string;
  billToAddress2: string;
  projectReference: string;
  quoteReference: string;
  lineItems: LineItem[];
  subtotal: string;
  tax: string;
  total: string;
  linkedProject: LinkedProject;
};

export const quoteDetails: Record<string, QuoteDetailInfo> = {
  'quote-0892': {
    specifications: 'Custom reception desk and conference room millwork for the new headquarters expansion.',
    lineItems: [
      { description: 'Reception Desk - Walnut Veneer', qty: 1, rate: '$4,500.00', amount: '$4,500' },
      { description: 'Conference Table - 12ft Oak', qty: 1, rate: '$6,200.00', amount: '$6,200' },
      { description: 'Conference Table - 12ft Oak', qty: 1, rate: '$90.00', amount: '$1,800' }
    ],
    subtotal: '$12,500.00',
    tax: '$1,000.00',
    total: '$12,500.00',
    linkedProject: {
      id: 'proj-1',
      title: 'Downtown HQ Expansion',
      category: 'Commercial',
      estCompletion: 'Dec 15, 2024',
      location: 'San Francisco, CA'
    }
  }
};

export const invoiceDetails: Record<string, InvoiceDetailInfo> = {
  'INV - 2024- 001': {
    billToName: 'Acme Corp',
    billToEmail: 'billing@acmecorp.com',
    billToAddress1: '123 Business Park, Suite 400',
    billToAddress2: 'San Francisco, CA 94107',
    projectReference: 'Website Redesign & Migration',
    quoteReference: 'Q-2024-055',
    lineItems: [
      { description: 'Reception Desk - Walnut Veneer', qty: 1, rate: '$4,500.00', amount: '$4,500' },
      { description: 'Conference Table - 12ft Oak', qty: 1, rate: '$6,200.00', amount: '$6,200' },
      { description: 'Conference Table - 12ft Oak', qty: 1, rate: '$90.00', amount: '$1,800' }
    ],
    subtotal: '$12,500.00',
    tax: '$1,000.00',
    total: '$12,500.00',
    linkedProject: {
      id: 'proj-1',
      title: 'Downtown HQ Expansion',
      category: 'Commercial',
      estCompletion: 'Dec 15, 2024',
      location: 'San Francisco, CA'
    }
  }
};
