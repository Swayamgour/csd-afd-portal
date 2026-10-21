import React from 'react';
import { RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Button from '../../components/common/Button.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useGetDemandsReportQuery } from '../admin/adminApi.js';

export default function UrcReports() {
  const { data: demandsData, isLoading: loading, isFetching, refetch } = useGetDemandsReportQuery();

  const demands = Array.isArray(demandsData)
    ? demandsData
    : Array.isArray(demandsData?.items)
    ? demandsData.items
    : [];

  const columns = [
    {
      header: 'Demand Ref',
      accessor: 'demandNo',
      render: (r) => <span className="font-semibold text-brand">{r.demandNo || r._id}</span>,
    },
    {
      header: 'Beneficiary Name',
      accessor: 'beneficiaryId',
      render: (r) => r.beneficiaryId?.fullName || r.beneficiaryId?.name || 'Applicant',
    },
    {
      header: 'Vehicle / Item Model',
      accessor: 'productSnapshot',
      render: (r) => r.productSnapshot?.name || 'AFD Product',
    },
    {
      header: 'Assigned Depot',
      accessor: 'depotId',
      render: (r) => r.depotId?.name || 'Depot',
    },
    {
      header: 'Sanction Value',
      accessor: 'totalAmount',
      render: (r) => `₹ ${(r.totalAmount || 0).toLocaleString('en-IN')}`,
    },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="urc-reports-page">
      <PageHeader
        title="URC Demands & Verification Reports"
        subtitle="Summary of personnel applications endorsed by this canteen"
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
