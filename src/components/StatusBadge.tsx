import type { ReactNode } from 'react';
import type { PortalIconName } from './PortalIcon';
import { PortalIcon } from './PortalIcon';

export type BadgeTone = 'danger' | 'neutral' | 'info' | 'warning' | 'success';

type StatusBadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: PortalIconName;
};

function StatusBadge({ children, tone = 'neutral', icon }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${tone}`}>
      {icon ? <PortalIcon name={icon} /> : null}
      {children}
    </span>
  );
}

export default StatusBadge;
