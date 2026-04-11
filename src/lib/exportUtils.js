import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToCSV = (data, filename) => {
  if (!data || !data.length) return;

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportToPDF = (title, columns, data, filename) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  // Map data to array of arrays ensuring order matches columns
  const tableRows = data.map(item => columns.map(col => {
      const val = item[col.dataKey];
      return val !== null && val !== undefined ? String(val) : '';
  }));

  const tableColumnHeaders = columns.map(c => c.header);

  doc.autoTable({
    head: [tableColumnHeaders],
    body: tableRows,
    startY: 40,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [220, 38, 38] }, // Red header
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};