import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterToolbar from "../../components/FilterToolbar";
import PageHeader from "../../components/PageHeader";
import ProjectCard from "../../components/ProjectCard";
import StatCard from "../../components/StatCard";
import { projectFilters } from "../../data/portal";
import type { Metric, ProjectFilter, ProjectListItem } from "../../data/portal";
import { getProjects } from "../../services/portalApi";

function matchesProjectFilter(project: ProjectListItem, filter: ProjectFilter) {
  if (filter === "All") {
    return true;
  }

  return project.status === filter;
}

function Projects() {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [projectList, setProjectList] = useState<ProjectListItem[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError("");

    getProjects()
      .then((data) => {
        if (isMounted) {
          setMetrics(data.metrics);
          setProjectList(data.projects);
        }
      })
      .catch((requestError: Error) => {
        if (isMounted) {
          setError(requestError.message || "Unable to load projects.");
          setMetrics([]);
          setProjectList([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return projectList.filter((project) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          project.title,
          project.location,
          project.category,
          project.status,
          project.assignedStaffName,
          project.assignedStaffEmail,
          project.quote?.quoteId,
          project.invoice?.invoiceId,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesProjectFilter(project, activeFilter) && matchesSearch;
    });
  }, [activeFilter, projectList, search]);

  return (
    <div className="page-stack">
      <PageHeader
        //   actionLabel="New Project"
        onAction={() => navigate("/new")}
        subtitle="Project portal"
        title="Projects"
      />

      <section
        className="metrics-grid metrics-grid--four"
        aria-label="Project summary"
      >
        {metrics.map((metric) => (
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
        {loading ? (
          <div className="panel">Loading projects...</div>
        ) : error ? (
          <div className="panel">{error}</div>
        ) : filteredProjects.length ? (
          filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <div className="panel">No projects have been assigned to this account yet.</div>
        )}
      </section>

      <p className="result-count">
        Showing {filteredProjects.length} of {projectList.length} projects
      </p>
    </div>
  );
}

export default Projects;
