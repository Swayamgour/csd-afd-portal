import React from 'react';
import { RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { useGetDemandsQuery } from '../demand/demandApi.js';

export default function OemDemands() {
  const { data: demandsData, isLoading: loading, isFetching, refetch } = useGetDemandsQuery();

  const demands = Array.isArray(demandsData?.items)
    ? demandsData.items
    : Array.isArray(demandsData)
    ? demandsData
    : [];

  const columns = [
    {
      header: 'Demand Ref',
      accessor: 'demandNo',
      render: (r) => <span className="font-semibold text-brand">{r.demandNo || r._id}</span>,
    },
    {
      header: 'Model Requested',
      accessor: 'productSnapshot',
      render: (r) => r.productSnapshot?.name || r.productId?.name || 'AFD Vehicle',
    },
    {
      header: 'Target Showroom',
      accessor: 'dealerId',
      render: (r) => r.dealerId?.name || 'Assigned Dealership',
    },
    {
      header: 'Regional Depot',
      accessor: 'depotId',
      render: (r) => r.depotId?.name || 'Regional Depot',
    },
    {
      header: 'Sanction Value',
      accessor: 'totalAmount',
      render: (r) => `₹ ${(r.totalAmount || 0).toLocaleString('en-IN')}`,
    },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="oem-demands-page">
      <PageHeader
        title="OEM Demand Pipeline"
        subtitle="Advance visibility into verified demands prior to supply order issue"
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        }
      />
      <Card>
        <DataTable columns={columns} data={demands} loading={loading} />
      </Card>
    </div>
  );
}
