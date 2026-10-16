import React, { useState, useEffect } from 'react';
import { Store, ShieldAlert, CheckCircle2, Phone } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { contentService } from '../../services/content.service.js';

export default function CsdDealers() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await contentService.getDealers();
        setDealers(data);
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
      header: 'Dealer Code',
      accessor: 'code',
      render: (row) => <span className="font-mono font-semibold text-brand">{row.code}</span>
    },
    {
      header: 'Showroom & City',
      accessor: 'name',
      render: (row) => (
        <div>
          <span className="font-semibold block">{row.name}</span>
          <span className="micro muted">{row.city} · OEM: {row.oem}</span>
        </div>
      )
    },
    { header: 'Nodal Manager', accessor: 'contact', render: (row) => <div><span>{row.contact}</span><span className="micro muted block">{row.phone}</span></div> },
    { header: 'Completed Deliveries', accessor: 'completedDeliveries', render: (row) => <span className="font-bold">{row.completedDeliveries}</span> },
    { header: 'Compliance / Fee Audit', accessor: 'complianceRating', render: (row) => <span className="small font-medium">{row.complianceRating}</span> },
    {
      header: 'Portal Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="csd-dealers-page">
      <PageHeader
        title="Authorized Dealership Network"
        subtitle="Delivery showrooms and institutional dealer compliance monitoring for zero handling fee compliance"
      />

      <Card>
        <DataTable
          columns={columns}
          data={dealers}
          loading={loading}
        />
      </Card>
    </div>
  );
}
