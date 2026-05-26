import { Dropdown, type MenuProps } from "antd";
import type { QuoteListItem } from "../data/portal";
import { PortalIcon } from "./PortalIcon";
import StatusBadge from "./StatusBadge";

type AdminQuoteTableProps = {
  emptyMessage?: string;
  error?: string;
  isLoading?: boolean;
  onEdit: (quote: QuoteListItem) => void;
  onView: (quote: QuoteListItem) => void;
  quotes: QuoteListItem[];
};

function quoteTone(status: QuoteListItem["status"]) {
  if (status === "Approved") return "success";
  if (status === "Rejected" || status === "Expired") return "danger";
  if (status === "Draft") return "neutral";
  return "warning";
}

function AdminQuoteTable({
  emptyMessage = "No quotes have been created yet.",
  error,
  isLoading = false,
  onEdit,
  onView,
  quotes,
}: AdminQuoteTableProps) {
  function actionMenu(quote: QuoteListItem): MenuProps {
    return {
      items: [
        { key: "view", label: "View" },
        { key: "edit", label: "Edit" },
      ],
      onClick: ({ key }) => {
        if (key === "edit") {
          onEdit(quote);
          return;
        }

        onView(quote);
      },
    };
  }

  return (
    <div className="admin-project-table-wrap">
      <div className="admin-record-table admin-record-table--quotes">
        <div className="admin-record-table__head">
          <span>Quote</span>
          <span>Project</span>
          <span>Amount</span>
          <span>Valid Until</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {isLoading ? (
          <div className="admin-empty-row">Loading quotes...</div>
        ) : error ? (
          <div className="admin-empty-row">{error}</div>
        ) : quotes.length ? (
          quotes.map((quote) => (
            <article className="admin-record-table__row" key={quote.id}>
              <strong>{quote.title}</strong>
              <span>{quote.projectName || quote.description || "Not set"}</span>
              <span>{quote.total || quote.amount}</span>
              <span>{quote.validUntil || "Not set"}</span>
              <StatusBadge tone={quoteTone(quote.status)}>{quote.status}</StatusBadge>
              <span>
                <Dropdown menu={actionMenu(quote)} placement="bottomRight">
                  <button className="table-action-button" type="button">
                    <span>Actions</span>
                    <PortalIcon name="down" />
                  </button>
                </Dropdown>
              </span>
            </article>
          ))
        ) : (
          <div className="admin-empty-row">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
}

export default AdminQuoteTable;
