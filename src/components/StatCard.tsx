import type { ReactNode } from 'react';
import type { BadgeTone } from './StatusBadge';
import type { PortalIconName } from './PortalIcon';
import { PortalIcon } from './PortalIcon';
import StatusBadge from './StatusBadge';

type StatCardProps = {
  icon: PortalIconName;
  label: string;
  value: ReactNode;
  pill?: {
    label: string;
    tone?: BadgeTone;
  };
  tone?: BadgeTone;
};

function StatCard({ icon, label, value, pill, tone = 'danger' }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-card__topline">
        <span className={`icon-tile icon-tile--${tone}`}>
          <PortalIcon name={icon} />
        </span>
        {pill ? <StatusBadge tone={pill.tone ?? tone}>{pill.label}</StatusBadge> : null}
      </div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </article>
  );
}

export default StatCard;
