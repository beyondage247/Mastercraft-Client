import { useEffect, useMemo, useState } from "react";
import AdminProjectDetailModal from "../../components/AdminProjectDetailModal";
import AdminQuoteModal from "../../components/AdminQuoteModal";
import AdminProjectStatusModal from "../../components/AdminProjectStatusModal";
import AdminProjectTable from "../../components/AdminProjectTable";
import PageHeader from "../../components/PageHeader";
import { Modal, Tabs } from "antd";
import type { ProjectListItem } from "../../data/portal";
import { getProjects, deleteProject, archiveProject, restoreProject } from "../../services/portalApi";
import { showRequestToast } from "../../utils/portalToast";
import ExportButton from '../../components/ExportButton';

function AdminProjects() {
  const [editingProject, setEditingProject] = useState<ProjectListItem | null>(null);
  const [activeProject, setActiveProject] = useState<ProjectListItem | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [quoteProject, setQuoteProject] = useState<ProjectListItem | null>(null);
  const [tab, setTab] = useState<"active" | "archived">("active");

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
    setQuoteProject(project);
  }

  function handleProjectSaved(project: ProjectListItem) {
    setProjects((current) =>
      current.map((item) => (item.id === project.id ? project : item)),
    );
    setActiveProject((current) => (current?.id === project.id ? project : current));
  }

  const activeProjects = useMemo(
    () => projects.filter((p) => (p.status as string) !== "Archived"),
    [projects],
  );
  const archivedProjects = useMemo(
    () => projects.filter((p) => (p.status as string) === "Archived"),
    [projects],
  );

  function handleDeleteProject(project: ProjectListItem) {
    Modal.confirm({
      title: "Delete project?",
      content: `Delete project "${project.title}"? This cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        const toast = showRequestToast(`admin-project-delete-${project.id}`, "Deleting project...");
        return deleteProject(project.id)
          .then(() => {
            toast.success("Project deleted.");
            setProjects((current) => current.filter((p) => p.id !== project.id));
          })
          .catch((err) => toast.error(err instanceof Error ? err.message : "Unable to delete project."));
      },
    });
  }

  function handleArchiveProject(project: ProjectListItem) {
    Modal.confirm({
      title: "Archive project?",
      content: `Archive "${project.title}"? It will be hidden from active projects but can be restored.`,
      okText: "Archive",
      okType: "default",
      cancelText: "Cancel",
      onOk: () => {
        const toast = showRequestToast(`admin-project-archive-${project.id}`, "Archiving project...");
        return archiveProject(project.id)
          .then(() => {
            toast.success("Project archived.");
            setProjects((current) =>
              current.map((p) => p.id === project.id ? { ...p, status: "Archived" as ProjectListItem["status"] } : p),
            );
          })
          .catch((err) => toast.error(err instanceof Error ? err.message : "Unable to archive project."));
      },
    });
  }

  function handleRestoreProject(project: ProjectListItem) {
    const toast = showRequestToast(`admin-project-restore-${project.id}`, "Restoring project...");
    restoreProject(project.id)
      .then(() => {
        toast.success("Project restored.");
        getProjects().then((data) => setProjects(data.projects)).catch(() => undefined);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Unable to restore project."));
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>{projects.length} total</span>
            <ExportButton
              data={projects.map((p) => ({
                Project: p.title,
                Staff: p.assignedStaffName ?? p.assignedStaffEmail ?? 'Not assigned',
                Location: p.location,
                'Estimated Completion': p.estimatedCompletion ?? p.dueDate ?? '',
                'Fabrication (%)': p.fabrication ?? p.progress,
                Status: p.status,
                Client: p.clientName ?? '',
                'Start Date': p.startDate ?? '',
                'End Date': p.endDate ?? '',
              }))}
              filename="projects"
              label="Export"
            />
          </div>
        </div>
        <Tabs
          activeKey={tab}
          onChange={(key) => setTab(key as "active" | "archived")}
          items={[
            { key: "active", label: `Active (${activeProjects.length})` },
            { key: "archived", label: `Archived (${archivedProjects.length})` },
          ]}
          style={{ marginBottom: 0 }}
        />
        <AdminProjectTable
          emptyMessage={tab === "archived" ? "No archived projects." : "No projects have been created yet."}
          error={error}
          isLoading={isLoading}
          onArchive={tab === "active" ? handleArchiveProject : undefined}
          onCreateQuote={tab === "active" ? handleCreateQuote : undefined}
          onDelete={handleDeleteProject}
          onEdit={tab === "active" ? setEditingProject : undefined}
          onRestore={tab === "archived" ? handleRestoreProject : undefined}
          onView={setActiveProject}
          projects={tab === "active" ? activeProjects : archivedProjects}
        />
      </section>

      <AdminProjectDetailModal
        onClose={() => setActiveProject(null)}
        onProjectUpdated={handleProjectSaved}
        open={Boolean(activeProject)}
        project={activeProject}
      />
      <AdminProjectStatusModal
        onClose={() => setEditingProject(null)}
        onSaved={handleProjectSaved}
        open={Boolean(editingProject)}
        project={editingProject}
      />
      <AdminQuoteModal
        onClose={() => setQuoteProject(null)}
        onCreated={() => {
          getProjects().then((data) => setProjects(data.projects)).catch(() => undefined);
        }}
        open={Boolean(quoteProject)}
        project={quoteProject}
      />
    </div>
  );
}

export default AdminProjects;
