import { PortalIcon } from './PortalIcon';

type PageHeaderProps = {
  title: string;
  subtitle: string;
  actionLabel: string;
};

function PageHeader({ title, subtitle, actionLabel }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <button className="primary-action" type="button">
        <PortalIcon name="plus" />
        <span>{actionLabel}</span>
      </button>
    </div>
  );
}

export default PageHeader;
