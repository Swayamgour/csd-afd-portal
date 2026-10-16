import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { demandService } from '../../services/demand.service.js';

export default function OemDemands() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await demandService.getDemands();
      // Filter to OEM relevant (e.g. Tata)
      setDemands(data.filter((d) => d.brand === 'Tata'));
      setLoading(false);
    }
    load();
  }, []);

  const columns = [
    { header: 'Demand Ref', accessor: 'id', render: (r) => <span className="font-semibold text-brand">{r.id}</span> },
    { header: 'Model Requested', accessor: 'productName' },
    { header: 'Target Showroom', accessor: 'dealer' },
    { header: 'Regional Depot', accessor: 'depot' },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="oem-demands-page">
      <PageHeader
        title="OEM Demand Pipeline"
        subtitle="Advance visibility into verified demands prior to supply order issue"
      />
      <Card>
        <DataTable columns={columns} data={demands} loading={loading} />
      </Card>
    </div>
  );
}
