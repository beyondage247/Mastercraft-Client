import type { BadgeTone } from "../components/StatusBadge";
import type { ProjectListItem } from "../data/portal";

export function projectStatusTone(status: ProjectListItem["status"]): BadgeTone {
  if (status === "Completed") {
    return "success";
  }

  if (status === "In Progress" || status === "In Fabrication" || status === "In Production") {
    return "info";
  }

  if (status === "In Design" || status === "Quoted") {
    return "warning";
  }

  if (status === "Lost") {
    return "danger";
  }

  return "danger";
}
