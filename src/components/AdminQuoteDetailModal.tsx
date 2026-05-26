import { Modal } from "antd";
import type { QuoteListItem } from "../data/portal";
import StatusBadge from "./StatusBadge";

type AdminQuoteDetailModalProps = {
  onClose: () => void;
  open: boolean;
  quote: QuoteListItem | null;
};

function AdminQuoteDetailModal({ onClose, open, quote }: AdminQuoteDetailModalProps) {
  return (
    <Modal footer={null} onCancel={onClose} open={open} title={quote?.title || "Quote details"} width={920}>
      {quote ? (
        <div className="admin-project-detail">
          <div className="admin-detail-grid">
            <div>
              <span>Quote ID</span>
              <strong>{quote.uid || quote.id}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>
                <StatusBadge tone={quote.status === "Approved" ? "success" : quote.status === "Rejected" ? "danger" : "warning"}>
                  {quote.status}
                </StatusBadge>
              </strong>
            </div>
            <div>
              <span>Project</span>
              <strong>{quote.projectName || quote.description || "Not set"}</strong>
            </div>
            <div>
              <span>Valid until</span>
              <strong>{quote.validUntil || "Not set"}</strong>
            </div>
            <div>
              <span>Subtotal</span>
              <strong>{quote.subtotal || "$0.00"}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{quote.total || quote.amount}</strong>
            </div>
          </div>

          {quote.clientComment ? (
            <div className="admin-project-detail__notes">
              <span>Client comment</span>
              <p>{quote.clientComment}</p>
            </div>
          ) : null}

          <div className="admin-project-stage-table admin-quote-line-table">
            <div className="admin-project-stage-table__head">
              <span>Product/service</span>
              <span>Qty</span>
              <span>Unit price</span>
              <span>Total</span>
            </div>
            {quote.lineItems?.length ? (
              quote.lineItems.map((item, index) => (
                <article className="admin-project-stage-table__row" key={`${item.description}-${index}`}>
                  <strong>{item.description}</strong>
                  <span>{item.qty}</span>
                  <span>{item.rate}</span>
                  <span>{item.amount}</span>
                </article>
              ))
            ) : (
              <div className="admin-empty-row">No line items were returned for this quote.</div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export default AdminQuoteDetailModal;
