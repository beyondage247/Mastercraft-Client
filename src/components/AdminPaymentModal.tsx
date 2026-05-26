import { Modal } from "antd";
import { useEffect, useState } from "react";
import type { ProjectListItem } from "../data/portal";
import {
  createPayment,
  getProjectPayments,
  type PaymentMethodInput,
  type ProjectPaymentSummary,
} from "../services/portalApi";
import { showRequestToast } from "../utils/portalToast";

type AdminPaymentModalProps = {
  onClose: () => void;
  onRecorded?: (summary: ProjectPaymentSummary) => void;
  open: boolean;
  project: ProjectListItem | null;
};

const paymentMethods: Array<{ label: string; value: PaymentMethodInput }> = [
  { label: "ACH", value: "ACH" },
  { label: "Wire", value: "WIRE" },
  { label: "Credit card", value: "CREDIT_CARD" },
  { label: "Check", value: "CHECK" },
];

function currentDateTimeInput() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  return date.toISOString().slice(0, 16);
}

function toApiDateTime(value: string) {
  const date = value ? new Date(value) : new Date();

  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function AdminPaymentModal({ onClose, onRecorded, open, project }: AdminPaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [createdAt, setCreatedAt] = useState(currentDateTimeInput());
  const [method, setMethod] = useState<PaymentMethodInput>("ACH");
  const [reference, setReference] = useState("");
  const [summary, setSummary] = useState<ProjectPaymentSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open || !project) {
      return;
    }

    setAmount("");
    setCreatedAt(currentDateTimeInput());
    setMethod("ACH");
    setReference("");
    setSummary(null);
    setIsLoadingSummary(true);

    getProjectPayments(project.id)
      .then(setSummary)
      .catch(() => {
        setSummary(null);
      })
      .finally(() => {
        setIsLoadingSummary(false);
      });
  }, [open, project]);

  async function handleSubmit() {
    if (!project) {
      return;
    }

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      showRequestToast("payment-validation", "Checking payment...").error(
        "Enter a payment amount greater than zero.",
      );
      return;
    }

    const toast = showRequestToast("create-payment", "Recording payment...");
    setIsSaving(true);

    try {
      const nextSummary = await createPayment({
        amount: numericAmount,
        createdAt: toApiDateTime(createdAt),
        method,
        projectId: project.id,
        reference: reference.trim() || undefined,
      });

      setSummary(nextSummary);
      onRecorded?.(nextSummary);
      toast.success("Payment was recorded.");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to record payment.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      okButtonProps={{ loading: isSaving }}
      okText="Record payment"
      onCancel={onClose}
      onOk={handleSubmit}
      open={open}
      title={`Record payment${project ? ` for ${project.title}` : ""}`}
      width={720}
    >
      <div className="admin-modal-form">
        <div className="quote-project-summary">
          <div>
            <span>Project</span>
            <strong>{project?.title || "Not selected"}</strong>
          </div>
          <div>
            <span>Payment status</span>
            <strong>{isLoadingSummary ? "Loading..." : summary?.paymentStatus || "Unknown"}</strong>
          </div>
          <div>
            <span>Amount paid</span>
            <strong>{summary?.amountPaid || "$0.00"}</strong>
          </div>
          <div>
            <span>Amount due</span>
            <strong>{summary?.amountDue || "Pending approved quote"}</strong>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="paymentAmount">Amount</label>
            <input
              id="paymentAmount"
              min="0"
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              type="number"
              value={amount}
            />
          </div>
          <div className="form-group">
            <label htmlFor="paymentMethod">Method</label>
            <select
              id="paymentMethod"
              onChange={(event) => setMethod(event.target.value as PaymentMethodInput)}
              value={method}
            >
              {paymentMethods.map((paymentMethod) => (
                <option key={paymentMethod.value} value={paymentMethod.value}>
                  {paymentMethod.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="paymentDate">Payment date</label>
            <input
              id="paymentDate"
              onChange={(event) => setCreatedAt(event.target.value)}
              type="datetime-local"
              value={createdAt}
            />
          </div>
          <div className="form-group">
            <label htmlFor="paymentReference">Reference</label>
            <input
              id="paymentReference"
              onChange={(event) => setReference(event.target.value)}
              placeholder="Optional, e.g. ACH-20260526090000000"
              value={reference}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default AdminPaymentModal;
