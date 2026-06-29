import * as XLSX from 'xlsx';

/**
 * Export an array of plain objects to an Excel (.xlsx) file and trigger a browser download.
 * @param rows     Array of flat objects (keys become column headers)
 * @param filename Filename without extension  (e.g. "clients")
 * @param sheetName Optional worksheet name (defaults to "Sheet1")
 */
export function exportToExcel(
  rows: Record<string, unknown>[],
  filename: string,
  sheetName = 'Sheet1',
): void {
  if (!rows.length) {
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
