import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import ExportButton from '../../components/common/ExportButton.jsx';
import { reportService } from '../../services/report.service.js';

export default function DepotReports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await reportService.getReportData('demands');
        setData(res.rows || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const columns = [
    { header: 'Quarter Period', accessor: 'period' },
    { header: 'Depot Sub-Sector', accessor: 'region' },
    { header: 'Demand Count', accessor: 'demands', render: (r) => <span className="font-bold">{r.demands}</span> },
    { header: 'Sanctioned Orders', accessor: 'approved', render: (r) => <span className="text-green font-semibold">{r.approved}</span> },
    { header: 'Turnover Value', accessor: 'value', render: (r) => <span className="font-bold text-brand">{r.value}</span> }
  ];

  return (
    <div className="depot-reports-page">
      <PageHeader
        title="Regional Depot Performance & Sanction Reports"
        subtitle="Zonal procurement throughput and dealer dispatch metrics"
        actions={
          <ExportButton
            filename="DEPOT_REGIONAL_REPORT"
            headers={columns.map((c) => c.header)}
            rows={data}
          />
        }
      />

      <Card>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
        />
      </Card>
    </div>
  );
}
