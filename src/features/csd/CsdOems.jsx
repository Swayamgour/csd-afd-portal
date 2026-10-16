import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle2, FileText, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { contentService } from '../../services/content.service.js';

export default function CsdOems() {
  const [oems, setOems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await contentService.getOems();
        setOems(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const columns = [
    {
      header: 'Manufacturer / OEM Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <span className="font-semibold block">{row.name}</span>
          <span className="micro muted">ID: {row.id} · {row.category}</span>
        </div>
      )
    },
    { header: 'Institutional Head', accessor: 'contactPerson' },
    { header: 'Official Contact', accessor: 'email', render: (row) => <span className="small">{row.email}</span> },
    { header: 'Active Models', accessor: 'activeModels', render: (row) => <span className="font-bold text-brand">{row.activeModels} Models</span> },
    { header: 'Pending Supply Orders', accessor: 'pendingOrders', render: (row) => <span className="font-semibold">{row.pendingOrders} Orders</span> },
    {
      header: 'Empanelment Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="csd-oems-page">
      <PageHeader
        title="Empaneled Original Equipment Manufacturers (OEMs)"
        subtitle="Automobile and appliance manufacturers with valid Rate Contracts with CSD Head Office"
      />

      <Card>
        <DataTable
          columns={columns}
          data={oems}
          loading={loading}
        />
      </Card>
    </div>
  );
}
