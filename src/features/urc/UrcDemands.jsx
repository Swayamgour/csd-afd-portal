import React from 'react';
import { RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { useGetDemandsQuery } from '../demand/demandApi.js';

export default function UrcDemands() {
  const { data: demandsData, isLoading: loading, isFetching, refetch } = useGetDemandsQuery();

  const demands = Array.isArray(demandsData?.items)
    ? demandsData.items
    : Array.isArray(demandsData)
    ? demandsData
    : [];

  const columns = [
    {
      header: 'Demand ID',
      accessor: 'demandNo',
      render: (r) => <span className="font-semibold text-brand">{r.demandNo || r._id}</span>,
    },
    {
      header: 'Beneficiary',
      accessor: 'beneficiaryId',
      render: (r) => (
        <div>
          <span className="font-semibold block">{r.beneficiaryId?.fullName || 'Applicant'}</span>
          <span className="micro muted">{r.beneficiaryId?.serviceNumber || ''}</span>
        </div>
      ),
    },
    {
      header: 'Vehicle / Item',
      accessor: 'productSnapshot',
      render: (r) => r.productSnapshot?.name || r.productId?.name || 'AFD Product',
    },
    {
      header: 'Sanction Price',
      accessor: 'totalAmount',
      render: (r) => `₹ ${(r.totalAmount || 0).toLocaleString('en-IN')}`,
    },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="urc-demands-page">
      <PageHeader
        title="Unit Run Canteen Demands"
        subtitle="Applications submitted by unit officers and service personnel"
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
