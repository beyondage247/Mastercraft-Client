import { DatePicker } from "antd";
import { PORTAL_DATE_FORMAT, type PortalDateRange } from "../utils/dateFormat";

type ReportFilterBarProps = {
  clientOptions: string[];
  clientValue: string;
  dateRange: PortalDateRange;
  onClientChange: (value: string) => void;
  onDateRangeChange: (value: PortalDateRange) => void;
};

function ReportFilterBar({ clientOptions, clientValue, dateRange, onClientChange, onDateRangeChange }: ReportFilterBarProps) {
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
    </section>
  );
}

export default ReportFilterBar;
