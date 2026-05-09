import { PortalIcon } from './PortalIcon';

type PageHeaderProps = {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
};

function PageHeader({ title, subtitle, actionLabel, onAction }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {actionLabel && (
        <button className="primary-action" type="button" onClick={onAction}>
          <PortalIcon name="plus" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

export default PageHeader;
