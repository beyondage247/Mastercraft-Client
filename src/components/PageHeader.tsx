import type { ReactNode } from "react";


type PageHeaderProps = {
  title: string;
  subtitle: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

function PageHeader({ title, subtitle, action, actionLabel, onAction }: PageHeaderProps) {
  const actionNode =
    action ??
    (actionLabel ? (
      <button onClick={onAction} type="button">
        {actionLabel}
      </button>
    ) : null);

  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {actionNode}
    </header>
  );
}

export default PageHeader;
