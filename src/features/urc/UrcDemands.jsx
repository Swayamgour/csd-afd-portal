import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { demandService } from '../../services/demand.service.js';

export default function UrcDemands() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await demandService.getDemands();
    setDemands(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { header: 'Demand ID', accessor: 'id', render: (r) => <span className="font-semibold text-brand">{r.id}</span> },
    { header: 'Beneficiary', accessor: 'beneficiaryName' },
    { header: 'Vehicle / Item', accessor: 'productName' },
    { header: 'Sanction Price', accessor: 'csdPrice', render: (r) => `₹ ${r.csdPrice?.toLocaleString('en-IN')}` },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="urc-demands-page">
      <PageHeader
        title="Unit Run Canteen Demands"
        subtitle="Applications submitted by unit officers and service personnel"
      />
      <Card>
        <DataTable columns={columns} data={demands} loading={loading} />
      </Card>
    </div>
  );
}
