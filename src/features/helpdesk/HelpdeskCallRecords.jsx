import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FilterBar } from '../../components/common/FilterBar';
import { ExportButton } from '../../components/common/ExportButton';

export const HelpdeskCallRecords = () => {
  const [search, setSearch] = useState('');

  const callData = [
    { id: 'CALL-9041', citizen: 'Subedar R. S. Pathania', mobile: '+91 98765 11092', category: 'Payment Gateway', duration: '4m 12s', disposition: 'Ticket Created', agent: 'Agent Vikram Singh', time: '14 Oct 2024, 11:42 AM' },
    { id: 'CALL-9040', citizen: 'Havildar Anuj Verma', mobile: '+91 98110 33412', category: 'Eligibility Inquiry', duration: '2m 45s', disposition: 'Resolved on Call', agent: 'Agent Meena Roy', time: '14 Oct 2024, 11:15 AM' },
    { id: 'CALL-9039', citizen: 'Capt (Retd) S. K. Nair', mobile: '+91 97654 22198', category: 'Chassis VIN Tracking', duration: '6m 10s', disposition: 'Escalated to Depot', agent: 'Agent Vikram Singh', time: '14 Oct 2024, 10:50 AM' },
    { id: 'CALL-9038', citizen: 'Smt. Gayatri Devi (Family)', mobile: '+91 94220 88910', category: 'Document Re-upload', duration: '5m 30s', disposition: 'Guidance Given', agent: 'Agent Rajesh Jha', time: '14 Oct 2024, 10:12 AM' }
  ];

  const columns = [
    { header: 'Call Ref', accessor: 'id', render: (c) => <strong>{c.id}</strong> },
    { header: 'Caller / Citizen', accessor: 'citizen' },
    { header: 'Mobile Number', accessor: 'mobile' },
    { header: 'Category', accessor: 'category' },
    { header: 'Duration', accessor: 'duration' },
    {
      header: 'Disposition',
      accessor: 'disposition',
      render: (c) => <span className="badge badge-subtle-slate">{c.disposition}</span>
    },
    { header: 'Attending Agent', accessor: 'agent' },
    { header: 'Call Timestamp', accessor: 'time' }
  ];

  const filtered = callData.filter(c =>
    !search || c.citizen.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="helpdesk-call-records-page">
      <PageHeader
        title="Telephony & IVR Call Records"
        subtitle="Inbound toll-free citizen call logs and telephony disposition tracking"
        breadcrumbs={[
          { label: 'Helpdesk', href: '/helpdesk/dashboard' },
          { label: 'Call Records' }
        ]}
        actions={<ExportButton data={filtered} filename="Telephony_Call_Logs" />}
      />

      <Card>
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by Call Ref, Citizen name, phone..."
        />
        <DataTable columns={columns} data={filtered} />
      </Card>
    </div>
  );
};
