import React, { useState } from 'react';
import { Download } from 'lucide-react';
import Button from './Button.jsx';
import { reportService } from '../../services/report.service.js';

export function ExportButton({
  filename = 'csd_afd_export',
  headers = [],
  rows = [],
  data,
  disabled = false,
  label = 'Export CSV'
}) {
  const [exporting, setExporting] = useState(false);
  const items = data || rows || [];

  const handleExport = () => {
    setExporting(true);
    try {
      const derivedHeaders = headers.length > 0 ? headers : Object.keys(items[0] || {});
      const derivedRows = items.map(item => derivedHeaders.map(h => item[h] !== undefined ? item[h] : ''));
      reportService.exportToCsv(filename, derivedHeaders, derivedRows);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setExporting(false), 500);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      icon={Download}
      loading={exporting}
      disabled={disabled || items.length === 0}
      onClick={handleExport}
    >
      {label}
    </Button>
  );
}

export default ExportButton;
