import React, { useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import { useGetDemandsQuery } from '../demand/demandApi.js';
import { Users } from 'lucide-react';

export default function DealerCustomers() {
  const { data: demandsData, isLoading } = useGetDemandsQuery();
  const demands = demandsData?.items || [];

  // Deduplicate customers across demands
  const customers = useMemo(() => {
    const map = new Map();
    for (const d of demands) {
      const b = d.beneficiaryId || {};
      const u = d.userId || {};
      const id = b._id || u._id || d.demandNo;
      if (!map.has(id)) {
        map.set(id, {
          id,
          serviceNumber: b.serviceNumber || 'Defence Staff',
          name: b.fullName || u.name || 'Beneficiary',
          rank: b.rank || 'Armed Forces',
          category: b.category || 'DEFENCE',
          phone: b.mobile || u.mobile || '—',
          email: u.email || '—',
          latestDemand: d.demandNo,
          productName: d.productSnapshot?.name || 'Allotted Item',
        });
      }
    }
    return Array.from(map.values());
  }, [demands]);

  const columns = [
    {
      header: 'Service No.',
      accessor: 'serviceNumber',
      render: (r) => <span className="font-mono font-semibold text-brand">{r.serviceNumber}</span>
    },
    {
      header: 'Beneficiary Name',
      accessor: 'name',
      render: (r) => <span className="font-semibold text-navy">{r.name}</span>
    },
    {
      header: 'Rank / Cadre',
      accessor: 'rank',
      render: (r) => <span>{r.rank}</span>
    },
    {
      header: 'Contact Mobile',
      accessor: 'phone',
      render: (r) => <span className="font-mono">{r.phone}</span>
    },
    {
      header: 'Official Email',
      accessor: 'email',
      render: (r) => <span className="small muted">{r.email}</span>
    },
    {
      header: 'Selected Vehicle',
      accessor: 'productName',
      render: (r) => <span className="badge micro info">{r.productName}</span>
    }
  ];

  return (
    <div className="dealer-customers-page">
      <PageHeader
        title="Beneficiary Customers Assigned"
        subtitle="Defence personnel who have selected this dealership for vehicle delivery"
      />
      <Card>
        <DataTable
          columns={columns}
          data={customers}
          loading={isLoading}
          emptyMessage={
            <div className="p-4 text-center">
              <Users size={36} className="text-muted mb-1" style={{ margin: '0 auto' }} />
              <h3 className="h4 font-bold">No Customers Assigned Yet</h3>
              <p className="text-muted small">
                Customers who choose your dealership at checkout will automatically appear in this roster.
              </p>
            </div>
          }
        />
      </Card>
    </div>
  );
}
