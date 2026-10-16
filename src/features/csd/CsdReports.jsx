import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Filter, Calendar } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import ExportButton from '../../components/common/ExportButton.jsx';
import Select from '../../components/common/Select.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import { reportService } from '../../services/report.service.js';

export default function CsdReports() {
  const [activeReport, setActiveReport] = useState('demands');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'demands', label: 'AFD Demand Volume', icon: FileSpreadsheet },
    { id: 'orders', label: 'OEM Supply Orders & Delivery', icon: FileSpreadsheet },
    { id: 'payments', label: 'Treasury Collections & Gateways', icon: FileSpreadsheet },
    { id: 'helpdesk', label: 'Helpdesk SLA Performance', icon: FileSpreadsheet }
  ];

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await reportService.getReportData(activeReport);
      setReportData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [activeReport]);

  const getColumns = () => {
    switch (activeReport) {
      case 'demands':
        return [
          { header: 'Period / Quarter', accessor: 'period' },
          { header: 'Command Region', accessor: 'region' },
          { header: 'Total Demands', accessor: 'demands', render: (r) => <span className="font-bold">{r.demands}</span> },
          { header: 'Approved / Sanctioned', accessor: 'approved', render: (r) => <span className="font-semibold text-green">{r.approved}</span> },
          { header: 'Sanction Value', accessor: 'value', render: (r) => <span className="font-bold text-brand">{r.value}</span> }
        ];

      case 'orders':
        return [
          { header: 'Manufacturer (OEM)', accessor: 'brand', render: (r) => <span className="font-semibold text-brand">{r.brand}</span> },
          { header: 'Orders Issued', accessor: 'orders', render: (r) => <span className="font-bold">{r.orders}</span> },
          { header: 'Delivered', accessor: 'delivered', render: (r) => <span className="font-semibold text-green">{r.delivered}</span> },
          { header: 'In Transit', accessor: 'pending', render: (r) => <span className="font-semibold text-saffron">{r.pending}</span> },
          { header: 'Avg Handover Turnaround', accessor: 'avgDaysToDeliver', render: (r) => `${r.avgDaysToDeliver} Days` }
        ];

      case 'payments':
        return [
          { header: 'Payment Channel', accessor: 'gateway', render: (r) => <span className="font-semibold">{r.gateway}</span> },
          { header: 'Transaction Count', accessor: 'transactions' },
          { header: 'Realized Revenue', accessor: 'amount', render: (r) => <span className="font-bold text-ink">{r.amount}</span> },
          { header: 'Reconciliation Health', accessor: 'status', render: (r) => <span className="badge-pill badge-success badge-sm">{r.status}</span> }
        ];

      case 'helpdesk':
        return [
          { header: 'Grievance Classification', accessor: 'category', render: (r) => <span className="font-semibold">{r.category}</span> },
          { header: 'Total Tickets', accessor: 'tickets' },
          { header: 'Average Resolution Time', accessor: 'avgResolutionHours', render: (r) => `${r.avgResolutionHours} hrs` },
          { header: 'SLA Breaches', accessor: 'breached', render: (r) => <span className="badge-pill badge-danger badge-sm">{r.breached} Breached</span> }
        ];

      default:
        return [];
    }
  };

  return (
    <div className="csd-reports-page">
      <PageHeader
        title="National MIS Analytics & Management Reports"
        subtitle="Analytical summaries of procurement volumes, treasury collections, and SLA metrics across zonal commands."
        actions={
          <ExportButton
            filename={`CSD_AFD_${activeReport.toUpperCase()}_REPORT`}
            headers={getColumns().map((c) => c.header)}
            rows={reportData?.rows || []}
          />
        }
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-3" />

      {/* Summary KPI Strip */}
      {reportData && (
        <div className="panel p-3 mb-3 bg-brand-soft border-brand row align-center justify-between flex-wrap gap-2">
          {activeReport === 'demands' && (
            <>
              <div><span className="small muted block">Total AFD Demands:</span> <span className="h3 font-bold text-brand">{reportData.total}</span></div>
              <div><span className="small muted block">Sanctioned:</span> <span className="h3 font-bold text-green">{reportData.approved}</span></div>
              <div><span className="small muted block">Pending Sanction:</span> <span className="h3 font-bold text-saffron">{reportData.pending}</span></div>
              <div><span className="small muted block">Total Value:</span> <span className="h3 font-bold text-ink">{reportData.totalValue}</span></div>
            </>
          )}

          {activeReport === 'orders' && (
            <>
              <div><span className="small muted block">Supply Orders Issued:</span> <span className="h3 font-bold text-brand">{reportData.total}</span></div>
              <div><span className="small muted block">Physical Delivery:</span> <span className="h3 font-bold text-green">{reportData.delivered}</span></div>
              <div><span className="small muted block">Carrier In-Transit:</span> <span className="h3 font-bold text-saffron">{reportData.inTransit}</span></div>
            </>
          )}

          {activeReport === 'payments' && (
            <>
              <div><span className="small muted block">Total Treasury Realization:</span> <span className="h3 font-bold text-brand">{reportData.totalCollected}</span></div>
              <div><span className="small muted block">SBI Cyber Treasury:</span> <span className="h3 font-bold text-green">{reportData.sbiCyberTreasury}</span></div>
              <div><span className="small muted block">Bharatkosh Receipts:</span> <span className="h3 font-bold text-ink">{reportData.bharatkosh}</span></div>
            </>
          )}

          {activeReport === 'helpdesk' && (
            <>
              <div><span className="small muted block">Total Logged Tickets:</span> <span className="h3 font-bold text-brand">{reportData.totalTickets}</span></div>
              <div><span className="small muted block">Resolved Within SLA:</span> <span className="h3 font-bold text-green">{reportData.resolvedWithinSla}</span></div>
              <div><span className="small muted block">National SLA Compliance:</span> <span className="h3 font-bold text-green">{reportData.slaComplianceRate}</span></div>
            </>
          )}
        </div>
      )}

      <Card title="Detailed Tabular Breakdown">
        <DataTable
          columns={getColumns()}
          data={reportData?.rows || []}
          loading={loading}
        />
      </Card>
    </div>
  );
}
