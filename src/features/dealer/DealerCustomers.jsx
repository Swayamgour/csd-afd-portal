import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import { userService } from '../../services/user.service.js';
import { ROLES } from '../../permissions/roles.js';

export default function DealerCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await userService.getUsers({ role: ROLES.BENEFICIARY });
      setCustomers(data);
      setLoading(false);
    }
    load();
  }, []);

  const columns = [
    { header: 'Service No.', accessor: 'serviceNumber', render: (r) => <span className="font-mono font-semibold text-brand">{r.serviceNumber}</span> },
    { header: 'Beneficiary Name', accessor: 'name', render: (r) => <span className="font-semibold">{r.name}</span> },
    { header: 'Rank / Service', accessor: 'rank', render: (r) => `${r.rank} (${r.service})` },
    { header: 'Contact Mobile', accessor: 'phone' },
    { header: 'Official Email', accessor: 'email', render: (r) => <span className="small">{r.email}</span> }
  ];

  return (
    <div className="dealer-customers-page">
      <PageHeader
        title="Beneficiary Customers Assigned"
        subtitle="Defence personnel who have selected this dealership for vehicle delivery"
      />
      <Card>
        <DataTable columns={columns} data={customers} loading={loading} />
      </Card>
    </div>
  );
}
