export { formatCurrency } from '@/utils/formatters.js';

export function getPercentageOfTotal(value, total) {
  if (!total) {
    return '0.0% del total';
  }

  return `${((value / total) * 100).toFixed(1)}% del total`;
}

export function exportRowsAsCsv(fileName, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
