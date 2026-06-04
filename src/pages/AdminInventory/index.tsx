import { Table } from "antd";
import type { TableProps } from "antd";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import PageHeader from "../../components/PageHeader";
import { PortalIcon } from "../../components/PortalIcon";
import StatusBadge, { type BadgeTone } from "../../components/StatusBadge";
import { formatPortalDateOrFallback } from "../../utils/dateFormat";

type InventoryAvailability = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "SPECIAL_ORDER" | "UNKNOWN";

type InventoryItem = {
  active: boolean;
  availabilityStatus: InventoryAvailability;
  category: string;
  id: string;
  inStock?: number;
  itemCode: string;
  lastPriceUpdate?: string;
  minReserve?: number;
  name: string;
  notes?: string;
  sizeDimension?: string;
  speciesMaterial?: string;
  subcategory?: string;
  supplier?: string;
  unitMeasure?: string;
};

const expectedInventoryHeaders = [
  "name",
  "itemCode",
  "category",
  "subcategory",
  "speciesMaterial",
  "sizeDimension",
  "unitMeasure",
  "supplier",
  "availabilityStatus",
  "minReserve",
  "inStock",
  "notes",
  "active",
  "lastPriceUpdate",
] as const;

type InventoryHeader = typeof expectedInventoryHeaders[number];

const inventoryHeaderAliases: Record<InventoryHeader, string[]> = {
  active: ["active"],
  availabilityStatus: ["availability status", "availability"],
  category: ["category"],
  inStock: ["in stock", "stock", "quantity", "qty", "on hand"],
  itemCode: ["sku / item code", "sku", "item code", "code"],
  lastPriceUpdate: ["last price update", "last price updated"],
  minReserve: ["min reserve", "minimum reserve", "reserve"],
  name: ["name", "product name", "item name"],
  notes: ["notes / variants", "notes", "variants"],
  sizeDimension: ["size / dimensions", "size dimensions", "size dimension", "size"],
  speciesMaterial: ["species / material", "species material", "material", "species"],
  subcategory: ["subcategory / series", "subcategory", "series"],
  supplier: ["supplier"],
  unitMeasure: ["unit of measure", "unit measure", "uom"],
};

const emptyImportSummary = {
  activeCount: 0,
  categoryCount: 0,
  inStockCount: 0,
  itemCount: 0,
  lowStockCount: 0,
};

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function isEmptyCell(value: unknown) {
  return value === null || value === undefined || String(value).trim() === "";
}

function parseNumber(value: unknown) {
  if (isEmptyCell(value)) {
    return undefined;
  }

  const amount = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(amount) ? amount : undefined;
}

function normalizeActive(value: unknown) {
  const normalized = normalizeHeader(value);

  if (!normalized) {
    return true;
  }

  return !["false", "inactive", "no", "0"].includes(normalized);
}

function normalizeAvailability(value: unknown, inStock?: number, minReserve?: number): InventoryAvailability {
  const normalized = normalizeHeader(value);

  if (typeof inStock === "number") {
    if (inStock <= 0) return "OUT_OF_STOCK";
    if (typeof minReserve === "number" && inStock <= minReserve) return "LOW_STOCK";
  }

  if (normalized.includes("out")) return "OUT_OF_STOCK";
  if (normalized.includes("low")) return "LOW_STOCK";
  if (normalized.includes("special")) return "SPECIAL_ORDER";
  if (normalized.includes("stock")) return "IN_STOCK";

  return "UNKNOWN";
}

function normalizeDate(value: unknown) {
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

  return undefined;
}

function mapHeaderIndexes(headerRow: unknown[]) {
  const normalizedHeaders = headerRow.map(normalizeHeader);

  return expectedInventoryHeaders.reduce<Record<InventoryHeader, number>>((indexes, header) => {
    const aliases = inventoryHeaderAliases[header];
    indexes[header] = normalizedHeaders.findIndex((value) => aliases.includes(value));
    return indexes;
  }, {} as Record<InventoryHeader, number>);
}

function findHeaderRow(rows: unknown[][]) {
  return rows.findIndex((row) => {
    const headers = row.map(normalizeHeader);
    return headers.includes("name") && headers.some((header) => header.includes("stock"));
  });
}

function readMappedValue(row: unknown[], indexes: Record<InventoryHeader, number>, header: InventoryHeader) {
  const index = indexes[header];
  return index >= 0 ? row[index] : undefined;
}

function isSectionRow(row: unknown[], indexes: Record<InventoryHeader, number>) {
  const name = readMappedValue(row, indexes, "name");
  const itemCode = readMappedValue(row, indexes, "itemCode");
  const category = readMappedValue(row, indexes, "category");

  return !isEmptyCell(name) && isEmptyCell(itemCode) && isEmptyCell(category);
}

function availabilityLabel(value: InventoryAvailability) {
  const labels: Record<InventoryAvailability, string> = {
    IN_STOCK: "In stock",
    LOW_STOCK: "Low stock",
    OUT_OF_STOCK: "Out of stock",
    SPECIAL_ORDER: "Special order",
    UNKNOWN: "Unspecified",
  };

  return labels[value];
}

function availabilityTone(value: InventoryAvailability): BadgeTone {
  if (value === "IN_STOCK") return "success";
  if (value === "LOW_STOCK" || value === "SPECIAL_ORDER") return "warning";
  if (value === "OUT_OF_STOCK") return "danger";
  return "neutral";
}

function numberText(value?: number) {
  return typeof value === "number" ? value.toLocaleString() : "Not counted";
}

function dateText(value?: string) {
  return value ? formatPortalDateOrFallback(value) : "Not set";
}

async function parseInventoryWorkbook(file: File) {
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
    throw new Error("Could not find an inventory header row in the first worksheet.");
  }

  const indexes = mapHeaderIndexes(rows[headerRowIndex]);

  return rows
    .slice(headerRowIndex + 1)
    .filter((row) => row.some((cell) => !isEmptyCell(cell)) && !isSectionRow(row, indexes))
    .map<InventoryItem>((row, index) => {
      const inStock = parseNumber(readMappedValue(row, indexes, "inStock"));
      const minReserve = parseNumber(readMappedValue(row, indexes, "minReserve"));
      const name = String(readMappedValue(row, indexes, "name") || `Unnamed inventory row ${index + 1}`).trim();
      const itemCode = String(readMappedValue(row, indexes, "itemCode") || "").trim();
      const category = String(readMappedValue(row, indexes, "category") || "Uncategorized").trim();
      const availabilityStatus = normalizeAvailability(
        readMappedValue(row, indexes, "availabilityStatus"),
        inStock,
        minReserve,
      );

      return {
        active: normalizeActive(readMappedValue(row, indexes, "active")),
        availabilityStatus,
        category,
        id: `${itemCode || name}-${index}`,
        inStock,
        itemCode,
        lastPriceUpdate: normalizeDate(readMappedValue(row, indexes, "lastPriceUpdate")),
        minReserve,
        name,
        notes: String(readMappedValue(row, indexes, "notes") || "").trim(),
        sizeDimension: String(readMappedValue(row, indexes, "sizeDimension") || "").trim(),
        speciesMaterial: String(readMappedValue(row, indexes, "speciesMaterial") || "").trim(),
        subcategory: String(readMappedValue(row, indexes, "subcategory") || "").trim(),
        supplier: String(readMappedValue(row, indexes, "supplier") || "").trim(),
        unitMeasure: String(readMappedValue(row, indexes, "unitMeasure") || "").trim(),
      };
    });
}

function AdminInventory() {
  const [error, setError] = useState("");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusFilter, setStatusFilter] = useState<InventoryAvailability | "All">("All");
  const [uploadInputKey, setUploadInputKey] = useState(0);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(inventoryItems.map((item) => item.category).filter(Boolean))).sort()],
    [inventoryItems],
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return inventoryItems.filter((item) => {
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchesStatus = statusFilter === "All" || item.availabilityStatus === statusFilter;
      const searchable = [
        item.name,
        item.itemCode,
        item.category,
        item.subcategory,
        item.speciesMaterial,
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

  const importSummary = useMemo(() => {
    if (!inventoryItems.length) {
      return emptyImportSummary;
    }

    return {
      activeCount: inventoryItems.filter((item) => item.active).length,
      categoryCount: new Set(inventoryItems.map((item) => item.category).filter(Boolean)).size,
      inStockCount: inventoryItems.filter((item) => item.availabilityStatus === "IN_STOCK").length,
      itemCount: inventoryItems.length,
      lowStockCount: inventoryItems.filter((item) => item.availabilityStatus === "LOW_STOCK").length,
    };
  }, [inventoryItems]);

  const inventoryColumns: TableProps<InventoryItem>["columns"] = [
    {
      dataIndex: "name",
      fixed: "left",
      key: "name",
      render: (value: string, item) => (
        <div className="product-service-name-cell">
          <strong>{value}</strong>
          <span>{item.sizeDimension || item.speciesMaterial || "No dimensions"}</span>
        </div>
      ),
      title: "Name",
      width: 320,
    },
    {
      dataIndex: "itemCode",
      key: "itemCode",
      render: (value?: string) => value || "Not set",
      title: "SKU / Item Code",
      width: 150,
    },
    {
      dataIndex: "category",
      key: "category",
      render: (value?: string) => value || "Not set",
      title: "Category",
      width: 170,
    },
    {
      dataIndex: "subcategory",
      key: "subcategory",
      render: (value?: string) => value || "Not set",
      title: "Subcategory / Series",
      width: 190,
    },
    {
      dataIndex: "speciesMaterial",
      key: "speciesMaterial",
      render: (value?: string) => value || "Not set",
      title: "Species / Material",
      width: 180,
    },
    {
      dataIndex: "availabilityStatus",
      key: "availabilityStatus",
      render: (status: InventoryAvailability) => (
        <StatusBadge tone={availabilityTone(status)}>{availabilityLabel(status)}</StatusBadge>
      ),
      title: "Availability Status",
      width: 180,
    },
    {
      dataIndex: "minReserve",
      key: "minReserve",
      render: numberText,
      title: "Min Reserve",
      width: 130,
    },
    {
      dataIndex: "inStock",
      key: "inStock",
      render: numberText,
      title: "In Stock",
      width: 130,
    },
    {
      dataIndex: "unitMeasure",
      key: "unitMeasure",
      render: (value?: string) => value || "Not set",
      title: "Unit of Measure",
      width: 160,
    },
    {
      dataIndex: "supplier",
      key: "supplier",
      render: (value?: string) => value || "Not set",
      title: "Supplier",
      width: 170,
    },
    {
      dataIndex: "notes",
      key: "notes",
      render: (value?: string) => value || "None",
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
  ];

  async function handlePreviewImport() {
    if (!selectedFile) {
      setError("Choose an inventory workbook before previewing.");
      return;
    }

    try {
      setIsParsing(true);
      setError("");
      const items = await parseInventoryWorkbook(selectedFile);
      setInventoryItems(items);
      setUploadInputKey((current) => current + 1);
    } catch (requestError) {
      setInventoryItems([]);
      setError(requestError instanceof Error ? requestError.message : "Unable to preview inventory workbook.");
    } finally {
      setIsParsing(false);
    }
  }

  return (
    <div className="page-stack admin-page">
      <PageHeader
        subtitle="Preview inventory workbooks and prepare stock data for the upcoming inventory endpoint"
        title="Inventory"
      />

      <section className="product-service-metrics">
        <article className="panel product-service-metric">
          <span>Preview items</span>
          <strong>{importSummary.itemCount}</strong>
          <small>{importSummary.activeCount} active rows</small>
        </article>
        <article className="panel product-service-metric">
          <span>In stock</span>
          <strong>{importSummary.inStockCount}</strong>
          <small>{importSummary.lowStockCount} below reserve</small>
        </article>
        <article className="panel product-service-metric">
          <span>Categories</span>
          <strong>{importSummary.categoryCount}</strong>
          <small>Read from workbook groups</small>
        </article>
      </section>

      <section className="panel product-import-panel inventory-import-panel">
        {/* <div>
          <h2>Upload Inventory Workbook</h2>
          <p>
            Upload the Mastercraft inventory board to preview extracted rows. Endpoint sync is paused until the
            inventory API is ready.
          </p>
        </div> */}
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
            disabled={isParsing || !selectedFile}
            onClick={handlePreviewImport}
            type="button"
          >
            <PortalIcon name="upload" />
            <span>{isParsing ? "Reading..." : "Preview Workbook"}</span>
          </button>
          {/* <button className="secondary-action inventory-sync-button" disabled type="button">
            Endpoint Pending
          </button> */}
        </div>
        {selectedFile ? <p className="product-import-file">Selected: {selectedFile.name}</p> : null}
        {error ? (
          <p className="admin-feedback" aria-live="polite">
            {error}
          </p>
        ) : null}
        {inventoryItems.length ? (
          <div className="product-import-summary">
            <span>{inventoryItems.length} rows staged</span>
            <strong>{importSummary.inStockCount} marked in stock</strong>
            <span>{importSummary.categoryCount} categories</span>
            <span>Ready for endpoint mapping</span>
          </div>
        ) : null}
      </section>

      <section className="panel admin-client-list">
        <div className="panel__header">
          <h2>Inventory Preview</h2>
          <span>{filteredItems.length} showing</span>
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
              onChange={(event) => setStatusFilter(event.target.value as InventoryAvailability | "All")}
              value={statusFilter}
            >
              <option value="All">All</option>
              <option value="IN_STOCK">In stock</option>
              <option value="LOW_STOCK">Low stock</option>
              <option value="OUT_OF_STOCK">Out of stock</option>
              <option value="SPECIAL_ORDER">Special order</option>
              <option value="UNKNOWN">Unspecified</option>
            </select>
          </div>
        </div>

        <Table<InventoryItem>
          className="product-service-ant-table"
          columns={inventoryColumns}
          dataSource={filteredItems}
          locale={{
            emptyText: "Upload the inventory workbook to preview extracted stock rows.",
          }}
          pagination={{ pageSize: 25, showSizeChanger: false }}
          rowKey="id"
          scroll={{ x: 2320 }}
          size="middle"
        />
      </section>
    </div>
  );
}

export default AdminInventory;
