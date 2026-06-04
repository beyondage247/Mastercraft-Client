import { Dropdown, type MenuProps } from "antd";
import { useMemo, useState } from "react";
import type { ProjectListItem } from "../data/portal";
import ProgressBar from "./ProgressBar";
import { PortalIcon } from "./PortalIcon";
import StatusBadge from "./StatusBadge";
import { projectStatusTone } from "../utils/projectStatus";

type AdminProjectTableProps = {
  emptyMessage?: string;
  error?: string;
  isLoading?: boolean;
  onCreateQuote: (project: ProjectListItem) => void;
  onEdit: (project: ProjectListItem) => void;
  onView: (project: ProjectListItem) => void;
  projects: ProjectListItem[];
};

function AdminProjectTable({
  emptyMessage = "No projects have been created yet.",
  error,
  isLoading = false,
  onCreateQuote,
  onEdit,
  onView,
  projects,
}: AdminProjectTableProps) {
  const [search, setSearch] = useState("");
  const visibleProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return projects;
    }

    return projects.filter((project) =>
      [
        project.title,
        project.assignedStaffName,
        project.assignedStaffEmail,
        project.location,
        project.estimatedCompletion,
        project.dueDate,
        project.status,
        project.clientName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [projects, search]);

  function assignedStaffText(project: ProjectListItem) {
    return project.assignedStaffName || project.assignedStaffEmail || "Not assigned";
  }

  function actionMenu(project: ProjectListItem): MenuProps {
    return {
      items: [
        { key: "view", label: "View" },
        ...(project.status === "Completed" ? [] : [{ key: "edit", label: "Edit" }]),
        { key: "create-quote", label: "Create quote" },
      ],
      onClick: ({ key }) => {
        if (key === "view") {
          onView(project);
          return;
        }

        if (key === "edit") {
          onEdit(project);
          return;
        }

        onCreateQuote(project);
      },
    };
  }

  return (
    <div className="admin-project-table-wrap">
      <label className="admin-table-search">
        <PortalIcon name="search" />
        <input
          aria-label="Search projects"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search projects"
          type="search"
          value={search}
        />
      </label>
      <div className="admin-record-table admin-record-table--projects">
      <div className="admin-record-table__head">
        <span>Project</span>
        <span>Staff</span>
        <span>Location</span>
        <span>Estimated Completion</span>
        <span>Fabrication</span>
        <span>Status</span>
        <span>Action</span>
      </div>
      {isLoading ? (
        <div className="admin-empty-row">Loading projects...</div>
      ) : error ? (
        <div className="admin-empty-row">{error}</div>
      ) : visibleProjects.length ? (
        visibleProjects.map((project) => {
          const fabrication = project.fabrication ?? project.progress;

          return (
            <article className="admin-record-table__row" key={project.id}>
              <strong>{project.title}</strong>
              <span>{assignedStaffText(project)}</span>
              <span>{project.location || "Not set"}</span>
              <span>{project.estimatedCompletion || project.dueDate || "Not set"}</span>
              <span className="admin-project-progress-cell">
                <strong>{fabrication}%</strong>
                <ProgressBar value={fabrication} />
              </span>
              <StatusBadge tone={projectStatusTone(project.status)}>{project.status}</StatusBadge>
              <span>
                <Dropdown menu={actionMenu(project)} placement="bottomRight">
                  <button className="table-action-button" type="button">
                    <span>Actions</span>
                    <PortalIcon name="down" />
                  </button>
                </Dropdown>
              </span>
            </article>
          );
        })
      ) : (
        <div className="admin-empty-row">{emptyMessage}</div>
      )}
      </div>
    </div>
  );
}

export default AdminProjectTable;
