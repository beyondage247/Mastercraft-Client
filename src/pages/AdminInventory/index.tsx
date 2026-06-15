import { Modal, Table } from "antd";
import type { TableProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { PortalIcon } from "../../components/PortalIcon";
import StatusBadge, { type BadgeTone } from "../../components/StatusBadge";
import {
  getInventoryItems,
  getInventorySummary,
  importInventoryItems,
  updateInventoryItem,
  type InventoryAvailabilityStatus,
  type InventoryImportResponse,
  type InventoryItem,
  type InventorySummaryResponse,
  type UpdateInventoryItemInput,
} from "../../services/portalApi";
import { formatPortalDateOrFallback } from "../../utils/dateFormat";
import { showRequestToast } from "../../utils/portalToast";

type InventoryStatusFilter = "All" | InventoryAvailabilityStatus | "LOW_STOCK" | "OUT_OF_STOCK";

type InventoryFormState = {
  active: boolean;
  availabilityStatus: InventoryAvailabilityStatus[];
  category: string;
  inStock: string;
  lastPriceUpdate: string;
  material: string;
  minReserve: string;
  name: string;
  notes: string;
  sizeDimension: string;
  sku: string;
  subcategory: string;
  supplier: string;
  unitMeasure: string;
};

const emptyInventoryForm: InventoryFormState = {
  active: true,
  availabilityStatus: ["EMAIL_FOR_QUOTE"],
  category: "",
  inStock: "",
  lastPriceUpdate: "",
  material: "",
  minReserve: "",
  name: "",
  notes: "",
  sizeDimension: "",
  sku: "",
  subcategory: "",
  supplier: "",
  unitMeasure: "",
};

const availabilityOptions: Array<{ label: string; value: InventoryAvailabilityStatus }> = [
  { label: "In stock", value: "IN_STOCK" },
  { label: "Email for quote", value: "EMAIL_FOR_QUOTE" },
  { label: "Special order", value: "SPECIAL_ORDER" },
];

const emptyImportResult: InventoryImportResponse = {
  createdCount: 0,
  errorCount: 0,
  errors: [],
  message: "",
  processedCount: 0,
  skippedCount: 0,
  skippedRows: [],
  updatedCount: 0,
};

function stringValue(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function displayValue(value: unknown, fallback = "Not set") {
  const valueText = stringValue(value).trim();

  return valueText || fallback;
}

function nullableText(value: string) {
  const trimmed = value.trim();

  return trimmed || null;
}

function nullableNumber(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) ? parsed : null;
}

function formFromItem(item: InventoryItem): InventoryFormState {
  return {
    active: item.active,
    availabilityStatus: item.availabilityStatus || [],
    category: item.category || "",
    inStock: stringValue(item.inStock),
    lastPriceUpdate: stringValue(item.lastPriceUpdate),
    material: stringValue(item.material),
    minReserve: stringValue(item.minReserve),
    name: item.name || "",
    notes: stringValue(item.notes),
    sizeDimension: stringValue(item.sizeDimension),
    sku: stringValue(item.sku),
    subcategory: stringValue(item.subcategory),
    supplier: item.supplier || "",
    unitMeasure: stringValue(item.unitMeasure),
  };
}

function dateText(value?: string | null) {
  return value ? formatPortalDateOrFallback(value) : "Not set";
}

function numberText(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return "Not counted";
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue.toLocaleString() : String(value);
}

function availabilityLabel(value: InventoryAvailabilityStatus) {
  return availabilityOptions.find((option) => option.value === value)?.label || value;
}

function availabilityTone(value: InventoryAvailabilityStatus): BadgeTone {
  if (value === "IN_STOCK") return "success";
  if (value === "SPECIAL_ORDER") return "warning";
  return "info";
}

function isOutOfStock(item: InventoryItem) {
  return item.inStock !== null && item.inStock !== undefined && Number(item.inStock) === 0;
}

function stockTone(item: InventoryItem): BadgeTone {
  if (isOutOfStock(item)) return "danger";
  if (item.lowStock) return "warning";
  return "success";
}

function stockLabel(item: InventoryItem) {
  if (isOutOfStock(item)) return "Out of stock";
  if (item.lowStock) return "Low stock";
  return "Stock ok";
}

function fallbackSummary(items: InventoryItem[]): InventorySummaryResponse {
  return {
    activeItems: items.filter((item) => item.active).length,
    categoriesCount: new Set(items.map((item) => item.category).filter(Boolean)).size,
    inactiveItems: items.filter((item) => !item.active).length,
    lowStockItems: items.filter((item) => item.lowStock).length,
    outOfStockItems: items.filter(isOutOfStock).length,
    totalItems: items.length,
    trackedItems: items.filter((item) => item.inStock !== null && item.inStock !== undefined).length,
  };
}

function AdminInventory() {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<InventoryFormState | null>(null);
  const [importResult, setImportResult] = useState<InventoryImportResponse>(emptyImportResult);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusFilter, setStatusFilter] = useState<InventoryStatusFilter>("All");
  const [summary, setSummary] = useState<InventorySummaryResponse | null>(null);
  const [uploadInputKey, setUploadInputKey] = useState(0);

  function refreshInventory() {
    return Promise.all([
      getInventoryItems(),
      getInventorySummary().catch(() => null),
    ]).then(([items, nextSummary]) => {
      setInventoryItems(items);
      setSummary(nextSummary);
      setError("");
    });
  }

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);

    Promise.all([
      getInventoryItems(),
      getInventorySummary().catch(() => null),
    ])
      .then(([items, nextSummary]) => {
        if (isMounted) {
          setInventoryItems(items);
          setSummary(nextSummary);
          setError("");
        }
      })
      .catch((requestError: Error) => {
        if (isMounted) {
          setInventoryItems([]);
          setSummary(null);
          setError(requestError.message || "Unable to load inventory.");
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

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(inventoryItems.map((item) => item.category).filter(Boolean))).sort()],
    [inventoryItems],
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return inventoryItems.filter((item) => {
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "LOW_STOCK" && item.lowStock) ||
        (statusFilter === "OUT_OF_STOCK" && isOutOfStock(item)) ||
        item.availabilityStatus?.includes(statusFilter as InventoryAvailabilityStatus);
      const searchable = [
        item.name,
        item.sku,
        item.category,
        item.subcategory,
        item.material,
        item.sizeDimension,
        item.supplier,
        item.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && matchesStatus && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [categoryFilter, inventoryItems, search, statusFilter]);

  const summaryMetrics = summary ?? fallbackSummary(inventoryItems);

  const inventoryColumns: TableProps<InventoryItem>["columns"] = [
    {
      dataIndex: "name",
      fixed: "left",
      key: "name",
      render: (value: string, item) => (
        <div className="product-service-name-cell">
          <strong>{value}</strong>
          <span>{displayValue(item.sizeDimension || item.material, "No dimensions")}</span>
        </div>
      ),
      title: "Name",
      width: 320,
    },
    {
      dataIndex: "sku",
      key: "sku",
      render: (value?: string | null) => displayValue(value),
      title: "SKU / Item Code",
      width: 150,
    },
    {
      dataIndex: "category",
      key: "category",
      render: (value?: string) => displayValue(value),
      title: "Category",
      width: 170,
    },
    {
      dataIndex: "subcategory",
      key: "subcategory",
      render: (value?: string | null) => displayValue(value),
      title: "Subcategory / Series",
      width: 190,
    },
    {
      dataIndex: "material",
      key: "material",
      render: (value?: string | null) => displayValue(value),
      title: "Species / Material",
      width: 180,
    },
    {
      dataIndex: "availabilityStatus",
      key: "availabilityStatus",
      render: (statuses?: InventoryAvailabilityStatus[]) => (
        <span className="product-service-status-list">
          {statuses?.length ? (
            statuses.map((status) => (
              <StatusBadge key={status} tone={availabilityTone(status)}>
                {availabilityLabel(status)}
              </StatusBadge>
            ))
          ) : (
            <StatusBadge tone="neutral">Unspecified</StatusBadge>
          )}
        </span>
      ),
      title: "Availability",
      width: 250,
    },
    {
      key: "stock",
      render: (_, item) => (
        <div className="product-service-name-cell">
          <strong>{numberText(item.inStock)}</strong>
          <span>Reserve: {numberText(item.minReserve)}</span>
        </div>
      ),
      title: "Stock",
      width: 150,
    },
    {
      key: "stockStatus",
      render: (_, item) => <StatusBadge tone={stockTone(item)}>{stockLabel(item)}</StatusBadge>,
      title: "Stock Status",
      width: 150,
    },
    {
      dataIndex: "unitMeasure",
      key: "unitMeasure",
      render: (value?: string | null) => displayValue(value),
      title: "Unit",
      width: 130,
    },
    {
      dataIndex: "supplier",
      key: "supplier",
      render: (value?: string) => displayValue(value),
      title: "Supplier",
      width: 170,
    },
    {
      dataIndex: "notes",
      key: "notes",
      render: (value?: string | null) => displayValue(value, "None"),
      title: "Notes / Variants",
      width: 240,
    },
    {
      dataIndex: "active",
      key: "active",
      render: (active: boolean) => (
        <StatusBadge tone={active ? "success" : "neutral"}>{active ? "Active" : "Inactive"}</StatusBadge>
      ),
      title: "Active",
      width: 120,
    },
    {
      dataIndex: "lastPriceUpdate",
      key: "lastPriceUpdate",
      render: dateText,
      title: "Last Price Update",
      width: 170,
    },
    {
      fixed: "right",
      key: "action",
      render: (_, item) => (
        <button className="table-action-button" onClick={() => openEdit(item)} type="button">
          Edit
        </button>
      ),
      title: "Action",
      width: 110,
    },
  ];

  async function handleImport() {
    if (!selectedFile) {
      setError("Choose an inventory workbook before importing.");
      return;
    }

    const toast = showRequestToast("inventory-import", "Importing inventory...");

    try {
      setIsImporting(true);
      const result = await importInventoryItems(selectedFile);
      setImportResult(result);
      await refreshInventory();
      setSelectedFile(null);
      setUploadInputKey((current) => current + 1);
      toast.success(result.message || "Inventory import completed.");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to import inventory.";

      setError(message);
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  }

  function openEdit(item: InventoryItem) {
    setEditItem(item);
    setIsCreateOpen(false);
    setForm(formFromItem(item));
  }

  function openCreate() {
    setEditItem(null);
    setForm(emptyInventoryForm);
    setIsCreateOpen(true);
  }

  function updateField<Field extends keyof InventoryFormState>(field: Field, value: InventoryFormState[Field]) {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  }

  function toggleAvailability(value: InventoryAvailabilityStatus, checked: boolean) {
    setForm((current) => {
      if (!current) {
        return current;
      }

      const nextStatuses = checked
        ? [...new Set([...current.availabilityStatus, value])]
        : current.availabilityStatus.filter((status) => status !== value);

      return { ...current, availabilityStatus: nextStatuses };
    });
  }

  async function handleSaveInventoryItem() {
    if (!form) {
      return;
    }

    if (!form.name.trim() || !form.category.trim() || !form.supplier.trim()) {
      setError("Name, category, and supplier are required.");
      return;
    }

    if (!form.availabilityStatus.length) {
      setError("Choose at least one availability status.");
      return;
    }

    const payload: UpdateInventoryItemInput = {
      active: form.active,
      availabilityStatus: form.availabilityStatus,
      category: form.category.trim(),
      inStock: nullableText(form.inStock),
      lastPriceUpdate: nullableText(form.lastPriceUpdate),
      material: nullableText(form.material),
      minReserve: nullableText(form.minReserve),
      name: form.name.trim(),
      notes: nullableText(form.notes),
      sizeDimension: nullableText(form.sizeDimension),
      sku: nullableText(form.sku),
      subcategory: nullableText(form.subcategory),
      supplier: form.supplier.trim(),
      unitMeasure: nullableText(form.unitMeasure),
    };

    if (!editItem) {
      const inStock = nullableNumber(form.inStock);
      const minReserve = nullableNumber(form.minReserve);
      const localItem: InventoryItem = {
        active: form.active,
        availabilityStatus: form.availabilityStatus,
        category: form.category.trim(),
        createdAt: new Date().toISOString(),
        id: `local-inventory-${Date.now()}`,
        inStock,
        lastPriceUpdate: nullableText(form.lastPriceUpdate),
        lowStock: inStock !== null && minReserve !== null ? inStock <= minReserve : false,
        material: nullableText(form.material),
        minReserve,
        name: form.name.trim(),
        notes: nullableText(form.notes),
        sizeDimension: nullableText(form.sizeDimension),
        sku: nullableText(form.sku),
        subcategory: nullableText(form.subcategory),
        supplier: form.supplier.trim(),
        unitMeasure: nullableText(form.unitMeasure),
        updatedAt: new Date().toISOString(),
      };

      setInventoryItems((current) => [localItem, ...current]);
      setSummary(null);
      setIsCreateOpen(false);
      setForm(null);
      showRequestToast("inventory-create-local", "Adding inventory item...").success(
        "Inventory item added locally. Endpoint integration is pending.",
      );
      return;
    }

    const toast = showRequestToast("inventory-update", "Updating inventory item...");

    try {
      setIsSaving(true);
      const response = await updateInventoryItem(editItem.id, payload);

      setInventoryItems((current) =>
        current.map((item) => (item.id === editItem.id ? response.item : item)),
      );
      setEditItem(null);
      setForm(null);
      await getInventorySummary().then(setSummary).catch(() => undefined);
      toast.success(response.message || "Inventory item updated.");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to update inventory item.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="page-stack admin-page">
      <PageHeader
        subtitle="Manage stock items, stock counts, and inventory workbook imports"
        title="Inventory"
      />

      <section className="product-service-metrics">
        <article className="panel product-service-metric">
          <span>Total inventory</span>
          <strong>{summaryMetrics.totalItems}</strong>
          <small>{summaryMetrics.activeItems} active items</small>
        </article>
        <article className="panel product-service-metric">
          <span>Low stock</span>
          <strong>{summaryMetrics.lowStockItems}</strong>
          <small>{summaryMetrics.outOfStockItems} out of stock</small>
        </article>
        <article className="panel product-service-metric">
          <span>Tracked items</span>
          <strong>{summaryMetrics.trackedItems}</strong>
          <small>{summaryMetrics.categoriesCount} categories</small>
        </article>
      </section>

      <section className="panel product-import-panel inventory-import-panel">
        <div className="product-import-form">
          <input
            accept=".xlsx,.xls,.csv"
            aria-label="Inventory Excel file"
            key={uploadInputKey}
            name="inventoryFile"
            onChange={(event) => {
              setSelectedFile(event.target.files?.[0] ?? null);
              setError("");
            }}
            type="file"
          />
          <button
            className="primary-action"
            disabled={isImporting || !selectedFile}
            onClick={handleImport}
            type="button"
          >
            <PortalIcon name="upload" />
            <span>{isImporting ? "Importing..." : "Import Excel"}</span>
          </button>
        </div>
        {selectedFile ? <p className="product-import-file">Selected: {selectedFile.name}</p> : null}
        {error ? (
          <p className="admin-feedback" aria-live="polite">
            {error}
          </p>
        ) : null}
        {importResult.message ? (
          <div className="product-import-summary">
            <span>{importResult.message}</span>
            <strong>{importResult.createdCount} created</strong>
            <span>{importResult.updatedCount} updated</span>
            <span>{importResult.skippedCount} skipped</span>
            <span>{importResult.errorCount} errors</span>
          </div>
        ) : null}
      </section>

      <section className="panel admin-client-list">
        <div className="panel__header">
          <h2>Inventory Items</h2>
          <div className="panel__actions">
            <span>{filteredItems.length} showing</span>
            <button className="primary-action" onClick={openCreate} type="button">
              <PortalIcon name="plus" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
        <div className="product-service-toolbar inventory-toolbar">
          <div className="form-group">
            <label htmlFor="inventoryCategoryFilter">Category</label>
            <select
              id="inventoryCategoryFilter"
              onChange={(event) => setCategoryFilter(event.target.value)}
              value={categoryFilter}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="inventorySearch">Search</label>
            <input
              id="inventorySearch"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search item, SKU, material, supplier, notes..."
              type="search"
              value={search}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inventoryStatusFilter">Status</label>
            <select
              id="inventoryStatusFilter"
              onChange={(event) => setStatusFilter(event.target.value as InventoryStatusFilter)}
              value={statusFilter}
            >
              <option value="All">All</option>
              <option value="IN_STOCK">In stock</option>
              <option value="EMAIL_FOR_QUOTE">Email for quote</option>
              <option value="SPECIAL_ORDER">Special order</option>
              <option value="LOW_STOCK">Low stock</option>
              <option value="OUT_OF_STOCK">Out of stock</option>
            </select>
          </div>
        </div>

        <Table<InventoryItem>
          className="product-service-ant-table"
          columns={inventoryColumns}
          dataSource={filteredItems}
          loading={isLoading}
          locale={{
            emptyText: error && !inventoryItems.length ? error : "No inventory items match this view.",
          }}
          pagination={{ pageSize: 15, showSizeChanger: false }}
          rowKey="id"
          scroll={{ x: 2640 }}
          size="middle"
        />
      </section>

      <Modal maskClosable={false}
        okButtonProps={{ loading: isSaving }}
        okText="Save item"
        onCancel={() => {
          setEditItem(null);
          setIsCreateOpen(false);
          setForm(null);
        }}
        onOk={handleSaveInventoryItem}
        open={Boolean(editItem || isCreateOpen)}
        title={editItem?.name || "Add inventory product"}
        width={920}
      >
        {form ? (
          <div className="admin-modal-form">
            <div className="form-group">
              <label htmlFor="inventoryName">Name</label>
              <input
                id="inventoryName"
                onChange={(event) => updateField("name", event.target.value)}
                value={form.name}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="inventorySku">SKU / item code</label>
                <input
                  id="inventorySku"
                  onChange={(event) => updateField("sku", event.target.value)}
                  value={form.sku}
                />
              </div>
              <div className="form-group">
                <label htmlFor="inventorySupplier">Supplier</label>
                <input
                  id="inventorySupplier"
                  onChange={(event) => updateField("supplier", event.target.value)}
                  value={form.supplier}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="inventoryCategory">Category</label>
                <input
                  id="inventoryCategory"
                  onChange={(event) => updateField("category", event.target.value)}
                  value={form.category}
                />
              </div>
              <div className="form-group">
                <label htmlFor="inventorySubcategory">Subcategory</label>
                <input
                  id="inventorySubcategory"
                  onChange={(event) => updateField("subcategory", event.target.value)}
                  value={form.subcategory}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="inventoryMaterial">Species / material</label>
                <input
                  id="inventoryMaterial"
                  onChange={(event) => updateField("material", event.target.value)}
                  value={form.material}
                />
              </div>
              <div className="form-group">
                <label htmlFor="inventorySize">Size / dimension</label>
                <input
                  id="inventorySize"
                  onChange={(event) => updateField("sizeDimension", event.target.value)}
                  value={form.sizeDimension}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="inventoryUnit">Unit measure</label>
                <input
                  id="inventoryUnit"
                  onChange={(event) => updateField("unitMeasure", event.target.value)}
                  value={form.unitMeasure}
                />
              </div>
              <div className="form-group">
                <label htmlFor="inventoryLastPriceUpdate">Last price update</label>
                <input
                  id="inventoryLastPriceUpdate"
                  onChange={(event) => updateField("lastPriceUpdate", event.target.value)}
                  placeholder="2026-06-01T00:00:00.000Z"
                  value={form.lastPriceUpdate}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="inventoryInStock">In stock</label>
                <input
                  id="inventoryInStock"
                  min="0"
                  onChange={(event) => updateField("inStock", event.target.value)}
                  type="number"
                  value={form.inStock}
                />
              </div>
              <div className="form-group">
                <label htmlFor="inventoryMinReserve">Min reserve</label>
                <input
                  id="inventoryMinReserve"
                  min="0"
                  onChange={(event) => updateField("minReserve", event.target.value)}
                  type="number"
                  value={form.minReserve}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="inventoryNotes">Notes / variants</label>
              <textarea
                id="inventoryNotes"
                onChange={(event) => updateField("notes", event.target.value)}
                rows={3}
                value={form.notes}
              />
            </div>
            <div className="product-service-checks">
              {availabilityOptions.map((option) => (
                <label key={option.value}>
                  <input
                    checked={form.availabilityStatus.includes(option.value)}
                    onChange={(event) => toggleAvailability(option.value, event.target.checked)}
                    type="checkbox"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
              <label>
                <input
                  checked={form.active}
                  onChange={(event) => updateField("active", event.target.checked)}
                  type="checkbox"
                />
                <span>Active</span>
              </label>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default AdminInventory;
