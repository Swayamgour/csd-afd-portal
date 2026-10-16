import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import ExportButton from '../../components/common/ExportButton.jsx';
import { reportService } from '../../services/report.service.js';

export default function OemReports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await reportService.getReportData('orders');
      setData(res.rows || []);
      setLoading(false);
    }
    load();
  }, []);

  const columns = [
    { header: 'Brand Model Line', accessor: 'brand' },
    { header: 'Total Supply Orders', accessor: 'orders' },
    { header: 'Handover Completed', accessor: 'delivered' },
    { header: 'Factory Dispatch', accessor: 'pending' },
    { header: 'Average Handover SLA', accessor: 'avgDaysToDeliver', render: (r) => `${r.avgDaysToDeliver} Days` }
  ];

  return (
    <div className="oem-reports-page">
      <PageHeader
        title="OEM Fulfilment & Turnaround Performance"
        subtitle="Quarterly analysis of factory-to-dealer transit and vehicle delivery times"
        actions={
          <ExportButton
            filename="OEM_FULFILMENT_REPORT"
            headers={columns.map((c) => c.header)}
            rows={data}
          />
        }
      />
      <Card>
        <DataTable columns={columns} data={data} loading={loading} />
      </Card>
    </div>
  );
}
