import { Dropdown, Pagination, type MenuProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import type { ProjectListItem } from "../data/portal";
import ProgressBar from "./ProgressBar";
import { PortalIcon } from "./PortalIcon";
import StatusBadge from "./StatusBadge";
import { projectStatusTone } from "../utils/projectStatus";
import { parsePortalDate } from "../utils/dateFormat";

const pageSize = 15;

type SortKey = "title" | "clientName" | "assignedStaff" | "location" | "estimatedCompletion" | "fabrication" | "status";
type SortState = { direction: "asc" | "desc"; key: SortKey } | null;

const sortableColumns: { key: SortKey; label: string }[] = [
  { key: "title", label: "Project" },
  { key: "clientName", label: "Client" },
  { key: "assignedStaff", label: "Staff" },
  { key: "location", label: "Location" },
  { key: "estimatedCompletion", label: "Estimated Completion" },
  { key: "fabrication", label: "Fabrication" },
  { key: "status", label: "Status" },
];

function assignedStaffText(project: ProjectListItem) {
  return project.assignedStaffName || project.assignedStaffEmail || "Not assigned";
}

function sortValue(project: ProjectListItem, key: SortKey): string | number {
  switch (key) {
    case "title":
      return project.title || "";
    case "clientName":
      return project.clientName || "";
    case "assignedStaff":
      return assignedStaffText(project);
    case "location":
      return project.location || "";
    case "estimatedCompletion": {
      const date = parsePortalDate(project.estimatedCompletion || project.dueDate);
      return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
    }
    case "fabrication":
      return project.fabrication ?? project.progress ?? 0;
    case "status":
      return project.status || "";
  }
}

type AdminProjectTableProps = {
  emptyMessage?: string;
  error?: string;
  isLoading?: boolean;
  onArchive?: (project: ProjectListItem) => void;
  onCreateQuote?: (project: ProjectListItem) => void;
  onDelete?: (project: ProjectListItem) => void;
  onEdit?: (project: ProjectListItem) => void;
  onMarkCompleted?: (project: ProjectListItem) => void;
  onRestore?: (project: ProjectListItem) => void;
  onView?: (project: ProjectListItem) => void;
  projects: ProjectListItem[];
};

function AdminProjectTable({
  emptyMessage = "No projects have been created yet.",
  error,
  isLoading = false,
  onArchive,
  onCreateQuote,
  onDelete,
  onEdit,
  onMarkCompleted,
  onRestore,
  onView,
  projects,
}: AdminProjectTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>(null);

  function toggleSort(key: SortKey) {
    setSort((current) => {
      if (current?.key === key) {
        return current.direction === "asc" ? { direction: "desc", key } : null;
      }
      return { direction: "asc", key };
    });
  }

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

  const sortedProjects = useMemo(() => {
    if (!sort) {
      return visibleProjects;
    }

    const factor = sort.direction === "asc" ? 1 : -1;

    return [...visibleProjects].sort((a, b) => {
      const valueA = sortValue(a, sort.key);
      const valueB = sortValue(b, sort.key);

      if (typeof valueA === "number" && typeof valueB === "number") {
        return (valueA - valueB) * factor;
      }

      return String(valueA).localeCompare(String(valueB)) * factor;
    });
  }, [visibleProjects, sort]);

  useEffect(() => {
    setPage(1);
  }, [projects, search, sort]);

  const paginatedProjects = useMemo(
    () => sortedProjects.slice((page - 1) * pageSize, page * pageSize),
    [page, sortedProjects],
  );

  const isArchived = (project: ProjectListItem) =>
    (project.status as string) === "Archived";

  const hasActions = Boolean(onView || onEdit || onCreateQuote || onArchive || onRestore || onDelete);

  function actionMenu(project: ProjectListItem): MenuProps {
    const archived = isArchived(project);
    const items = [
      ...(onView ? [{ key: "view", label: "View" }] : []),
      ...(!archived && onEdit && project.status !== "Completed" ? [{ key: "edit", label: "Edit" }] : []),
      ...(!archived && onMarkCompleted ? [{ key: "mark-completed", label: "Mark as Completed" }] : []),
      ...(!archived && onCreateQuote ? [{ key: "create-quote", label: "Create quote" }] : []),
      ...((onArchive || onRestore || onDelete) ? [{ type: "divider" as const }] : []),
      ...(!archived && onArchive ? [{ key: "archive", label: "Archive" }] : []),
      ...(archived && onRestore ? [{ key: "restore", label: "Restore" }] : []),
      ...(onDelete ? [{ key: "delete", label: "Delete", danger: true }] : []),
    ];

    return {
      items,
      onClick: ({ key }) => {
        if (key === "view" && onView) { onView(project); return; }
        if (key === "edit" && onEdit) { onEdit(project); return; }
        if (key === "mark-completed" && onMarkCompleted) { onMarkCompleted(project); return; }
        if (key === "create-quote" && onCreateQuote) { onCreateQuote(project); return; }
        if (key === "archive" && onArchive) { onArchive(project); return; }
        if (key === "restore" && onRestore) { onRestore(project); return; }
        if (key === "delete" && onDelete) { onDelete(project); }
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
      <div className="table-responsive-wrapper">
        <div className="admin-record-table admin-record-table--projects">
        <div className="admin-record-table__head">
          {sortableColumns.map((column) => (
            <button
              className="admin-table-sort-header"
              key={column.key}
              onClick={() => toggleSort(column.key)}
              type="button"
            >
              <span>{column.label}</span>
              {sort?.key === column.key ? <span aria-hidden="true">{sort.direction === "asc" ? "▲" : "▼"}</span> : null}
            </button>
          ))}
          <span>{hasActions ? "Action" : ""}</span>
        </div>
        {isLoading ? (
          <div className="admin-empty-row">Loading projects...</div>
        ) : error ? (
          <div className="admin-empty-row">{error}</div>
        ) : sortedProjects.length ? (
          paginatedProjects.map((project) => {
            const fabrication = project.fabrication ?? project.progress;

            return (
              <article 
                className="admin-record-table__row" 
                key={project.id}
                onClick={() => onView && onView(project)}
                style={{ cursor: onView ? "pointer" : "default" }}
              >
                <strong>{project.title}</strong>
                <span>{project.clientName || '—'}</span>
                <span>{assignedStaffText(project)}</span>
                <span>{project.location || "Not set"}</span>
                <span>{project.estimatedCompletion || project.dueDate || "Not set"}</span>
                <span className="admin-project-progress-cell">
                  <strong>{fabrication}%</strong>
                  <ProgressBar value={fabrication} />
                </span>
                <StatusBadge tone={projectStatusTone(project.status)}>{project.status}</StatusBadge>
                <span onClick={(e) => e.stopPropagation()}>
                  {hasActions && (
                    <Dropdown menu={actionMenu(project)} placement="bottomRight">
                      <button className="table-action-button" type="button">
                        <span>Actions</span>
                        <PortalIcon name="down" />
                      </button>
                    </Dropdown>
                  )}
                </span>
              </article>
            );
          })
        ) : (
          <div className="admin-empty-row">{emptyMessage}</div>
        )}
        </div>
      </div>
      <Pagination
        className="admin-client-pagination"
        current={page}
        onChange={setPage}
        pageSize={pageSize}
        showSizeChanger={false}
        total={sortedProjects.length}
      />
    </div>
  );
}

export default AdminProjectTable;
