import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import ExportButton from '../../components/common/ExportButton.jsx';
import { reportService } from '../../services/report.service.js';

export default function DealerReports() {
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
    { header: 'OEM Line', accessor: 'brand' },
    { header: 'Allotted Orders', accessor: 'orders' },
    { header: 'Delivered', accessor: 'delivered' },
    { header: 'Stockyard In Transit', accessor: 'pending' },
    { header: 'Average Handover Days', accessor: 'avgDaysToDeliver', render: (r) => `${r.avgDaysToDeliver} Days` }
  ];

  return (
    <div className="dealer-reports-page">
      <PageHeader
        title="Dealership Delivery Performance Reports"
        subtitle="Monthly audit of vehicles delivered and average turnaround times"
        actions={
          <ExportButton
            filename="DEALER_DELIVERY_REPORT"
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
