import ExcelJS from "exceljs";
import { Buffer } from "buffer";

interface ExportColumn<T> {
  header: string;
  key: string;
  format?: (row: T) => any;
}

export async function exportToExcel<T>(data: T[], columns: ExportColumn<T>[], sheetName = "Export"): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: 20,
  }));

  data.forEach((row) => {
    const formattedRow: Record<string, any> = {};
    columns.forEach((col) => {
      formattedRow[col.key] = col.format ? col.format(row) : (row as any)[col.key];
    });
    worksheet.addRow(formattedRow);
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
