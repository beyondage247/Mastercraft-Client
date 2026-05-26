import {
  AppstoreOutlined,
  AuditOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  DeleteOutlined,
  DownOutlined,
  DownloadOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FilterOutlined,
  FolderOpenOutlined,
  HomeOutlined,
  LeftOutlined,
  MessageOutlined,
  PlusOutlined,
  ProfileOutlined,
  ProjectOutlined,
  RightOutlined,
  SearchOutlined,
  ToolOutlined,
  UploadOutlined,
} from '@ant-design/icons';

const icons = {
  activeProjects: AppstoreOutlined,
  calendar: CalendarOutlined,
  check: CheckCircleOutlined,
  clock: ClockCircleOutlined,
  delete: DeleteOutlined,
  documents: FileTextOutlined,
  down: DownOutlined,
  download: DownloadOutlined,
  dollar: DollarOutlined,
  file: FileDoneOutlined,
  filter: FilterOutlined,
  folder: FolderOpenOutlined,
  home: HomeOutlined,
  invoices: DollarOutlined,
  left: LeftOutlined,
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
  upload: UploadOutlined,
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
