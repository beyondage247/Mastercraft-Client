import { Modal, Table } from "antd";
import type { TableProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import PageHeader from "../../components/PageHeader";
import { PortalIcon } from "../../components/PortalIcon";
import StatusBadge from "../../components/StatusBadge";
import {
  createCatalogItem,
  getCatalogItems,
  importCatalogItems,
  updateCatalogItem,
  type CatalogAvailabilityStatus,
  type CreateCatalogItemInput,
  type CatalogImportResponse,
  type CatalogItem,
  type UpdateCatalogItemInput,
} from "../../services/portalApi";
import { formatPortalDateOrFallback } from "../../utils/dateFormat";
import { showRequestToast } from "../../utils/portalToast";

type CatalogFormState = {
  active: boolean;
  availabilityStatus: CatalogAvailabilityStatus[];
  category: string;
  itemCode: string;
  markUp: string;
  material: string;
  ourPrice: string;
  productName: string;
  sizeDimension: string;
  styleProfile: string;
  subcategory: string;
  supplier: string;
  supplierCatalogue: string;
  supplierCost: string;
  unitMeasure: string;
};

const emptyCatalogForm: CatalogFormState = {
  active: true,
  availabilityStatus: ["EMAIL_FOR_QUOTE"],
  category: "",
  itemCode: "",
  markUp: "",
  material: "",
  ourPrice: "",
  productName: "",
  sizeDimension: "",
  styleProfile: "",
  subcategory: "",
  supplier: "",
  supplierCatalogue: "",
  supplierCost: "",
  unitMeasure: "",
};

const availabilityOptions: Array<{ label: string; value: CatalogAvailabilityStatus }> = [
  { label: "In stock", value: "IN_STOCK" },
  { label: "Email for quote", value: "EMAIL_FOR_QUOTE" },
  { label: "Special order", value: "SPECIAL_ORDER" },
];

const emptyImportResult: CatalogImportResponse = {
  errorCount: 0,
  errors: [],
  importedCount: 0,
  message: "",
  processedCount: 0,
  skippedCount: 0,
  skippedRows: [],
};

const expectedImportHeaders = [
  "productName",
  "itemCode",
  "subcategory",
  "material",
  "supplierCost",
  "ourPrice",
  "markUp",
  "availabilityStatus",
  "category",
  "supplier",
  "sizeDimension",
  "unitMeasure",
  "styleProfile",
  "supplierCatalogue",
  "active",
  "lastPriceUpdate",
] as const;

type ImportHeader = typeof expectedImportHeaders[number];

const importHeaderAliases: Record<ImportHeader, string[]> = {
  active: ["active"],
  availabilityStatus: ["availability status"],
  category: ["category"],
  itemCode: ["item code", "sku / item code", "sku", "code"],
  lastPriceUpdate: ["last price updated", "last price update"],
  markUp: ["markup", "markup %", "mark up"],
  material: ["material", "species", "species / material"],
  ourPrice: ["our price"],
  productName: ["product name", "name"],
  sizeDimension: ["size dimension", "size / dimensions", "size dimensions", "size"],
  styleProfile: ["style profile", "style / profile code", "style profile code"],
  subcategory: ["subcategory", "subcategory / series", "series"],
  supplier: ["supplier"],
  supplierCatalogue: ["supplier catalogue", "supplier catalog page", "supplier catalog", "catalogue"],
  supplierCost: ["supplier cost"],
  unitMeasure: ["unit measure", "unit of measure"],
};

const defaultImportValues: Record<ImportHeader, string | boolean> = {
  active: true,
  availabilityStatus: "EMAIL_FOR_QUOTE",
  category: "Uncategorized",
  itemCode: "",
  lastPriceUpdate: new Date().toISOString(),
  markUp: "0",
  material: "",
  ourPrice: "0",
  productName: "",
  sizeDimension: "N/A",
  styleProfile: "N/A",
  subcategory: "General",
  supplier: "Unknown supplier",
  supplierCatalogue: "N/A",
  supplierCost: "0",
  unitMeasure: "Each",
};

function formFromItem(item: CatalogItem): CatalogFormState {
  return {
    active: item.active,
    availabilityStatus: item.availabilityStatus || [],
    category: item.category || "",
    itemCode: item.itemCode || "",
    markUp: item.markUp || "",
    material: item.material || "",
    ourPrice: item.ourPrice || "",
    productName: item.productName || "",
    sizeDimension: item.sizeDimension || "",
    styleProfile: item.styleProfile || "",
    subcategory: item.subcategory || "",
    supplier: item.supplier || "",
    supplierCatalogue: item.supplierCatalogue || "",
    supplierCost: item.supplierCost || "",
    unitMeasure: item.unitMeasure || "",
  };
}

function moneyText(value?: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return value || "Not set";
  }

  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}

function dateText(value?: string) {
  return formatPortalDateOrFallback(value);
}

function availabilityLabel(value: CatalogAvailabilityStatus) {
  return availabilityOptions.find((option) => option.value === value)?.label || value;
}

function availabilityTone(value: CatalogAvailabilityStatus) {
  if (value === "IN_STOCK") return "success";
  if (value === "SPECIAL_ORDER") return "warning";
  return "info";
}

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function isEmptyCell(value: unknown) {
  return value === null || value === undefined || String(value).trim() === "";
}

function normalizeAvailability(value: unknown) {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized.includes("stock")) {
    return "IN_STOCK";
  }

  if (normalized.includes("special")) {
    return "SPECIAL_ORDER";
  }

  return "EMAIL_FOR_QUOTE";
}

function normalizeActive(value: unknown) {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return !["false", "inactive", "no", "0"].includes(normalized);
}

function normalizeDateForImport(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);

    if (parsed) {
      return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)).toISOString();
    }
  }

  if (!isEmptyCell(value)) {
    const date = new Date(String(value));

    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return new Date().toISOString();
}

function mapHeaderIndexes(headerRow: unknown[]) {
  const normalizedHeaders = headerRow.map(normalizeHeader);

  return expectedImportHeaders.reduce<Record<ImportHeader, number>>((indexes, header) => {
    const aliases = importHeaderAliases[header];
    const index = normalizedHeaders.findIndex((value) => aliases.includes(value));

    indexes[header] = index;
    return indexes;
  }, {} as Record<ImportHeader, number>);
}

function findHeaderRow(rows: unknown[][]) {
  return rows.findIndex((row) => {
    const headers = row.map(normalizeHeader);

    return headers.includes("name") && headers.some((header) => header.includes("supplier"));
  });
}

function readMappedValue(row: unknown[], indexes: Record<ImportHeader, number>, header: ImportHeader, rowNumber: number) {
  const index = indexes[header];
  const value = index >= 0 ? row[index] : undefined;

  if (!isEmptyCell(value)) {
    if (header === "availabilityStatus") {
      return normalizeAvailability(value);
    }

    if (header === "active") {
      return normalizeActive(value);
    }

    if (header === "lastPriceUpdate") {
      return normalizeDateForImport(value);
    }

    return value;
  }

  if (header === "productName") {
    return `Unnamed product row ${rowNumber}`;
  }

  return defaultImportValues[header];
}

async function normalizeCatalogWorkbook(file: File) {
  const workbook = XLSX.read(await file.arrayBuffer(), {
    cellDates: true,
    type: "array",
  });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    blankrows: false,
    defval: "",
    header: 1,
  });
  const headerRowIndex = findHeaderRow(rows);

  if (headerRowIndex < 0) {
    return file;
  }

  const indexes = mapHeaderIndexes(rows[headerRowIndex]);
  const normalizedRows = rows
    .slice(headerRowIndex + 1)
    .filter((row) => row.some((cell) => !isEmptyCell(cell)))
    .map((row, index) => {
      const rowNumber = headerRowIndex + index + 2;

      return expectedImportHeaders.reduce<Record<string, unknown>>((record, header) => {
        record[header] = readMappedValue(row, indexes, header, rowNumber);
        return record;
      }, {});
    });
  const normalizedSheet = XLSX.utils.json_to_sheet(normalizedRows, {
    header: [...expectedImportHeaders],
  });
  const normalizedWorkbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(normalizedWorkbook, normalizedSheet, "services");

  const buffer = XLSX.write(normalizedWorkbook, { bookType: "xlsx", type: "array" });

  return new File([buffer], `normalized-${file.name.replace(/\.[^.]+$/, "")}.xlsx`, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function AdminProductsServices() {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [editItem, setEditItem] = useState<CatalogItem | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CatalogFormState | null>(null);
  const [importResult, setImportResult] = useState<CatalogImportResponse>(emptyImportResult);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("All");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [uploadInputKey, setUploadInputKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    getCatalogItems()
      .then((items) => {
        if (isMounted) {
          setCatalogItems(items);
          setError("");
        }
      })
      .catch((requestError: Error) => {
        if (isMounted) {
          setCatalogItems([]);
          setError(requestError.message || "Unable to load products and services.");
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

  const suppliers = useMemo(
    () => ["All", ...Array.from(new Set(catalogItems.map((item) => item.supplier).filter(Boolean))).sort()],
    [catalogItems],
  );

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(catalogItems.map((item) => item.category).filter(Boolean))).sort()],
    [catalogItems],
  );

  const subcategories = useMemo(
    () => ["All", ...Array.from(new Set(catalogItems.map((item) => item.subcategory).filter(Boolean))).sort()],
    [catalogItems],
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return catalogItems.filter((item) => {
      const matchesSupplier = supplierFilter === "All" || item.supplier === supplierFilter;
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchesSubcategory = subcategoryFilter === "All" || item.subcategory === subcategoryFilter;
      const searchable = [
        item.productName,
        item.itemCode,
        item.category,
        item.material,
        item.subcategory,
        item.supplier,
        item.sizeDimension,
        item.styleProfile,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesSupplier && matchesCategory && matchesSubcategory && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [catalogItems, categoryFilter, search, subcategoryFilter, supplierFilter]);

  const activeCount = catalogItems.filter((item) => item.active).length;
  const inStockCount = catalogItems.filter((item) => item.availabilityStatus?.includes("IN_STOCK")).length;
  const categoriesCount = new Set(catalogItems.map((item) => item.category).filter(Boolean)).size;
  const catalogColumns: TableProps<CatalogItem>["columns"] = [
    {
      dataIndex: "productName",
      fixed: "left",
      key: "productName",
      render: (value: string, item) => (
        <div className="product-service-name-cell">
          <strong>{value}</strong>
          <span>{item.sizeDimension || item.styleProfile || "No dimensions"}</span>
        </div>
      ),
      title: "productName",
      width: 320,
    },
    {
      dataIndex: "itemCode",
      key: "itemCode",
      render: (value?: string) => value || "Not set",
      title: "itemCode",
      width: 130,
    },
    {
      dataIndex: "subcategory",
      key: "subcategory",
      render: (value?: string) => value || "Not set",
      title: "subcategory",
      width: 170,
    },
    {
      dataIndex: "material",
      key: "material",
      render: (value?: string) => value || "Not set",
      title: "material",
      width: 150,
    },
    {
      dataIndex: "supplierCost",
      key: "supplierCost",
      render: moneyText,
      title: "supplierCost",
      width: 150,
    },
    {
      dataIndex: "ourPrice",
      key: "ourPrice",
      render: moneyText,
      title: "ourPrice",
      width: 140,
    },
    {
      dataIndex: "markUp",
      key: "markUp",
      render: (value?: string) => (value ? `${value}%` : "Not set"),
      title: "markUp",
      width: 120,
    },
    {
      dataIndex: "availabilityStatus",
      key: "availabilityStatus",
      render: (statuses?: CatalogAvailabilityStatus[]) => (
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
      title: "availabilityStatus",
      width: 240,
    },
    {
      dataIndex: "category",
      key: "category",
      render: (value?: string) => value || "Not set",
      title: "category",
      width: 170,
    },
    {
      dataIndex: "supplier",
      key: "supplier",
      render: (value?: string) => value || "Not set",
      title: "supplier",
      width: 170,
    },
    {
      dataIndex: "sizeDimension",
      key: "sizeDimension",
      render: (value?: string) => value || "Not set",
      title: "sizeDimension",
      width: 180,
    },
    {
      dataIndex: "unitMeasure",
      key: "unitMeasure",
      render: (value?: string) => value || "Not set",
      title: "unitMeasure",
      width: 150,
    },
    {
      dataIndex: "styleProfile",
      key: "styleProfile",
      render: (value?: string) => value || "Not set",
      title: "styleProfile",
      width: 180,
    },
    {
      dataIndex: "supplierCatalogue",
      key: "supplierCatalogue",
      render: (value?: string) => value || "Not set",
      title: "supplierCatalogue",
      width: 190,
    },
    {
      dataIndex: "active",
      key: "active",
      render: (active: boolean) => (
        <StatusBadge tone={active ? "success" : "neutral"}>
          {active ? "Active" : "Inactive"}
        </StatusBadge>
      ),
      title: "active",
      width: 120,
    },
    {
      dataIndex: "lastPriceUpdate",
      key: "lastPriceUpdate",
      render: dateText,
      title: "lastPriceUpdate",
      width: 180,
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

  function refreshCatalog() {
    return getCatalogItems().then((items) => {
      setCatalogItems(items);
      setError("");
    });
  }

  async function handleImport() {
    if (!selectedFile) {
      setError("Choose an Excel workbook before importing.");
      return;
    }

    const toast = showRequestToast("catalog-import", "Importing catalog...");

    try {
      setIsImporting(true);
      const uploadFile = await normalizeCatalogWorkbook(selectedFile);
      const result = await importCatalogItems(uploadFile);
      setImportResult(result);
      await refreshCatalog();
      setSelectedFile(null);
      setUploadInputKey((current) => current + 1);
      toast.success(result.message || "Catalog import completed.");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to import catalog.";

      setError(message);
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  }

  function openEdit(item: CatalogItem) {
    setEditItem(item);
    setIsCreateOpen(false);
    setForm(formFromItem(item));
  }

  function openCreate() {
    setEditItem(null);
    setForm(emptyCatalogForm);
    setIsCreateOpen(true);
  }

  function updateField<Field extends keyof CatalogFormState>(field: Field, value: CatalogFormState[Field]) {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  }

  function toggleAvailability(value: CatalogAvailabilityStatus, checked: boolean) {
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

  async function handleSaveCatalogItem() {
    if (!form) {
      return;
    }

    if (!form.productName.trim() || !form.category.trim() || !form.supplier.trim()) {
      setError("Product name, category, and supplier are required.");
      return;
    }

    const payload: CreateCatalogItemInput = {
      active: form.active,
      availabilityStatus: form.availabilityStatus,
      category: form.category.trim(),
      itemCode: form.itemCode.trim(),
      markUp: form.markUp.trim(),
      material: form.material.trim(),
      ourPrice: form.ourPrice.trim(),
      productName: form.productName.trim(),
      sizeDimension: form.sizeDimension.trim(),
      styleProfile: form.styleProfile.trim(),
      subcategory: form.subcategory.trim(),
      supplier: form.supplier.trim(),
      supplierCatalogue: form.supplierCatalogue.trim(),
      supplierCost: form.supplierCost.trim(),
      unitMeasure: form.unitMeasure.trim(),
    };

    if (!editItem) {
      const toast = showRequestToast("catalog-create", "Adding product...");

      try {
        setIsSaving(true);
        const response = await createCatalogItem(payload);

        setCatalogItems((current) => [response.item, ...current]);
        setIsCreateOpen(false);
        setForm(null);
        toast.success(response.message || "Product added.");
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : "Unable to add product.";

        setError(message);
        toast.error(message);
      } finally {
        setIsSaving(false);
      }
      return;
    }

    const updatePayload: UpdateCatalogItemInput = payload;
    const toast = showRequestToast("catalog-update", "Updating catalog item...");

    try {
      setIsSaving(true);
      const response = await updateCatalogItem(editItem.id, updatePayload);

      setCatalogItems((current) =>
        current.map((item) => (item.id === editItem.id ? response.item : item)),
      );
      setEditItem(null);
      setForm(null);
      toast.success(response.message || "Catalog item updated.");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to update catalog item.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="page-stack admin-page">
      <PageHeader
        subtitle="Manage products and services used in projects and quote line items"
        title="Products & Services"
      />

      <section className="product-service-metrics">
        <article className="panel product-service-metric">
          <span>Total catalog</span>
          <strong>{catalogItems.length}</strong>
          <small>{activeCount} active</small>
        </article>
        <article className="panel product-service-metric">
          <span>In stock</span>
          <strong>{inStockCount}</strong>
          <small>Available for quote forms</small>
        </article>
        <article className="panel product-service-metric">
          <span>Categories</span>
          <strong>{categoriesCount}</strong>
          <small>Grouped by product family</small>
        </article>
      </section>

      <section className="panel product-import-panel">
        {/* <div>
          <h2>Import Catalog</h2>
          <p>Upload the Excel document from the supplier catalog. The backend reads the first worksheet and returns a row-by-row import summary.</p>
        </div> */}
        <div className="product-import-form">
          <input
            accept=".xlsx,.xls,.csv"
            aria-label="Catalog Excel file"
            name="catalogFile"
            onChange={(event) => {
              setSelectedFile(event.target.files?.[0] ?? null);
              setError("");
            }}
            key={uploadInputKey}
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
        {selectedFile ? (
          <p className="product-import-file">Selected: {selectedFile.name}</p>
        ) : null}
        {error ? (
          <p className="admin-feedback" aria-live="polite">{error}</p>
        ) : null}
        {importResult.message ? (
          <div className="product-import-summary">
            <span>{importResult.message}</span>
            <strong>{importResult.importedCount} imported</strong>
            <span>{importResult.skippedCount} skipped</span>
            <span>{importResult.errorCount} errors</span>
          </div>
        ) : null}
      </section>

      <section className="panel admin-client-list">
        <div className="panel__header">
          <h2>Catalog Items</h2>
          <div className="panel__actions">
            <span>{filteredItems.length} showing</span>
            <button className="primary-action" onClick={openCreate} type="button">
              <PortalIcon name="plus" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
        <div className="product-service-toolbar">
          <div className="form-group">
            <label htmlFor="catalogSupplierFilter">Supplier</label>
            <select
              id="catalogSupplierFilter"
              onChange={(event) => setSupplierFilter(event.target.value)}
              value={supplierFilter}
            >
              {suppliers.map((supplier) => (
                <option key={supplier} value={supplier}>{supplier}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="catalogCategoryFilter">Category</label>
            <select
              id="catalogCategoryFilter"
              onChange={(event) => setCategoryFilter(event.target.value)}
              value={categoryFilter}
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="catalogSearch">Search</label>
            <input
              id="catalogSearch"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, code, supplier, category..."
              type="search"
              value={search}
            />
          </div>
          <div className="form-group">
            <label htmlFor="catalogSubcategoryFilter">Subcategory</label>
            <select
              id="catalogSubcategoryFilter"
              onChange={(event) => setSubcategoryFilter(event.target.value)}
              value={subcategoryFilter}
            >
              {subcategories.map((subcategory) => (
                <option key={subcategory} value={subcategory}>{subcategory}</option>
              ))}
            </select>
          </div>
        </div>

        <Table<CatalogItem>
          className="product-service-ant-table"
          columns={catalogColumns}
          dataSource={filteredItems}
          loading={isLoading}
          locale={{
            emptyText: error && !catalogItems.length ? error : "No catalog items match this view.",
          }}
          pagination={{ pageSize: 15, showSizeChanger: false }}
          rowKey="id"
          scroll={{ x: 2800 }}
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
        onOk={handleSaveCatalogItem}
        open={Boolean(editItem || isCreateOpen)}
        title={editItem?.productName || "Add product"}
        width={920}
      >
        {form ? (
          <div className="admin-modal-form">
            <div className="form-group">
              <label htmlFor="catalogProductName">Product name</label>
              <input
                id="catalogProductName"
                onChange={(event) => updateField("productName", event.target.value)}
                value={form.productName}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="catalogItemCode">Item code</label>
                <input
                  id="catalogItemCode"
                  onChange={(event) => updateField("itemCode", event.target.value)}
                  value={form.itemCode}
                />
              </div>
              <div className="form-group">
                <label htmlFor="catalogSupplier">Supplier</label>
                <input
                  id="catalogSupplier"
                  onChange={(event) => updateField("supplier", event.target.value)}
                  value={form.supplier}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="catalogCategory">Category</label>
                <input
                  id="catalogCategory"
                  onChange={(event) => updateField("category", event.target.value)}
                  value={form.category}
                />
              </div>
              <div className="form-group">
                <label htmlFor="catalogSubcategory">Subcategory</label>
                <input
                  id="catalogSubcategory"
                  onChange={(event) => updateField("subcategory", event.target.value)}
                  value={form.subcategory}
                />
              </div>
              <div className="form-group">
                <label htmlFor="catalogMaterial">Material</label>
                <input
                  id="catalogMaterial"
                  onChange={(event) => updateField("material", event.target.value)}
                  value={form.material}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="catalogSupplierCost">Supplier cost</label>
                <input
                  id="catalogSupplierCost"
                  onChange={(event) => updateField("supplierCost", event.target.value)}
                  value={form.supplierCost}
                />
              </div>
              <div className="form-group">
                <label htmlFor="catalogMarkup">Markup %</label>
                <input
                  id="catalogMarkup"
                  onChange={(event) => updateField("markUp", event.target.value)}
                  value={form.markUp}
                />
              </div>
              <div className="form-group">
                <label htmlFor="catalogOurPrice">Our price</label>
                <input
                  id="catalogOurPrice"
                  onChange={(event) => updateField("ourPrice", event.target.value)}
                  value={form.ourPrice}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="catalogSize">Size / dimension</label>
                <input
                  id="catalogSize"
                  onChange={(event) => updateField("sizeDimension", event.target.value)}
                  value={form.sizeDimension}
                />
              </div>
              <div className="form-group">
                <label htmlFor="catalogUnit">Unit measure</label>
                <input
                  id="catalogUnit"
                  onChange={(event) => updateField("unitMeasure", event.target.value)}
                  value={form.unitMeasure}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="catalogStyle">Style / profile</label>
                <input
                  id="catalogStyle"
                  onChange={(event) => updateField("styleProfile", event.target.value)}
                  value={form.styleProfile}
                />
              </div>
              <div className="form-group">
                <label htmlFor="catalogSupplierCatalogue">Supplier catalogue</label>
                <input
                  id="catalogSupplierCatalogue"
                  onChange={(event) => updateField("supplierCatalogue", event.target.value)}
                  value={form.supplierCatalogue}
                />
              </div>
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

export default AdminProductsServices;
