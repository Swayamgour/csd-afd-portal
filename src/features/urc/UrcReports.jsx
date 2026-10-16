import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import { reportService } from '../../services/report.service.js';

export default function UrcReports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await reportService.getReportData('demands');
      setData(res.rows || []);
      setLoading(false);
    }
    load();
  }, []);

  const columns = [
    { header: 'Period', accessor: 'period' },
    { header: 'Unit Sub-sector', accessor: 'region' },
    { header: 'Demands Endorsed', accessor: 'demands' },
    { header: 'Approved', accessor: 'approved' }
  ];

  return (
    <div className="urc-reports-page">
      <PageHeader
        title="URC Demands & Verification Reports"
        subtitle="Summary of personnel applications endorsed by this canteen"
      />
      <Card>
        <DataTable columns={columns} data={data} loading={loading} />
      </Card>
    </div>
  );
}
