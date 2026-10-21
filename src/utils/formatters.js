/**
 * Enterprise Formatting Utilities for CSD AFD Portal
 */

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹ 0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatDate(dateStr, includeTime = false) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const options = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    };
    return d.toLocaleDateString('en-IN', options);
  } catch {
    return String(dateStr);
  }
}

export function formatNumber(num) {
  if (num === undefined || num === null || isNaN(Number(num))) return '0';
  return new Intl.NumberFormat('en-IN').format(Number(num));
}
