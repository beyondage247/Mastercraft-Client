import {
  AppstoreOutlined,
  AuditOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  HomeOutlined,
  MessageOutlined,
  PlusOutlined,
  ProfileOutlined,
  ProjectOutlined,
  RightOutlined,
  SearchOutlined,
  ToolOutlined,
} from '@ant-design/icons';

const icons = {
  activeProjects: AppstoreOutlined,
  calendar: CalendarOutlined,
  check: CheckCircleOutlined,
  clock: ClockCircleOutlined,
  documents: FileTextOutlined,
  dollar: DollarOutlined,
  file: FileDoneOutlined,
  folder: FolderOpenOutlined,
  home: HomeOutlined,
  invoices: DollarOutlined,
  location: EnvironmentOutlined,
  messages: MessageOutlined,
  payments: CreditCardOutlined,
  plus: PlusOutlined,
  projects: ProjectOutlined,
  quotes: ProfileOutlined,
  review: AuditOutlined,
  right: RightOutlined,
  search: SearchOutlined,
  tool: ToolOutlined,
} as const;

export type PortalIconName = keyof typeof icons;

type PortalIconProps = {
  name: PortalIconName;
  className?: string;
};

export function PortalIcon({ name, className }: PortalIconProps) {
  const Icon = icons[name];

  return <Icon className={className} aria-hidden="true" />;
}
