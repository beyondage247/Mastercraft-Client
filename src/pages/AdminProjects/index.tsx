import { message } from "antd";
import { useEffect, useState } from "react";
import AdminProjectDetailModal from "../../components/AdminProjectDetailModal";
import AdminProjectStatusModal from "../../components/AdminProjectStatusModal";
import AdminProjectTable from "../../components/AdminProjectTable";
import PageHeader from "../../components/PageHeader";
import type { ProjectListItem } from "../../data/portal";
import { getProjects } from "../../services/portalApi";

function AdminProjects() {
  const [editingProject, setEditingProject] = useState<ProjectListItem | null>(null);
  const [activeProject, setActiveProject] = useState<ProjectListItem | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    getProjects()
      .then((data) => {
        if (isMounted) {
          setProjects(data.projects);
          setError("");
        }
      })
      .catch((requestError: Error) => {
        if (isMounted) {
          setProjects([]);
          setError(requestError.message || "Unable to load projects.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function handleCreateQuote(project: ProjectListItem) {
    message.info(`Quote creation for ${project.title} will be connected when the quote endpoint is available.`);
  }

  function handleProjectSaved(project: ProjectListItem) {
    setProjects((current) =>
      current.map((item) => (item.id === project.id ? project : item)),
    );
    setActiveProject((current) => (current?.id === project.id ? project : current));
  }

  return (
    <div className="page-stack admin-page">
      <PageHeader
        subtitle="Projects created for client accounts"
        title="Projects"
      />

      <section className="panel admin-client-list">
        <div className="panel__header">
          <h2>Project List</h2>
          <span>{projects.length} total</span>
        </div>
        <AdminProjectTable
          error={error}
          isLoading={isLoading}
          onCreateQuote={handleCreateQuote}
          onEdit={setEditingProject}
          onView={setActiveProject}
          projects={projects}
        />
      </section>

      <AdminProjectDetailModal
        onClose={() => setActiveProject(null)}
        open={Boolean(activeProject)}
        project={activeProject}
      />
      <AdminProjectStatusModal
        onClose={() => setEditingProject(null)}
        onSaved={handleProjectSaved}
        open={Boolean(editingProject)}
        project={editingProject}
      />
    </div>
  );
}

export default AdminProjects;
