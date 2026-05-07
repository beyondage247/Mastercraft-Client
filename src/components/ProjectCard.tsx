import type { ProjectListItem } from '../data/portal';
import { PortalIcon } from './PortalIcon';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';

const projectStatusTone = {
  Completed: 'success',
  'In Design': 'info',
  'In Fabrication': 'danger',
  Pending: 'danger',
} as const;

type ProjectCardProps = {
  project: ProjectListItem;
};

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="record-card project-card">
      <div className="record-card__body">
        <div className="record-card__meta">
          <StatusBadge tone={projectStatusTone[project.status]}>{project.status}</StatusBadge>
          <StatusBadge tone="neutral">{project.category}</StatusBadge>
        </div>
        <h2>{project.title}</h2>
        <div className="record-card__details">
          <span>
            <PortalIcon name="location" />
            {project.location}
          </span>
          <span>
            <PortalIcon name="calendar" />
            Due: {project.dueDate}
          </span>
        </div>
        <div className="progress-summary">
          <div>
            <span>Fabrication Progress</span>
            <strong>{project.progress}%</strong>
          </div>
          <ProgressBar value={project.progress} />
        </div>
      </div>
      <button className="record-card__arrow" type="button" aria-label={`Open ${project.title}`}>
        <PortalIcon name="right" />
      </button>
    </article>
  );
}

export default ProjectCard;
