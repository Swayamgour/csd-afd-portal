import React, { useState, useEffect } from 'react';
import { Warehouse, Phone, MapPin } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { contentService } from '../../services/content.service.js';

export default function CsdDepots() {
  const [depots, setDepots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await contentService.getDepots();
        setDepots(data);
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
      header: 'Depot Code',
      accessor: 'code',
      render: (row) => <span className="badge-pill badge-primary badge-sm font-mono">{row.code}</span>
    },
    {
      header: 'Depot Name & Location',
      accessor: 'name',
      render: (row) => (
        <div>
          <span className="font-semibold block">{row.name}</span>
          <span className="micro muted">{row.location}</span>
        </div>
      )
    },
    { header: 'Commanding Officer / Manager', accessor: 'manager' },
    { header: 'Contact Phone', accessor: 'phone', render: (row) => <span className="small font-mono">{row.phone}</span> },
    { header: 'Active Demands', accessor: 'activeDemands', render: (row) => <span className="font-bold text-brand">{row.activeDemands} Demands</span> },
    { header: 'Orders Dispatched', accessor: 'ordersDispatched', render: (row) => <span className="font-semibold text-green">{row.ordersDispatched} SOs</span> },
    {
      header: 'Operational Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="csd-depots-page">
      <PageHeader
        title="Regional CSD Depots Directorate"
        subtitle="Operational oversight of 34 Area Depots managing regional AFD sanction queues and supply orders"
      />

      <Card>
        <DataTable
          columns={columns}
          data={depots}
          loading={loading}
        />
      </Card>
    </div>
  );
}
