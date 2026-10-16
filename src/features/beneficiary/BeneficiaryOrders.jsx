import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Eye, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { orderService } from '../../services/order.service.js';
import { useAuth } from '../../context/AuthContext.jsx';

export function BeneficiaryOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await orderService.getOrders({ beneficiaryId: user?.id });
        setOrders(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const columns = [
    {
      header: 'Supply Order No.',
      accessor: 'id',
      render: (row) => <span className="font-semibold text-brand">{row.id}</span>
    },
    { header: 'Vehicle / Item', accessor: 'productName' },
    { header: 'Dealership Showroom', accessor: 'dealer' },
    { header: 'Chassis / VIN', accessor: 'chassisNumber', render: (row) => <span className="font-mono small">{row.chassisNumber || 'In Allocation'}</span> },
    { header: 'Order Date', accessor: 'orderDate' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <Link to={`/beneficiary/orders/${encodeURIComponent(row.id)}`} className="btn sm out">
          <Eye size={14} />
          <span>Track Order</span>
        </Link>
      )
    }
  ];

  return (
    <div className="beneficiary-orders-page">
      <PageHeader
        title="My Supply Orders"
        subtitle="View certified CSD Supply Orders issued to authorized dealerships and track vehicle allocation"
      />

      <Card>
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          emptyTitle="No Supply Orders Issued Yet"
          emptyText="Supply Orders are automatically generated once Depot approves your demand and payment is reconciled."
        />
      </Card>
    </div>
  );
}
export default BeneficiaryOrders;
