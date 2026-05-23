import type { BadgeTone } from "../components/StatusBadge";
import type { ProjectListItem } from "../data/portal";

export function projectStatusTone(status: ProjectListItem["status"]): BadgeTone {
  if (status === "Completed") {
    return "success";
  }

  if (status === "In Progress" || status === "In Fabrication") {
    return "info";
  }

  if (status === "In Design") {
    return "warning";
  }

  return "danger";
}
