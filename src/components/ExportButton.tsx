import { exportToExcel } from '../utils/exportToExcel';
import { PortalIcon } from './PortalIcon';

type ExportButtonProps = {
  /** Array of plain objects to export — keys become column headers */
  data: Record<string, unknown>[];
  /** Filename without extension (e.g. "clients") */
  filename: string;
  /** Optional button label. Defaults to "Export" */
  label?: string;
};

export default function ExportButton({ data, filename, label = 'Export' }: ExportButtonProps) {
  function handleExport() {
    exportToExcel(data, filename);
  }

  return (
    <button
      className="export-btn"
      disabled={data.length === 0}
      onClick={handleExport}
      title={`Export ${label} to Excel`}
      type="button"
    >
      <PortalIcon name="download" />
      <span>{label}</span>
    </button>
  );
}
