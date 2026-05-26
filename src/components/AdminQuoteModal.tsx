import { Button, Modal, Select } from "antd";
import { useEffect, useMemo, useState } from "react";
import type { ProjectListItem, QuoteListItem } from "../data/portal";
import {
  createQuote,
  getCatalogItems,
  updateQuote,
  type CatalogItem,
} from "../services/portalApi";
import { showRequestToast } from "../utils/portalToast";
import { PortalIcon } from "./PortalIcon";

type AdminQuoteModalProps = {
  mode?: "create" | "edit";
  onClose: () => void;
  onCreated?: (quote: QuoteListItem) => void;
  onSaved?: (quote: QuoteListItem) => void;
  open: boolean;
  project: ProjectListItem | null;
  quote?: QuoteListItem | null;
};

type QuoteLineDraft = {
  catalogItemId: string;
  key: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

type QuoteFormState = {
  dateIssued: string;
  name: string;
  quoteId: string;
  tax: number;
  validUntil: string;
};

function dateValue(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  return date.toISOString().slice(0, 10);
}

function dateInputValue(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function nextQuoteId() {
  return `QT-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
}

function emptyLine(): QuoteLineDraft {
  return {
    catalogItemId: "",
    key: crypto.randomUUID(),
    productName: "",
    quantity: 1,
    unitPrice: 0,
  };
}

function numberFromPrice(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    return Number(value.replace(/[^0-9.-]/g, "")) || 0;
  }

  return 0;
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(value);
}

function itemSearchText(item: CatalogItem) {
  return [
    item.productName,
    item.category,
    item.subcategory,
    item.itemCode,
    item.supplier,
  ]
    .filter(Boolean)
    .join(" ");
}

function lineFromQuoteItem(
  item: NonNullable<QuoteListItem["lineItems"]>[number],
  catalogItems: CatalogItem[],
): QuoteLineDraft {
  const matchedCatalogItem = catalogItems.find(
    (catalogItem) =>
      catalogItem.productName.trim().toLowerCase() === item.description.trim().toLowerCase(),
  );

  return {
    catalogItemId: matchedCatalogItem?.id || "",
    key: crypto.randomUUID(),
    productName: item.description,
    quantity: item.qty || 1,
    unitPrice: numberFromPrice(item.rate),
  };
}

function AdminQuoteModal({
  mode = "create",
  onClose,
  onCreated,
  onSaved,
  open,
  project,
  quote,
}: AdminQuoteModalProps) {
  const isEdit = mode === "edit" && quote;
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [form, setForm] = useState<QuoteFormState>({
    dateIssued: dateValue(),
    name: "",
    quoteId: nextQuoteId(),
    tax: 0,
    validUntil: dateValue(14),
  });
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lines, setLines] = useState<QuoteLineDraft[]>([emptyLine()]);
  const [subcategoryFilter, setSubcategoryFilter] = useState("");

  useEffect(() => {
    if (!open || catalogItems.length) {
      return;
    }

    let isMounted = true;
    setIsCatalogLoading(true);
    getCatalogItems()
      .then((items) => {
        if (isMounted) {
          setCatalogItems(items.filter((item) => item.active !== false));
        }
      })
      .catch((error: Error) => {
        if (isMounted) {
          showRequestToast("load-catalog", "Loading products and services...").error(
            error.message || "Unable to load products and services.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCatalogLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [catalogItems.length, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isEdit) {
      setForm({
        dateIssued: dateInputValue(quote.dateIssued) || dateValue(),
        name: quote.title,
        quoteId: quote.uid || quote.id,
        tax: numberFromPrice(quote.tax),
        validUntil: dateInputValue(quote.validUntil) || dateValue(14),
      });
      setLines(
        quote.lineItems?.length
          ? quote.lineItems.map((item) => lineFromQuoteItem(item, catalogItems))
          : [emptyLine()],
      );
      setSubcategoryFilter("");
      return;
    }

    if (project) {
      setForm({
        dateIssued: dateValue(),
        name: `${project.title} Quote`,
        quoteId: nextQuoteId(),
        tax: 0,
        validUntil: dateValue(14),
      });
      setLines([emptyLine()]);
      setSubcategoryFilter("");
    }
  }, [catalogItems, isEdit, open, project, quote]);

  const subcategoryOptions = useMemo(() => {
    const subcategories = Array.from(
      new Set(catalogItems.map((item) => item.subcategory).filter(Boolean)),
    ).sort((first, second) => String(first).localeCompare(String(second)));

    return [
      { label: "All subcategories", value: "" },
      ...subcategories.map((subcategory) => ({
        label: String(subcategory),
        value: String(subcategory),
      })),
    ];
  }, [catalogItems]);

  const catalogOptions = useMemo(() => {
    const filteredItems = subcategoryFilter
      ? catalogItems.filter((item) => item.subcategory === subcategoryFilter)
      : catalogItems;

    return filteredItems.map((item) => ({
      label: `${item.productName}${item.category ? ` - ${item.category}` : ""}${
        item.subcategory ? ` - ${item.subcategory}` : ""
      }`,
      searchText: itemSearchText(item),
      value: item.id,
    }));
  }, [catalogItems, subcategoryFilter]);

  const subtotal = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + line.unitPrice * Math.max(0, Number(line.quantity) || 0),
        0,
      ),
    [lines],
  );
  const taxAmount = (Math.max(0, Number(form.tax) || 0) / 100) * subtotal;
  const total = subtotal + taxAmount;

  function updateForm<K extends keyof QuoteFormState>(key: K, value: QuoteFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateLine(key: string, patch: Partial<QuoteLineDraft>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  function selectCatalogItem(key: string, itemId: string) {
    const item = catalogItems.find((catalogItem) => catalogItem.id === itemId);

    updateLine(key, {
      catalogItemId: itemId,
      productName: item?.productName ?? "",
      unitPrice: numberFromPrice(item?.ourPrice),
    });
  }

  function addLineItem() {
    setLines((current) => [...current, emptyLine()]);
  }

  function removeLineItem(key: string) {
    setLines((current) =>
      current.length > 1 ? current.filter((line) => line.key !== key) : current,
    );
  }

  async function handleSubmit() {
    if (!project && !quote?.projectId) {
      return;
    }

    const selectedLines = lines.filter((line) => line.catalogItemId);

    if (!form.name.trim() || !form.quoteId.trim() || !form.dateIssued || !form.validUntil) {
      showRequestToast("quote-validation", "Checking quote...").error(
        "Quote name, quote ID, issue date, and valid until date are required.",
      );
      return;
    }

    if (!selectedLines.length) {
      showRequestToast("quote-validation", "Checking quote...").error(
        "Add at least one product or service line item.",
      );
      return;
    }

    if (lines.some((line) => line.catalogItemId && (!line.quantity || line.quantity <= 0))) {
      showRequestToast("quote-validation", "Checking quote...").error(
        "Each selected line item needs a quantity greater than zero.",
      );
      return;
    }

    const payload = {
      dateIssued: form.dateIssued,
      lineItems: selectedLines.map((line) => ({
        quantity: Math.max(1, Number(line.quantity) || 1),
        serviceId: line.catalogItemId,
      })),
      name: form.name.trim(),
      quoteId: form.quoteId.trim(),
      subtotal,
      tax: Math.max(0, Number(form.tax) || 0),
      taxAmount,
      total,
      validUntil: form.validUntil,
    };
    const toast = showRequestToast(isEdit ? "update-quote" : "create-quote", isEdit ? "Updating quote..." : "Creating quote...");
    setIsSubmitting(true);

    try {
      const savedQuote = isEdit
        ? await updateQuote(quote.id, payload)
        : await createQuote({
            ...payload,
            projectId: project?.id || quote?.projectId || "",
          });

      toast.success(isEdit ? "Quote was updated." : `Quote created for ${project?.title || "project"}.`);
      onSaved?.(savedQuote);
      onCreated?.(savedQuote);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save quote.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      okButtonProps={{ loading: isSubmitting }}
      okText={isEdit ? "Save quote" : "Create quote"}
      onCancel={onClose}
      onOk={handleSubmit}
      open={open}
      title={`${isEdit ? "Edit" : "Create"} quote${project ? ` for ${project.title}` : ""}`}
      width={1040}
    >
      <div className="admin-modal-form quote-create-form">
        <div className="quote-project-summary">
          <div>
            <span>Project</span>
            <strong>{project?.title || quote?.projectName || quote?.description || "Not selected"}</strong>
          </div>
          <div>
            <span>Client</span>
            <strong>{project?.clientName || "Not set"}</strong>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="quoteName">Quote name</label>
            <input
              id="quoteName"
              onChange={(event) => updateForm("name", event.target.value)}
              value={form.name}
            />
          </div>
          <div className="form-group">
            <label htmlFor="quoteId">Quote ID</label>
            <input
              id="quoteId"
              onChange={(event) => updateForm("quoteId", event.target.value)}
              value={form.quoteId}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="quoteDateIssued">Date issued</label>
            <input
              id="quoteDateIssued"
              onChange={(event) => updateForm("dateIssued", event.target.value)}
              type="date"
              value={form.dateIssued}
            />
          </div>
          <div className="form-group">
            <label htmlFor="quoteValidUntil">Valid until</label>
            <input
              id="quoteValidUntil"
              onChange={(event) => updateForm("validUntil", event.target.value)}
              type="date"
              value={form.validUntil}
            />
          </div>
        </div>

        <div className="quote-line-section">
          <div className="quote-line-section__header">
            <h3>Line items</h3>
            <div className="quote-line-section__tools">
              <Select
                onChange={setSubcategoryFilter}
                options={subcategoryOptions}
                value={subcategoryFilter}
              />
              <Button icon={<PortalIcon name="plus" />} onClick={addLineItem} type="default">
                Add line item
              </Button>
            </div>
          </div>

          <div className="quote-line-table">
            <div className="quote-line-table__head">
              <span>Product or service</span>
              <span>Unit price</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Action</span>
            </div>
            {lines.map((line) => (
              <div className="quote-line-table__row" key={line.key}>
                <Select
                  filterOption={(input, option) =>
                    String(option?.searchText || option?.label || "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  loading={isCatalogLoading}
                  onChange={(value) => selectCatalogItem(line.key, value)}
                  options={catalogOptions}
                  placeholder="Search product, category, or subcategory"
                  showSearch
                  value={line.catalogItemId || undefined}
                />
                <input
                  aria-label="Unit price"
                  onChange={(event) =>
                    updateLine(line.key, { unitPrice: numberFromPrice(event.target.value) })
                  }
                  type="number"
                  value={line.unitPrice}
                />
                <input
                  aria-label="Quantity"
                  min="1"
                  onChange={(event) =>
                    updateLine(line.key, { quantity: Number(event.target.value) || 0 })
                  }
                  type="number"
                  value={line.quantity}
                />
                <strong>{money(line.unitPrice * Math.max(0, Number(line.quantity) || 0))}</strong>
                <Button
                  aria-label="Remove line item"
                  disabled={lines.length === 1}
                  icon={<PortalIcon name="delete" />}
                  onClick={() => removeLineItem(line.key)}
                  type="text"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="quote-total-panel">
          <div className="form-group">
            <label htmlFor="quoteTax">Tax (%)</label>
            <input
              id="quoteTax"
              min="0"
              onChange={(event) => updateForm("tax", Number(event.target.value) || 0)}
              type="number"
              value={form.tax}
            />
          </div>
          <div className="quote-total-panel__summary">
            <div>
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <div>
              <span>Tax amount</span>
              <strong>{money(taxAmount)}</strong>
            </div>
            <div className="quote-total-panel__grand">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default AdminQuoteModal;
