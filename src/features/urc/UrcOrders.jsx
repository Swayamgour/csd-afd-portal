import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { orderService } from '../../services/order.service.js';

export default function UrcOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await orderService.getOrders();
      setOrders(data);
      setLoading(false);
    }
    load();
  }, []);

  const columns = [
    { header: 'Order Ref', accessor: 'id', render: (r) => <span className="font-semibold text-brand">{r.id}</span> },
    { header: 'Beneficiary', accessor: 'beneficiaryName' },
    { header: 'Item / Vehicle', accessor: 'productName' },
    { header: 'Dealer Showroom', accessor: 'dealer' },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="urc-orders-page">
      <PageHeader
        title="Unit Supply Orders Tracking"
        subtitle="Track delivery execution for personnel under this unit canteen"
      />
      <Card>
        <DataTable columns={columns} data={orders} loading={loading} />
      </Card>
    </div>
  );
}
