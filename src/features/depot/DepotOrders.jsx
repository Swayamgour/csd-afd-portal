import React, { useState, useEffect } from 'react';
import { Truck, Download } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { orderService } from '../../services/order.service.js';

export default function DepotOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await orderService.getOrders();
        setOrders(data);
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
      header: 'Supply Order No.',
      accessor: 'id',
      render: (row) => <span className="font-semibold text-brand">{row.id}</span>
    },
    { header: 'Applicant', accessor: 'beneficiaryName', render: (row) => <div><span className="font-semibold block">{row.beneficiaryName}</span><span className="micro muted">{row.serviceNumber}</span></div> },
    { header: 'Vehicle / Product', accessor: 'productName' },
    { header: 'Dealership', accessor: 'dealer' },
    { header: 'Chassis / VIN', accessor: 'chassisNumber', render: (row) => <span className="font-mono small">{row.chassisNumber || 'In Allocation'}</span> },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Supply Order PDF',
      accessor: 'id',
      render: (row) => (
        <button
          type="button"
          className="btn sm out"
          onClick={() => alert(`Downloading Certified Depot Supply Order: ${row.id}`)}
        >
          <Download size={13} />
          <span>Download</span>
        </button>
      )
    }
  ];

  return (
    <div className="depot-orders-page">
      <PageHeader
        title="Regional Depot Supply Orders"
        subtitle="Monitor vehicle dispatches, showroom delivery status, and chassis allocation records"
      />

      <Card>
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
        />
      </Card>
    </div>
  );
}
