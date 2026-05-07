import { useMemo, useState } from 'react';
import FilterToolbar from '../../components/FilterToolbar';
import PageHeader from '../../components/PageHeader';
import ProjectCard from '../../components/ProjectCard';
import StatCard from '../../components/StatCard';
import { projectFilters, projectMetrics, projects } from '../../data/portal';
import type { ProjectFilter, ProjectListItem } from '../../data/portal';

function matchesProjectFilter(project: ProjectListItem, filter: ProjectFilter) {
  if (filter === 'All') {
    return true;
  }

  if (filter === 'In Progress') {
    return project.status === 'In Design' || project.status === 'In Fabrication';
  }

  return project.status === filter;
}

function Projects() {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>('All');
  const [search, setSearch] = useState('');

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !normalizedSearch ||
        [project.title, project.location, project.category, project.status]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesProjectFilter(project, activeFilter) && matchesSearch;
    });
  }, [activeFilter, search]);

  return (
    <div className="page-stack">
      <PageHeader actionLabel="New Project" subtitle="Millwork & Fabrication Dashboard" title="Projects" />

      <section className="metrics-grid metrics-grid--four" aria-label="Project summary">
        {projectMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>

      <FilterToolbar
        activeFilter={activeFilter}
        filters={projectFilters}
        onFilterChange={(value) => setActiveFilter(value)}
        onSearchChange={(value) => setSearch(value)}
        search={search}
        searchLabel="projects"
      />

      <section className="record-list" aria-label="Projects">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </section>

      <p className="result-count">
        Showing {filteredProjects.length} of {projects.length} projects
      </p>
    </div>
  );
}

export default Projects;
