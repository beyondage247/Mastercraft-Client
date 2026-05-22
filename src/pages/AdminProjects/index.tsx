import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import {
  listBackOfficeProjects,
  type BackOfficeProject,
} from "../../services/backOfficeStore";

function AdminProjects() {
  const [projects, setProjects] = useState<BackOfficeProject[]>([]);

  useEffect(() => {
    setProjects(listBackOfficeProjects());
  }, []);

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
        <div className="admin-record-table admin-record-table--projects">
          <div className="admin-record-table__head">
            <span>Project</span>
            <span>Client</span>
            <span>Location</span>
            <span>Estimated Completion</span>
            <span>Status</span>
          </div>
          {projects.length ? (
            projects.map((project) => (
              <article className="admin-record-table__row" key={project.id}>
                <strong>{project.name}</strong>
                <span>{project.clientName}</span>
                <span>{project.location || "Not set"}</span>
                <span>{project.estimatedCompletion || "Not set"}</span>
                <StatusBadge tone="neutral">{project.status}</StatusBadge>
              </article>
            ))
          ) : (
            <div className="admin-empty-row">
              No projects have been created yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminProjects;

