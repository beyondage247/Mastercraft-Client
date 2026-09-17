import { DatePicker } from "antd";
import { UNCATEGORIZED_FILTER } from "../utils/categoryFilter";
import { PORTAL_DATE_FORMAT, type PortalDateRange } from "../utils/dateFormat";

type ReportFilterBarProps = {
  /** When provided, shows a job-category filter. Values are category ids, "All", or UNCATEGORIZED_FILTER. */
  categoryOptions?: Array<{ id: string; name: string }>;
  categoryValue?: string;
  onCategoryChange?: (value: string) => void;
  clientOptions: string[];
  clientValue: string;
  dateRange: PortalDateRange;
  onClientChange: (value: string) => void;
  onDateRangeChange: (value: PortalDateRange) => void;
};

function ReportFilterBar({
  categoryOptions,
  categoryValue = "All",
  clientOptions,
  clientValue,
  dateRange,
  onCategoryChange,
  onClientChange,
  onDateRangeChange,
}: ReportFilterBarProps) {
  return (
    <section className="admin-report-filter-bar" aria-label="Report filters">
      <label className="admin-report-filter-bar__field">
        <span>Date range</span>
        <DatePicker.RangePicker
          allowClear
          format={PORTAL_DATE_FORMAT}
          onChange={(value) => onDateRangeChange(value as PortalDateRange)}
          value={dateRange}
        />
      </label>
      <label className="admin-report-filter-bar__field">
        <span>Client</span>
        <select
          aria-label="Filter by client"
          onChange={(event) => onClientChange(event.target.value)}
          value={clientValue}
        >
          <option value="All">All clients</option>
          {clientOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      {categoryOptions && onCategoryChange ? (
        <label className="admin-report-filter-bar__field">
          <span>Category</span>
          <select
            aria-label="Filter by category"
            onChange={(event) => onCategoryChange(event.target.value)}
            value={categoryValue}
          >
            <option value="All">All categories</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
            <option value={UNCATEGORIZED_FILTER}>Uncategorized</option>
          </select>
        </label>
      ) : null}
    </section>
  );
}

export default ReportFilterBar;
